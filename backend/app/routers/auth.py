from fastapi import APIRouter, HTTPException, status
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm
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
def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        session = supabase.auth.sign_in_with_password({
            "email": form_data.username,   # Supabase는 email을 username처럼 사용
            "password": form_data.password
        })

        user_id = session.user.id
        user_email = session.user.email

        user_data = supabase.table("user").select("username").eq("id", user_id).execute()

        username =""
        if user_data.data and len(user_data.data) > 0:
            username = user_data.data[0]['username']
        else: 
            username = session.user.email.split("@")[0]

        return {
            "access_token": session.session.access_token,
            "token_type": "bearer",
            "expires_in": session.session.expires_in,
            "user_info": {
                "id": user_id,            # UUID
                "email": user_email,      # 이메일
                "username": username # 유저 이름
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="로그인 실패: 아이디/비번을 확인하세요.")
