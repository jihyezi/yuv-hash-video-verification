import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./App.css";
import "./Login";

export default function MainPage() {
  const location = useLocation();

  return (
    <div className="page-container">
      {/* ===== 헤더 ===== */}
      <header className="header">
        {/* 로고 */}
        <Link to="/home" className="logo">혜안</Link>

        {/* 네비게이션 */}
        <nav className="nav">
          <Link to="/upload" className={location.pathname === "/upload" ? "active" : ""}>원본 등록</Link>
          <Link to="/verify" className={location.pathname === "/verify" ? "active" : ""}>위변조 검증</Link>
          <Link to="/gallery" className={location.pathname === "/gallery" ? "active" : ""}>내 갤러리</Link>
        </nav>

        {/* 로그인 & 회원가입 버튼 */}
        <div className="auth-buttons">
          <Link to="/signup" className="signup-btn">가입</Link>
          <Link to="/login" className="login-btn">로그인</Link>
        </div>
      </header>

      {/* ===== 메인 컨텐츠 ===== */}
      <main className="main-content">
        <h1 className="main-title">영상 위변조 감지 시스템</h1>
        <p className="main-subtitle">해안과 함께 영상의 무결성을 지키세요</p>

        {/* 두 개의 주요 카드 */}
        <div className="cards">
          <div className="card">
            <div className="card-icon-circle">
              <img src="/img/main_upload.svg" alt="upload"/>
            </div>
            <div className ="card-content">
            <h2>원본 사진 등록</h2>
            <p>나의 소중한 원본 영상을 안전하게 <br/> 저장하고 관리하세요.</p>
            <Link to="/upload">
              <button className="card-btn">원본 사진 등록하기</button>
            </Link>
          </div>
          </div>

          <div className="card">
            <div className="card-icon-circle">
              <img src="/img/check.svg" alt="check"/>
            </div>
            <div className="card-content">
            <h2>사진 위변조 검증</h2>
            <p>의심스러운 사진, 원본과 비교하여 <br/> 조작 여부를 확인하세요.</p>
            <Link to="/verify">
              <button className="card-btn">사진 위변조 검증하기</button>
            </Link>
          </div>
        </div>
        </div>

            {/* ===== 사진 위변조 검증하는 방법 섹션 ===== */}
        {/* ===== 사진 위변조 검증하는 방법 섹션 ===== */}
<h2 className="how-to-title">사진 위변조 검증하는 방법</h2>

<section className="how-to">
  <div className="how-to-container">
    {/* 왼쪽 시연 이미지 */}
    <div className="how-to-image">
      <img src="./img/laptop.jpg " alt="이미지" />
    </div>

    {/* 오른쪽 단계별 설명 */}
    <ul className="how-to-steps">
      <li className="active">
        <div className="step-bar"></div>
        <div className="step-content">
          <h3>혜안 열기</h3>
          <p>데스크톱에서 혜안을 열어 로그인 해주세요.</p>
        </div>
      </li>
      <li>
        <div className="step-bar"></div>
        <div className="step-content">
          <h3>원본 영상 등록</h3>
        </div>
      </li>
      <li>
        <div className="step-bar"></div>
        <div className="step-content">
          <h3>내 갤러리에서 원본 영상 선택</h3>
        </div>
      </li>
      <li>
        <div className="step-bar"></div>
        <div className="step-content">
          <h3>비교할 의심스러운 사진 업로드</h3>
        </div>
      </li>
      <li>
        <div className="step-bar"></div>
        <div className="step-content">
          <h3>사진 위변조 검사</h3>
        </div>
      </li>
      <li>
        <div className="step-bar"></div>
        <div className="step-content">
          <h3>결과 확인</h3>
        </div>
      </li>
    </ul>
  </div>
</section>



      </main>
    </div>
  );
}
