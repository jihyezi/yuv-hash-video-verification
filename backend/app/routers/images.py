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
    file: UploadFile = File(...)
    # current_user = Depends(get_current_user) # 사용자 인증 시 주석 해제
):
    """
    업로드된 이미지 파일을 받아 사용자별 해시를 생성하고, 파일을 Supabase에 저장합니다.
    """
    
    # --- 0. 초기 설정 및 인증 확인 ---
    user_id = TEMP_USER_UUID
    
    file_uuid = uuid.uuid4()
    # 임시 파일명에는 원래 파일명을 유지합니다.
    temp_original_path = os.path.join(TEMP_DIR, f"temp_original_{file_uuid}_{file.filename}")
    temp_hashed_path = os.path.join(TEMP_DIR, f"temp_hashed_{file_uuid}_{file.filename}")
    
    # Supabase Storage에 사용자 ID별 폴더에 저장
    storage_prefix = f"originals/{user_id}" 

    try:
        # HASHING_SECRET(시스템 페퍼)이 설정되었는지 확인
        if not SYSTEM_PEPPER:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="서버 설정 오류: HASHING_SECRET(시스템 페퍼)이 설정되지 않았습니다."
            )
            
        # 1. 업로드된 파일 임시 저장
        with open(temp_original_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 2. 사용자별 비밀 키 생성 (security/au.py 로직 사용)
        user_secret_key = generate_user_secret_key(user_id, SYSTEM_PEPPER)

        # 3. 사용자 비밀 키를 이용해 해시 생성
        hash_value = generate_chroma_hash(temp_original_path, user_secret_key)
        
        if not hash_value:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="해시 생성에 실패했습니다. 파일 형식을 확인해주세요."
            )
        
        # 4. 해시 포함 파일 저장 (metadata를 이미지에 삽입)
        # 이 단계에서 파일의 확장자가 변경될 수 있습니다 (예: HEIC -> PNG)
        save_image_with_hash(temp_original_path, temp_hashed_path, hash_value)

        # 5. Supabase Storage에 '해시 포함 파일' 업로드
        
        # 파일명을 UUID와 확장자로만 구성하여 안전하게 변경 
        _, file_extension = os.path.splitext(temp_hashed_path) # 임시로 저장된 파일의 확장자를 사용
        storage_filename = f"{storage_prefix}/{file_uuid}{file_extension}"
        
        # 파일 확장자 기반 Content-Type 결정 
        mime_type, _ = mimetypes.guess_type(temp_hashed_path)
        if not mime_type or not mime_type.startswith('image/'):
            # 기본값 설정 또는 오류 처리
            mime_type = 'image/jpeg' 

        with open(temp_hashed_path, 'rb') as f:
            # Supabase Storage API 호출
            supabase.storage.from_(STORAGE_BUCKET_NAME).upload( 
                path=storage_filename,
                file=f,
                # 💡 file_options에 Content-Type을 지정하여 미리보기가 가능하게 함
                file_options={"content-type": mime_type} 
            )
        
        # 6. Supabase DB에 메타데이터 저장
        db_data = {
            "id": str(file_uuid),                 
            "image_url": storage_filename,        # 안전한 경로(영문+UUID) 저장
            "title": file.filename,               # 원본 파일명은 DB에 저장
            "hash": hash_value,                   
            "user_id": user_id,                   
        }
        
        db_response = supabase.table("gallery").insert(db_data).execute()
        
        return {
            "message": "파일 업로드 및 해시 저장 성공",
            "file_data": db_response.data[0] # 저장된 DB 정보 반환
        }

    except HTTPException:
        raise
    except Exception as e:
        # 그 외 예외 발생 시 내부 서버 오류로 처리합니다.
        print(f"업로드 중 예상치 못한 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"파일 업로드 중 서버 오류가 발생했습니다: {str(e)}"
        )
    
    finally:
        # 7. 임시 파일 삭제 (오류 발생 여부와 관계없이 실행)
        if os.path.exists(temp_original_path):
            os.remove(temp_original_path)
        if os.path.exists(temp_hashed_path):
            os.remove(temp_hashed_path)