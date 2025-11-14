import hashlib

def generate_user_secret_key(user_id, system_pepper):
    """
    사용자 ID(솔트)와 시스템 페퍼를 조합하여, 예측 불가능하고 고유한
    사용자별 비밀 키를 생성합니다.
    """
    # 사용자 ID와 시스템 페퍼를 바이트로 변환하여 합칩니다.
    data_to_hash = user_id.encode('utf-8') + system_pepper.encode('utf-8')
    
    # SHA-256 해시 함수를 사용하여 최종 비밀 키를 생성합니다.
    secret_key = hashlib.sha256(data_to_hash).hexdigest()
    return secret_key


