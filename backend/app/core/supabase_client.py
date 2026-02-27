import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Final



current_dir = os.path.dirname(os.path.realpath(__file__))
# app/core -> app -> backend -> root
env_path = os.path.join(current_dir, "..", "..", "..", ".env")
load_dotenv(dotenv_path=env_path)

SUPABASE_URL: Final[str] = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY: Final[str] = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_ANON_KEY: Final[str] = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_URL 또는 SUPABASE_SERVICE_KEY가 .env에 없습니다.")

# 일반 클라이언트 (service_role 키 → 풀 권한, RLS 우회 가능)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# 관리자 전용 클라이언트 (동일 키지만 명시적 분리)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# anon 키 클라이언트 – JWT + RLS 엄격 적용 시 사용
if SUPABASE_ANON_KEY:
    supabase_anon: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
else:
    supabase_anon = None 

import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.info("Supabase 클라이언트 초기화 완료 (service_role 키 사용)")