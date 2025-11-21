import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css"; // 로그인과 동일한 스타일 사용 가능

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.confirmPassword) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 서버 연동 대신 데모 처리
    alert(`회원가입 완료: ${form.email}`);
  };

  return (
    <div className="page-container">
      <div className="auth-box">
        <h1 className="auth-title">회원가입</h1>
        <p className="auth-subtitle">계정을 만들어 혜안 서비스를 이용하세요</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input type="name" name="name" placeholder="사용자 이름" value={form.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="이메일" value={form.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="비밀번호" value={form.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="비밀번호 확인" value={form.confirmPassword} onChange={handleChange} required />

          <button type="submit" className="login-btn">회원가입</button>
        </form>

        <p style={{ marginTop: "16px", fontSize: "14px", color: "#555" }}>
          이미 계정이 있으신가요?{" "}
          <Link to="/" style={{ color: "#4a90e2", fontWeight: "600" }}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
