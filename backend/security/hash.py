import hashlib
import numpy as np
from PIL import Image
import pillow_heif
import piexif
import os

# Register HEIC/HEIF file formats for PIL
pillow_heif.register_heif_opener()

def generate_chroma_hash(image_path, secret_key, num_pixels=64, quantization_level=4):
    """
    주어진 비밀 키를 사용하여 이미지 파일의 특징 해시를 생성합니다.
    """
    try:
        # 이미지 준비 (열기, YUV 변환, NumPy 배열화)
        img = Image.open(image_path)
        yuv_frame = np.array(img.convert('YCbCr'))
        height, width, _ = yuv_frame.shape

        # 비밀 키를 기반으로 재현 가능한 랜덤 좌표 생성
        seed_hash = int(hashlib.md5(secret_key.encode()).hexdigest(), 16)
        seed = seed_hash % (2**32)
        rng = np.random.RandomState(seed)
        
        x_coords = rng.randint(0, width, size=num_pixels)
        y_coords = rng.randint(0, height, size=num_pixels)
        
        # 좌표의 픽셀 값 추출 및 양자화
        data_to_hash = []
        quantization_step = 256 // quantization_level
        for x, y in zip(x_coords, y_coords):
            u_value = yuv_frame[y, x, 1]
            v_value = yuv_frame[y, x, 2]
            u_level = u_value // quantization_step
            v_level = v_value // quantization_step
            data_to_hash.append(f"{u_level}{v_level}")
        
        # 최종 해시 생성
        final_data_string = "".join(data_to_hash)
        sha256_hash = hashlib.sha256(final_data_string.encode('utf-8')).hexdigest()
        
        return sha256_hash
    except FileNotFoundError:
        print(f"Error: The file '{image_path}' was not found.")
        return None
    except Exception as e:
        print(f"An error occurred in hash_core: {e}")
        return None

def save_image_with_hash(image_path, output_path, hash_value):
    """
    이미지 파일을 열어 해시값을 메타데이터에 삽입한 후, 
    output_path의 확장자에 맞는 형식으로 저장합니다.
    """
    try:
        img = Image.open(image_path)
        
        _, ext = os.path.splitext(output_path)
        output_format = ext.lower().replace('.', '')
        
        if output_format == 'png':
            # PNG는 img.info 딕셔너리를 사용하여 메타데이터를 저장
            img.info["chroma_hash"] = hash_value
            img.save(output_path, format='PNG')
        elif output_format in ['jpg', 'jpeg']:
            # JPG/JPEG는 EXIF UserComment 필드를 사용하여 메타데이터를 저장
            user_comment_bytes = hash_value.encode('utf-8')
            exif_dict = {"Exif": {piexif.ExifIFD.UserComment: user_comment_bytes}}
            exif_bytes = piexif.dump(exif_dict)
            
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            img.save(output_path, exif=exif_bytes, quality=95)
        elif output_format == 'webp':
            # WebP는 PNG와 마찬가지로 img.info를 사용합니다.
            img.info["chroma_hash"] = hash_value
            img.save(output_path, format='WebP')
        else:
            print(f"[오류] 지원하지 않는 출력 포맷입니다: {output_format}")
            return False

        print(f"✅ 해시값이 메타데이터에 포함된 파일이 '{output_path}'에 저장되었습니다.")
        return True
        
    except Exception as e:
        print(f"파일 저장 중 오류가 발생했습니다: {e}")
        return False

