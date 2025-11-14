import React, { useState } from "react";
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
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const [username, setUsername] = useState(""); 

  return (
    <Router>
      {isLoggedIn ? (
        // 로그인 후 화면
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Header  username={username} />
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
           <Route
            path="*"
            element={<Login onLogin={(name) => { setUsername(name); setIsLoggedIn(true); }} />}
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
