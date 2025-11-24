from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from typing import Dict, Any
import io
import os
from datetime import datetime
import uuid 
import mimetypes 

# ReportLab 및 폰트 관련 라이브러리
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.utils import ImageReader 

# 사용자 인증 함수 및 Supabase 클라이언트
from app.routers.auth import get_current_user 
from app.core.supabase_client import supabase 

# 파일명이 verifyresult.py이므로 라우터 이름도 verifyresult.router로 사용합니다.
router = APIRouter(prefix="/verifyresult", tags=["Verification Report"])

# -----------------------------------------------------------------
# 🎨 PDF 스타일 및 파일 경로 설정 (origincert.py와 동일하게 설정)
# -----------------------------------------------------------------
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

# 폰트 경로 정규화: 'static/fonts' 사용
raw_bold_path = os.path.join(CURRENT_DIR, '..', '..', 'static', 'fonts', 'NanumGothicBold.ttf')
FONT_BOLD_PATH = os.path.normpath(raw_bold_path)

raw_regular_path = os.path.join(CURRENT_DIR, '..', '..', 'static', 'fonts', 'NanumGothic.ttf')
FONT_REGULAR_PATH = os.path.normpath(raw_regular_path)

LOGO_FILENAME = 'hyean_logo.png' 

HYEAN_BLUE = HexColor('#003399')
HYEAN_GRAY = HexColor('#666666')
HYEAN_DARK_GRAY = HexColor('#333333')
HYEAN_LIGHT_GRAY = HexColor('#F0F0F0')
HYEAN_GREEN = HexColor('#008000') # 원본 일치 색상

# --- 한글 폰트 등록 ---
try:
    pdfmetrics.registerFont(TTFont('NanumGothicBold', FONT_BOLD_PATH))
    pdfmetrics.registerFont(TTFont('NanumGothic', FONT_REGULAR_PATH))
    pdfmetrics.registerFontFamily('NanumGothic', normal='NanumGothic', bold='NanumGothicBold')
except Exception as e:
    print(f"Warning: 한글 폰트 로드 실패. 폰트 파일을 확인하세요. 오류: {e}")

def truncate_filename(filename: str, start_len: int = 15, end_len: int = 8) -> str:
    """
    파일명이 길 경우, 중간을 '...'으로 생략하여 축약합니다.
    (예: 15글자 + ... + 8글자)
    """
    if len(filename) > start_len + end_len + 3:
        start = filename[:start_len]
        end = filename[-end_len:]
        return f"{start}...{end}"
    return filename

def draw_data_box(c, x, y, title, data_list, width, height, line_height=18):
    """특정 데이터를 상자에 담아 출력하는 헬퍼 함수"""
    # y는 제목 텍스트의 baseline 위치입니다.
    box_padding_top = 18 # 제목 텍스트와 박스 사이의 간격
    
    # Title text position (파란색 세로줄 포함)
    c.setFont('NanumGothicBold', 12)
    
    # 파란색 세로선
    c.setFillColor(HYEAN_BLUE)
    c.rect(x, y - 10, 3, 14, fill=1, stroke=0) # x, y_bottom, width, height
    
    # 제목 텍스트 색상 및 위치 조정
    c.setFillColor(HYEAN_DARK_GRAY) 
    c.drawString(x + 10, y, title) 
    
    # Calculate box top edge (박스 시작 위치)
    box_top_edge = y - box_padding_top
    
    # 데이터 영역 그리기
    c.setStrokeColor(HYEAN_LIGHT_GRAY)
    c.setLineWidth(1)
    # Box rectangle: (x, y_bottom, width, height)
    c.roundRect(x, box_top_edge - height, width, height, 5, stroke=1, fill=0)
    
    # 데이터 시작 위치 (박스 안쪽으로 10pt 패딩 + 🚨 한 줄 내리기)
    current_y = box_top_edge - 10 - line_height
    
    for label, value in data_list:
        c.setFont('NanumGothic', 11)
        c.setFillColor(HYEAN_GRAY)
        c.drawString(x + 10, current_y, label)
        
        c.setFont('NanumGothicBold', 11)
        c.setFillColor(black)
        c.drawString(x + 80, current_y, value)
        
        current_y -= line_height

def create_verify_report_pdf(report_id, verify_date, result_data):
    """
    검증 결과 데이터를 바탕으로 PDF 리포트를 생성합니다.
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4 
    margin = 50
    line_height = 18

    # --- 1. 상단 헤더 ---
    # 로고
    logo_path = os.path.normpath(os.path.join(CURRENT_DIR, '..', '..', 'static', LOGO_FILENAME))
    if os.path.exists(logo_path):
        try:
            c.setFillColor(HYEAN_DARK_GRAY)
            c.circle(margin + 10, height - 55, 10, fill=1)
            c.setFillColor(white)
            c.setFont('NanumGothicBold', 10)
            c.drawString(margin + 5, height - 58, "혜안")
            c.setFillColor(black)
        except Exception:
            pass 

    # 타이틀
    c.setFont('NanumGothicBold', 22)
    c.drawString(margin, height - 45, "검증 결과 리포트")
    c.setFont('Helvetica', 12)
    c.setFillColor(HYEAN_GRAY)
    c.drawString(margin, height - 65, "Verification Result Report")
    
    # 검증일시
    c.setFont('NanumGothic', 11)
    c.drawRightString(width - margin, height - 45, "검증일시:")
    c.drawRightString(width - margin, height - 65, verify_date)

    c.setStrokeColor(HYEAN_DARK_GRAY)
    c.setLineWidth(1)
    c.line(margin, height - 85, width - margin, height - 85)

    # --- 2. 최종 판정 결과 박스 ---
    
    current_y = height - 120 
    
    # 연한 회색 배경 박스
    box_x = margin
    box_width_full = width - margin * 2
    box_height_result = 120 # 박스 높이 유지 (120pt)
    box_y = current_y - box_height_result + 10 # 박스 하단 y 좌표
    
    c.setFillColor(HYEAN_LIGHT_GRAY)
    c.roundRect(box_x, box_y, box_width_full, box_height_result, 5, fill=1, stroke=0)
    
    # --- 텍스트 위치 재계산 (겹침 방지) ---
    
    # 박스 상단 패딩 (1.1배 높이): 120pt 박스 내에서 상단 20pt 여백
    padding_top = 30 
    
    # "최종 판정 결과" 텍스트 위치: 박스 상단에서 30pt 내려온 위치
    final_text_y = box_y + box_height_result - padding_top 
    
    c.setFont('NanumGothic', 12)
    c.setFillColor(HYEAN_DARK_GRAY)
    c.drawCentredString(width / 2, final_text_y, "최종 판정 결과") 
    
    # "원본 일치" 메인 메시지 위치: 최종 판정 결과 텍스트 아래 50pt 간격 확보 (겹침 방지)
    c.setFont('NanumGothicBold', 32)
    c.setFillColor(HYEAN_GREEN)
    authentic_text_y = final_text_y - 50 
    c.drawCentredString(width / 2, authentic_text_y, "✓ 원본 일치 (Authentic)")
    
    # --- 3. 검증 대상 vs 원본 대조 정보 ---
    
    # 박스 끝(box_y)에서 30pt 아래로 시작 (회색 박스 커진 만큼 아래로 내림)
    current_y_data_start = box_y - 30 
    
    box_height_info = 130 # 정보 박스 높이
    box_width = (width - margin * 2 - 20) / 2 # 중간 간격 20pt
    
    # A. 검증 대상 정보 (TARGET)
    target_filename_truncated = truncate_filename(result_data['targetFileName']) 
    
    target_data = [
        ("파일명", target_filename_truncated),
        ("요청자", f"{result_data['targetUploaderName']} ({result_data['targetUploaderDept']})"),
        ("검증일시", verify_date),
    ]
    draw_data_box(c, margin, current_y_data_start, "검증 대상 정보 (TARGET)", target_data, box_width, box_height_info, line_height)

    # B. 원본 대조 정보 (ORIGINAL)
    original_filename_truncated = truncate_filename(result_data['originalFileName']) 
    
    original_data = [
        ("원본명", original_filename_truncated),
        ("등록자", f"{result_data['originalUploader']} ({result_data['originalUploaderDept']})"),
        ("등록일시", result_data['originalUploadDate']),
    ]
    draw_data_box(c, margin + box_width + 20, current_y_data_start, "원본 대조 정보 (ORIGINAL)", original_data, box_width, box_height_info, line_height)


    # --- 4. 종합 소견 ---
    # 데이터 박스의 가장 아래 위치에서 충분한 여백 (30pt)을 더합니다.
    current_y_bottom_data_box = current_y_data_start - 18 - box_height_info
    current_y = current_y_bottom_data_box - 30 
    
    c.setFont('NanumGothicBold', 14)
    c.setFillColor(HYEAN_DARK_GRAY)
    
    # 종합 소견 수직 바 추가
    c.setFillColor(HYEAN_BLUE)
    c.rect(margin, current_y - 10, 3, 14, fill=1, stroke=0) 
    
    # 텍스트는 수직 바 옆에 그립니다.
    c.setFillColor(HYEAN_DARK_GRAY)
    c.drawString(margin + 10, current_y, "종합 소견 (OPINION)")
    
    # 종합 소견 아래 선 제거 (새로운 디자인은 선 대신 박스를 사용하므로)
    # c.setStrokeColor(HYEAN_DARK_GRAY)
    # c.setLineWidth(1)
    # c.line(margin, current_y - 5, width - margin, current_y - 5) 
    
    opinion_text = [
        "본 시스템(혜안)의 Chroma Hash 알고리즘을 통해 검증 대상 파일과 원본 파일의 디지털 지문(Hash)을",
        "정밀 대조하였습니다.",
        "",
        "분석 결과, 두 파일의 고유 해시값이 100% 일치하는 것으로 확인되었습니다. 이에 따라 상기 검증 대상 파",
        "일은 원본 데이터와 동일하며, 등록 시점 이후 어떠한 픽셀 변조나 손상이 발생하지 않았음을 증명합니다."
    ]
    
    # 종합 소견 텍스트를 박스 안에 넣기 위해 위치 조정
    text_start_y = current_y - 10 - line_height # 제목 아래 여백
    
    # 텍스트 박스 그리기
    text_box_x = margin
    text_box_width = width - margin * 2
    # 텍스트 높이 계산: 5줄 + 상하 여백
    text_height_estimated = line_height * 5 + 30 
    text_box_y_bottom = text_start_y - text_height_estimated
    
    c.setStrokeColor(HYEAN_LIGHT_GRAY) # 연한 회색 테두리
    c.setLineWidth(1)
    c.roundRect(text_box_x, text_box_y_bottom, text_box_width, text_height_estimated, 5, stroke=1, fill=0)
    
    # 첫 문단 위에 공백 한 줄($18pt) 삽입
    current_y = text_start_y - line_height * 1.5 # 박스 안쪽 여백 시작점 조정 (0.5줄 + 1줄 공백)
    
    c.setFont('NanumGothic', 11)
    c.setFillColor(black)
    for line in opinion_text:
        c.drawString(margin + 10, current_y, line) # 박스 안쪽으로 10pt 여백
        current_y -= line_height

    # --- 5. 발급 기관 정보 (Footer) ---
    c.setStrokeColor(HYEAN_LIGHT_GRAY)
    c.setLineWidth(1)
    c.line(margin, 90, width - margin, 90)
    
    c.setFont('NanumGothic', 10)
    c.setFillColor(HYEAN_GRAY)
    c.drawString(margin, 70, "발급기관: 혜안 (UV Hash Verification System)")
    c.drawString(margin, 55, "문의: support@hyean.com")
    
    c.drawRightString(width - margin, 55, "Page 1 of 1")
    
    # --- PDF 저장 ---
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer

# -----------------------------------------------------------------
# 🌐 FastAPI 엔드포인트
# -----------------------------------------------------------------

@router.post("/issue", 
             summary="검증 결과를 바탕으로 디지털 원본 증명서 PDF를 발급합니다.")
async def issue_verification_report(
    current_user: Dict[str, Any] = Depends(get_current_user), 
    
    request_data: Dict[str, Any] = Body(
        example={
            "report_id": "VR-20251125-0001",
            "original_file_id": "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
            "target_file_name": "screenshot_2025-08-19_3.03.26.png",
            "verification_result": "MATCH"
        }
    )
):
    """
    원본 파일 ID와 검증 대상 파일 정보를 받아 검증 결과 리포트 PDF를 생성합니다.
    """
    
    # --- 1. 필수 데이터 파싱 및 DB 조회 ---
    try:
        report_id = request_data.get('report_id')
        original_file_id = request_data.get('original_file_id') 
        target_file_name = request_data.get('target_file_name')
        verification_result = request_data.get('verification_result') # MATCH/MISMATCH
        
        # 필드 누락 여부 수동 확인
        if not report_id or not original_file_id or not target_file_name or not verification_result:
            missing_field = 'report_id' if not report_id else ('original_file_id' if not original_file_id else ('target_file_name' if not target_file_name else 'verification_result'))
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"필수 요청 데이터 필드 누락: '{missing_field}'")

        # 1-1. Gallery 테이블에서 원본 파일 정보 조회
        gallery_res = supabase.table("gallery").select("title, uploaded_at, user_id").eq("id", original_file_id).execute()
        
        if not gallery_res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"원본 파일 ID ({original_file_id})를 Gallery에서 찾을 수 없습니다."
            )
            
        file_data = gallery_res.data[0]
        original_user_id = file_data['user_id']
        
        # 1-2. User 테이블에서 원본 등록자 정보 조회
        user_res = supabase.table("user").select("username, department_id").eq("id", original_user_id).execute()
        
        original_uploader_name = "정보 없음"
        original_uploader_dept = "부서 정보 없음"
        
        if user_res.data and user_res.data[0].get('username'):
             original_uploader_name = user_res.data[0]['username']
             original_dept_id = user_res.data[0].get('department_id')
             
             # 1-3. Original Uploader의 부서 이름 조회
             if original_dept_id:
                 dept_res = supabase.table("department").select("name").eq("id", original_dept_id).execute()
                 if dept_res.data:
                     original_uploader_dept = dept_res.data[0]['name']
                     
        # 1-4. 검증 요청자 정보 (현재 로그인 사용자)
        verifier_name = current_user.get('username', '비로그인 사용자')
        verifier_id = current_user.get('id')
        verifier_dept = current_user.get('department', '부서 정보 없음')
        
        # 1-5. PDF 생성 함수에 전달할 데이터 구성
        upload_dt = datetime.fromisoformat(file_data['uploaded_at'].replace('Z', '+00:00')) 
        original_upload_date = upload_dt.strftime("%Y.%m.%d %H:%M:%S")
        
        result_data = {
            # 원본 정보 (Original)
            'originalFileName': file_data['title'],
            'originalUploader': original_uploader_name,
            'originalUploaderDept': original_uploader_dept,
            'originalUploadDate': original_upload_date,
            
            # 검증 대상 정보 (Target)
            'targetFileName': target_file_name,
            'targetUploaderName': verifier_name,
            'targetUploaderDept': verifier_dept,
            'verificationResult': verification_result,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"DB 조회 및 데이터 파싱 중 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"데이터 처리 중 서버 오류가 발생했습니다: {str(e)}"
        )
        
    # --- 2. 날짜 문자열 생성 (리포트 발급 시점) ---
    now = datetime.now()
    report_issue_date_str = now.strftime("%Y-%m-%d %H:%M:%S") 
    
    # --- 3. PDF 생성 함수 호출 (내부 함수 사용) ---
    try:
        pdf_buffer: io.BytesIO = create_verify_report_pdf(
            report_id=report_id,
            verify_date=report_issue_date_str,
            result_data=result_data,
        )
    except Exception as e:
        print(f"PDF 생성 중 오류 발생: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF 파일 생성 중 서버 오류가 발생했습니다: {str(e)}. 서버 로그를 확인하세요."
        )
    
    # --- 4. verification_log 테이블에 발급 기록 저장 ---
    log_data = {
        "id": report_id, 
        "verifier_user_id": verifier_id, 
        "original_file_id": original_file_id, 
        "verification_time": now.isoformat(), 
        "verification_result": verification_result,
        "report_data": { 
            "originalFileName": result_data['originalFileName'],
            "targetFileName": result_data['targetFileName'],
            "verifierName": verifier_name,
            "reportIssueTime": report_issue_date_str,
        } 
    }

    try:
        supabase.table("verification_log").insert(log_data).execute()
    except Exception as log_e:
        print(f"Warning: Failed to log verification report to DB: {log_e}")
        
    # --- 5. StreamingResponse로 클라이언트에 PDF 데이터 전송 ---
    
    # 파일명은 리포트 ID만 사용 (한글 깨짐 방지)
    new_filename = f"{report_id}.pdf"
    encoded_filename = new_filename.encode('utf-8').decode('latin-1') 

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=\"{encoded_filename}\"",
            "Cache-Control": "no-cache"
        }
    )