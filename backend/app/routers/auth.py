from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from pydantic import BaseModel

from app.db.schemas import UserCreate, UserLogin
from app.core.supabase_client import supabase, supabase_admin

router = APIRouter(prefix="/auth", tags=["Auth"])

security = HTTPBearer()

class RefreshTokenReq(BaseModel):
    refresh_token: str

# -----------------------------
# 현재 사용자 정보 가져오기
# -----------------------------
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    try:
        token = credentials.credentials
        user_auth_res = supabase.auth.get_user(token)
        if not user_auth_res or not user_auth_res.user:
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰")
        
        auth_user = user_auth_res.user
        user_id = auth_user.id
        user_email = auth_user.email

        # user 테이블에서 username, department_id, authority 가져오기
        user_db_res = supabase.table("user").select("username, department_id, authority").eq("id", user_id).execute()

        username = "이름 정보 없음"
        department_name = "부서 미지정"
        department_id = None
        authority = "user"  # 기본값

        if user_db_res.data:
            username = user_db_res.data[0].get("username")
            department_id = user_db_res.data[0].get("department_id")
            authority = user_db_res.data[0].get("authority", "user")

            if department_id:
                dept_res = supabase.table("department").select("name").eq("id", department_id).execute()
                if dept_res.data:
                    department_name = dept_res.data[0]["name"]

        return {
            "id": user_id,
            "email": user_email,
            "username": username,
            "department_id": department_id,
            "department": department_name,
            "authority": authority
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="인증 실패",
            headers={"WWW-Authenticate": "Bearer"},
        )

# -----------------------------
# 부서 목록 조회
# -----------------------------
@router.get("/departments")
def get_departments():
    try:
        response = supabase.table("department").select("id, name").execute()
        return response.data if response.data else []
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"부서 목록 조회 실패: {str(e)}")

# -----------------------------
# 회원가입
# -----------------------------
@router.post("/signup")
def create_user(user_in: UserCreate):
    try:
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
            "authority": getattr(user_in, "authority", "user"),  # 기본값 user
            "created_at": str(auth_creation_time)
        }

        response = supabase.table("user").insert(insert_data).execute()
        if not response.data:
            supabase_admin.auth.admin.delete_user(auth_user_id)
            raise HTTPException(status_code=400, detail="DB 프로필 생성 실패")

        # 활동 로그 기록
        supabase.table("activity_log").insert({
            "user_id": auth_user_id,
            "username": user_in.username,
            "activity_type": "회원가입",
            "target_object": user_in.email,
            "status": "완료"
        }).execute()

        return {"auth_user": auth_response.user, "db_profile": response.data}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

# -----------------------------
# 로그인
# -----------------------------
@router.post("/login")
def login_user(user_in: UserLogin):
    try:
        session = supabase.auth.sign_in_with_password({
            "email": user_in.email,
            "password": user_in.password
        })

        user_id = session.user.id
        user_email = session.user.email

        user_data = supabase.table("user").select("username, department_id, authority").eq("id", user_id).execute()

        username = ""
        department_name = "부서 미지정"
        department_id = None
        authority = "user"

        if user_data.data:
            data = user_data.data[0]
            username = data["username"]
            department_id = data.get("department_id")
            authority = data.get("authority", "user")
            if department_id:
                dept_res = supabase.table("department").select("name").eq("id", department_id).execute()
                if dept_res.data:
                    department_name = dept_res.data[0]["name"]
        else:
            username = session.user.email.split("@")[0]

        # 로그인 활동 기록
        supabase.table("activity_log").insert({
            "user_id": user_id,
            "username": username,
            "activity_type": "로그인",
            "target_object": "관리자 시스템",
            "status": "성공"
        }).execute()

        return {
            "access_token": session.session.access_token,
            "refresh_token": session.session.refresh_token,
            "token_type": "bearer",
            "expires_in": session.session.expires_in,
            "user_info": {
                "id": user_id,
                "email": user_email,
                "username": username,
                "department_id": department_id,
                "department": department_name,
                "authority": authority
            }
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail="로그인 실패")

# -----------------------------
# 토큰 갱신
# -----------------------------
@router.post("/refresh")
def refresh_token(req: RefreshTokenReq):
    try:
        res = supabase.auth.refresh_session(req.refresh_token)
        if not res.session:
            raise HTTPException(status_code=401, detail="토큰 갱신 실패")

        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "token_type": "bearer"
        }

    except Exception:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰")
