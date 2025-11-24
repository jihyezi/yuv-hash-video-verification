from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
import os
import uuid
import shutil
from typing import Dict, Any
import hashlib 
import mimetypes 



# Supabase 클라이언트
from app.core.supabase_client import supabase 
# 사용자 비밀 키 생성 (security/au.py)
from security.au import generate_user_secret_key 
# 해시 생성 및 저장 (security/hash.py)
from security.hash import generate_chroma_hash, save_image_with_hash
# from app.routers.auth import get_current_user # 현재 사용자 인증 함수
from app.routers.auth import get_current_user


router = APIRouter(prefix="/gallery", tags=["gallery"])

SYSTEM_PEPPER = os.getenv("HASHING_SECRET") 
TEMP_DIR = "temp_uploads"
STORAGE_BUCKET_NAME = "Gallery"

# 임시 디렉토리 생성 (서버 시작 시 한 번 실행)
os.makedirs(TEMP_DIR, exist_ok=True)

# 💡 NOTE: test-user-001 대신 유효한 UUID를 사용하기 위한 임시 상수
# 이 ID는 Supabase user 테이블에 수동으로 삽입된 ID와 일치해야 합니다.
TEMP_USER_UUID = "00000000-0000-0000-0000-000000000001" 

@router.post("/upload",
             response_model=Dict[str, Any],
             summary="원본 이미지 업로드 및 해시 저장")
async def upload_original_image(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """
    업로드된 이미지를 받아 사용자별 해시 생성 후 Supabase에 저장 + DB에 department 저장
    """

    # 1️⃣ 로그인한 user_id
    user_id = current_user.id
    print(f"🔥 업로드 요청한 user_id: {user_id}")

    # 2️⃣ user 테이블에서 department_id 조회
    user_row = supabase.table("user").select("department_id").eq("id", user_id).execute()

    if not user_row.data or not user_row.data[0].get("department_id"):
        raise HTTPException(status_code=400, detail="유저의 department_id가 없습니다.")

    department_id = user_row.data[0]["department_id"]
    print(f"🔥 사용자 부서 ID: {department_id}")

    # 파일 저장 준비
    file_uuid = uuid.uuid4()
    temp_original_path = os.path.join(TEMP_DIR, f"temp_original_{file_uuid}_{file.filename}")
    temp_hashed_path = os.path.join(TEMP_DIR, f"temp_hashed_{file_uuid}_{file.filename}")

    storage_prefix = f"originals/{department_id}"   # ⭐ 부서 폴더에 저장

    try:
        if not SYSTEM_PEPPER:
            raise HTTPException(status_code=500, detail="HASHING_SECRET 설정 안됨")

        # 1. 파일 임시 저장
        with open(temp_original_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. 사용자 비밀 키 생성
        user_secret_key = generate_user_secret_key(user_id, SYSTEM_PEPPER)

        # 3. 해시 생성
        hash_value = generate_chroma_hash(temp_original_path, user_secret_key)

        # 4. 메타데이터 삽입
        save_image_with_hash(temp_original_path, temp_hashed_path, hash_value)

        # 5. Supabase Storage 업로드
        _, file_extension = os.path.splitext(temp_hashed_path)
        storage_filename = f"{storage_prefix}/{file_uuid}{file_extension}"

        mime_type, _ = mimetypes.guess_type(temp_hashed_path)
        if not mime_type:
            mime_type = "image/jpeg"

        with open(temp_hashed_path, "rb") as f:
            supabase.storage.from_(STORAGE_BUCKET_NAME).upload(
                path=storage_filename,
                file=f,
                file_options={"content-type": mime_type}
            )

        # 6️⃣ DB 저장 (⭐ department_id 포함)
        db_data = {
            "id": str(file_uuid),
            "image_url": storage_filename,
            "title": file.filename,
            "hash": hash_value,
            "user_id": user_id,
            "department_id": department_id  # ⭐ 핵심
        }

        db_response = supabase.table("gallery").insert(db_data).execute()

        supabase.table("api_calls").insert({
            "user_id": user_id,
            "type": "upload"
        }).execute()
        
        return {
            "message": "파일 업로드 및 해시 저장 성공",
            "file_data": db_response.data[0]
        }

    except Exception as e:
        print(f"업로드 에러: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(temp_original_path):
            os.remove(temp_original_path)
        if os.path.exists(temp_hashed_path):
            os.remove(temp_hashed_path)
