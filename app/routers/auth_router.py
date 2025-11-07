from fastapi import APIRouter
from app.models.schemas import SignUpIn, LoginIn, UserOut, TokenOut

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserOut)
async def signup(data: SignUpIn):
    return UserOut(id=1, email=data.email, username=data.username)

@router.post("/login", response_model=TokenOut)
async def login(data: LoginIn):
    return TokenOut(access_token="dummy")
