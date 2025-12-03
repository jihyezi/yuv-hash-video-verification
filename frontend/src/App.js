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
import Certificate from "./pages/Certificate";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "",
    id: "",
    email: "",
    department: "",
    role: ""
  });

  // 🔥 새로고침 시 로그인 유지
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      const savedName = localStorage.getItem("username");
      const savedId = localStorage.getItem("user_id");
      const savedEmail = localStorage.getItem("email");
      const savedDept = localStorage.getItem("department");
      const savedRole = localStorage.getItem("role");

      setUser({
        name: savedName || "사용자",
        id: savedId || "",
        email: savedEmail || "",
        department: savedDept || "",
        role: savedRole || "user"   // 기본값 user
      });

      setIsLoggedIn(true);
    }
  }, []);

  // 🔥 로그인 시 유저 저장 + localStorage 저장
  const handleLogin = (userInfo) => {
    console.log("유저 데이터: ", userInfo);

    // authority 값에서 줄바꿈 제거
    const cleanRole = (userInfo.role || userInfo.authority || "user").trim();

    const userData = {
      name: userInfo.username,
      id: userInfo.id,
      email: userInfo.email,
      department: userInfo.department || "",
      role: cleanRole
    };

    setUser(userData);

    // localStorage 저장
    localStorage.setItem("access_token", userInfo.access_token);
    localStorage.setItem("username", userInfo.username);
    localStorage.setItem("user_id", userInfo.id);
    localStorage.setItem("email", userInfo.email);
    localStorage.setItem("department", userInfo.department || "");
    localStorage.setItem("role", cleanRole);

    setIsLoggedIn(true);
  };

  // 🔥 로그아웃
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    localStorage.removeItem("department");
    localStorage.removeItem("role");   // ← 중요!!

    setIsLoggedIn(false);
    setUser({ name: "", id: "", email: "", department: "", role: "" });
  };

  return (
    <Router>
      {isLoggedIn ? (
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            
            {/* ⭐ 역할 추가된 헤더 */}
            <Header 
              username={user.name}
              role={user.role}
              onLogout={handleLogout}
            />

            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/project" element={<Project />} />
              <Route path="/data" element={<DataUpload userDept={user.department} />} />
              <Route path="/detect" element={<Detect />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/certificate" element={<Certificate />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
