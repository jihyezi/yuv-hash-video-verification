# 다른 파일에서 필요한 함수들을 가져옵니다 (import).
from au import generate_user_secret_key
from hash import generate_chroma_hash, save_image_with_hash

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

            # 3. 해시값을 메타데이터에 삽입하여 파일로 저장 (JPG, PNG, WebP로 저장)
            output_image_path_jpg = f"hashed_{user_id}_image.jpg"
            save_image_with_hash(image_path, output_image_path_jpg, generated_hash)
            
            output_image_path_png = f"hashed_{user_id}_image.png"
            save_image_with_hash(image_path, output_image_path_png, generated_hash)

            output_image_path_webp = f"hashed_{user_id}_image.webp"
            save_image_with_hash(image_path, output_image_path_webp, generated_hash)

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
    TARGET_IMAGE = 'IMG_3543.HEIC'
    SYSTEM_PEPPER = "gr63-ob87-secret-pepper-lh44-mercedes-win-!@#$!%^&"
    
    # 메인 프로세스 실행
    run_main_process(CURRENT_USER, TARGET_IMAGE, SYSTEM_PEPPER)

