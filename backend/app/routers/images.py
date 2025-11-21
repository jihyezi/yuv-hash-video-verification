import os
import uuid
import shutil
import hashlib 
import mimetypes 
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
# Supabase 클라이언트를 가져옵니다.
from app.core.supabase_client import supabase 
# 사용자 비밀 키 생성 로직 (부서 공유 키 전략)
from security.au import generate_user_secret_key 
# 해시 생성 및 저장 로직
from security.hash import generate_chroma_hash, save_image_with_hash
# 💡 [필수] 인증 의존성 함수를 가져옵니다.
from app.routers.auth import get_current_user 

router = APIRouter(prefix="/gallery", tags=["gallery"])

SYSTEM_PEPPER = os.getenv("HASHING_SECRET") 
TEMP_DIR = "temp_uploads"
STORAGE_BUCKET_NAME = "Gallery"

# 임시 디렉토리 생성 (서버 시작 시 한 번 실행)
os.makedirs(TEMP_DIR, exist_ok=True)

# 부서 매핑 정보 (Storage 경로에 사용)
DEPARTMENT_MAP = {
    "법무팀": "legal_team",
    "sw 개발팀": "sw_dev_team",
    "디자인팀": "design_team",
    "인사팀": "hr_team",
    "기획팀": "planning_team",
}
DEFAULT_DEPARTMENT_EN = "unassigned" # 부서 정보가 없을 때 사용할 기본 폴더명

def get_english_department_name(department_kr: Optional[str]) -> str:
    """한글 부서명을 Storage 경로에 사용할 영어 이름으로 변환합니다."""
    if not department_kr:
        return DEFAULT_DEPARTMENT_EN
    
    # 맵에서 찾고, 없으면 기본값(unassigned)을 반환합니다.
    return DEPARTMENT_MAP.get(department_kr, DEFAULT_DEPARTMENT_EN)

@router.post("/upload", 
             response_model=Dict[str, Any],
             summary="원본 이미지 업로드 및 해시 저장") 
async def upload_original_image(
    file: UploadFile = File(...),
    current_user: Dict[str, Any] = Depends(get_current_user) 
):
    """
    업로드된 이미지 파일을 받아 사용자별 해시를 생성하고, 파일을 Supabase에 저장합니다.
    """
    
    user_id = current_user['id'] 
    
    department_kr = None
    
    # 🚨 2. [DB에서 부서 정보 조회] 🚨
    try:
        # user 테이블에서 department 정보 조회
        # .single().execute()를 사용하여 결과가 하나임을 명시
        user_profile_response = supabase.table("user").select("department").eq("id", user_id).single().execute()
        
        # 조회된 데이터에서 department 값을 추출
        if user_profile_response.data and 'department' in user_profile_response.data:
            department_kr = user_profile_response.data.get('department') 

    except Exception as e:
        # DB 조회 실패 (RLS, 네트워크 등)
        print(f"DEBUG: 사용자 부서 정보 조회 실패: {e}")
    
    # 💡 3. [부서명 매핑 및 경로 설정]
    department_en = get_english_department_name(department_kr)

    storage_prefix = f"originals/{department_en}/{user_id}" 

    file_uuid = uuid.uuid4()
    temp_original_path = os.path.join(TEMP_DIR, f"temp_original_{file_uuid}_{file.filename}")
    temp_hashed_path = os.path.join(TEMP_DIR, f"temp_hashed_{file_uuid}_{file.filename}")
    
    try:
        # HASHING_SECRET(시스템 페퍼)이 설정되었는지 확인
        if not SYSTEM_PEPPER:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="서버 설정 오류: HASHING_SECRET(시스템 페퍼)이 설정되지 않았습니다."
            )
            
        # 4. 업로드된 파일 임시 저장
        with open(temp_original_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            

        user_secret_key = generate_user_secret_key(
            user_id=user_id, 
            department_kr=department_kr, 
            system_pepper=SYSTEM_PEPPER
        )

        # 6. 사용자 비밀 키를 이용해 해시 생성
        hash_value = generate_chroma_hash(temp_original_path, user_secret_key)
        
        if not hash_value:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="해시 생성에 실패했습니다. 파일 형식을 확인해주세요."
            )
        
        # 7. 해시 포함 파일 저장 (metadata 삽입)
        save_image_with_hash(temp_original_path, temp_hashed_path, hash_value)

        # 8. Supabase Storage에 '해시 포함 파일' 업로드
        
        # 파일명을 UUID와 확장자로만 구성하여 안전하게 변경
        _, file_extension = os.path.splitext(temp_hashed_path)
        storage_filename = f"{storage_prefix}/{file_uuid}{file_extension}"
        
        # 파일 확장자 기반 Content-Type 결정 및 명시적 지정
        mime_type, _ = mimetypes.guess_type(temp_hashed_path)
        if not mime_type or not mime_type.startswith('image/'):
            mime_type = 'image/jpeg' 

        with open(temp_hashed_path, 'rb') as f:
            supabase.storage.from_(STORAGE_BUCKET_NAME).upload( 
                path=storage_filename,
                file=f,
                file_options={"content-type": mime_type} 
            )
        
        # 9. [DB 저장] 메타데이터 저장 (department 정보 포함)
        db_data = {
            "id": str(file_uuid),                 
            "image_url": storage_filename,        
            "title": file.filename,               
            "hash": hash_value,                   
            "user_id": user_id,
            "department": department_kr,
        }
        
        db_response = supabase.table("gallery").insert(db_data).execute()
        
        return {
            "message": "파일 업로드 및 해시 저장 성공",
            "file_data": db_response.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"업로드 중 예상치 못한 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"파일 업로드 중 서버 오류가 발생했습니다: {str(e)}"
        )
    
    finally:
        # 10. 임시 파일 삭제
        if os.path.exists(temp_original_path):
            os.remove(temp_original_path)
        if os.path.exists(temp_hashed_path):
            os.remove(temp_hashed_path)