# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.utils import get_openapi

# (있다면) 프로젝트 설정
try:
    from app.core.config import settings
    APP_TITLE = getattr(settings, "PROJECT_NAME", "UV Hash Backend")
    APP_VERSION = getattr(settings, "VERSION", "0.1.0")
except Exception:
    APP_TITLE = "UV Hash Backend"
    APP_VERSION = "0.1.0"

# ---- FastAPI 앱 생성 ----
app = FastAPI(title=APP_TITLE, version=APP_VERSION)

# CORS (필요하면 도메인 추가)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # 프론트 주소로 좁히면 더 안전: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- 라우터 등록 ----
# 네가 이미 만든 라우터가 있으면 그대로 임포트해서 등록해줘.
try:
    from app.routers.auth import router as auth_router
    app.include_router(auth_router, prefix="/auth", tags=["auth"])
except Exception:
    # 아직 auth 라우터가 없다면 그냥 무시
    pass

try:
    from app.routers.hash import router as hash_router
    app.include_router(hash_router, prefix="/hash", tags=["hash"])
except Exception:
    pass

try:
    from app.routers.user import router as user_router
    app.include_router(user_router, prefix="/users", tags=["users"])
except Exception:
    pass

# ---- 기본 헬스/루트 ----
@app.get("/", tags=["default"])
def root():
    return {"message": "Hello, FastAPI is running!"}

# =========================================================
# 🔐 Swagger UI에 Authorize 버튼 추가 (Bearer JWT)
# =========================================================
# /auth/login 엔드포인트가 토큰 발급을 한다는 가정 (tokenUrl은 문서 표시용)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def custom_openapi():
    """
    Swagger 문서에 Bearer(JWT) 보안 스키마를 추가해 Authorize 버튼을 표시합니다.
    """
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description="UV Hash Backend API",
        routes=app.routes,
    )

    # components/securitySchemes 추가
    components = openapi_schema.get("components", {})
    security_schemes = components.get("securitySchemes", {})
    security_schemes["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
        # 필요하면 아래처럼 헤더 이름 명시 가능 (기본은 Authorization)
        # "in": "header",
        # "name": "Authorization",
    }
    components["securitySchemes"] = security_schemes
    openapi_schema["components"] = components

    # 전역 보안 요구(선택): 전역으로 인증 필요하게 설정. 특정 엔드포인트만 필요하면 라우터에서 deps로 제어.
    openapi_schema["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
