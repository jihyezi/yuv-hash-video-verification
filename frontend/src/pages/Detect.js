import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import GalleryModal from "./GalleryModal";
import uploadIcon from "../img/upload_.svg";
import "./Detect.css";

export default function Detect() {
  const location = useLocation();
  const navigate = useNavigate();
  const quickImage = location.state?.quickImage || null;
  const [originalImage, setOriginalImage] = useState(quickImage);
  const [suspiciousImage, setSuspiciousImage] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [dragOriginal, setDragOriginal] = useState(false);
  const [dragSuspicious, setDragSuspicious] = useState(false);

  // 이미지 미리보기
  const getPreviewSrc = (img) => {
    if (!img) return null;
    if (img.url) return img.url;
    return typeof img === "string" ? img : URL.createObjectURL(img);
  };

  // 원본 이미지 업로드
  const handleOriginalUpload = (file) => {
    setOriginalImage({
      id: null,
      file,
      url: URL.createObjectURL(file),
    });
  };

  // 의심 이미지 업로드
  const handleSuspiciousUpload = (file) => {
    setSuspiciousImage(file);
  };

  // 드래그 앤 드롭 이벤트
  const handleDrag = (e, setDragState) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(true);
  };

  const handleDragLeave = (e, setDragState) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);
  };

  const handleDrop = (e, setDragState, uploadHandler) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState(false);

    const file = e.dataTransfer.files[0];
    if (file) uploadHandler(file);
  };

  // 검증 API
  const handleVerify = async () => {
    if (!originalImage || !suspiciousImage) {
      alert("원본 이미지와 의심 이미지를 모두 업로드해주세요.");
      return;
    }

    if (!originalImage.id) {
      alert("❌ 원본 이미지 ID가 없습니다. 프로젝트 화면에서 '빠른 검증'을 사용하세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", suspiciousImage);
      formData.append("original_file_id", originalImage.id);

      const res = await apiClient.post("/verify/detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVerifyResult(res.data);

      // 결과와 상관없이 항상 Certificate 페이지로 이동
      navigate("/certificate", {
        state: {
          original: originalImage,
          result: res.data,
        },
      });
    } catch (err) {
      console.error("검증 에러:", err);
      alert(err.response?.data?.detail || "검증 중 오류 발생");
    }
  };

  // 갤러리 이미지 선택
  const handleSelectFromGallery = (img) => {
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
      <p className="detect-subtitle">원본 이미지와 의심 이미지를 비교해 위변조 여부를 확인합니다.</p>

      <div className="detect-steps">

        {/* === STEP 1 — 원본 === */}
        <div className="step-wrapper">
          <h3 className="step-title active-title">
            <span>Step 1. 원본 데이터 선택</span> {originalImage && "✅"}
          </h3>

          <div
            className={`upload-box ${dragOriginal ? "drag-active" : ""}`}
            onDragOver={(e) => handleDrag(e, setDragOriginal)}
            onDragLeave={(e) => handleDragLeave(e, setDragOriginal)}
            onDrop={(e) => handleDrop(e, setDragOriginal, handleOriginalUpload)}
          >
            {!originalImage ? (
              <label
                className="drop-zone"
                onClick={(e) => {
                  e.preventDefault();
                  setShowGallery(true); // 클릭하면 갤러리 모달 열기
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleOriginalUpload(e.target.files[0])}
                  className="file-input"
                />
                <div className="drop-content">
                  <img src={uploadIcon} alt="업로드" className="upload-icon" />
                  <p>원본 이미지를 갤러리에서 선택하세요</p>
                </div>
              </label>
            ) : (
              <div className="preview-container">
                <img src={getPreviewSrc(originalImage)} className="image-preview" alt="원본" />
              </div>
            )}

            <button className="detect-action-btn" onClick={() => setShowGallery(true)}>
              {originalImage ? "다른 이미지 선택" : "내 갤러리에서 선택"}
            </button>
          </div>
        </div>

        {/* === STEP 2 — 의심 이미지 === */}
        <div className="step-wrapper">
          <h3 className={`step-title ${originalImage ? "active-title" : ""}`}>
            <span>Step 2. 의심 데이터 업로드</span> {suspiciousImage && "✅"}
          </h3>

          <div
            className={`upload-box ${dragSuspicious ? "drag-active" : ""}`}
            onDragOver={(e) => handleDrag(e, setDragSuspicious)}
            onDragLeave={(e) => handleDragLeave(e, setDragSuspicious)}
            onDrop={(e) => handleDrop(e, setDragSuspicious, handleSuspiciousUpload)}
          >
            {!suspiciousImage ? (
              <label className="drop-zone">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSuspiciousUpload(e.target.files[0])}
                  className="file-input"
                />
                <div className="drop-content">
                  <img src={uploadIcon} alt="업로드" className="upload-icon" />
                  <p>의심 이미지를 선택하거나 드래그하세요</p>
                </div>
              </label>
            ) : (
              <div className="preview-container">
                <img src={URL.createObjectURL(suspiciousImage)} className="image-preview" alt="의심" />
              </div>
            )}

            <button
              className="detect-action-btn"
              onClick={handleVerify}
              disabled={!originalImage || !suspiciousImage}
            >
              데이터 위변조 검증하기
            </button>
          </div>
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
