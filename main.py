# 다른 파일에서 필요한 함수들을 가져옵니다 (import).
from au import generate_user_secret_key
from hash import generate_chroma_hash, save_image_with_hash
import os
from PIL import Image
import pillow_heif

def run_main_process(user_id, image_path, system_pepper):
    """
    한 명의 사용자와 하나의 이미지에 대한 해시 생성 프로세스를 실행합니다.
    """
    try:
        print(f"--- 프로세스 시작 ---")
        print(f"사용자: {user_id}")
        print(f"이미지: {image_path}")

        # 1. 사용자 고유 비밀 키 생성
        user_secret_key = generate_user_secret_key(user_id, system_pepper)
        print(f"사용자 비밀 키 생성 완료 (앞 10자리): {user_secret_key[:10]}...")

        # 2. 이미지 특징 해시 생성
        generated_hash = generate_chroma_hash(image_path, user_secret_key)
        
        if generated_hash:
            print("-" * 20)
            print(f"최종 생성된 특징 해시: {generated_hash}")

            # 3. 입력 포맷 확인 및 출력 포맷 결정
            _, input_ext = os.path.splitext(image_path)
            input_ext = input_ext.lower()

            final_output_ext = input_ext  
            input_path_for_hash = image_path  
        
            # 3-A. HEIC 파일 특수 처리: PNG로 변환 및 임시 저장
            if input_ext in ('.heic', '.heif'):
                print("▶ HEIC/HEIF 파일 감지: PNG로 변환 후 메타데이터 삽입을 시도합니다.")
            
                img = Image.open(image_path)
                temp_image_path = f"temp_{user_id}_converted.png"
                img.save(temp_image_path, format='PNG')
            
                final_output_ext = '.png'
                input_path_for_hash = temp_image_path
        
            # 4. 해시값을 메타데이터에 삽입하여 단일 파일로 저장
            original_base_name = os.path.splitext(image_path)[0]
            output_image_path = f"{original_base_name}_hashed{final_output_ext}"
        
            save_success = save_image_with_hash(
                input_path_for_hash, 
                output_image_path, 
                generated_hash
            )

            print("--- 프로세스 성공 ---")
            return generated_hash
        else:
            raise Exception("해시 생성에 실패했습니다.")

    except FileNotFoundError:
        print(f"\n[오류] 파일을 찾을 수 없습니다: {image_path}")
        return None
    except Exception as e:
        print(f"\n[오류] 프로세스 중 예외가 발생했습니다: {e}")
        return None

# --- 이 파일이 직접 실행될 때만 아래 코드가 작동합니다 ---
if __name__ == "__main__":
    # --- 실행 환경 설정 ---
    # 실제 서비스에서는 이 값들을 외부(예: 사용자 입력, 서버 환경변수)에서 받아옵니다.
    CURRENT_USER = "seoyun_dev"
    TARGET_IMAGE = 'example.jpg'
    SYSTEM_PEPPER = "gr63-ob87-secret-pepper-lh44-mercedes-win-!@#$!%^&"
    
    # 메인 프로세스 실행
    run_main_process(CURRENT_USER, TARGET_IMAGE, SYSTEM_PEPPER)

