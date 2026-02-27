import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupAPI } from "../api/api.js";
import "./Login.css"; 
export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department_id: "",
  });

  // 모든 input 변화 처리
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    console.log("변경됨:", e.target.name, "=", e.target.value);
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

    if (!form.department_id) {
      alert("부서를 선택해주세요.");
      return;
    }

    // 실제로 axios에 전달되는 데이터 확인
    const payload = {
      username: form.name,
      email: form.email,
      password: form.password,
      department_id: form.department_id,
      authority: "user", 
    };

    console.log("📤 전송되는 payload:", payload);

    try {
      await signupAPI(payload);
      alert("회원가입 성공!");
      navigate("/");
    } catch (err) {
      console.error("❌ 회원가입 오류:", err);
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

          {/* ⭐ 부서 선택 */}
          <select
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            required
            className="auth-input"
            style={{ marginBottom: "12px" }}
          >
            <option value="">부서를 선택하세요</option>
            <option value="7cc1f471-f275-48eb-895d-ed0337d7f435">법무팀</option>
            <option value="c556e9d9-da6d-4b11-b946-de24e4f1f610">SW개발팀</option>
            <option value="76293a95-a138-4137-8d5a-c75a0b1b26a8">디자인팀</option>
            <option value="98040d12-5465-40f3-8865-d3bfec54ac37">인사팀</option>
            <option value="16df947b-4248-45d6-b177-47a5bc790b1d">기획팀</option>
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
