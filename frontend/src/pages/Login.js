import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    const displayName = form.email.split("@")[0]; // 예: 이메일 앞부분 사용
  onLogin(displayName); // App.js로 전달


    // 서버 연동 대신 데모 처리
    alert(`로그인 시도: ${form.email}`);
    onLogin(); // 로그인 성공 처리
  };

  return (
    <div className="page-container">
      <div className="auth-box">
        <h1 className="auth-title">로그인</h1>
        <p className="auth-subtitle">혜안 서비스를 이용하려면 로그인하세요</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input type="email" name="email" placeholder="이메일" value={form.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="비밀번호" value={form.password} onChange={handleChange} required />
          <button type="submit" className="login-btn">로그인</button>
        </form>

        <p style={{ marginTop: "16px", fontSize: "14px", color: "#555" }}>
          아직 회원이 아니신가요?{" "}
          <Link to="/signup" style={{ color: "#4a90e2", fontWeight: "600" }}>
            회원가입하기
          </Link>
        </p>
      </div>
    </div>
  );
}
