import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import GalleryModal from "./GalleryModal";
import "./Detect.css";

export default function Detect() {
  const location = useLocation();
  const quickImage = location.state?.quickImage || null; // Project에서 전달된 이미지

  const [originalImage, setOriginalImage] = useState(quickImage);
  const [suspiciousImage, setSuspiciousImage] = useState(null);
  const [showGallery, setShowGallery] = useState(false);

  // ✅ File 또는 URL 모두 처리
  const getPreviewSrc = (img) => {
    if (!img) return null;
    return typeof img === "string" ? img : URL.createObjectURL(img);
  };

  // ✅ 파일 업로드 이벤트
  const handleOriginalUpload = (e) => {
    const file = e.target.files[0];
    if (file) setOriginalImage(file);
  };

  const handleSuspiciousUpload = (e) => {
    const file = e.target.files[0];
    if (file) setSuspiciousImage(file);
  };

  const handleVerify = () => {
    if (!originalImage || !suspiciousImage) {
      alert("원본 사진과 의심 사진을 모두 업로드해주세요.");
      return;
    }
    alert("사진 위변조 검증을 시작합니다!");
  };

  // ✅ 갤러리에서 선택한 이미지
  const handleSelectFromGallery = (img) => {
    setOriginalImage(img);
    setShowGallery(false);
  };

  // ✅ Project에서 전달된 이미지가 있으면 자동 적용
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
        {/* Step 1 */}
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
                <img src="/img/upload_.svg" alt="업로드" className="upload-icon" />
                <p>
                  원본 이미지를 선택하거나 <br /> 파일을 이곳에 끌어 놓으세요
                </p>
              </div>
            </label>
          )}

          {originalImage && (
            <img
              src={getPreviewSrc(originalImage)}
              alt="원본 미리보"
              className="image-preview"
            />
          )}

          {!originalImage && (
            <button type="button" onClick={() => setShowGallery(true)}>
              내 갤러리에서 선택
            </button>
          )}
        </div>

        {/* Step 2 */}
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
                <img src="/img/upload_.svg" alt="업로드" className="upload-icon" />
                <p>
                  의심 이미지를 선택하거나 <br /> 파일을 이곳에 끌어 놓으세요
                </p>
              </div>
            </label>
          )}

          {suspiciousImage && (
            <img
              src={getPreviewSrc(suspiciousImage)}
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
