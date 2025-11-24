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
    department_id: Optional[str] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    model_config = {
        "from_attributes": True
    }


# --- gallery ---
class GalleryCreate(BaseModel):
    title: str
    image_url: str
    hash: str


class GalleryDisplay(BaseModel):
    id: str
    created_at: datetime.datetime
    title: str
    image_url: str
    user_id: str
    department_id: Optional[str] = None

    model_config = {
        "from_attributes": True  # ❗ pydantic v2 호환 설정
    }
