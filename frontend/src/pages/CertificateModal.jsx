import React from "react";
import "./CertificateModal.css";

export default function CertificateModal({ data, onClose }) {
  if (!data) return null;

  const {
    certificateId = "CG-20250101-0000",
    fileName = "알 수 없음",
    requestedAt = "",
    owner = "Hye-an (혜안)",
    originalUploader = "",
    originalUploadDate = "",
    isAuthentic = true,
    pdfUrl = null
  } = data;

  // 날짜 포맷 함수
  const formatDateCustom = (dateStr, includeTime = true) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    const datePart = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
    return includeTime ? `${datePart} ${d.toLocaleTimeString("ko-KR")}` : datePart;
  };

  return (
    <div className="certificate-modal-backdrop" onClick={onClose}>
      <div className="certificate-modal" onClick={e => e.stopPropagation()}>
        {/* HEADER */}
        <h1 className="doc-title">디지털 원본 증명서</h1>
        <h2 className="doc-subtitle">(Certificate of Origin)</h2>

        <div className="section-divider" />

        {/* 증명서 고유 정보 */}
        <div className="section">
          <h3 className="section-title">증명서 고유 정보</h3>
          <div className="row">
            <span>증명서 발급번호:</span>
            <p>{certificateId}</p>
          </div>
          <div className="row">
            <span>검증 요청일시:</span>
            <p>{formatDateCustom(requestedAt)}</p>
          </div>
        </div>

        {/* 원본 등록 정보 */}
        <div className="section">
          <h3 className="section-title">원본 등록 정보</h3>
          <div className="row">
            <span>원본 파일명:</span>
            <p>{fileName}</p>
          </div>
          <div className="row">
            <span>원본 등록자:</span>
            <p>{originalUploader}</p>
          </div>
          <div className="row">
            <span>원본 등록일시:</span>
            <p>{formatDateCustom(originalUploadDate)}</p>
          </div>
        </div>

        {/* 설명 */}
        <p className="description">
          상기 파일은 Hye-an (혜안) 시스템에 등록된 원본 디지털 자산과<br />
          고유 특징이 일치함을 증명합니다.
        </p>

        {/* 오늘 날짜 */}
        <p className="date-text">{formatDateCustom(new Date(), false)}</p>

        {/* 서명 */}
        <p className="sign-text">Hye-an (혜안) 인증 시스템 (인)</p>

        {/* PDF 다운로드 */}
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pdf-download-btn"
          >
            PDF 다운로드
          </a>
        )}
      </div>
    </div>
  );
}