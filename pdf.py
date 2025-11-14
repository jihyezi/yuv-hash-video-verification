
import io
import os
import textwrap
import hashlib 
from datetime import datetime 

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, black, Color
from reportlab.lib.units import mm 
from reportlab.lib.utils import ImageReader # 이미지 삽입을 위해 추가

# --- 폰트 및 로고 파일 경로 설정 ---
FONT_BOLD_PATH = 'NanumGothicBold.ttf'
FONT_REGULAR_PATH = 'NanumGothic.ttf'
LOGO_FILENAME = 'star_logo.png' # 로고 파일명

# --- 한글 폰트 등록 (필수) ---
try:
    pdfmetrics.registerFont(TTFont('NanumGothicBold', FONT_BOLD_PATH))
    pdfmetrics.registerFont(TTFont('NanumGothic', FONT_REGULAR_PATH))
    print(f"'{FONT_BOLD_PATH}' / '{FONT_REGULAR_PATH}' 폰트 로드 성공.")
except Exception as e:
    print(f"Warning: 나눔고딕 폰트 로드 실패. 한글이 깨질 수 있습니다. (오류: {e})")
    print("스크립트와 같은 폴더에 폰트 파일이 있는지 확인하세요.")
    # 대체 폰트 등록 (오류 방지용)
    if 'NanumGothicBold' not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont('NanumGothicBold', 'Helvetica-Bold'))
    if 'NanumGothic' not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont('NanumGothic', 'Helvetica'))

# 혜안 브랜드 색상 정의
HYEAN_BLUE = HexColor('#003399')
HYEAN_GRAY = HexColor('#666666')
HYEAN_LIGHT_GRAY = HexColor('#F0F0F0')

def create_certificate_pdf(result_data, certificate_id, issue_date_str, verification_date_str):
    """
    검증 결과 데이터를 바탕으로 PDF 증명서를 생성합니다.

    Args:
        result_data (dict): DB에서 조회한 원본 파일 정보
            (예: {'dbFileName': ..., 'originalUploader': ..., 'uploadDate': ...})
        certificate_id (str): 증명서 고유 발급번호 (예: "CG-20251028-8980")
        issue_date_str (str): 증명서 발급일 (표시용 문자열, 예: "2025년 10월 28일")
        verification_date_str (str): 검증 요청 일시 (표시용 문자열, 예: "2025. 10. 28. 오후 8:04:51")

    Returns:
        io.BytesIO: 생성된 PDF 데이터가 담긴 버퍼
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4 # A4 용지 크기 (약 595.27, 841.89)

    # --- 1. 테두리 ---
    c.setStrokeColor(HYEAN_BLUE)
    c.setLineWidth(3)
    c.rect(20, 20, width - 40, height - 40) # 외부 테두리

    # --- 2. 상단 타이틀 및 로고 ---
    # 로고 삽입 (star_logo.png)
    logo_path = LOGO_FILENAME
    logo_drawn = False # 로고 드로잉 성공 여부 플래그
    if os.path.exists(logo_path):
        try:
            logo_width = 40
            logo_height = 40
            # A4 중앙, 상단에서 170 포인트 아래에 로고 중앙 배치
            c.drawImage(logo_path, width/2 - logo_width/2, height - 170, 
                        width=logo_width, height=logo_height, mask='auto')
            logo_drawn = True
        except Exception as e:
            print(f"Error: 로고 이미지 '{logo_path}' 처리 중 오류 발생: {e}")
            c.setFont('Helvetica', 10)
            c.setFillColor(black)
            c.drawCentredString(width / 2, height - 150, "[로고 이미지 로드 실패]")
    else:
        print(f"Warning: 로고 파일 '{logo_path}'을(를) 찾을 수 없습니다.")
        c.setFont('Helvetica', 10)
        c.setFillColor(HYEAN_GRAY)
        c.drawCentredString(width / 2, height - 150, "[로고 파일 없음]")

    # 타이틀
    c.setFont('NanumGothicBold', 24)
    c.setFillColor(black)
    c.drawCentredString(width / 2, height - 80, "디지털 원본 증명서")
    
    c.setFont('Helvetica', 12)
    c.setFillColor(HYEAN_GRAY)
    c.drawCentredString(width / 2, height - 100, "(Certificate of Origin)")

    c.setFont('NanumGothicBold', 20)
    c.setFillColor(HYEAN_BLUE)
    c.drawCentredString(width / 2, height - 140, "Hye-an (혜안)")


    # --- 3. 증명서 고유 정보 ---
    current_y = height - 250 # 섹션 시작 Y 좌표
    c.setFont('NanumGothicBold', 14)
    c.setFillColor(black)
    c.drawString(60, current_y, "증명서 고유 정보")
    c.setStrokeColor(HYEAN_LIGHT_GRAY) # 연한 회색 밑줄
    c.setLineWidth(1)
    c.line(60, current_y - 5, width - 60, current_y - 5)

    c.setFont('NanumGothic', 11)
    c.setFillColor(black)
    c.drawString(80, current_y - 30, f"증명서 발급번호: {certificate_id}")
    c.drawString(width / 2 + 20, current_y - 30, f"검증 요청일시: {verification_date_str}")
    
    # --- 4. 원본 등록 정보 (파일명 자동 줄바꿈) ---
    current_y -= 80 # 다음 섹션 Y 좌표
    c.setFont('NanumGothicBold', 14)
    c.setFillColor(black)
    c.drawString(60, current_y, "원본 등록 정보")
    c.setStrokeColor(HYEAN_LIGHT_GRAY)
    c.setLineWidth(1)
    c.line(60, current_y - 5, width - 60, current_y - 5)
    
    c.setFont('NanumGothic', 11)
    c.setFillColor(black)
    
    line_height = 18 # 줄 간격
    left_x = 80
    right_x = width / 2 + 20
    row1_y = current_y - 30 # 첫 번째 줄 Y 좌표
    
    # --- 파일명 (최대 2줄, 들여쓰기) ---
    filename_label = "원본 파일명: "
    filename_value = result_data.get('dbFileName', 'N/A')
    
    max_chars_per_line = 25 # 한 줄의 최대 글자 수 25
    
    # TextWrapper로 줄바꿈 로직 처리
    wrapper = textwrap.TextWrapper(
        width=max_chars_per_line,
        break_long_words=True, # 긴 단어 강제 줄바꿈
        break_on_hyphens=True, # 하이픈에서 줄바꿈
        replace_whitespace=False,
        drop_whitespace=False     
    )
    
    full_text = f"{filename_label}{filename_value}"
    wrapped_lines = wrapper.wrap(full_text)
    
    
    text_obj = c.beginText()
    text_obj.setFont('NanumGothic', 11)
    text_obj.setFillColor(black)
    text_obj.setTextOrigin(left_x, row1_y) # 텍스트 시작 위치 (첫 줄)
    text_obj.setLeading(line_height) # 줄 간격(line_height) 설정
    
    # 최대 2줄까지만 그리기
    if len(wrapped_lines) > 0:
        text_obj.textLine(wrapped_lines[0].strip()) # 첫 번째 줄
    if len(wrapped_lines) > 1:
        text_obj.textLine(wrapped_lines[1].strip()) # 두 번째 줄 (자동으로 line_height만큼 내려감)
    
    # 캔버스에 TextObject 그리기
    c.drawText(text_obj)
    
    # 파일명이 최대 2줄을 차지한다고 가정하고, 등록일시는 3번째 줄 위치에 고정
    row2_y = row1_y - line_height * 2
    c.drawString(left_x, row2_y, f"원본 등록일시: {result_data.get('uploadDate', 'N/A')}")
    
    # 오른쪽 컬럼
    c.drawString(right_x, row1_y, f"원본 등록자 (ID): {result_data.get('originalUploader', 'N/A')}")
    
    c.setFont('NanumGothicBold', 11)
    c.setFillColor(HexColor('#008000')) # 초록색
    c.drawString(right_x, row2_y, "검증 결과: 원본 일치 (Verified)")
    c.setFillColor(black)

    # --- 5. 확인 문구 ---
    current_y = row2_y - 120 # Y 좌표를 고정된 row2_y 기준으로 설정
    c.setFont('NanumGothic', 12)
    c.setFillColor(black)
    c.drawCentredString(width / 2, current_y, "상기 파일은 Hye-an (혜안) 시스템에 등록된 원본 디지털 자산과")
    c.drawCentredString(width / 2, current_y - 20, "고유 특징이 일치함을 증명합니다.")

    c.setFont('NanumGothicBold', 14)
    c.drawCentredString(width / 2, current_y - 60, issue_date_str) # 발급일
    
    c.setFont('NanumGothicBold', 18)
    c.setFillColor(HYEAN_BLUE)
    
    # --- 6. 하단 서명 및 로고 (인) ---
    
    signature_text = "Hye-an (혜안) 인증 시스템 (인)"
    text_width = c.stringWidth(signature_text, 'NanumGothicBold', 18)
    
    # 텍스트의 시작 X 좌표 계산 (중앙 정렬 기준)
    text_start_x = width/2 - text_width/2
    c.drawCentredString(width / 2, current_y - 100, signature_text)
    
    # 텍스트 바로 오른쪽에 로고 삽입
    if logo_drawn: # 상단 로고가 성공적으로 로드되었을 경우에만 하단에도 그림
        seal_size = 20 # 인장 로고 크기
        
        # 텍스트 끝나는 지점에 로고 배치
        # (중앙 정렬된 텍스트의 시작점 + 텍스트 전체 폭 + 여백)
        logo_x = text_start_x + text_width + 5 # 텍스트 끝 + 5포인트 여백
        logo_y = current_y - 100 - (seal_size / 3) # 텍스트 높이와 중앙 정렬
        
        c.drawImage(LOGO_FILENAME, logo_x, logo_y, 
                    width=seal_size, height=seal_size, mask='auto')
    else:
        # 로고 파일이 없어도 (인) 텍스트는 보이도록 함
        print("Warning: 하단 인장 로고를 그릴 수 없습니다 (원본 로고 로드 실패)")

    
    # --- PDF 저장 ---
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer

# --- 테스트를 위한 __main__ 블록 ---
if __name__ == "__main__":
    print("--- pdf_utils.py 테스트 시작 ---")
    
    # 1. 폰트 및 로고 파일 존재 여부 확인
    if not os.path.exists(FONT_BOLD_PATH) or not os.path.exists(FONT_REGULAR_PATH):
        print(f"Error: 폰트 파일({FONT_BOLD_PATH}, {FONT_REGULAR_PATH})을 찾을 수 없습니다.")
        print("테스트를 중단합니다.")
    elif not os.path.exists(LOGO_FILENAME):
        print(f"Warning: 로고 파일({LOGO_FILENAME})을 찾을 수 없습니다.")
        print("로고 없이 테스트를 진행합니다.")
    
    # 2. 테스트용 가짜(mock) 데이터 생성
    mock_result_data = {
        'dbFileName': '스크린샷 2025-10-02 오후 8.42.12.png이라는_아주_긴_파일이름이_여기에_들어간다면.png',
        'originalUploader': 'seoyun_dev',
        'uploadDate': '2025-10-10 13:30:00',
        'dbHash': 'a1b2c3d4e5f6...' # (현재는 PDF에 표시되지 않음)
    }
    
    # 3. 날짜 관련 문자열 생성
    now = datetime.now()
    issue_date_str = now.strftime("%Y년 %m월 %d일")
    verification_date_str = now.strftime("%Y. %m. %d. %p %I:%M:%S")
    
    # 4. PDF 생성 함수 직접 호출
    print("PDF 생성 중...")
    try:
        pdf_buffer = create_certificate_pdf(
            result_data=mock_result_data,
            certificate_id="CG-20251103-TEST", # 테스트용 ID
            issue_date_str=issue_date_str,
            verification_date_str=verification_date_str
        )
        
        # 5. 결과물을 실제 파일로 저장
        output_filename = "test_certificate.pdf"
        with open(output_filename, "wb") as f:
            f.write(pdf_buffer.getvalue())
            
        print(f"--- 테스트 완료! ---")
        print(f"'{output_filename}' 파일이 생성되었습니다. 파일을 열어 확인해보세요.")
    
    except Exception as e:
        print(f"--- 테스트 실패 ---")
        print(f"PDF 생성 중 오류가 발생했습니다: {e}")



