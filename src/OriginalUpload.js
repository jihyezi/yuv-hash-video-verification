import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./App.css";

export default function OriginalUpload() {
  const [file, setFile] = useState(null);
  const location = useLocation();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert("이미지를 선택해주세요.");
      return;
    }
    alert(`업로드 완료: ${file.name}`);
  };

  return (
    <div className="page-container">
      {/* ===== 헤더 ===== */}
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

      {/* ===== 원본 등록 섹션 ===== */}
      <main className="upload-page">
        <h1 className="upload-title">원본 사진 등록</h1>
        <p className="upload-subtitle">
          진위 검증을 위해 원본 영상을 안전하게 등록하고 보관하세요.
        </p>

        <div className="upload-box">
          {/* 드래그 앤 드롭 영역 */}
          <label className="drop-zone">
            <input
              type="file"
              accept="image/*, video/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <div className="drop-content">
            <img src="/img/upload_.svg" alt="업로드" className="upload-icon"/>
              <p>
                이미지 파일을 선택<br />
                또는 파일을 여기로 끌어 놓으세요
              </p>
            </div>
          </label>

          {/* 업로드 버튼 */}
          <button className="upload-btn" onClick={handleUpload}>
            이미지 업로드하기
          </button>

          {/* 파일 이름 표시 */}
          {file && <p className="file-name">선택한 파일: {file.name}</p>}
        </div>
      </main>
    </div>
  );
}
