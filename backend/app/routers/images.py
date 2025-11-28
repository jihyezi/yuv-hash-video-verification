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
    # 1. 유저 ID 및 이름 추출 (AttributeError 방지)
    username_placeholder = "Unknown User"
    
    if isinstance(current_user, dict):

        user_id = current_user.get('id')
        # 딕셔너리에서 username 추출 시도
        username_placeholder = current_user.get('username', username_placeholder)

    else:
        # 객체에서 ID 및 username 추출 시도 (getattr 사용)
        user_id = getattr(current_user, 'id', None)
        username_placeholder = getattr(current_user, 'username', username_placeholder)

    if not user_id:
        raise HTTPException(status_code=401, detail="유저 ID를 찾을 수 없습니다.")

    
    folder_name = "unassigned" 
    department_id = None

    # --- 2. [DB 조회] 부서 정보 가져오기 ---
    try:
        user_res = supabase.table("user").select("department_id, username").eq("id", user_id).execute()
        
        if user_res.data and user_res.data[0]:
            user_data = user_res.data[0]
            
            # 조회된 사용자 이름으로 갱신
            username_placeholder = user_data.get('username', username_placeholder)
            department_id = user_data.get('department_id')
            
            if department_id:
                dept_res = supabase.table("department").select("folder_name").eq("id", department_id).execute()
                
                if dept_res.data and dept_res.data[0].get('folder_name'):
                    folder_name = dept_res.data[0]['folder_name'] 

    except Exception as e:
        print(f"부서/사용자 정보 조회 실패: {e}")
    
    # --- 3. 경로 설정 ---
    storage_prefix = f"originals/{folder_name}" 

    file_uuid = uuid.uuid4()
    temp_original_path = os.path.join(TEMP_DIR, f"temp_original_{file_uuid}_{file.filename}")
    temp_hashed_path = os.path.join(TEMP_DIR, f"temp_hashed_{file_uuid}_{file.filename}")
    
    try:
        if not SYSTEM_PEPPER:
            raise HTTPException(status_code=500, detail="HASHING_SECRET 설정 오류")
            
        with open(temp_original_path, "wb") as buffer:
            # 파일을 임시 경로에 복사
            shutil.copyfileobj(file.file, buffer)
            
        dept_arg = str(department_id) if department_id else "unknown"
        user_secret_key = generate_user_secret_key(user_id, dept_arg, SYSTEM_PEPPER)

        # 해시 생성 및 저장
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

        # API 호출 로그 기록
        supabase.table("api_calls").insert({
            "user_id": user_id,
            "type": "upload"
        }).execute()
        
        # 활동 로그 기록 (Activity Log)
        supabase.table("activity_log").insert({
            "user_id": user_id,
            "username": username_placeholder,
            "activity_type": "파일 등록",
            "target_object": file.filename,
            "status": "완료"
        }).execute()
        # -----------------------------------------------------------


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
        # 임시 파일 정리 (오류 발생 여부와 관계없이 실행)
        if os.path.exists(temp_original_path):
            os.remove(temp_original_path)
        if os.path.exists(temp_hashed_path):
            os.remove(temp_hashed_path)