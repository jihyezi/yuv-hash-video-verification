from fastapi import APIRouter, HTTPException, status, Header
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

from app.db.schemas import UserCreate, UserLogin
from app.core.supabase_client import supabase, supabase_admin

router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()

# ★ [수정 2] 토큰 검증 함수 변경 (Header -> Depends(security))
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Swagger UI의 'Authorize' 버튼을 활성화하고, 
    입력된 토큰을 자동으로 파싱해서 검증합니다.
    """
    try:
        # HTTPBearer가 자동으로 "Bearer "를 떼고 토큰만 줍니다.
        token = credentials.credentials 
        
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰")
        return user.user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증 실패",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
# --- 부서 목록 조회 ---
@router.get("/departments")
def get_departments():
    try:
        response = supabase.table("department").select("id, name").execute()
        return response.data if response.data else []
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"부서 목록 조회 실패: {str(e)}")

# --- 회원가입 ---
@router.post("/signup")
def create_user(user_in: UserCreate):
    print("🔥 DEBUG user_in:", user_in)
    print("🔥 받은 department_id:", user_in.department_id)
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

        insert_data = {
            "id": auth_user_id,
            "username": user_in.username,
            "department_id": user_in.department_id,
            "created_at": str(auth_creation_time)
        }
        
        response = supabase.table("user").insert(insert_data).execute()
        
        if not response.data:
            supabase_admin.auth.admin.delete_user(auth_user_id)
            raise HTTPException(status_code=400, detail="DB 프로필 생성 실패")

        return {"auth_user": auth_response.user, "db_profile": response.data}

    except Exception as e:
        print(f"Signup Error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# --- 로그인 ---
@router.post("/login")
def login_user(user_in: UserLogin):
    try:
        session = supabase.auth.sign_in_with_password({
            "email": user_in.email,  
            "password": user_in.password
        })

        user_id = session.user.id
        user_email = session.user.email

        user_data = supabase.table("user").select("username, department_id").eq("id", user_id).execute()

        username =""
        department_name = "부서 미지정"

        if user_data.data and len(user_data.data) > 0:
            data = user_data.data[0]
            username = data['username']
            
            dept_id_uuid = data.get('department_id')

            if dept_id_uuid:
                dept_res = supabase.table("department").select("name").eq("id", dept_id_uuid).execute()
                if dept_res.data:
                    department_name = dept_res.data[0]['name']
        else: 
            username = session.user.email.split("@")[0]

        return {
            "access_token": session.session.access_token,
            "token_type": "bearer",
            "expires_in": session.session.expires_in,
            "user_info": {
                "id": user_id,            # UUID
                "email": user_email,      # 이메일
                "username": username,     # 유저 이름
                "department": department_name # 부서 이름
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail="로그인 실패: 아이디/비번을 확인하세요.")
