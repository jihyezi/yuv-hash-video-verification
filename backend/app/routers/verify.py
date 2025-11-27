from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
import os
import shutil
import uuid
from app.core.supabase_client import supabase
from security.au import generate_user_secret_key
from security.verify_logic import verify_image
from app.routers.auth import get_current_user # 현재 사용자 정보 가져오기

router = APIRouter(prefix="/verify", tags=["Verify"])

SYSTEM_PEPPER = os.getenv("HASHING_SECRET")
TEMP_DIR = "temp_verify"
STORAGE_BUCKET_NAME = "Gallery"

# 임시 폴더 생성
os.makedirs(TEMP_DIR, exist_ok=True)

@router.post("/detect")
async def detect_forgery(
    file: UploadFile = File(...),      # 검증할 파일
    original_file_id: str = Form(...),  # 비교 대상인 원본 ID
    current_user = Depends(get_current_user) 
):
    
    # 1. 유저 ID 및 이름 추출 (AttributeError 방지 및 로그용)
    username_placeholder = "Unknown User"
    
    if isinstance(current_user, dict):
        user_id = current_user.get('id')
        username_placeholder = current_user.get('username', username_placeholder)
    else:
        user_id = getattr(current_user, 'id', None)
        username_placeholder = getattr(current_user, 'username', username_placeholder)

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유저 ID를 찾을 수 없습니다.")

    # 임시 파일명 생성 (충돌 방지용 UUID 사용)
    request_uuid = str(uuid.uuid4())
    temp_original_path = None
    temp_suspect_path = None
    
    try:
        # --- [1] DB에서 원본 정보 조회 ---
        response = supabase.table("gallery")\
            .select("image_url, user_id, department_id, title")\
            .eq("id", original_file_id)\
            .execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="원본 이미지를 찾을 수 없습니다.")
            
        original_data = response.data[0]
        
        storage_path = original_data['image_url']     
        owner_user_id = original_data['user_id']       
        owner_dept_id = original_data['department_id']
        original_title = original_data['title'] # 로그에 사용할 파일 제목 추출

        # ▼▼▼ [디버깅 코드 추가] ▼▼▼
        print(f"\n🔎 [다운로드 경로 확인]")
        print(f" - 버킷 이름: {STORAGE_BUCKET_NAME}")
        print(f" - 파일 경로: {storage_path}")
        print(f" - 전체 URL (추정): {supabase.storage_url}/object/public/{STORAGE_BUCKET_NAME}/{storage_path}\n")

        # 저장된 파일 경로에서 확장자 추출
        _, file_extension = os.path.splitext(storage_path)
        
        # 확장자가 없으면 기본값 jpg 사용
        if not file_extension:
            file_extension = ".jpg"

        # 추출한 확장자를 사용하여 임시 파일 경로 설정
        temp_original_path = os.path.join(TEMP_DIR, f"original_{request_uuid}{file_extension}")
        
        # 의심 파일은 원래 확장자 그대로 사용
        temp_suspect_path = os.path.join(TEMP_DIR, f"suspect_{request_uuid}_{file.filename}")

        # --- [2] Supabase에서 원본 다운로드 ---
        try:
            file_bytes = supabase.storage.from_(STORAGE_BUCKET_NAME).download(storage_path)
            with open(temp_original_path, "wb") as f:
                f.write(file_bytes)
        except Exception as e:
            print(f"다운로드 실패: {e}")
            raise HTTPException(status_code=500, detail="원본 파일을 불러오는데 실패했습니다.")

        # --- [3] 검증 대상 파일 임시 저장 ---
        with open(temp_suspect_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # --- [4] 비밀키 복구 ---
        if not SYSTEM_PEPPER:
            raise HTTPException(status_code=500, detail="시스템 페퍼 설정 오류")
            
        dept_arg = str(owner_dept_id) if owner_dept_id else "unknown"
        secret_key = generate_user_secret_key(owner_user_id, dept_arg, SYSTEM_PEPPER)

        # --- [5] 검증 로직 실행 ---
        is_authentic, message = verify_image(temp_original_path, temp_suspect_path, secret_key)
        
        # 검증 상태 설정 (로그 및 반환용)
        verification_status = "통과" if is_authentic else "실패"

        try:
            # API 호출 로그 기록
            supabase.table("api_calls").insert({
                "user_id": user_id,
                "type": "verify" 
            }).execute()

            # verification_log 기록 (대시보드 통계용)
            supabase.table("verification_log").insert({
                "user_id": user_id,
                "file_name": file.filename,
                "is_authentic": is_authentic 
            }).execute()
            
            # -----------------------------------------------------------
            # 활동 로그 기록 (Activity Log)
            # -----------------------------------------------------------
            supabase.table("activity_log").insert({
                "user_id": user_id,
                "username": username_placeholder,
                "activity_type": "파일 검증",
                "target_object": original_title, # 원본 파일명을 로그 대상으로 기록
                "status": verification_status # '통과' 또는 '실패'
            }).execute()
            # -----------------------------------------------------------

        except Exception as log_e:
            print(f"로그 기록 실패 (activity_log/verification_log): {log_e}")
            # 로그 기록 실패는 500 오류를 발생시키지 않음 (주요 기능 아님)
            pass

        return {
            "status": "success",
            "is_authentic": is_authentic, 
            "message": message,
            "original_id": original_file_id
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"검증 에러: {e}")
        raise HTTPException(status_code=500, detail=f"검증 중 오류 발생: {str(e)}")
    
    finally:
        # --- [Step 6] 뒷정리 ---
        if temp_original_path and os.path.exists(temp_original_path):
            os.remove(temp_original_path)
        if temp_suspect_path and os.path.exists(temp_suspect_path):
            os.remove(temp_suspect_path)


@router.get("/list")
async def get_department_gallery_list(current_user=Depends(get_current_user)):
    # 1. 유저 ID 추출 (AttributeError 방지)
    if isinstance(current_user, dict):
        user_id = current_user.get('id')
    else:
        user_id = getattr(current_user, 'id', None)

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유저 ID를 찾을 수 없습니다.")

    try:
        # 기존 users → user 테이블로 변경
        user_response = supabase.table("user").select("department_id").eq("id", user_id).single().execute()
        
        if user_response.data is None:
            # 부서 정보가 없는 경우 빈 리스트 반환 가능
            return []
        
        department_id = user_response.data["department_id"]

        # 여기서 department_id로 갤러리 리스트 조회
        gallery_response = supabase.table("gallery").select("*").eq("department_id", department_id).execute()
        return gallery_response.data

    except Exception as e:
        # 오류 발생 시 HTTPException 반환
        raise HTTPException(status_code=500, detail=f"갤러리 목록 조회 실패: {str(e)}")