from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime

# --- auth ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
<<<<<<< HEAD
    username: str # 사용자 이름
    department: str   # 부서 추가
=======
    username: str
    department_id: Optional[str] = None
>>>>>>> b266ea55353fa7dcbef0b3f30bf16e1efed76d3a

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

    