from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.supabase_client import supabase, supabase_admin
from app.routers.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])


# ==========================
# 📌 Pydantic 모델
# ==========================
class InviteMember(BaseModel):
    email: str
    team: str   # 예: "법무", "기획", "sw개발"
    role: str = "User"


# ==========================
# 📌 팀원 목록 조회 (GET)
# ==========================
@router.get("/team")
def get_team_members(current_user: dict = Depends(get_current_user)):
    """
    user 테이블 + department 조합으로 팀원 목록 반환
    """
    try:
        # user 테이블 전체 조회
        res = (
            supabase.table("user")
            .select("id, username, department_id,  authority") #12.04hr
            .execute()
        )

        print("🔥 Supabase user rows:", res.data)

        result = []

        for row in res.data:
            department_id = row.get("department_id")
            username = row.get("username")
            user_id = row.get("id")

            # 부서 이름 조회
            dept = (
                supabase.table("department")
                .select("name")
                .eq("id", department_id)
                .execute()
            )
            department_name = dept.data[0]["name"] if dept.data else "부서 미지정"

            result.append({
                "id": user_id,
                "email": username,  # 현재는 username을 email 대신 사용
                "team": department_name,
                "role": (row.get("authority") or "user").strip()    # 역할 컬럼 없으므로 기본 User12.04hr
            })

        return result

    except Exception as e:
        print("🔥 팀원 조회 실패:", e)
        raise HTTPException(status_code=500, detail="팀원 조회 실패")



# ==========================
# 📌 팀원 초대 (POST)
# ==========================
@router.post("/team")
def invite_member(data: InviteMember, current_user: dict = Depends(get_current_user)):
    """
    Supabase Auth 초대 이메일 자동 발송 + user 테이블 row 생성
    """
    try:
        # 1) Supabase 초대 이메일 생성 + 발송
        link_res = supabase_admin.auth.admin.generate_link(
            {
                "type": "invite",
                "email": data.email
            }
        )

        if not link_res or not link_res["user"]:
            raise HTTPException(status_code=400, detail="초대 이메일 발송 실패")

        user = link_res["user"]
        user_id = user["id"]

        # 2) team → department_id로 변환
        department_name_full = f"{data.team}팀"  # 예: 법무팀

        dept_res = (
            supabase.table("department")
            .select("id")
            .eq("name", department_name_full)
            .execute()
        )

        if not dept_res.data:
            raise HTTPException(status_code=400, detail="해당 부서가 존재하지 않습니다")

        department_id = dept_res.data[0]["id"]

        # 3) user 테이블에 새 유저 추가
        username = data.email.split("@")[0]

        supabase.table("user").insert({
            "id": user_id,
            "username": username,
            "department_id": department_id
        }).execute()

        # 4) 프론트에서 쓰기 쉽게 반환
        return {
            "id": user_id,
            "email": data.email,
            "team": department_name_full,
            "role": "User"
        }

    except Exception as e:
        print("🔥 초대 실패:", e)
        raise HTTPException(status_code=500, detail="초대 실패")



# ==========================
# 📌 팀원 삭제 (DELETE)
# ==========================
@router.delete("/team/{user_id}")
def delete_member(user_id: str, current_user: dict = Depends(get_current_user)):
    """
    Supabase Auth 계정 + user 테이블 row 동시 삭제
    """
    try:
        # auth.users 삭제
        supabase_admin.auth.admin.delete_user(user_id)

        # user 테이블 삭제
        supabase.table("user").delete().eq("id", user_id).execute()

        return {"message": "삭제 완료"}

    except Exception as e:
        print("🔥 삭제 실패:", e)
        raise HTTPException(status_code=500, detail="팀원 삭제 실패")
