import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// 기존 컴포넌트 import (그대로 유지)
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

// 수정한 ProtectedRoute 가져오기
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./App.css";

const normalizeRole = (role) => {
  if (!role) return "user"; // 기본값 소문자
  const lowerRole = role.toLowerCase().trim();

  // 유효한 역할인지 확인 (admin, institution, user)
  if (['admin', 'institution', 'user'].includes(lowerRole)) {
    return lowerRole;
  }
  return 'user';
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "",
    id: "",
    email: "",
    department: "",
    role: "",
  });

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
        role: normalizeRole(savedRole)
      });

      setIsLoggedIn(true);
    }
  }, []);

  // 🔥 로그인 핸들러
  const handleLogin = (userInfo) => {
    console.log("유저 데이터: ", userInfo);

    // ✅ 로그인 시에도 정규화 적용
    const rawRole = userInfo.role || userInfo.authority || "User";
    const cleanRole = normalizeRole(rawRole);

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
    localStorage.setItem("role", cleanRole); // 정규화된 값 저장

    setIsLoggedIn(true);
  };

  // 🔥 로그아웃
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser({ name: "", id: "", email: "", department: "", role: "" });
  };

  return (
    <Router>
      {isLoggedIn ? (
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Header
              username={user.name}
              role={user.role}
              onLogout={handleLogout}
            />

            <Routes>
              {/* 1. 조회 권한 (Admin, User, Institution) */}
              <Route element={<ProtectedRoute userRole={user.role} requiredPermission="view" />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/project" element={<Project />} />
                <Route path="/detect" element={<Detect />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/certificate" element={<Certificate />} />
              </Route>

              {/* 2. 업로드 권한 (Admin, User) */}
              <Route element={<ProtectedRoute userRole={user.role} requiredPermission="upload" />}>
                <Route path="/data" element={<DataUpload userDept={user.department} />} />
              </Route>

              {/* 3. 설정 권한 (Admin) */}
              <Route element={<ProtectedRoute userRole={user.role} requiredPermission="settings" />}>
                <Route path="/settings" element={<Settings />} />
              </Route>

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