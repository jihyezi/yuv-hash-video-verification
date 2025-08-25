import numpy as np

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

# 예시 사용법
if __name__ == "__main__":
    # 임의의 Y 채널 데이터 생성 (실제로는 이미지에서 추출)
    dummy_width, dummy_height = 640, 480
    dummy_y_channel = np.random.randint(0, 256, size=(dummy_height, dummy_width), dtype=np.uint8)
    
    # 함수 호출
    selected_pixels = select_fixed_pixels(dummy_y_channel, dummy_width, dummy_height)
    
    print(f"선택된 픽셀 개수: {len(selected_pixels)}")
    print(f"선택된 픽셀 값 (일부): {selected_pixels[:10]}")