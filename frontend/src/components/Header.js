// Header.js
import React, { useState, useEffect, useRef } from "react";
import "./Header.css";

export default function Header({ username, role, onLogout }) {   // ⭐ role 추가
  const [showLogout, setShowLogout] = useState(false);
  const containerRef = useRef(null);

  // ⭐ authority → 한국어 역할 매핑
  const roleKor = {
    admin: "관리자",
    institution: "기관",
    user: "사원",
  };

  const toggleLogout = () => {
    setShowLogout((prev) => !prev);
  };

  const handleLogout = () => {
    setShowLogout(false);

    // ⭐ onLogout이 없을 경우 에러 방지
    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="admin-container" ref={containerRef}>
        <div className="admin-label" onClick={toggleLogout}>
          <span className="user-name">{username}님</span>
          {role && <span className="role-tag">({roleKor[role]})</span>}
          <span className={`arrow ${showLogout ? "up" : ""}`}>▼</span>
        </div>

        {showLogout && (
          <div className="dropdown-menu">
            <button className="logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
