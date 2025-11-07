import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css"; // 스타일 파일 import

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      
      {/* 1. 사이드바 헤더: 로고와 토글 버튼을 함께 관리 */}
      <div className="sidebar-header">
        <h2 className="logo">혜안</h2>
        <button className="toggle-btn" onClick={toggleSidebar}>
        ☰
        </button>
      </div>

      {/* 2. 사이드바 내용: 스크롤 방지 및 메뉴 리스트 관리 */}
      <div className="sidebar-content">
        <ul className="menu">
          <li className={location.pathname === "/" ? "active" : ""}>
            <Link to="/">🏠 {isOpen && "홈"}</Link>
          </li>
          <li className={location.pathname === "/project" ? "active" : ""}>
            <Link to="/project">📁 {isOpen && "프로젝트 관리"}</Link>
          </li>
          <li className={location.pathname === "/data" ? "active" : ""}>
            <Link to="/data">📤 {isOpen && "데이터 등록"}</Link>
          </li>
          <li className={location.pathname === "/detect" ? "active" : ""}>
            <Link to="/detect">🔍 {isOpen && "빠른검증"}</Link>
          </li>
          <li className={location.pathname === "/stats" ? "active" : ""}>
            <Link to="/stats">📄 {isOpen && "증명서 발급"}</Link>
          </li>
          <li className={location.pathname === "/log" ? "active" : ""}>
            <Link to="/log">📊 {isOpen && "실시간 활동 로그"}</Link>
          </li>
          <li className={location.pathname === "/settings" ? "active" : ""}>
            <Link to="/settings">⚙️ {isOpen && "설정"}</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;