import hashlib
import numpy as np
from PIL import Image
import pillow_heif

# HEIC/HEIF 파일 형식을 PIL에서 사용할 수 있도록 등록
pillow_heif.register_heif_opener()

def generate_chroma_hash(image_path, secret_key, num_pixels=64, quantization_level=4):
    """
    이미지 파일로부터 YUV(YCbCr) 기반 SHA-256 해시를 생성합니다.

    Args:
        image_path (str): 해시를 생성할 이미지 파일의 경로.
        secret_key (str): 픽셀 좌표 생성을 위한 비밀 키.
        num_pixels (int): 해시 생성에 사용할 픽셀의 개수.
        quantization_level (int): U, V 값을 나눌 구간의 수.

    Returns:
        str: 64자리의 16진수 SHA-256 해시.
        Or None if an error occurs.
    """
    try:
        # --- 1. 이미지 열기 및 YUV(YCbCr) 변환 ---
        img = Image.open(image_path)
        ycbcr_img = img.convert('YCbCr')
        yuv_frame = np.array(ycbcr_img)
        
        height, width, _ = yuv_frame.shape

        # --- 2. '어디서' 뽑을 것인가? (비밀 키 기반 좌표 생성) ---
        # MD5 해시 값을 32비트 정수 범위로 변환하여 시드로 사용 (오류 수정)
        seed_hash = int(hashlib.md5(secret_key.encode()).hexdigest(), 16)
        seed = seed_hash % (2**32)
        rng = np.random.RandomState(seed)
        
        x_coords = rng.randint(0, width, size=num_pixels)
        y_coords = rng.randint(0, height, size=num_pixels)
        
        # --- 3. '무엇을' 뽑을 것인가? (양자화 규칙 적용) ---
        data_to_hash = []
        quantization_step = 256 // quantization_level

        for x, y in zip(x_coords, y_coords):
            # YCbCr에서 Cb(U), Cr(V) 값 추출 (Y=0, Cb=1, Cr=2)
            u_value = yuv_frame[y, x, 1]
            v_value = yuv_frame[y, x, 2]
            
            u_level = u_value // quantization_step
            v_level = v_value // quantization_step
            
            data_to_hash.append(f"{u_level}{v_level}")
        
        final_data_string = "".join(data_to_hash)

        # --- 4. '어떻게' 잠글 것인가? (SHA-256 해싱) ---
        data_bytes = final_data_string.encode('utf-8')
        sha256_hash = hashlib.sha256(data_bytes).hexdigest()
        
        return sha256_hash

    except FileNotFoundError:
        print(f"Error: The file '{image_path}' was not found.")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# --- 메인 실행 부분 ---
if __name__ == "__main__":
    # 사용할 이미지 파일 경로
    target_image = 'IMG_3543.HEIC'
    
    # 사용할 비밀 키 (이 키가 같아야 항상 같은 해시가 나옴)
    MY_SECRET_KEY = "project-gamma-2025-seoyun"
    
    # 최종 함수 호출
    image_hash = generate_chroma_hash(target_image, MY_SECRET_KEY)
    
    # 결과 출력
    if image_hash:
        print(f"이미지 파일: {target_image}")
        print(f"사용한 비밀 키: {MY_SECRET_KEY}")
        print("-" * 30)
        print(f"생성된 최종 해시: {image_hash}")

