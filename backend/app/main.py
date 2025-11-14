# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth,images

# --- FastAPI 앱 설정 ---
app = FastAPI(
    title="UV Hash Backend",
    version="0.1.0",
    description="Image/Video hash verification backend (JWT auth, media upload, hash record).",
    servers=[
        {
            "url": "http://127.0.0.1:8000", # 서버 주소
            "description": "Local development server"
        }
    ]
)

# --- CORS (필요시 FE 도메인으로 교체) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # 배포 시 특정 도메인으로 제한 권장
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 라우터 등록 ---
app.include_router(auth.router)
app.include_router(images.router)



# --- 기본/헬스 체크 ---
@app.get("/", tags=["health"])
def root():
    return {"status": "ok"}

@app.get("/health", tags=["health"])
def health():
    return {"ok": True}
