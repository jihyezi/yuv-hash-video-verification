import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./App.css";

export default function VerifyPage() {
  const [originalImage, setOriginalImage] = useState(null);
  const [suspiciousImage, setSuspiciousImage] = useState(null);
  const location = useLocation();

  const handleOriginalUpload = (e) => {
    setOriginalImage(e.target.files[0]);
  };

  const handleSuspiciousUpload = (e) => {
    setSuspiciousImage(e.target.files[0]);
  };

  const handleVerify = () => {
    if (!originalImage || !suspiciousImage) {
      alert("원본 사진과 의심 사진을 모두 업로드해주세요.");
      return;
    }
    alert("사진 위변조 검증을 시작합니다!");
    // 여기에 API 연동 로직 추가 가능
  };

  return (
    <div className="verify-page">
     <header className="header">
        <Link to="/home" className="logo">혜안</Link>
        <nav className="nav">
          <Link to="/upload" className={location.pathname === "/upload" ? "active" : ""}>원본 등록</Link>
          <Link to="/verify" className={location.pathname === "/verify" ? "active" : ""}>위변조 검증</Link>
          <Link to="/gallery" className={location.pathname === "/gallery" ? "active" : ""}>내 갤러리</Link>
        </nav>
        <div className="auth-buttons">
          <Link to="/signup" className="signup-btn">가입</Link>
          <Link to="/login" className="login-btn">로그인</Link>
        </div>
      </header>
          
      {/* ===== 메인 컨텐츠 ===== */}
      <h2 className="verify-title">사진 위변조 검증</h2>
      <p className="verify-subtitle">
        원본 영상과 의심 영상을 비교하여, 조작 여부를 빠르고 정확하게 판별하세요.
      </p>

      <div className="verify-steps">
        {/* Step1: 원본 사진 선택 */}
        <div className="step-box">
        <h3 className="step-title">
            Step1. <span>원본 사진 선택</span>
        </h3>
        <div className="upload-box">
          <label className="drop-zone">
            <input
              type="file"
              accept="image/*"
              onChange={handleOriginalUpload}
              hidden
            />
            <div className="drop-content">
             <img src="/img/upload_.svg" alt="업로드" className="upload-icon"/>
              <p>
                이미지 파일을 선택
                <br />
                또는 파일을 여기로 끌어 놓으세요
              </p>
            </div>
          </label>
          <button className="gallery-btn">내 갤러리에서 선택</button>
        </div>
    </div>

        {/* Step2: 위변조 의심 사진 업로드 */}
        <div className="step-box">
        <h3 className="step-title disabled"> Step2. 위변조 의심 사진 업로드</h3>
        <div className="upload-box">
          <label className="drop-zone">
            <input
              type="file"
              accept="image/*"
              onChange={handleSuspiciousUpload}
              hidden
            />
            <div className="drop-content">
              <img src="/img/upload_.svg" alt="업로드" className="upload-icon"/>
              <p>
                이미지 파일을 선택
                <br />
                또는 파일을 여기로 끌어 놓으세요
              </p>
            </div>
          </label>
          <button
            className={`verify-btn ${
              !originalImage || !suspiciousImage ? "disabled" : ""
            }`}
            onClick={handleVerify}
            disabled={!originalImage || !suspiciousImage}
          >
            사진 위변조 검증하기
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
