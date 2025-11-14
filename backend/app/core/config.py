from dotenv import load_dotenv
import os

# .env 파일 강제 로드
load_dotenv()

class Settings:
    supabase_url: str = os.getenv("SUPABASE_URL")
    supabase_service_key: str = os.getenv("SUPABASE_SERVICE_KEY")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY")

settings = Settings()
