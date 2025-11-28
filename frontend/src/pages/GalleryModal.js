import React, { useState, useEffect } from "react";
import "./GalleryModal.css";
import { getDepartmentGalleryAPI } from "../api/api";

export default function GalleryModal({ isOpen, onClose, onSelect }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
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
      }
    };

    if (isOpen) fetchImages();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">

        {/* 🔥 오른쪽 상단 X 버튼 */}
        <button className="modal-close-x" onClick={onClose}>
          ×
        </button>

        <h2>사진 선택</h2>

        <div className="gallery-grid">
          {images.length === 0 && <p>이미지를 불러오는 중입니다...</p>}
          {images.map((img) => (
            <img
              key={img.id}
              src={img.full_url}
              alt={img.name}
              className="gallery-item"
              onClick={() => {
                onSelect(img);
                onClose();
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
