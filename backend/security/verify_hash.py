import os
import piexif
from PIL import Image
import pillow_heif

pillow_heif.register_heif_opener()

def read_image_hash(input_path):
    """
    저장된 이미지 파일에서 메타데이터 해시값을 읽어 반환합니다.
    (JPG는 EXIF UserComment, PNG/WebP는 img.info에서 추출)
    """
    try:
        if not os.path.exists(input_path):
            print(f"❌ 오류: 파일을 찾을 수 없습니다: '{input_path}'")
            return None
            
        img = Image.open(input_path)
        _, ext = os.path.splitext(input_path)
        ext = ext.lower().replace('.', '')
        
        extracted_hash = None

        if ext == 'png' or ext == 'webp':
            # PNG/WebP: img.info에서 'chroma_hash' 키 확인
            extracted_hash = img.info.get("chroma_hash")
            print(f"[{ext.upper()}] img.info에서 해시 확인:")
        
        elif ext in ['jpg', 'jpeg']:
            # JPG/JPEG: EXIF UserComment에서 해시 확인
            exif_dict = piexif.load(img.info["exif"])
            user_comment = exif_dict["Exif"].get(piexif.ExifIFD.UserComment)
            
            if user_comment:
                extracted_hash = user_comment.decode('utf-8').lstrip('\x00')
                print(f"[JPG/JPEG] EXIF UserComment에서 해시 확인:")
            else:
                print(f"[JPG/JPEG] EXIF UserComment 필드가 비어 있습니다.")

        print(f"  -> 추출된 해시: {extracted_hash}")
        return extracted_hash

    except KeyError as ke:
        print(f"❌ 오류: 파일 '{input_path}'에 EXIF/메타데이터 정보가 없습니다. ({ke})")
        return None
    except Exception as e:
        print(f"해시 읽기 중 오류 발생: {e}")
        return None

if __name__ == "__main__":
    
    CURRENT_USER = "seoyun_dev"
    TARGET_IMAGE_NAME = 'example.jpg' 
    
    original_base_name = os.path.splitext(TARGET_IMAGE_NAME)[0]
    original_ext = os.path.splitext(TARGET_IMAGE_NAME)[1].lower()
    
    print("\n--- 메타데이터 검증 시작 ---")
    
    if original_ext in ('.heic', '.heif'):
        final_file_name = f"{original_base_name}_hashed.png"
    else:
        final_file_name = f"{original_base_name}_hashed{original_ext}"
        
    read_image_hash(final_file_name)
    
    print("-" * 28)
    print("검증 완료. 추출된 해시값을 main.py의 '최종 생성된 특징 해시'와 비교하세요.")
