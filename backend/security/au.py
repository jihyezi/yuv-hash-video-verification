import hashlib
from typing import Optional

def generate_user_secret_key(user_id: str, department_kr: Optional[str], system_pepper: str) -> str:
   
    # department_kr이 NULL일 경우 'unassigned'를 사용하여 키 생성
    key_basis = department_kr if department_kr else "unassigned"
    
    # 부서명과 시스템 페퍼를 바이트로 변환하여 합칩니다.
    data_to_hash = key_basis.encode('utf-8') + system_pepper.encode('utf-8')
    
    # SHA-256 해시 함수를 사용하여 최종 비밀 키(부서 공유 키)를 생성합니다.
    secret_key = hashlib.sha256(data_to_hash).hexdigest()
    return secret_key