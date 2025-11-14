import React from "react";
import "./Header.css";

export default function Header({ username }) {
  return (
    <header className="header">
      <div className="header-right">
        <span className="admin-label">{username}님</span>
      </div>
    </header>
  );
}
