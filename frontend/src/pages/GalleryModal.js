import React, { useState, useEffect } from "react";
import "./GalleryModal.css";
import { getDepartmentGalleryAPI } from "../api/api";
import heic_icon from "../img/heic_icon.jpeg";

export default function GalleryModal({ isOpen, onClose, onSelect }) {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      if (!isOpen) return;
      setIsLoading(true);
      try {
        const res = await getDepartmentGalleryAPI();
        console.log("갤러리 API 응답:", res.data);

        const imgs = (res.data.images || res.data || []).map((img) => ({
          ...img,
          full_url: img.full_url || img.image_url,
        }));
        setImages(imgs);
      } catch (err) {
        console.error("갤러리 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) fetchImages();
  }, [isOpen]);

  const formatFileName = (fileName, nameLimit = 10) => {
    if (!fileName) return "";
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex === -1) {
      if (fileName.length <= nameLimit) return fileName;
      return fileName.substring(0, nameLimit) + "...";
    }
    const extension = fileName.substring(lastDotIndex);
    const namePart = fileName.substring(0, lastDotIndex);

    if (namePart.length <= nameLimit) return fileName;

    const frontPart = namePart.substring(0, 6);
    const backPart = namePart.substring(namePart.length - 3);
    return `${frontPart}...${backPart}${extension}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        {/* 🔥 오른쪽 상단 X 버튼 */}
        <button className="modal-close-x" onClick={onClose}>×</button>

        <h2>사진 선택</h2>
        <p className="modal-subtitle">검증할 원본 이미지를 선택해주세요.</p>

        <div className="gallery-grid">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>이미지를 불러오는 중입니다...</p>
            </div>
          ) : images.length === 0 ? (
            /* 2. 로딩 끝났는데 데이터가 없을 때: 빈 상태 표시 */
            <p className="no-data">등록된 이미지가 없습니다.</p>
          ) : (images.map((img) => {
            const extension = img.title ? img.title.split('.').pop().toLowerCase() : '';
            const isHeic = extension === 'heic';
            const displaySrc = isHeic ? heic_icon : img.full_url;

            return (
              <div
                key={img.id}
                className="gallery-card"
                onClick={() => {
                  onSelect(img);
                  onClose();
                }}
              >
                <div className="gallery-image-wrapper">
                  <img
                    src={displaySrc}
                    alt={img.title}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                </div>
                <span className="gallery-title" title={img.title}>
                  {formatFileName(img.title)}
                </span>
              </div>
            );
          })
          )}
        </div>

      </div>
    </div>
  );
}