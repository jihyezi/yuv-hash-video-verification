import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Project from "./pages/Project";
import DataUpload from "./pages/DataUpload";
import Detect from "./pages/Detect";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const [user, setUser] = useState({
    name: "",
    id: "",
    email: ""
  });

  // 새로고침 시 로그인 유지 (useEffect 필수!)
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      // 토큰이 있으면 로컬스토리지에서 정보들을 싹 긁어옵니다.
      const savedName = localStorage.getItem("username");
      const savedId = localStorage.getItem("user_id");
      const savedEmail = localStorage.getItem("email");

      // 상태 복구
      setUser({
        name: savedName || "사용자",
        id: savedId || "",
        email: savedEmail || ""
      });
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userInfo) => {
    console.log("유저 데이터: ", userInfo);

    setUser({
      name: userInfo.username,
      id: userInfo.id,
      email: userInfo.email
    });
    setIsLoggedIn(true);
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");

    setIsLoggedIn(false);
    setUser({ name: "", id: "", email: "" });
  };

  return (
    <Router>
      {isLoggedIn ? (
        // 로그인 후 화면
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Header username={user.name} onLogout={handleLogout} />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/project" element={<Project />} />
              <Route path="/data" element={<DataUpload />} />
              <Route path="/detect" element={<Detect />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<Settings />} />
              {/* 로그인 상태면 로그인/회원가입 페이지 접근 불가 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      ) : (
        // 로그인 전 화면
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
