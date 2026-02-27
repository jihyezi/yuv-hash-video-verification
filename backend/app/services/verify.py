# app/services/verify.py
from typing import BinaryIO

def verify_with_external(file_obj: BinaryIO, expected_hash: str) -> bool:
    """
    보안팀 verification.py 사용 시
    """
    try:
        from security.verification import verify_hash  # 예: verify_hash(data, expected)
        file_obj.seek(0)
        data = file_obj.read()
        file_obj.seek(0)
        return bool(verify_hash(data, expected_hash))
    except Exception:
        return False  # 외부가 없으면 False 반환(또는 내부 비교로 대체)
