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
import Certificate from "./pages/Certificate";   // ⭐ 추가된 부분
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "",
    id: "",
    email: "",
    department: ""
  });

  // 새로고침 시 로그인 유지
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      const savedName = localStorage.getItem("username");
      const savedId = localStorage.getItem("user_id");
      const savedEmail = localStorage.getItem("email");
      const savedDept = localStorage.getItem("department");

      setUser({
        name: savedName || "사용자",
        id: savedId || "",
        email: savedEmail || "",
        department: savedDept || ""
      });
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userInfo) => {
    console.log("유저 데이터: ", userInfo);

    setUser({
      name: userInfo.username,
      id: userInfo.id,
      email: userInfo.email,
      department: userInfo.department || ""
    });
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
    localStorage.removeItem("department");

    setIsLoggedIn(false);
    setUser({ name: "", id: "", email: "", department: "" });
  };

  return (
    <Router>
      {isLoggedIn ? (
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Header username={user.name} onLogout={handleLogout} />

            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/project" element={<Project />} />
              <Route path="/data" element={<DataUpload userDept={user.department} />} />
              <Route path="/detect" element={<Detect />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<Settings />} />

              {/* ⭐ 여기가 증명서 페이지 라우트 */}
              <Route path="/certificate" element={<Certificate />} />

              {/* 로그인 상태에서 잘못된 경로 → 홈으로 */}
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
