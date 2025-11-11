# app/routers/verify.py

import os
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.utils.deps import get_db, get_current_user
from app.db.models import Media, User
from security.hash import generate_chroma_hash
from security.au import generate_user_secret_key

router = APIRouter(prefix="/verify", tags=["verify"])

MEDIA_STORAGE = "./storage"
os.makedirs(MEDIA_STORAGE, exist_ok=True)


@router.post("/")
async def verify_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    print("🟢 /verify 실행됨")

    # 1️⃣ 파일 임시 저장
    temp_path = os.path.join(MEDIA_STORAGE, f"verify_{file.filename}")
    content = await file.read()
    with open(temp_path, "wb") as out:
        out.write(content)
    print(f"✅ 검증용 파일 저장 완료: {temp_path}")

    # 2️⃣ 업로드 시와 동일한 비밀키 생성
    SYSTEM_PEPPER = "gr63-ob87-secret-pepper-lh44-mercedes-win-!@#$!%^&"
    secret_key = generate_user_secret_key(user.email, SYSTEM_PEPPER)
    print(f"🔑 검증용 비밀키 생성 완료 (앞 10자리): {secret_key[:10]}")

    # 3️⃣ 현재 입력 이미지의 해시 계산
    computed_hash = generate_chroma_hash(temp_path, secret_key)
    print(f"🧩 계산된 이미지 해시: {computed_hash}")

    # 4️⃣ DB에 등록된 해시와 비교
    match = db.query(Media).filter_by(owner_id=user.id, uv_hash=computed_hash).first()

    if match:
        print("✅ 해시 일치 — 위변조 없음")
        return {
            "result": "✅ 원본과 일치합니다 (위변조 없음)",
            "matched_file": match.filename,
            "uv_hash": computed_hash,
        }

    print("❌ 위변조 가능성 있음 (DB 해시 불일치)")
    return {
        "result": "❌ 위변조 가능성 있음",
        "computed_hash": computed_hash,
    }
