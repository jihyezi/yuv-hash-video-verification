from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class ImageHash(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="user.id")
    # 실제 이미지 저장 위치(선택)
    filename: Optional[str] = None
    # 해시값
    hash_hex: str
    # 메타데이터(JSON 문자열로 저장해도 됨. 간단히 문자열)
    meta_json: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
