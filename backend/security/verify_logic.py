# verify_logic.py
from PIL import Image
import pillow_heif
import piexif
import os

# hash.py
from security.hash import generate_chroma_hash, save_image_with_hash 

pillow_heif.register_heif_opener()


# (1) 메타데이터에서 해시 읽기
def read_hash_from_metadata(image_path):
    try:
        img = Image.open(image_path)
        
        if "chroma_hash" in img.info:
            return img.info["chroma_hash"]
        
        if "exif" in img.info:
            exif_data = piexif.load(img.info["exif"])
            if "Exif" in exif_data and piexif.ExifIFD.UserComment in exif_data["Exif"]:
                hash_value_bytes = exif_data["Exif"][piexif.ExifIFD.UserComment]
                try:
                    hash_value = hash_value_bytes.decode('utf-8')
                except UnicodeDecodeError:
                    hash_value = hash_value_bytes.decode('latin-1')
                return hash_value.strip().split('\x00')[0]

        print(f"[{os.path.basename(image_path)}]에서 메타데이터 해시를 찾을 수 없습니다.")
        return None
        
    except Exception as e:
        print(f"메타데이터 읽기 중 오류 발생 ({os.path.basename(image_path)}): {e}")
        return None

# (2) 두 이미지 비교 및 검증
def verify_image(original_image_path, uploaded_image_path, secret_key):
    print(f"\n--- 🔎 이미지 검증 시작 ---")
    print(f"  [DB 원본]: {os.path.basename(original_image_path)}")
    print(f"  [검증 대상]: {os.path.basename(uploaded_image_path)}")
    
    # 1. 원본 이미지에서 메타데이터의 해시값 추출
    hash_from_metadata = read_hash_from_metadata(original_image_path)
    
    if hash_from_metadata is None:
        message = "🚨 [검증 실패] 원본 이미지에서 해시를 읽을 수 없습니다."
        print(message)
        return False, message

    print(f"  > [메타데이터 해시]: {hash_from_metadata}")

    # 업로드된 이미지에서 새로 해시 생성 (hash.py에서 불러온 함수 사용)
    hash_from_uploaded = generate_chroma_hash(
        uploaded_image_path, 
        secret_key
    )

    if hash_from_uploaded is None:
        message = "🚨 [검증 실패] 업로드된 이미지에서 해시를 생성할 수 없습니다."
        print(message)
        return False, message
        
    print(f"  > [업로드 생성 해시]: {hash_from_uploaded}")

    # 3. 두 해시 값 비교
    if hash_from_metadata == hash_from_uploaded:
        message = "✅ [검증 결과] 원본 이미지입니다."
        print(message)
        return True, message
    else:
        message = "❌ [검증 결과] 위조된 이미지입니다."
        print(message)
        return False, message
