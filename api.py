import os
import shutil
from fastapi import FastAPI, UploadFile, File, Form, HTTPException

# 우리가 만든 모듈들을 가져옵니다.
# (au.py와 hash.py가 이 파일과 같은 폴더에 있어야 합니다)
from au import generate_user_secret_key
from hash import generate_chroma_hash

# FastAPI 앱 생성
app = FastAPI(title="ChromaGuard API")

@app.post("/generate-hash/")
async def create_hash_for_image(
    user_id: str = Form(...), 
    image_file: UploadFile = File(...)
):
    """
    사용자 ID와 이미지 파일을 받아, 고유한 특징 해시를 생성하는 API.
    - user_id: 해시를 생성할 사용자의 ID (문자열)
    - image_file: 해시를 생성할 이미지 파일
    """
    # 1. 시스템 페퍼를 안전하게 환경 변수에서 불러오기
    SYSTEM_PEPPER = os.getenv("SYSTEM_PEPPER")
    if not SYSTEM_PEPPER:
        # 서버에 페퍼가 설정되지 않았으면, 보안상 에러를 발생시켜야 합니다.
        raise HTTPException(status_code=500, detail="Error: System pepper is not configured.")

    # 2. 업로드된 파일을 임시로 디스크에 저장
    #    (기존 hash.py의 함수가 파일 경로를 입력으로 받기 때문입니다.)
    temp_file_path = f"temp_{image_file.filename}"
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(image_file.file, buffer)

        # 3. 사용자별 고유 비밀 키 생성
        user_secret_key = generate_user_secret_key(user_id, SYSTEM_PEPPER)

        # 4. 이미지 특징 해시 생성
        generated_hash = generate_chroma_hash(temp_file_path, user_secret_key)
        
        if not generated_hash:
            raise HTTPException(status_code=400, detail="Failed to generate hash. The image file might be corrupt or unsupported.")

        # 5. 성공 시, 생성된 해시를 JSON 형태로 반환
        return {"status": "success", "user_id": user_id, "filename": image_file.filename, "hash": generated_hash}

    except Exception as e:
        # 예상치 못한 에러가 발생했을 경우
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")

    finally:
        # 6. 성공하든 실패하든, 임시 파일은 반드시 삭제
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.get("/")
def read_root():
    return {"message": "Welcome to ChromaGuard API!"}
