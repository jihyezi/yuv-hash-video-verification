import cv2
import numpy as np
import hashlib

# 고정 픽셀 추출
def get_yuv_average_hash(image_path, grid_size=10):
    try:
        rgb_image = cv2.imread(image_path)
        
        if rgb_image is None:
            print("오류: 이미지를 로드할 수 없습니다.")
            return None
        
        yuv_image = cv2.cvtColor(rgb_image, cv2.COLOR_BGR2YUV)

        height, width, _= yuv_image.shape
        pixel_values = []

# 각 격자 영역에서 UV 채널 평균값 추출
        for i in range(grid_size):
            for j in range(grid_size):
                x_center = int(width * (j + 0.5) / grid_size)
                y_center = int(height * (i + 0.5) / grid_size)

                x_start = max(0, x_center -1)
                x_end = min(width, x_center + 2)
                y_start = max(0, y_center -1)
                y_end = min(height, y_center + 2)

                uv_patch = yuv_image[y_start:y_end, x_start:x_end, 1:3]

                u_avg = np.mean(uv_patch[:,:,0])
                v_avg = np.mean(uv_patch[:,:,1])

                pixel_values.append(u_avg)
                pixel_values.append(v_avg)

        pixel_array = np.array(pixel_values, dtype=np.float32)

        return pixel_array
    
    except Exception as e:
        print(f"오류가 발생했습니다: {e}")
        return None
    
original_image_path = "example.jpg"
uv_pixel_data = get_yuv_average_hash(original_image_path)

if uv_pixel_data:
    print("성공적으로 추출된 UV 픽셀 데이터(일부):")
    print(uv_pixel_data[:10])
