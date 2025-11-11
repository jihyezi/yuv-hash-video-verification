
from pydantic import BaseModel, EmailStr

class SignUpIn(BaseModel):
    email: EmailStr
    password: str
    username: str

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
