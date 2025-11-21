import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupAPI } from "../api/api.js";
<<<<<<< HEAD
import "./Login.css";

=======
import "./Login.css"; 
>>>>>>> 2e88f6e258990dd9682a226b4f77c565afdfa9fa
export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "", 
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필드 검증
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.department
    ) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 서버로 회원가입 요청 (부서 포함)
      await signupAPI({
        username: form.name,
        email: form.email,
        password: form.password,
        department: form.department, // ✅ 부서 전달
      });

      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate("/");
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
          <input
            type="text"
            name="name"
            placeholder="사용자 이름"
            value={form.name}
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

          {/* 🔥 부서 선택 드롭다운 */}
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            required
            className="auth-input"
            style={{ marginBottom: "12px" }}
          >
            <option value="">부서를 선택하세요</option>
            <option value="법무팀">법무팀</option>
            <option value="SW개발팀">SW개발팀</option>
            <option value="디자인팀">디자인팀</option>
            <option value="인사팀">인사팀</option>
            <option value="기획팀">기획팀</option>
          </select>

          <button type="submit" className="login-btn">
            회원가입
          </button>
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
