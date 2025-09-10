import React, { useState } from "react";
import "./App.css"; 

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      alert("모든 필드를 입력해주세요.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    alert(`회원가입 완료!\n환영합니다, ${form.username}님 🎉`);
  };

  return (
    <div className="page-container">
      <div className="auth-box">
        <h1 className="auth-title">회원가입</h1>
        <p className="auth-subtitle">혜안 서비스를 이용하려면 회원가입하세요</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="username"
            placeholder="이름"
            value={form.username}
            onChange={handleChange}
            required
          />

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

          <input
            type="password"
            name="confirmPassword"
            placeholder="비밀번호 확인"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="login-btn">회원가입</button>
        </form>
      </div>
    </div>
  );
}
