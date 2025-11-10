# app/routers/media.py

import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.utils.deps import get_db, get_current_user
from app.db.models import Media, User
from app.schemas.media import MediaOut

# ✅ 보안 관련 유틸 (보안팀 코드)
from security.hash import generate_chroma_hash, save_image_with_hash
from security.au import generate_user_secret_key


# ✅ 라우터 등록
router = APIRouter(prefix="/media", tags=["media"])


# ✅ storage 절대경로 설정 (항상 프로젝트 루트에 저장)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MEDIA_STORAGE = os.path.join(BASE_DIR, "storage")
os.makedirs(MEDIA_STORAGE, exist_ok=True)

print(f"📁 실제 저장 경로: {MEDIA_STORAGE}")


@router.post("/upload", response_model=MediaOut)
async def upload_media(
    f: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    print("🟢 /media/upload 실행됨")

    # 1️⃣ 원본 파일 저장
    temp_path = os.path.join(MEDIA_STORAGE, f.filename)
    content = await f.read()
    with open(temp_path, "wb") as out:
        out.write(content)
    print(f"✅ 원본 저장 완료: {temp_path}")

    # 2️⃣ 사용자 비밀키 생성
    SYSTEM_PEPPER = "gr63-ob87-secret-pepper-lh44-mercedes-win-!@#$!%^&"
    secret_key = generate_user_secret_key(user.email, SYSTEM_PEPPER)
    print(f"✅ 사용자 비밀키 생성 완료 (앞 10자리): {secret_key[:10]}")

    # 3️⃣ 이미지 해시 생성
    generated_hash = generate_chroma_hash(temp_path, secret_key)
    print(f"✅ 이미지 해시 생성 완료: {generated_hash[:10]}...")

    # 4️⃣ 해시 삽입된 이미지 생성
    output_filename = f"{uuid.uuid4().hex}_hashed.jpeg"
    output_path = os.path.join(MEDIA_STORAGE, output_filename)

    print(f"⚙️ 해시 삽입 시도 중... ({output_path})")
    success = save_image_with_hash(temp_path, output_path, generated_hash)
    print(f"📦 저장 함수 반환값: {success}")

    if not success:
        print("❌ save_image_with_hash 실패! 저장 로직 확인 필요.")
        raise HTTPException(status_code=500, detail="해시 이미지 저장 실패")

    # 5️⃣ DB에 메타데이터 저장
    media = Media(
        owner_id=user.id,
        filename=output_filename,
        mimetype=f.content_type or "application/octet-stream",
        size_bytes=len(content),
        uv_hash=generated_hash,
    )

    db.add(media)
    db.commit()
    db.refresh(media)
    print(f"✅ DB 등록 완료 (id={media.id})")

    # ✅ ORM 객체 리턴 → Pydantic 모델이 자동 변환
    return media
