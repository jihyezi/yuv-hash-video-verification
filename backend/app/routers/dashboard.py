from fastapi import APIRouter, HTTPException, status
from app.core.supabase_client import supabase

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats():
    try:
        # 1. 등록된 건수 (Gallery 테이블 전체 카운트)
        gallery_res = supabase.table("gallery").select("*", count="exact", head=True).execute()
        gallery_count = gallery_res.count if gallery_res.count else 0

        # 2. 총 API 호출 횟수 (api_calls 테이블 카운트)
        api_res = supabase.table("api_calls").select("*", count="exact", head=True).execute()
        api_count = api_res.count if api_res.count else 0

        # 3. 사용자 수 (User 테이블 카운트)
        user_res = supabase.table("user").select("*", count="exact", head=True).execute()
        user_count = user_res.count if user_res.count else 0

        # 4. 위조 의심 발견 (verification_logs 테이블 카운트)
        # (검증 로그 테이블이 있다면 거기서 '위조' 판정된 수만 카운트)
        forgery_res = supabase.table("verification_logs")\
            .select("*", count="exact", head=True)\
            .eq("is_authentic", False)\
            .execute()
            
        forgery_count = forgery_res.count if forgery_res.count else 0

        # 5. 스토리지 사용량 (MB 단위)
        # (Gallery 테이블에 'size' 컬럼이 있다면 sum을 하겠지만, 없으면 개수 * 평균 2MB로 추정)
        # 정확하게 하려면 gallery 테이블에 'size' (int) 컬럼을 추가하고 저장 시 파일 크기를 넣어야 합니다.
        
        # 임시 계산: 등록된 건수 * 3MB
        estimated_usage_mb = gallery_count * 3 
        
        # GB 단위로 변환하여 문자열 포맷팅
        if estimated_usage_mb > 1024:
            storage_usage = f"{estimated_usage_mb / 1024:.2f} GB"
        else:
            storage_usage = f"{estimated_usage_mb} MB"

        return {
            "gallery_count": gallery_count,
            "api_count": api_count,
            "user_count": user_count,
            "forgery_count": forgery_count,
            "storage_usage": storage_usage
        }

    except Exception as e:
        print(f"대시보드 데이터 조회 실패: {e}")
        # 에러가 나도 화면이 안 깨지게 기본값 반환
        return {
            "gallery_count": 0,
            "api_count": 0,
            "user_count": 0,
            "forgery_count": 0,
            "storage_usage": "0 MB"
        }