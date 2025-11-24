import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Certificate.css";

export default function Certificate() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <p>잘못된 접근입니다.</p>;

  const { original, result } = state;

  const handleDownload = () => {
    // 간단한 다운로드 기능 (필요하면 PDF로 만들어서 저장도 가능)
    const content = `
==== 검증 증명서 ====
파일 ID: ${result.original_id}
검증 결과: ${result.is_authentic ? "원본과 일치" : "위변조 감지"}
메시지: ${result.message}
검증 시각: ${new Date().toLocaleString()}
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "certificate.txt";
    a.click();

    URL.revokeObjectURL(url);
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

        {/* 👇 버튼 영역 */}
        <div className="cert-buttons">
          <button className="back-btn" onClick={() => navigate("/detect")}>
            뒤로가기
          </button>

          {/* 👇 추가된 '증명서 발급' 버튼 */}
          <button className="issue-btn" onClick={handleDownload}>
            증명서 발급
          </button>
        </div>
      </div>
    </div>
  );
}
