from dotenv import load_dotenv
load_dotenv() 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< HEAD
from app.routers import auth,images, verify, project, origincert, verifyresult, dashboard
=======
from app.routers import auth,images, verify, project,origincert, verifyresult, dashboard
>>>>>>> 2f9af04 (fix: 오류 해결)
import logging



logging.basicConfig(level=logging.DEBUG)
from fastapi.openapi.docs import get_swagger_ui_html

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
    ],
    docs_url="/docs",
)

# --- CORS (필요시 FE 도메인으로 교체) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # 모든 출처 허용 (디버깅용)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 라우터 등록 ---
app.include_router(auth.router)
app.include_router(images.router)
app.include_router(verify.router)
app.include_router(project.router)
app.include_router(dashboard.router)
app.include_router(origincert.router)
app.include_router(verifyresult.router) 



# --- 기본/헬스 체크 ---
@app.get("/", tags=["health"])
def root():
    return {"status": "ok"}

@app.get("/health", tags=["health"])
def health():
    return {"ok": True}