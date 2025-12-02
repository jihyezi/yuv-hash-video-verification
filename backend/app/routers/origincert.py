from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import Dict, Any
import io
import os
import textwrap
from datetime import datetime
import shutil 
import uuid 
import mimetypes # 파일 형식(MIME type) 추론을 위해 추가
import unicodedata

# ReportLab 및 폰트 관련 라이브러리
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, black, white

# 사용자 인증 함수 및 Supabase 클라이언트
from app.routers.auth import get_current_user 
from app.core.supabase_client import supabase 

router = APIRouter(prefix="/certificate", tags=["Certificate"])

# -----------------------------------------------------------------
# 🎨 PDF 스타일 및 파일 경로 설정
# -----------------------------------------------------------------
# 1. 현재 파일(origincert.py)의 위치
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. 폰트 폴더 경로 설정 (app/routers/../fonts ==> app/fonts)
FONT_DIR = os.path.join(CURRENT_DIR, '..', 'fonts')
FONT_DIR = os.path.normpath(FONT_DIR)

# 3. 폰트 파일 경로
FONT_BOLD_PATH = os.path.join(FONT_DIR, 'NanumGothicBold.ttf')
FONT_REGULAR_PATH = os.path.join(FONT_DIR, 'NanumGothic.ttf')

# 디버깅 로그
print(f"📂 [OriginCert] 폰트 폴더 경로: {FONT_DIR}")
print(f"🔍 [OriginCert] 폰트 파일 확인: {FONT_BOLD_PATH}")

LOGO_FILENAME = 'hyean_logo.png' # 로고 파일명 (PNG나 JPG로 가정)

HYEAN_BLUE = HexColor('#003399')
HYEAN_GRAY = HexColor('#666666')
HYEAN_DARK_GRAY = HexColor('#333333')
HYEAN_LIGHT_GRAY = HexColor('#F0F0F0')

if not os.path.exists(FONT_BOLD_PATH):
    raise FileNotFoundError(f"🚨 [오류] 폰트 파일이 없습니다: {FONT_BOLD_PATH}")

if not os.path.exists(FONT_REGULAR_PATH):
    raise FileNotFoundError(f"🚨 [오류] 폰트 파일이 없습니다: {FONT_REGULAR_PATH}")

# --- 한글 폰트 등록 ---
try:
    # 폰트가 등록되어야 한글 출력이 가능합니다.
    pdfmetrics.registerFont(TTFont('NanumGothicBold', FONT_BOLD_PATH))
    pdfmetrics.registerFont(TTFont('NanumGothic', FONT_REGULAR_PATH))
    # ReportLab 기본 폰트에 한글 맵핑 (필수)
    pdfmetrics.registerFontFamily('NanumGothic', normal='NanumGothic', bold='NanumGothicBold')
    print("✅ [OriginCert] 한글 폰트 로드 성공!")
except Exception as e:
    if "is already registered" in str(e):
        print("ℹ️ [OriginCert] 폰트가 이미 등록되어 있습니다.")
    else:
        print(f"❌ [OriginCert] 폰트 등록 실패: {e}")
        raise e


def create_certificate_pdf(result_data, certificate_id, issue_date_str):
    """
    검증 결과 데이터를 바탕으로 PDF 증명서를 생성합니다. (새로운 디자인 적용)
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4 
    margin = 50
    current_y = height - margin

    # --- 1. 테두리 ---
    c.setStrokeColor(HYEAN_DARK_GRAY)
    c.setLineWidth(2)
    c.rect(20, 20, width - 40, height - 40) 

    # --- 2. 상단 헤더 및 타이틀 ---
    # 로고 (왼쪽 상단)
    logo_path = os.path.normpath(os.path.join(CURRENT_DIR, '..', '..', 'static', LOGO_FILENAME))
    if os.path.exists(logo_path):
        try:
            # 원형 로고 배경
            c.setFillColor(HYEAN_DARK_GRAY)
            c.circle(margin + 15, height - 60, 15, fill=1)
            # 로고 텍스트/이미지 (실제 이미지 경로가 없으므로 텍스트로 대체)
            c.setFillColor(white)
            c.setFont('NanumGothicBold', 12)
            c.drawString(margin + 5, height - 64, "혜안")

            c.setFillColor(black)
            c.setFont('NanumGothicBold', 16)
            c.drawString(margin + 40, height - 65, "혜안 (Hye-An)")
        except Exception:
            pass # 로고 처리 오류 무시
    
    # 증명서 번호 (오른쪽 상단)
    c.setFont('NanumGothic', 11)
    c.setFillColor(HYEAN_GRAY)
    c.drawRightString(width - margin, height - 55, "증명서 번호")
    c.setFont('Helvetica-Bold', 14) # 영문/숫자는 Helvetica 사용
    c.setFillColor(HYEAN_BLUE)
    c.drawRightString(width - margin, height - 75, certificate_id)

    # 중앙 타이틀
    c.setFont('NanumGothicBold', 30)
    c.setFillColor(HYEAN_DARK_GRAY)
    c.drawCentredString(width / 2, height - 140, "디지털 원본 증명서")
    c.setFont('Helvetica', 10)
    c.drawCentredString(width / 2, height - 160, "CERTIFICATE OF DIGITAL ORIGINALITY")

    # --- 3. 소유자 / 등록자 정보 ---
    current_y = height - 250
    line_height = 24
    
    c.setFont('NanumGothicBold', 14)
    c.setFillColor(HYEAN_DARK_GRAY)
    c.drawString(margin, current_y, "소유자 / 등록자 정보")
    
    # 구분선
    c.setStrokeColor(HYEAN_DARK_GRAY)
    c.setLineWidth(1)
    c.line(margin, current_y - 5, width - margin, current_y - 5)
    
    # 등록자명
    c.setFont('NanumGothic', 11)
    c.setFillColor(HYEAN_GRAY)
    c.drawString(margin, current_y - line_height, "등록자명")
    c.setFillColor(black)
    c.drawString(margin + 100, current_y - line_height, result_data.get('originalUploader', 'N/A'))
    
    # 소속 부서
    current_y_for_dept = current_y - line_height * 2
    c.setFillColor(HYEAN_GRAY)
    c.drawString(margin, current_y_for_dept, "소속 부서")
    c.setFillColor(black)
    c.drawString(margin + 100, current_y_for_dept, result_data.get('originalUploaderDept', 'N/A'))


    # --- 4. 디지털 자산 정보 ---
    # 🚨 수정 1: 소속 부서 (current_y_for_dept) 아래 2줄 공백 확보 (1줄은 이미 사용됨)
    current_y = current_y_for_dept - line_height * 2 
    
    c.setFont('NanumGothicBold', 14)
    c.setFillColor(HYEAN_DARK_GRAY)
    c.drawString(margin, current_y, "디지털 자산 정보")
    
    # 구분선
    c.setStrokeColor(HYEAN_DARK_GRAY)
    c.setLineWidth(1)
    c.line(margin, current_y - 5, width - margin, current_y - 5)
    
    # 파일명 
    c.setFont('NanumGothic', 11)
    c.setFillColor(HYEAN_GRAY)
    c.drawString(margin, current_y - line_height, "파일명")

    safe_filename = unicodedata.normalize("NFC", result_data.get('dbFileName', 'N/A'))
    c.setFont('NanumGothicBold', 11)
    c.setFillColor(black)
    c.drawString(margin + 100, current_y - line_height, safe_filename)
    
    # 파일 형식
    c.setFont('NanumGothic', 11)
    c.setFillColor(HYEAN_GRAY)
    c.drawString(margin, current_y - line_height * 2, "파일 형식")
    c.setFillColor(black)
    c.drawString(margin + 100, current_y - line_height * 2, result_data.get('fileFormat', 'N/A'))
    
    # 등록 일시
    c.setFont('NanumGothic', 11)
    current_y_for_date = current_y - line_height * 3
    c.setFillColor(HYEAN_GRAY)
    c.drawString(margin, current_y_for_date, "등록 일시")
    c.setFillColor(black)
    c.drawString(margin + 100, current_y_for_date, result_data.get('uploadDate', 'N/A'))

    
    # --- 5. 확인 문구 ---
    
    # 🚨 수정 2: 등록 일시와 확인 문구 사이에 3줄 공백 추가
    # current_y_for_date (등록일시) 이후 3줄(line_height * 3) 아래에 문구 시작
    current_y = current_y_for_date - line_height * 5
    
    # 확인 문구 (이미지 두 번째 스크린샷 참고)
    c.setFont('NanumGothic', 14)
    c.drawCentredString(width / 2, current_y, f"위 디지털 자산은 [혜안] 시스템에 안전하게 등록되었으며,")
    current_y -= line_height
    c.drawCentredString(width / 2, current_y, "등록 시점의 원본 데이터가 변조되지 않았음을 증명합니다.")

    # --- 6. 서명 및 날짜 ---
    
    # 발급일 위치 (확인 문구 아래 3줄)
    current_y -= line_height * 5
    c.setFont('NanumGothic', 14)
    c.drawCentredString(width / 2, current_y, issue_date_str)
    
    # 🚨 수정 3: '발급일' 아래 7줄 공백 확보
    # '발급일' 위치 (current_y)에서 7줄(line_height * 7) 아래로 이동
    current_y -= line_height * 2
    
    c.setFont('NanumGothicBold', 20)
    c.drawCentredString(width / 2, current_y, "주식회사 혜안")
    
    # 서명/직인 (이미지 대체)
    c.setFillColor(HexColor('#ff0000')) # 빨간색
    c.setStrokeColor(HexColor('#ff0000'))
    c.setLineWidth(1)
    c.rect(width / 2 + 60, current_y - 30, 40, 40, fill=0)
    c.setFont('NanumGothicBold', 10)
    c.drawCentredString(width / 2 + 80, current_y - 20, "직인")
    c.drawCentredString(width / 2 + 80, current_y - 35, "생략")
    
    # 하단 설명
    c.setFont('NanumGothic', 8)
    c.setFillColor(HYEAN_GRAY)
    c.drawCentredString(width / 2, 40, "본 증명서는 혜안(Hye-An) 위변조 검증 시스템에 의해 발급되었습니다.")
    
    # --- PDF 저장 ---
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer

# -----------------------------------------------------------------
# 🌐 FastAPI 엔드포인트
# -----------------------------------------------------------------

@router.post("/issue", 
             summary="원본 파일을 기준으로 디지털 원본 증명서 PDF를 발급합니다.")
async def issue_certificate(
    current_user: Dict[str, Any] = Depends(get_current_user), 
    
    request_data: Dict[str, Any] = Body(
        example={
            "certificate_id": "CERT-ORG-2025-001",
            "original_file_id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
        }
    )
):
    """
    Gallery에 등록된 원본 파일 ID를 받아 PDF 증명서를 생성하고 다운로드 링크로 반환합니다.
    """
    
    # --- 1. 필수 데이터 파싱 및 DB 조회 ---
    try:
        certificate_id = request_data.get('certificate_id')
        original_file_id = request_data.get('original_file_id') 
        
        # 필드 누락 여부 수동 확인
        if not certificate_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="필수 요청 데이터 필드 누락: 'certificate_id'")
        if not original_file_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="필수 요청 데이터 필드 누락: 'original_file_id'")

        
        # 1-1. Gallery 테이블에서 원본 파일 정보 조회 (title, uploaded_at, user_id)
        gallery_res = supabase.table("gallery").select("title, uploaded_at, user_id, image_url").eq("id", original_file_id).execute()
        
        if not gallery_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"원본 파일 ID ({original_file_id})를 Gallery에서 찾을 수 없습니다."
            )
            
        file_data = gallery_res.data[0]
        gallery_user_id = file_data['user_id']
        
        # 1-2. User 테이블에서 원본 등록자 이름 및 부서 ID 조회
        user_res = supabase.table("user").select("username, department_id").eq("id", gallery_user_id).execute()
        
        uploader_name_db = "정보 없음"
        uploader_dept_name = "부서 정보 없음"
        
        if user_res.data and user_res.data[0].get('username'):
             uploader_name_db = user_res.data[0]['username']
             original_dept_id = user_res.data[0].get('department_id')
             
             # 1-3. Original Uploader의 부서 이름 조회
             if original_dept_id:
                 dept_res = supabase.table("department").select("name").eq("id", original_dept_id).execute()
                 if dept_res.data:
                     uploader_dept_name = dept_res.data[0]['name']
                     
        # 1-4. PDF 생성 함수에 전달할 데이터 구성
        
        # File Format (파일 확장자 기반 MIME 타입 추론)
        file_mime_type, _ = mimetypes.guess_type(file_data['title'])
        file_extension = os.path.splitext(file_data['title'])[-1]
        file_format = file_mime_type if file_mime_type else file_extension.upper().strip('.')
        
        # uploaded_at 필드 처리
        upload_dt = datetime.fromisoformat(file_data['uploaded_at'].replace('Z', '+00:00')) 
        upload_date_str = upload_dt.strftime("%Y년 %m월 %d일 %H:%M:%S")
        
        result_data = {
            'dbFileName': file_data['title'],               # 원본 파일명
            'originalUploader': uploader_name_db,           # 등록자명
            'originalUploaderDept': uploader_dept_name,     # 등록자 소속 부서
            'fileFormat': file_format,                      # 파일 형식
            'uploadDate': upload_date_str,                  # 등록 일시
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DB 조회 및 데이터 파싱 중 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"데이터 처리 중 서버 오류가 발생했습니다: {str(e)}"
        )
        
    # --- 2. 날짜 문자열 생성 (증명서 발급 시점) ---
    now = datetime.now()
    issue_date_str = now.strftime("%Y년 %m월 %d일")
    # verification_date_str은 로그에만 사용
    
    # --- 3. PDF 생성 함수 호출 (내부 함수 사용) ---
    try:
        pdf_buffer: io.BytesIO = create_certificate_pdf(
            result_data=result_data,
            certificate_id=certificate_id,
            issue_date_str=issue_date_str,
        )
    except Exception as e:
        print(f"PDF 생성 중 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF 파일 생성 중 서버 오류가 발생했습니다: {str(e)}. 서버 로그를 확인하세요."
        )
    
    # --- 4. certificate_log 테이블에 발급 기록 저장 ---
    current_user_id = current_user.get('id')
    verification_date_str = now.strftime("%Y. %m. %d. %H:%M:%S") # 로그용 검증 일시
    
    log_data = {
        "id": certificate_id, 
        "user_id": current_user_id, # 발급자 (로그인 사용자)
        "file_id": original_file_id, # 원본 파일 ID
        "verification_data": { 
            "originalFileName": result_data['dbFileName'],
            "originalUploader": result_data['originalUploader'],
            "originalUploaderDept": result_data['originalUploaderDept'],
            "issueDate": issue_date_str,
            "verificationDate": verification_date_str,
        } 
    }

    try:
        supabase.table("certificate_log").insert(log_data).execute()
    except Exception as log_e:
        print(f"Warning: Failed to log certificate issuance to DB: {log_e}")
        
    # --- 5. StreamingResponse로 클라이언트에 PDF 데이터 전송 ---
    new_filename = f"{certificate_id}.pdf"
    encoded_filename = new_filename.encode('utf-8').decode('latin-1')

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=\"{encoded_filename}\"",
            "Cache-Control": "no-cache"
        }
    )