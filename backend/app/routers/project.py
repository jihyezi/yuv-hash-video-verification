from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, Dict, Any, List
import os

# Supabase 클라이언트
from app.core.supabase_client import supabase
# 인증된 사용자 정보 가져오기
from app.routers.auth import get_current_user

router = APIRouter(prefix="/project", tags=["Project"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
STORAGE_BUCKET_NAME = "Gallery"


@router.get("/list")
def get_project_images(
    department_id: Optional[str] = None,
    current_user=Depends(get_current_user)
):
    """
    📌 특정 부서(department_id)의 이미지를 불러오는 API
    - department_id가 전달되면 해당 부서 이미지 조회
    - 전달되지 않으면 로그인한 유저의 부서 기준 조회
    """

    try:
        # 1. 유저 ID 추출 (AttributeError 방지)
        if isinstance(current_user, dict):

            user_id = current_user.get('id')
        else:
            user_id = getattr(current_user, 'id', None)

        if not user_id:

            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유저 ID를 찾을 수 없습니다.")
        
        print("\n========== [프로젝트 이미지 조회 시작] ==========")
        print(f"1. 요청자 사용자 ID: {user_id}")

        # 1) department_id가 없으면 로그인 유저의 부서 사용
        if not department_id:
            user_data = (
                supabase.table("user")
                .select("department_id")
                .eq("id", user_id)
                .execute()
            )

            if not user_data.data or not user_data.data[0].get("department_id"):
                print("🚨 이 유저는 department_id가 없습니다.")
                return []

            department_id = user_data.data[0]["department_id"]

        print(f"2. 조회할 부서 ID: {department_id}")

        # 2) 부서별 이미지 조회
        response = (
            supabase.table("gallery")
            .select("*")
            .eq("department_id", department_id)
            .order("created_at", desc=True)
            .execute()
        )

        images = response.data
        print(f"3. 조회된 이미지 개수: {len(images)}개")

        # 3) Storage URL 변환
        for img in images:
            path = img["image_url"]
            full_url = f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET_NAME}/{path}"
            img["full_url"] = full_url

        if images:
            print(f"4. 첫 번째 이미지 URL 예시: {images[0]['full_url']}")

        print("=============================================\n")

        return images

    except Exception as e:
        print("🔥 이미지 조회 오류:", e)
        raise HTTPException(status_code=500, detail="이미지 목록 불러오기 실패")

@router.delete("/delete")
def delete_image(
    image_id: str,
    current_user=Depends(get_current_user)
):
    """
    📌 이미지 삭제 API
    - gallery 테이블에서 해당 row 삭제
    - Supabase Storage에서도 파일 삭제
    """

    try:
        # 1. 유저 ID 추출 (AttributeError 방지)
        if isinstance(current_user, dict):
            user_id = current_user.get('id')
        else:
            user_id = getattr(current_user, 'id', None)
        
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="유저 ID를 찾을 수 없습니다.")

        print("\n========== [이미지 삭제 시작] ==========")
        print(f"1. 요청한 사용자 ID: {user_id}")
        print(f"2. 삭제 요청한 이미지 ID: {image_id}")

        # 1) gallery 테이블에서 이미지 정보 가져오기 (로그를 위해 title도 가져옴)
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
        file_title = image_row["title"] # 로그에 사용할 파일 제목 추출

        print(f"3. 삭제할 Storage 파일 경로: {file_path}")

        # 2) Supabase Storage 파일 삭제
        storage_res = supabase.storage.from_(STORAGE_BUCKET_NAME).remove([file_path])

        print("4. Storage 삭제 결과:", storage_res)

        # 3) gallery 테이블에서 row 삭제
        delete_res = (
            supabase.table("gallery")
            .delete()
            .eq("id", image_id)
            .execute()
        )

        print("5. DB 삭제 결과:", delete_res)
        
        # 4) 사용자 이름 조회 (활동 로그 기록용)
        username_res = supabase.table("user").select("username").eq("id", user_id).single().execute()
        username_placeholder = username_res.data.get("username", "Unknown User") if username_res.data else "Unknown User"

        # -----------------------------------------------------------
        # 활동 로그 기록 (Activity Log)
        supabase.table("activity_log").insert({
            "user_id": user_id,
            "username": username_placeholder,
            "activity_type": "파일 삭제",
            "target_object": file_title,
            "status": "완료"
        }).execute()
        # -----------------------------------------------------------

        print("=====================================\n")

        return {"message": "삭제 완료"}

    except Exception as e:
        print("🔥 삭제 중 오류:", e)
        raise HTTPException(status_code=500, detail="이미지 삭제 실패")