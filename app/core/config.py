from dotenv import load_dotenv
import os

# .env 파일 강제 로드
load_dotenv()

class Settings:
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./uvhash.db")
    jwt_secret: str = os.getenv("JWT_SECRET", "dev_secret")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
    media_storage: str = os.getenv("MEDIA_STORAGE", "./storage")

settings = Settings()

# 원본 파일 저장 경로 (환경변수 없으면 ./storage)
MEDIA_STORAGE = os.getenv("MEDIA_STORAGE", "./storage")
