import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";   // ★ 반드시 추가 필요
import "./Certificate.css";

export default function Certificate() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <p>잘못된 접근입니다.</p>;

  const { original, result } = state;

  // ===============================
  //    🎯 PDF 발급 (FastAPI 연결)
  // ===============================
  const handleDownload = async () => {
    try {
      // 서버에 보낼 데이터 구성
      const payload = {
        report_id: `VR-${Date.now()}`,              // 리포트 ID 자동 생성
        original_file_id: result.original_id,       // 원본 파일 ID
        target_file_name: result.target_file_name || "uploaded_file.png",
        verification_result: result.is_authentic ? "MATCH" : "MISMATCH",
      };

      // 서버로 PDF 요청 (blob으로 받기)
      const response = await apiClient.post(
        "/verifyresult/issue",
        payload,
        { responseType: "blob" }  // ★ PDF binary 응답 필수
      );

      // 브라우저에서 다운로드 처리
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `${payload.report_id}.pdf`;   // 다운로드 파일명
      link.click();
      link.remove();

      window.URL.revokeObjectURL(fileURL);

    } catch (error) {
      console.error("증명서 발급 오류:", error);
      alert("증명서 발급 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="cert-page">
      <h1 className="cert-title">🔒 검증 결과 증명서</h1>

      <div className="cert-box">
        <img src={original.url} alt="원본" className="cert-image" />

        <h2>검증 결과</h2>
        <p className="cert-status">
          {result.is_authentic
            ? "✔ 원본과 일치합니다 (위변조 없음)"
            : "❌ 위변조가 감지되었습니다"}
        </p>

        <p className="cert-msg">{result.message}</p>

        <div className="cert-info">
          <p>
            <strong>파일 ID:</strong> {result.original_id}
          </p>
          <p>
            <strong>검증 시각:</strong> {new Date().toLocaleString()}
          </p>
        </div>

        {/* 👇 버튼 영역: 디자인 유지 */}
        <div className="cert-buttons">
          <button className="back-btn" onClick={() => navigate("/detect")}>
            뒤로가기
          </button>

          {/* 🎯 PDF 발급 버튼 */}
          <button className="issue-btn" onClick={handleDownload}>
            증명서 발급
          </button>
        </div>
      </div>
    </div>
  );
}
