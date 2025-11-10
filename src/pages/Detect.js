import React, { useState } from "react";
import GalleryModal from "./GalleryModal";
import "./Detect.css";

export default function Detect() {
  const [originalImage, setOriginalImage] = useState(null);
  const [previewOriginal, setPreviewOriginal] = useState(null);

  const [suspiciousImage, setSuspiciousImage] = useState(null);
  const [previewSuspicious, setPreviewSuspicious] = useState(null);

  const [showGallery, setShowGallery] = useState(false);

  // ✅ 원본 파일 업로드 이벤트
  const handleOriginalChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setOriginalImage(selectedFile);
      setPreviewOriginal(URL.createObjectURL(selectedFile));
    }
  };

  // ✅ 갤러리에서 선택한 이미지 처리
  const handleSelectFromGallery = (imgUrl) => {
    setOriginalImage(imgUrl);          // 문자열 URL 저장
    setPreviewOriginal(imgUrl);        // 미리보기 URL 설정
    setShowGallery(false);             // 모달 닫기
  };

  // ✅ 의심 이미지 업로드
  const handleSuspiciousChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setSuspiciousImage(selectedFile);
      setPreviewSuspicious(URL.createObjectURL(selectedFile));
    }
  };

  // ✅ 검증 실행
  const handleVerify = () => {
    if (!originalImage || !suspiciousImage) {
      alert("원본과 의심 이미지를 모두 선택해주세요.");
      return;
    }
    alert("검증을 시작합니다!");
  };

  // ✅ 원본 이미지 재선택
  const resetOriginal = () => {
    setOriginalImage(null);
    setPreviewOriginal(null);
  };

  // ✅ 의심 이미지 재선택
  const resetSuspicious = () => {
    setSuspiciousImage(null);
    setPreviewSuspicious(null);
  };

  return (
    <div className="page-container">
      <main className="upload-page">
        <h1 className="upload-title">데이터 위변조 검증</h1>
        <p className="upload-subtitle">
          원본과 의심 데이터를 등록하여 진위 여부를 확인하세요.
        </p>

        {/* ✅ Step1: 원본 이미지 */}
        <div className="upload-box">
          <h3 className="step-title">Step 1. 원본 이미지 선택</h3>

          {!previewOriginal ? (
            <label className="drop-zone">
              <input
                type="file"
                accept="image/*"
                onChange={handleOriginalChange}
                className="file-input"
              />
              <div className="drop-content">
                <img src="/img/upload_.svg" alt="업로드" className="upload-icon" />
                <p>
                  원본 이미지를 선택하거나<br />파일을 이곳에 끌어 놓으세요
                </p>
              </div>
            </label>
          ) : (
            <div className="image-preview-container">
              <img src={previewOriginal} alt="미리보기" className="drop-preview" />
            </div>
          )}

          <div className="button-container">
            {previewOriginal && (
              <button className="reset-btn" onClick={resetOriginal}>
                재업로드
              </button>
            )}
            {!previewOriginal && (
              <button className="upload-btn" onClick={() => setShowGallery(true)}>
                내 갤러리에서 선택
              </button>
            )}
          </div>
        </div>

        {/* ✅ Step2: 의심 이미지 */}
        <div className="upload-box">
          <h3 className="step-title">Step 2. 의심 이미지 업로드</h3>

          {!previewSuspicious ? (
            <label className="drop-zone">
              <input
                type="file"
                accept="image/*"
                onChange={handleSuspiciousChange}
                className="file-input"
              />
              <div className="drop-content">
                <img src="/img/upload_.svg" alt="업로드" className="upload-icon" />
                <p>
                  의심 이미지를 선택하거나<br />파일을 이곳에 끌어 놓으세요
                </p>
              </div>
            </label>
          ) : (
            <div className="image-preview-container">
              <img src={previewSuspicious} alt="미리보기" className="drop-preview" />
            </div>
          )}

          <div className="button-container">
            {previewSuspicious && (
              <button className="reset-btn" onClick={resetSuspicious}>
                재업로드
              </button>
            )}
            <button
              className="upload-btn verify-btn"
              onClick={handleVerify}
              disabled={!originalImage || !suspiciousImage}
            >
              데이터 위변조 검증하기
            </button>
          </div>
        </div>
      </main>

      {/* ✅ 갤러리 모달 */}
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
