import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import "./Certificate.css";

export default function Certificate() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState("");

  const suspicious = state?.suspicious;
  const result = state?.result;
  const fileName = suspicious?.name || "unknown_file.jpg";

  useEffect(() => {
    if (!suspicious) return;

    if (suspicious instanceof File || suspicious instanceof Blob) {
      const url = URL.createObjectURL(suspicious);
      setPreviewUrl(url);

      return () => URL.revokeObjectURL(url);
    }
    else if (typeof suspicious === "string") {
      setPreviewUrl(suspicious);
    }
    else {
      console.error("🚨 이미지 데이터가 올바르지 않습니다:", suspicious);
    }
  }, [suspicious]);

  if (!state) return <p>잘못된 접근입니다.</p>;

  const handleDownload = async () => {
    try {
      // 1. 서버에 보낼 데이터 구성
      const payload = {
        report_id: `VR-${Date.now()}`,       // 리포트 ID 자동 생성
        original_file_id: result.original_id, // 원본 파일 ID
        target_file_name: fileName,           // 검증 대상 파일명
        verification_result: result.is_authentic ? "MATCH" : "MISMATCH",
      };

      // 2. 서버로 PDF 요청 (blob으로 받기)
      const response = await apiClient.post(
        "/verifyresult/issue",
        payload,
        { responseType: "blob" }
      );

      // 3. 브라우저에서 다운로드 처리
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `Certificate_${fileName.split('.')[0]}_${payload.report_id}.pdf`;
      link.click();
      link.remove();

      window.URL.revokeObjectURL(fileURL);

    } catch (error) {
      console.error("증명서 발급 오류:", error);
      alert("증명서 발급 중 오류가 발생했습니다. 서버 상태를 확인해주세요.");
    }
  };

  return (
    <div className="cert-page">
      <h1 className="cert-title">검증 결과 증명서</h1>

      <div className="cert-box">
        <div className="image-wrapper">
          <span className="img-label">검증 대상 이미지</span>
          <img src={previewUrl} alt="의심 이미지" className="cert-image" />
        </div>

        <div className="divider"></div>

        <div className={`result-badge ${result.is_authentic ? "success" : "danger"}`}>
          <div className="icon">
            {result.is_authentic ? "✅" : "🚨"}
          </div>
          <div className="text-content">
            <h3>{result.is_authentic ? "AUTHENTIC" : "FORGERY DETECTED"}</h3>
            <p>
              {result.is_authentic
                ? "원본과 일치함이 인증되었습니다."
                : "위변조 흔적이 감지되었습니다."}
            </p>
          </div>
        </div>

        <div className="cert-info">
          <div className="info-row">
            <span className="label">파일 이름</span>
            <span className="value">{fileName}</span>
          </div>
          <div className="info-row">
            <span className="label">검증 시각</span>
            <span className="value">{new Date().toLocaleString()}</span>
          </div>
        </div>

        <div className="cert-buttons">
          <button className="back-btn" onClick={() => navigate("/detect")}>
            다시 검증하기
          </button>

          <button className="issue-btn" onClick={handleDownload}>
            증명서 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}
