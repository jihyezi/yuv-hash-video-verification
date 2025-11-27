from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
import os
import uuid
import shutil
from typing import Dict, Any
import mimetypes 

# Supabase 클라이언트
from app.core.supabase_client import supabase 
# 보안 모듈
from security.au import generate_user_secret_key 
from security.hash import generate_chroma_hash, save_image_with_hash
# Auth에서 유저 확인 함수 가져오기
from app.routers.auth import get_current_user 

router = APIRouter(prefix="/gallery", tags=["gallery"])

SYSTEM_PEPPER = os.getenv("HASHING_SECRET") 
TEMP_DIR = "temp_uploads"
STORAGE_BUCKET_NAME = "Gallery"

os.makedirs(TEMP_DIR, exist_ok=True)

@router.post("/upload", 
            response_model=Dict[str, Any],
            summary="원본 이미지 업로드 및 해시 저장") 
async def upload_original_image(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user) 
):
<<<<<<< HEAD
    # 1. 유저 ID 추출
    if isinstance(current_user, dict):
            user_id = current_user.get('id')
    else:
            user_id = getattr(current_user, 'id', None)

    if not user_id:
        raise HTTPException(status_code=401, detail="유저 ID를 찾을 수 없습니다.")
=======
    if isinstance(current_user, dict):
        # 딕셔너리인 경우: 키 접근 사용
        user_id = current_user.get("id")
    else:
        # 객체/모델인 경우: 속성 접근 사용 (Fallback)
        user_id = current_user.id
        
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="사용자 ID를 찾을 수 없습니다.")
>>>>>>> 2f9af04 (fix: 오류 해결)
    
    folder_name = "unassigned" 
    department_id = None

    # --- 2. [DB 조회] 부서 정보 가져오기 ---
    try:
        user_res = supabase.table("user").select("department_id").eq("id", user_id).execute()
        
        if user_res.data and user_res.data[0].get('department_id'):
            department_id = user_res.data[0]['department_id']
            
            dept_res = supabase.table("department").select("folder_name").eq("id", department_id).execute()
            
            if dept_res.data and dept_res.data[0].get('folder_name'):
                folder_name = dept_res.data[0]['folder_name'] 

    except Exception as e:
        print(f"부서 정보 조회 실패: {e}")
    
    # --- 3. 경로 설정 ---
    storage_prefix = f"originals/{folder_name}" 

    file_uuid = uuid.uuid4()
    temp_original_path = os.path.join(TEMP_DIR, f"temp_original_{file_uuid}_{file.filename}")
    temp_hashed_path = os.path.join(TEMP_DIR, f"temp_hashed_{file_uuid}_{file.filename}")
    
    try:
        if not SYSTEM_PEPPER:
            raise HTTPException(status_code=500, detail="HASHING_SECRET 설정 오류")
            
        with open(temp_original_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # ★ [수정된 부분] 인자를 3개 전달합니다! (user_id, department_id, pepper)
        # 만약 department_id가 없으면 빈 문자열("")이라도 보내야 에러가 안 납니다.
        dept_arg = str(department_id) if department_id else "unknown"
        
        user_secret_key = generate_user_secret_key(user_id, dept_arg, SYSTEM_PEPPER)

        # 해시 생성
        hash_value = generate_chroma_hash(temp_original_path, user_secret_key)
        
        if not hash_value:
            raise HTTPException(status_code=500, detail="해시 생성 실패")
        
        save_image_with_hash(temp_original_path, temp_hashed_path, hash_value)

        # Storage 업로드
        _, file_extension = os.path.splitext(temp_hashed_path)
        storage_filename = f"{storage_prefix}/{file_uuid}{file_extension}"
        
        mime_type, _ = mimetypes.guess_type(temp_hashed_path)
        if not mime_type: mime_type = 'image/jpeg' 

        with open(temp_hashed_path, 'rb') as f:
            supabase.storage.from_(STORAGE_BUCKET_NAME).upload( 
                path=storage_filename,
                file=f,
                file_options={"content-type": mime_type} 
            )
        
        # DB 저장
        db_data = {
            "id": str(file_uuid),                 
            "image_url": storage_filename,        
            "title": file.filename,               
            "hash": hash_value,                   
            "user_id": user_id,
            "department_id": department_id, 
        }
        
        db_response = supabase.table("gallery").insert(db_data).execute()

        supabase.table("api_calls").insert({
            "user_id": user_id,
            "type": "upload"
        }).execute()
        
        return {
            "message": "성공",
            "file_data": db_response.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"업로드 에러: {e}")
        raise HTTPException(status_code=500, detail=f"오류 발생: {str(e)}")
    
    finally:
        if os.path.exists(temp_original_path):
            os.remove(temp_original_path)
        if os.path.exists(temp_hashed_path):
            os.remove(temp_hashed_path)