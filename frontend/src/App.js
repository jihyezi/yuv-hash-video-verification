
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
import Signup from "./pages/Signup"; // 회원가입 페이지
import "./App.css";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(""); // 토큰 저장

  // 페이지 로드 시 localStorage에서 토큰 확인
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedName = localStorage.getItem("username");
    if (savedToken && savedName) {
      setToken(savedToken);
      setUsername(savedName);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (name, accessToken) => {
    setUsername(name);
    setToken(accessToken);
    setIsLoggedIn(true);

    // 브라우저 저장소에 저장 (새로고침 시 유지)
    localStorage.setItem("token", accessToken);
    localStorage.setItem("username", name);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return (
    <Router>
      {isLoggedIn ? (
        <div className="app-container">
          <Sidebar onLogout={handleLogout} />
          <div className="main-content">
            <Header username={username} onLogout={handleLogout} />
            <Routes>
              <Route path="/" element={<Dashboard token={token} />} />
              <Route path="/project" element={<Project token={token} />} />
              <Route path="/data" element={<DataUpload token={token} />} />
              <Route path="/detect" element={<Detect token={token} />} />
              <Route path="/stats" element={<Stats token={token} />} />
              <Route path="/settings" element={<Settings token={token} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      ) : (
        <Routes>
          <Route
            path="/*"
            element={<Login onLogin={handleLogin} />}
          />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;