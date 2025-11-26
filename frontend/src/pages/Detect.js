import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "../api/axiosConfig";   // ★ 검증 API 호출용
import GalleryModal from "./GalleryModal";
import uploadIcon from "../img/upload_.svg";
import "./Detect.css";


export default function Detect() {
  const location = useLocation();
  const quickImage = location.state?.quickImage || null;

  // quickImage 구조: { id, url }
  const [originalImage, setOriginalImage] = useState(quickImage);
  const [suspiciousImage, setSuspiciousImage] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  // 이미지 미리보기 (url 또는 File 모두 backend/app/routers/project.py 처리)
  const getPreviewSrc = (img) => {
    if (!img) return null;

    // img가 객체일 경우 (Project.js에서 넘어온 경우)
    if (img.url) return img.url;

    return typeof img === "string" ? img : URL.createObjectURL(img);
  };

  // 원본 이미지 직접 업로드한 경우 → File로 들어감
  const handleOriginalUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOriginalImage({
        id: null,   // 직접 업로드한 건 ID가 없음 → DB 조회 불가
        file: file,
        url: URL.createObjectURL(file)
      });
    }
  };

  const handleSuspiciousUpload = (e) => {
    const file = e.target.files[0];
    if (file) setSuspiciousImage(file);
  };

  // ============================================
  // 🔥 실제 검증 API 호출하는 핵심 함수
  // ============================================
  const handleVerify = async () => {
    if (!originalImage || !suspiciousImage) {
      alert("원본 사진과 의심 사진을 모두 업로드해주세요.");
      return;
    }

    if (!originalImage.id) {
      alert("❌ 원본 이미지 ID가 없습니다.\n\n'프로젝트 → 빠른 검증' 버튼을 통해 원본을 선택해야 합니다.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", suspiciousImage);            // 비교할 의심 이미지
      formData.append("original_file_id", originalImage.id); // 원본 ID

      const res = await apiClient.post("/verify/detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("검증결과:", res.data);

      if (res.data.is_authentic) {
        alert("✔ 정상 이미지 — 위변조 없음!");
      } else {
        alert("❌ 위변조 탐지됨!");
      }

    } catch (err) {
      console.error("검증 에러:", err);
      alert(err.response?.data?.detail || "검증 중 오류 발생");
    }
  };

  // Gallery에서 선택한 이미지 → 반드시 URL + ID 포함됨
  const handleSelectFromGallery = (img) => {
    // img: { id, full_url, title }
    setOriginalImage({
      id: img.id,
      url: img.full_url,
    });
    setShowGallery(false);
  };

  useEffect(() => {
    if (quickImage) setOriginalImage(quickImage);
  }, [quickImage]);

  return (
    <div className="detect-page">
      <h1 className="detect-title">데이터 위변조 검증</h1>
      <p className="detect-subtitle">
        원본 데이터와 의심 데이터를 업로드하여 시스템이 자동으로 위변조 여부를 판별합니다.
      </p>

      <div className="detect-steps">

        {/* STEP 1 */}
        <div className="upload-box">
          <h3 className="step-title">
            Step 1. <span>데이터 선택</span>
          </h3>

          {!originalImage && (
            <label className="drop-zone">
              <input
                type="file"
                accept="image/*"
                onChange={handleOriginalUpload}
                className="file-input"
              />
              <div className="drop-content">
              <img src={uploadIcon} alt="업로드" className="upload-icon" />
                <p>원본 이미지를 선택하거나<br/>파일을 이곳에 끌어 놓으세요</p>
              </div>
            </label>
          )}

          {originalImage && (
            <img
              src={getPreviewSrc(originalImage)}
              alt="원본 미리보기"
              className="image-preview"
            />
          )}

          {!originalImage && (
            <button onClick={() => setShowGallery(true)}>
              내 갤러리에서 선택
            </button>
          )}
        </div>

        {/* STEP 2 */}
        <div className="upload-box">
          <h3 className="step-title">
            Step 2. <span>위변조 의심 데이터 업로드</span>
          </h3>

          {!suspiciousImage && (
            <label className="drop-zone">
              <input
                type="file"
                accept="image/*"
                onChange={handleSuspiciousUpload}
                className="file-input"
              />
              <div className="drop-content">
              <img src={uploadIcon} alt="업로드" className="upload-icon" />

              <p>의심 이미지를 선택하거나<br />파일을 이곳에 끌어 놓으세요</p>
              </div>
            </label>
          )}

          {suspiciousImage && (
            <img
              src={URL.createObjectURL(suspiciousImage)}
              alt="의심 미리보기"
              className="image-preview"
            />
          )}

          <button
            className="verify-btn"
            onClick={handleVerify}
            disabled={!originalImage || !suspiciousImage}
          >
            데이터 위변조 검증하기
          </button>
        </div>
      </div>

      {/* 갤러리 모달 */}
      {showGallery && (
        <GalleryModal
          isOpen={showGallery}
          onClose={() => setShowGallery(false)}
          onSelect={handleSelectFromGallery}
        />
      )}
    </div>
  );
}
