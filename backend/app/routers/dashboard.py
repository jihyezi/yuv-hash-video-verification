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
        forgery_res = supabase.table("verification_log")\
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
    
@router.get("/files")
def get_recent_files(limit: int = 5):
    try:
        # gallery 테이블을 조회하면서
        # 1. user_id를 통해 user 테이블의 username 가져오기
        # 2. department_id를 통해 department 테이블의 name 가져오기
        response = (
            supabase.table("gallery")
            .select("""
                id, 
                title, 
                created_at,
                user:user_id ( username ),
                department:department_id ( name )
            """)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        
        formatted_data = []
        if response.data:
            for item in response.data:
                # 관계 데이터 가져오기 (없을 경우 대비해 .get 사용)
                user_obj = item.get("user") or {}
                dept_obj = item.get("department") or {}
                
                formatted_data.append({
                    "id": item["id"],
                    "file_name": item["title"],  # DB의 title을 프론트엔드에선 file_name으로 쓰거나 title로 맞춰주면 됨
                    "created_at": item["created_at"],
                    "username": user_obj.get("username", "알 수 없음"),   # user 테이블의 username
                    "department": dept_obj.get("name", "공용")            # department 테이블의 name
                })
            
        return formatted_data

    except Exception as e:
        print(f"파일 목록 조회 실패: {e}")
        # 에러 발생 시 빈 배열 반환해서 프론트엔드 멈춤 방지
        return []