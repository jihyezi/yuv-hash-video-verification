from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
import os

from app.core.supabase_client import supabase
from app.routers.auth import get_current_user

router = APIRouter(prefix="/project", tags=["Project"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
STORAGE_BUCKET_NAME = "Gallery"


# =========================================
# 📌 1) 부서별 이미지 목록 조회 (권한 포함)
# =========================================
@router.get("/list")
def get_project_images(
    department_id: Optional[str] = None,
    current_user=Depends(get_current_user)
):
    try:
        # 유저 정보
        user_id = current_user.get("id")
        user_department = current_user.get("department_id")
        authority = current_user.get("authority")

        # ✔ department_id 없이 요청하면 자동으로 자기 부서
        if not department_id:
            department_id = user_department

        # 🔥 권한 체크
        if authority != "admin":
            if str(department_id) != str(user_department):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="해당 부서에 접근할 권한이 없습니다."
                )

        # ✔ Supabase에서 이미지 가져오기
        response = (
            supabase.table("gallery")
            .select("*, user:user_id(username)")
            .eq("department_id", department_id)
            .order("created_at", desc=True)
            .execute()
        )

        images = response.data

        # 이미지 URL 변환
        for img in images:
            path = img["image_url"]
            full_url = (
                f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET_NAME}/{path}"
            )
            img["full_url"] = full_url

        return images

    except Exception as e:
        print("🔥 get_project_images ERROR:", e)
        raise HTTPException(status_code=500, detail="이미지 목록 불러오기 실패")


# =========================================
# 📌 2) 이미지 삭제 (활동 로그 포함)
# =========================================
@router.delete("/delete")
def delete_image(image_id: str, current_user=Depends(get_current_user)):
    try:
        # 1. 유저 ID 추출
        user_id = current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="유저 ID가 없습니다.")

        print("\n========== [이미지 삭제 시작] ==========")
        print(f"사용자 ID: {user_id}")
        print(f"삭제 요청한 이미지 ID: {image_id}")

        # 1) gallery 테이블에서 이미지 정보 가져오기
        image_data = (
            supabase.table("gallery")
            .select("image_url, title")
            .eq("id", image_id)
            .single()
            .execute()
        )

        if not image_data.data:
            raise HTTPException(status_code=404, detail="이미지를 찾을 수 없습니다.")

        image_row = image_data.data
        file_path = image_row["image_url"]
        file_title = image_row["title"]

        print(f"삭제 파일 경로: {file_path}")

        # 2) Supabase Storage 파일 삭제
        storage_res = supabase.storage.from_(STORAGE_BUCKET_NAME).remove([file_path])
        print("Storage 삭제 결과:", storage_res)

        # 3) gallery 테이블에서 row 삭제
        delete_res = (
            supabase.table("gallery")
            .delete()
            .eq("id", image_id)
            .execute()
        )
        print("DB 삭제 결과:", delete_res)

        # 4) 사용자 닉네임 조회
        username_res = (
            supabase.table("user")
            .select("username")
            .eq("id", user_id)
            .single()
            .execute()
        )
        username = username_res.data.get("username", "Unknown User")

        # 5) 활동 로그 기록
        supabase.table("activity_log").insert({
            "user_id": user_id,
            "username": username,
            "activity_type": "파일 삭제",
            "target_object": file_title,
            "status": "완료"
        }).execute()

        print("=====================================\n")

        return {"message": "삭제 완료"}

    except Exception as e:
        print("🔥 삭제 중 오류:", e)
        raise HTTPException(status_code=500, detail="이미지 삭제 실패")
