from fastapi import APIRouter, HTTPException, status, Header
from fastapi import Depends
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any 

from app.db.schemas import UserCreate, UserLogin
from app.core.supabase_client import supabase, supabase_admin
# activity_log 기록을 위해 supabase 클라이언트 재사용

router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    try:
        token = credentials.credentials 
        
        user_auth_res = supabase.auth.get_user(token)
        if not user_auth_res or not user_auth_res.user:
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰")
        
        auth_user = user_auth_res.user
        user_id = auth_user.id
        user_email = auth_user.email

        # DB에서 username, department_id 조회
        user_db_res = supabase.table("user").select("username, department_id").eq("id", user_id).execute()

        username = "이름 정보 없음"
        department_name = "부서 미지정"

        if user_db_res.data:
            username = user_db_res.data[0].get('username')
            dept_id_uuid = user_db_res.data[0].get("department_id")

            if dept_id_uuid:
                dept = supabase.table("department").select("name").eq("id", dept_id_uuid).execute()
                if dept.data:
                    department_name = dept.data[0]["name"]

        return {
            "id": user_id,
            "email": user_email,
            "username": username,
            "department": department_name
        }

    except HTTPException:
        raise
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
            # DB 생성 실패 시 Supabase auth의 유저도 삭제
            supabase_admin.auth.admin.delete_user(auth_user_id)
            raise HTTPException(status_code=400, detail="DB 프로필 생성 실패")
        
        # -----------------------------------------------------------
        # 활동 로그 기록: 회원가입 성공
        # -----------------------------------------------------------
        supabase.table("activity_log").insert({
            "user_id": auth_user_id,
            "username": user_in.username,
            "activity_type": "회원가입",
            "target_object": user_in.email,
            "status": "완료"
        }).execute()
        # -----------------------------------------------------------


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
            # user 테이블에 정보가 없을 경우 auth 테이블의 이메일 사용
            username = session.user.email.split("@")[0]

        # -----------------------------------------------------------
        # 활동 로그 기록: 로그인 성공
        # -----------------------------------------------------------
        supabase.table("activity_log").insert({
            "user_id": user_id,
            "username": username,
            "activity_type": "로그인",
            "target_object": "관리자 시스템",
            "status": "성공",
            # IP 주소는 FastAPI Request 객체에서 가져올 수 있으나, 현재 함수 시그니처에는 없음
        }).execute()
        # -----------------------------------------------------------


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