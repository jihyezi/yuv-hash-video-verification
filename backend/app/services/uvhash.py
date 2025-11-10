# app/services/uvhash.py
from typing import BinaryIO

# 1) 기본 폴백: sha256 (보안팀 모듈이 없거나 에러 시)
import hashlib

def _builtin_hash(file_obj: BinaryIO) -> str:
    file_obj.seek(0)
    sha = hashlib.sha256()
    for chunk in iter(lambda: file_obj.read(8192), b""):
        sha.update(chunk)
    file_obj.seek(0)
    return sha.hexdigest()

# 2) 보안팀 모듈 시도
_HAS_EXTERNAL = False
_external_hash_fn = None

try:
    # 보안팀이 제공할 수 있는 여러 형태를 대비한 어댑터
    from security.hash import generate_image_hash as _gen_hash  # 1안: 바이트/스트림 입력
    _external_hash_fn = _gen_hash
    _HAS_EXTERNAL = True
except Exception:
    try:
        from security.hash import generate_hash as _gen_hash2     # 2안: 함수명이 다를 때
        _external_hash_fn = _gen_hash2
        _HAS_EXTERNAL = True
    except Exception:
        _HAS_EXTERNAL = False
        _external_hash_fn = None

def compute_uv_hash(file_obj: BinaryIO, prefer_external: bool = True) -> str:
    """
    업로드된 파일 스트림으로부터 해시 생성.
    - 기본은 보안팀 함수 사용
    - 실패/미존재 시 sha256 폴백
    """
    if prefer_external and _HAS_EXTERNAL and _external_hash_fn:
        try:
            file_obj.seek(0)
            data = file_obj.read()
            file_obj.seek(0)
            # 보안팀 함수가 bytes를 받는다고 가정 (스트림이면 data 전달 대신 file_obj 넘겨도 됨)
            return _external_hash_fn(data)  # 필요 시 _external_hash_fn(file_obj)
        except Exception:
            # 보안팀 함수 에러 시 폴백
            return _builtin_hash(file_obj)
    return _builtin_hash(file_obj)
