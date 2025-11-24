import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import GalleryModal from "./GalleryModal";
import { verifyImageAPI, getDepartmentGalleryAPI } from "../api/api";
import "./Detect.css";

export default function Detect() {
  const location = useLocation();
  const quickImage = location.state?.quickImage || null;

  const [originalImage, setOriginalImage] = useState(quickImage);
  const [suspiciousImage, setSuspiciousImage] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [departmentImages, setDepartmentImages] = useState([]);
  const [result, setResult] = useState(null); // 검증 결과
  const [loadingGallery, setLoadingGallery] = useState(false);

  // 이미지 미리보기 URL
  const getPreviewSrc = (img) => {
    if (!img) return null;
    return typeof img === "string"
      ? img
      : img.full_url || img.image_url || URL.createObjectURL(img);
  };

  // 의심 이미지 업로드
  const handleSuspiciousUpload = (e) => {
    const file = e.target.files[0];
    if (file) setSuspiciousImage(file);
  };

  // 원본 이미지 갤러리에서 선택
  const handleSelectFromGallery = (img) => {
    setOriginalImage(img);
    setShowGallery(false);
  };

  // 검증 실행
  const handleVerify = async () => {
    if (!originalImage || !suspiciousImage) {
      alert("원본 사진과 의심 사진을 모두 업로드해주세요.");
      return;
    }
  
    // originalImage.id가 문자열인지 확인
    if (!originalImage.id || typeof originalImage.id !== "string") {
      alert("원본 이미지 ID가 올바르지 않습니다.");
      return;
    }
  
    // suspiciousImage가 File 객체인지 확인
    if (!(suspiciousImage instanceof File)) {
      alert("업로드한 의심 이미지가 유효하지 않습니다.");
      return;
    }
  
    try {
      const response = await verifyImageAPI(suspiciousImage, originalImage.id);
      console.log("검증 결과:", response.data);
      setResult(response.data);
    } catch (err) {
      console.error("API Error:", err);
      alert(err.response?.data?.detail || err.message || "검증 중 오류가 발생했습니다.");
    }
  };
  

  // 갤러리 불러오기
  useEffect(() => {
    const fetchDepartmentImages = async () => {
      setLoadingGallery(true);
      try {
        const res = await getDepartmentGalleryAPI();
        setDepartmentImages(res.data || res || []);
      } catch (err) {
        console.error("갤러리 불러오기 실패:", err);
        alert("갤러리 이미지를 불러오지 못했습니다.");
      } finally {
        setLoadingGallery(false);
      }
    };

    if (showGallery) fetchDepartmentImages();
  }, [showGallery]);

  useEffect(() => {
    if (quickImage) setOriginalImage(quickImage);
  }, [quickImage]);

  return (
    <div className="detect-page">
      <h1 className="detect-title">데이터 위변조 검증</h1>

      {/* Step 1 */}
      <div className="upload-box">
        <h3>Step 1. 원본 데이터 선택</h3>
        {originalImage ? (
          <img
            src={getPreviewSrc(originalImage)}
            alt="원본 미리보기"
            className="image-preview"
          />
        ) : (
          <button onClick={() => setShowGallery(true)}>내 갤러리에서 선택</button>
        )}
      </div>

      {/* Step 2 */}
      <div className="upload-box">
        <h3>Step 2. 의심 데이터 업로드</h3>
        <input type="file" accept="image/*" onChange={handleSuspiciousUpload} />
        {suspiciousImage && (
          <img
            src={URL.createObjectURL(suspiciousImage)}
            alt="의심 미리보기"
            className="image-preview"
          />
        )}
      </div>

      <button
        onClick={handleVerify}
        disabled={!originalImage || !suspiciousImage}
      >
        데이터 위변조 검증하기
      </button>

      {result && (
        <div className="verify-result">
          <p>
            {result.is_authentic
              ? "✅ 원본 이미지입니다."
              : "❌ 위조된 이미지입니다."}
          </p>
          <p>{result.message}</p>
        </div>
      )}

      {showGallery && (
        <GalleryModal
          isOpen={showGallery}
          images={departmentImages}
          onClose={() => setShowGallery(false)}
          onSelect={handleSelectFromGallery}
        />
      )}

      {showGallery && loadingGallery && <p>이미지를 불러오는 중입니다...</p>}
    </div>
  );
}
