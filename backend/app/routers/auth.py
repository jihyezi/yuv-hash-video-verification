from fastapi import APIRouter, HTTPException, status
from app.db.schemas import UserCreate, UserLogin
from app.core.supabase_client import supabase, supabase_admin

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
def create_user(user_in: UserCreate):
    try:
        # 1. Supabase auth.users 테이블에 사용자 생성
        auth_response = supabase.auth.sign_up({
            "email": user_in.email,
            "password": user_in.password
        })

        if not auth_response.user or not auth_response.user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Auth 응답에 유저 정보가 없습니다.")

        auth_user_id = auth_response.user.id
        auth_creation_time = auth_response.user.created_at

        # 2. public.user 테이블에 추가 정보 (사용자 이름) 삽입
        response = supabase.table("user").insert({
            "id": auth_user_id,
            "username": user_in.username,
            "created_at": str(auth_creation_time)
        }).execute()
        
        if not response.data:  # 성공 시 data에 리스트 있음, 실패 시 []
            supabase_admin.auth.admin.delete_user(auth_user_id)
            raise HTTPException(status_code=400, detail="프로필 생성 실패")

        return {"auth_user": auth_response.user, "db_profile": response.data}

    except Exception as e:
        print(f"DEBUG: 발생한 오류 타입: {type(e)}")
        print(f"DEBUG: 발생한 오류 내용: {e}")
        
        detail_message = getattr(e, 'message', str(e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail_message)

@router.post("/login")
def login_user(user_in: UserLogin):
    try:
        session = supabase.auth.sign_in_with_password({
            "email": user_in.email,
            "password": user_in.password
        })
        return session
    
    except Exception as e:
        print(f"DEBUG: 발생한 오류 타입: {type(e)}")
        print(f"DEBUG: 발생한 오류 내용: {e}")
        
        detail_message = getattr(e, 'message', str(e))
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail_message)
