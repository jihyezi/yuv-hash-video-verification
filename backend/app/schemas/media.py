# app/schemas/media.py
from pydantic import BaseModel
from datetime import datetime

class MediaOut(BaseModel):
    id: int
    filename: str
    mimetype: str
    size_bytes: int
    uv_hash: str
    created_at: datetime
    stored_file: str | None = None  # 선택적 필드 허용

    class Config:
        orm_mode = True
