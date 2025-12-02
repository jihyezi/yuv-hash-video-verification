from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, Dict, Any, List
from app.core.supabase_client import supabase
from app.routers.auth import get_current_user 
router = APIRouter(prefix="/log", tags=["Activity Log"])


@router.get("/activity")
def get_activity_log(limit: int = 7):
    """최신 활동 로그를 조회하는 API"""
    try:
        response = (

            supabase.table("activity_log")
            .select("created_at, username, activity_type, target_object, status, ip_address")
            .order("created_at", desc=True) # 최신순 정렬
            .limit(limit)
            .execute()
        )
        
        return response.data
    
    except Exception as e:
        # 오류 처리 추가
        raise HTTPException(status_code=500, detail=f"로그 조회 실패: {e}")
