import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // ★ form이 GET 요청 보내는 문제 방지

    if (!form.email || !form.password) {
      alert("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // ★ JSON으로 변경 (더 안전)
        },
        body: JSON.stringify({
          username: form.email,  // Supabase auth → username = email
          password: form.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        alert(error?.detail || "로그인 실패");
        return;
      }

      const data = await response.json();
      const displayName = form.email.split("@")[0];

      // 로그인 성공 → 상위 컴포넌트(App.js)에 전달
      onLogin(displayName, data.access_token);
      localStorage.setItem("username", displayName);
      alert("로그인 성공!");
    } catch (err) {
      console.error(err);
      alert("서버 연결 실패");
    }
  };

  return (
    <div className="page-container">
      <div className="auth-box">
        <h1 className="auth-title">로그인</h1>
        <p className="auth-subtitle">혜안 서비스를 이용하려면 로그인하세요</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <input
            type="email"
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="username"
          />

          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />

          <button type="submit" className="login-btn">
            로그인
          </button>
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
