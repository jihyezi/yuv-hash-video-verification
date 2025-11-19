import React from "react";
import "./Header.css";

export default function Header({ username, onLogout }) {
  return (
    <header className="header">
      <div className="header-right">
        <span className="admin-label">{username}님</span>
        <button className="logout-btn" onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
}
