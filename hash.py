import hashlib
import numpy as np
from PIL import Image
import pillow_heif

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

