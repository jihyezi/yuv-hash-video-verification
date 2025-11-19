// Header.js
import React, { useState, useEffect, useRef } from "react";
import "./Header.css";

export default function Header({ username, onLogout }) {
  const [showLogout, setShowLogout] = useState(false);
  const containerRef = useRef(null);

  const toggleLogout = () => {
    setShowLogout((prev) => !prev);
  };

  const handleLogout = () => {
    setShowLogout(false); // 드롭다운 닫기
    onLogout();           // 부모(App.js)의 로그아웃 함수 호출
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
        <span className="admin-label" onClick={toggleLogout}>
          {username}님
        </span>
        {showLogout && (
          <button className="logout-btn" onClick={handleLogout}>
            로그아웃
          </button>
        )}
      </div>
    </header>
  );
}
