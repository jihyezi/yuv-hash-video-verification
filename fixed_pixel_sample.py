import numpy as np
from PIL import Image
import pillow_heif

# HEIC/HEIF 파일 형식을 PIL에서 사용할 수 있도록 등록합니다.
pillow_heif.register_heif_opener()

def select_fixed_pixels(y_channel, width, height, hash_size=8):
    """
    Y 채널에서 고정된 픽셀을 선택합니다.
    
    Args:
        y_channel (np.ndarray): Y(밝기) 채널 데이터.
        width (int): 이미지의 너비.
        height (int): 이미지의 높이.
        hash_size (int): 해시를 생성할 격자의 크기 (예: 8x8).
        
    Returns:
        list: 선택된 픽셀들의 밝기 값 리스트.
    """
    sampled_pixels = []
    
    # 각 격자 셀의 크기 계산
    step_x = width // hash_size
    step_y = height // hash_size
    
    # 픽셀 샘플링 (중앙 좌표 기준)
    for i in range(hash_size):
        for j in range(hash_size):
            # 격자 내 중앙 좌표 계산
            x = j * step_x + (step_x // 2)
            y = i * step_y + (step_y // 2)
            
            # Y 채널에서 픽셀 값 추출
            pixel_value = y_channel[y, x]
            sampled_pixels.append(pixel_value)
            
    return sampled_pixels

# --- 코드 실행 부분 ---
if __name__ == "__main__":
    try:
        # 1. HEIC 이미지 파일 열기
        file_path = 'IMG_3543.HEIC'
        img = Image.open(file_path)
        
        # 2. 이미지를 YCbCr 컬러 스페이스로 변환 (Y=밝기, Cb/Cr=색차)
        img_ycbcr = img.convert('YCbCr')
        
        # 3. numpy 배열로 변환하고 Y 채널만 추출
        np_img = np.array(img_ycbcr)
        y_channel = np_img[:, :, 0] # Y 채널은 첫 번째 채널입니다.
        
        # 4. 이미지의 너비와 높이 가져오기
        width, height = img.size
        
        # 5. 함수 호출하여 픽셀 샘플링 실행
        selected_pixels = select_fixed_pixels(y_channel, width, height)
        
        print(f"이미지 크기: {width}x{height}")
        print(f"선택된 픽셀 개수: {len(selected_pixels)}")
        print(f"선택된 픽셀 값 (밝기): {selected_pixels}")

    except FileNotFoundError:
        print(f"오류: '{file_path}' 파일을 찾을 수 없습니다. 스크립트와 같은 폴더에 있는지 확인하세요.")
    except Exception as e:
        print(f"이미지 처리 중 오류가 발생했습니다: {e}")