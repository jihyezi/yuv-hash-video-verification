import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupAPI } from "../api/api.js";
import "./Login.css"; 
export default function Signup() {
  const navigate = useNavigate(); // 회원가입 후 로그인 페이지 이동
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 서버로 회원가입 요청
      await signupAPI({ username: form.name, email: form.email, password: form.password });
      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate("/"); // 로그인 페이지로 이동
    } catch (err) {
      console.error(err);
      alert("회원가입 실패: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="page-container">
      <div className="auth-box">
        <h1 className="auth-title">회원가입</h1>
        <p className="auth-subtitle">계정을 만들어 혜안 서비스를 이용하세요</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input type="text" name="name" placeholder="사용자 이름" value={form.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="이메일" value={form.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="비밀번호" value={form.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="비밀번호 확인" value={form.confirmPassword} onChange={handleChange} required />

          {/* 🔥 부서 드롭다운 (기존 스타일 유지 위해 가벼운 스타일만 추가) */}
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            className="auth-input" // input과 동일한 느낌
            style={{ marginBottom: "12px" }}
          >
            <option value="">부서를 선택하세요</option>
            <option value="개발">법무팀</option>
            <option value="디자인">SW개발팀</option>
            <option value="영업">디자인팀</option>
            <option value="경영지원">인사팀</option>
            <option value="기획">기획팀</option>
          </select>

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
