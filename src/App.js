import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./MainPage";
import OriginalUpload from "./OriginalUpload";
import VerifyPage from "./VerifyPage";
import GalleryPage from "./GalleryPage";
import Login from "./Login";
import Signup from "./Signup"

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 루트("/") → 메인 페이지 */}
        <Route path="/" element={<MainPage />} />

        {/* /home → 메인 페이지 */}
        <Route path="/home" element={<MainPage />} />


        {/* 로그인 페이지 */}
        <Route path="/login" element={<Login />} />  


        {/* 회원가입 페이지 */}
        <Route path="/signup" element={<Signup />} />  


        {/* 원본 등록 페이지 */}
        <Route path="/upload" element={<OriginalUpload />} />

        {/* 위변조 검증 페이지 */}
        <Route path="/verify" element={<VerifyPage />} />

        {/* 내 갤러리 페이지 */}
        <Route path="/gallery" element={<GalleryPage />} />

        {/* 없는 경로는 메인으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
