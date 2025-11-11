import os
from fastapi import FastAPI, HTTPException
from supabase_py import create_client, Client

# 1. Supabase URL 및 서비스 키 설정
# (실제 프로덕션에서는 .env 파일이나 환경 변수를 사용하세요)
SUPABASE_URL = "https://ldglxoqoburouvtlaqvr.supabase.co"  # 여기에 본인의 URL 붙여넣기
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ2x4b3FvYnVyb3V2dGxhcXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTQ1ODYsImV4cCI6MjA3NDY5MDU4Nn0.-rGc-dC_aarnBK9GERZjDi6UsSVY9mr414smFIB9Sa0" # 여기에 본인의 service_role 키 붙여넣기

# 2. Supabase 클라이언트 초기화
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Supabase 클라이언트 초기화 실패: {e}")
    # 실제로는 앱을 시작하지 않도록 처리할 수 있습니다.
    supabase = None

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "FastAPI 서버가 실행 중입니다."}

@app.get("/check-db")
def check_database_connection():
    """
    Supabase 'user' 테이블에 연결하여 첫 번째 사용자의 id를 가져옵니다.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase 클라이언트가 초기화되지 않았습니다.")

    try:
        # 3. 'user' 테이블에서 'id' 컬럼을 1개만 조회
        #   - .from_('user') : 테이블 이름이 'user'라고 가정
        #   - .select('id') : 'id' 컬럼만 선택
        #   - .limit(1) : 데이터 1개만 가져오기
        response = supabase.from_('user').select('id').limit(1).execute()

        # 4. 결과 확인
        if response.data:
            # 데이터가 성공적으로 조회됨
            first_user_id = response.data[0]['id']
            return {
                "status": "success",
                "message": "Supabase 연동 성공!",
                "user_id": first_user_id
            }
        else:
            # 연동은 되었으나 'user' 테이블에 데이터가 없는 경우
            return {
                "status": "warning",
                "message": "Supabase 연결은 되었으나 'user' 테이블에 데이터가 없습니다."
            }

    except Exception as e:
        # 5. 오류 처리 (URL, 키, 테이블명 오류 등)
        raise HTTPException(status_code=500, detail=f"데이터베이스 조회 오류: {str(e)}")

# 서버 실행을 위해 (터미널에서 uvicorn main:app —reload 입력)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)