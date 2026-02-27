import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
GALLERY_TABLE = "gallery"

def insert_gallery_record(id: str, user_id: str, image_url: str, file_hash: str, title: str = None): 
    url = f"{SUPABASE_URL}/rest/v1/{GALLERY_TABLE}"

    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    payload = {
        "id": id,
        "user_id": user_id,
        "image_url": image_url,
        "hash": file_hash,
        "title": title if title is not None and title.strip() != "" else None
    }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()

        print(f"DB 삽입 성공. Gallery ID: {id}")
        return response.json()
    
    except requests.exceptions.HTTPError as err:
        print(f"DB 삽입 실패 - HTTP 오류: {err}")
        print(f"    응답 본문: {response.text}")
        return None
    except Exception as e:
        print(f"DB 삽입 중 예외 발생: {e}")
        return None