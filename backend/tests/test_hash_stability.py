import sys
import os
import uuid
from PIL import Image
import piexif
import shutil
import hashlib

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.append(project_root)

from security.hash import generate_chroma_hash, save_image_with_hash
from security.verify_logic import read_hash_from_metadata 
from security.au import generate_user_secret_key 


# --- 테스트 환경 설정 ---
TEMP_DIR = os.path.join(project_root, "test_temp_files") # 프로젝트 루트에 임시 폴더 생성
os.makedirs(TEMP_DIR, exist_ok=True)

# 테스트에 사용할 시뮬레이션 데이터
TEST_USER_ID = str(uuid.uuid4())
TEST_DEPT_ID = "test_department_alpha"
TEST_PEPPER = "this-is-a-very-secret-system-pepper-for-tests"
TEST_KEY = generate_user_secret_key(TEST_USER_ID, TEST_DEPT_ID, TEST_PEPPER)
TEST_FILE_NAME = "original_test_image.jpeg" 

# --- 헬퍼 함수: 메타데이터 변경 ---
def change_image_metadata(image_path, new_comment):
    """
    이미지 파일을 열어 EXIF UserComment 필드를 변경합니다.
    """
    try:
        img = Image.open(image_path)
        
        # 1. 기존 EXIF 데이터 로드
        exif_dict = piexif.load(img.info.get("exif", b"")) # 'exif' 키가 없을 경우 대비
        
        # 2. UserComment 필드 변경
        exif_dict["Exif"][piexif.ExifIFD.UserComment] = new_comment.encode('utf-8')
        
        # 3. 새로운 EXIF 바이트 생성
        exif_bytes = piexif.dump(exif_dict)
        
        # 4. 새 메타데이터로 파일 저장 (픽셀 데이터는 보존)
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        # Ensure the file is saved with the new EXIF data
        img.save(image_path, exif=exif_bytes, quality=95)
        print(f"✅ 메타데이터 변경 완료: {image_path}")
        return True
    except Exception as e:
        print(f"❌ 메타데이터 변경 실패: {e}")
        return False


def test_hash_stability_metadata():
    """
    HASH-001 테스트: 메타데이터 수정 시 Chroma Hash 불변성 검증
    """
    # 1. 테스트 파일 경로 설정
    original_path = os.path.join(TEMP_DIR, TEST_FILE_NAME)
    hashed_original_path = os.path.join(TEMP_DIR, f"hashed_{TEST_FILE_NAME}")
    suspect_path = os.path.join(TEMP_DIR, f"suspect_{TEST_FILE_NAME}")

    # 🚨 파일 존재 여부 확인 (경로가 project_root/test_temp_files로 변경됨)
    if not os.path.exists(original_path):
        print(f"\n--- 🚨 테스트 실패: 필수 이미지 파일 없음 ---")
        print(f"    '{original_path}' 경로에 원본 테스트 이미지(JPEG 또는 PNG)를 넣어주세요.")
        return False
    
    try:
        # --- A. 원본 해시 생성 및 파일 저장 (DB 등록 시점 시뮬레이션) ---
        original_hash = generate_chroma_hash(original_path, TEST_KEY)
        assert original_hash is not None, "Chroma Hash 생성 실패"
        
        # 이 해시를 메타데이터에 포함하여 파일 저장
        save_image_with_hash(original_path, hashed_original_path, original_hash)
        print(f"\n--- 1. 원본 해시 및 파일 등록 완료 ---")
        print(f"    참조 해시 (Hash_Ref): {original_hash}")


        # --- B. 검증용 파일 준비 및 메타데이터 수정 ---
        shutil.copyfile(hashed_original_path, suspect_path) # 원본(해시 포함) 복사
        
        new_comment = "이것은 고의적으로 삽입된 다른 메타데이터입니다. - 2025/12/01"
        change_image_metadata(suspect_path, new_comment) # 메타데이터만 변경


        # --- C. 검증: 메타데이터가 바뀐 파일에서 해시 재 생성 ---
        hash_from_suspect = generate_chroma_hash(suspect_path, TEST_KEY)
        
        assert hash_from_suspect is not None, "검증 파일에서 해시 재 생성 실패"
        print(f"\n--- 2. 검증 파일 해시 재 생성 완료 ---")
        print(f"    재 생성 해시 (Hash_New): {hash_from_suspect}")


        # --- D. 최종 검증 및 비교 ---
        print("\n--- 3. 최종 비교 ---")
        if original_hash == hash_from_suspect:
            print("✅ HASH-001 PASS: 메타데이터가 변경되어도 해시가 일치합니다.")
            return True
        else:
            print("❌ HASH-001 FAIL: 메타데이터 변경으로 인해 해시가 변동되었습니다.")
            return False

    finally:
        # --- E. 뒷정리 ---
        for f in [original_path, hashed_original_path, suspect_path]:
            if os.path.exists(f) and f != original_path: # original_path는 임시 폴더 내의 파일이므로 삭제해야 함
                os.remove(f)

# --- 테스트 실행 ---
if __name__ == "__main__":
    test_hash_stability_metadata()