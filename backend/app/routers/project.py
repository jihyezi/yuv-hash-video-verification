from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional, Dict, Any, List
import os

# Supabase 클라이언트
from app.core.supabase_client import supabase
# Auth에서 유저 확인 함수 가져오기
from app.routers.auth import get_current_user 

router = APIRouter(prefix="/project", tags=["Project"])

SUPABASE_URL = os.getenv("SUPABASE_URL") 
STORAGE_BUCKET_NAME = "Gallery"

@router.get("/list")
def get_project_images(
    current_user = Depends(get_current_user) 
):
    try:
        user_id = current_user.id 
        
        # ▼ [확인용 로그 1] 요청한 사람 확인
        print(f"\n========== [프로젝트 이미지 조회 시작] ==========")
        print(f"1. 요청자 ID: {user_id}")

        # 1. 내 부서 ID 찾기
        user_data = supabase.table("user").select("department_id").eq("id", user_id).execute()
        
        if not user_data.data or not user_data.data[0].get('department_id'):
            print("🚨 [주의] 이 유저는 department_id가 없습니다.")
            return []

        my_dept_id = user_data.data[0]['department_id']
        
        # ▼ [확인용 로그 2] 부서 ID 확인
        print(f"2. 조회된 부서 ID: {my_dept_id}")

        # 2. 내 부서의 사진들만 조회
        response = supabase.table("gallery")\
            .select("*")\
            .eq("department_id", my_dept_id)\
            .order("created_at", desc=True)\
            .execute()
        
        images = response.data
        
        # ▼ [확인용 로그 3] 가져온 이미지 개수 확인
        print(f"3. DB에서 찾은 이미지 개수: {len(images)}개")

        # 3. 이미지 URL 완성하기
        for img in images:
            path = img['image_url']
            full_url = f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET_NAME}/{path}"
            img['full_url'] = full_url 
            
        # ▼ [확인용 로그 4] 첫 번째 이미지 URL 확인 (잘 만들어졌나?)
        if len(images) > 0:
            print(f"4. 첫 번째 이미지 URL 예시: {images[0]['full_url']}")
            
        print(f"=============================================\n")

        return images

    except Exception as e:
        print(f"🔥 이미지 조회 에러 발생: {e}")
        raise HTTPException(status_code=500, detail="이미지 목록을 불러오지 못했습니다.")