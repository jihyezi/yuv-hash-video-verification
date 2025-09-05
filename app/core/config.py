# app/core/config.py
from pydantic_settings import BaseSettings
from pydantic import computed_field

class Settings(BaseSettings):
    PROJECT_NAME: str = "UV Hash Backend"
    # SQLite 로컬 DB (파일명: app.db)
    DATABASE_URL: str = "sqlite:///./app.db"

    # JWT
    SECRET_KEY: str = "change-this-in-production-please"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1시간

    @computed_field  # type: ignore
    @property
    def sql_echo(self) -> bool:
        return False  # True로 바꾸면 SQL 로그가 보임

settings = Settings()
