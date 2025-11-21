from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime

# --- auth ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str
    department_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- user ---
class UserDisplay(BaseModel):
    id: str  
    username: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

# --- gallery ---
class GalleryCreate(BaseModel):
    title: str       # 제목
    image_url: str   # 이미지_URL
    hash: str        # 해시

class GalleryDisplay(BaseModel):
    id: str
    created_at: datetime.datetime 
    title: str
    image_url: str
    user_id: str     # 사용자_아이디

    class Config:
        orm_mode = True # ORM 객체를 Pydantic 모델로 변환