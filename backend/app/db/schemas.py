from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime

# --- auth ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str # 사용자 이름
    department: str   # 부서 추가

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- user ---
class UserDisplay(BaseModel):
    id: str  
    username: str
    department: str #부서
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

    