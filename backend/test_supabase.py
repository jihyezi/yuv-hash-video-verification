# test_supabase_select.py
from supabase import create_client, Client
from dotenv import load_dotenv
import os

# 1️⃣ .env 파일 로드
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise RuntimeError("❌ SUPABASE_URL 또는 SUPABASE_ANON_KEY가 .env에 없습니다!")

print("✅ SUPABASE_URL =", SUPABASE_URL)

# 2️⃣ Supabase 클라이언트 생성
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# 3️⃣ user 테이블 데이터 조회
try:
    res = supabase.table("user").select("id, username, created_at").execute()
    print("✅ SELECT 결과:")
    if res.data:
        for row in res.data:
            print(f"🧍‍♂️ id={row['id']}, username={row.get('username')}, created_at={row.get('created_at')}")
    else:
        print("⚠️ user 테이블에 데이터가 없습니다.")
except Exception as e:
    print("❌ 오류 발생:", e)
