# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.db import models
from app.routers import auth, media, verify  # ✅ verify 추가!
from app.routers import debug  # 임시 디버그 뷰가 있을 때만 유지

# --- FastAPI 앱 설정 ---
app = FastAPI(
    title="UV Hash Backend",
    version="0.1.0",
    description="Image/Video hash verification backend (JWT auth, media upload, hash record).",
)

# --- CORS (필요시 FE 도메인으로 교체) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # 배포 시 특정 도메인으로 제한 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DB 테이블 생성 (개발 편의용) ---
Base.metadata.create_all(bind=engine)

# --- 라우터 등록 ---
app.include_router(auth.router)
app.include_router(media.router)
app.include_router(debug.router)
app.include_router(verify.router)  # ✅ verify가 import되면 여기서 정상 작동!

# --- 기본/헬스 체크 ---
@app.get("/", tags=["health"])
def root():
    return {"status": "ok"}

@app.get("/health", tags=["health"])
def health():
    return {"ok": True}
