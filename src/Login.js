import React, { useState } from "react";
import "./App.css"; 

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!form.email || !form.password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    // 서버 연동 대신 데모용 처리
    alert(`로그인 시도: ${form.email}`);
  };

  return (
    <div className="page-container">
      <div className="auth-box">
        <h1 className="auth-title">로그인</h1>
        <p className="auth-subtitle">혜안 서비스를 이용하려면 로그인하세요</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="login-btn">
            로그인
          </button>
        </form>

        {/* 회원가입 페이지 이동 버튼 */}
        <p style={{ marginTop: "16px", fontSize: "14px", color: "#555" }}>
          아직 회원이 아니신가요?{" "}
          <a href="/signup" style={{ color: "#4a90e2", fontWeight: "600" }}>
            회원가입하기
          </a>
        </p>
      </div>
    </div>
  );
}
