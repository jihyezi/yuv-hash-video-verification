import React from "react";
import "./GalleryModal.css";

export default function GalleryModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  const images = [
    "/img/sample1.jpg",
    "/img/sample2.jpg",
    "/img/sample3.jpg",
    "/img/sample4.jpg",
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>이미지 선택</h2>
        <div className="gallery-grid">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`gallery-${idx}`}
              className="gallery-item"
              onClick={() => onSelect(img)} // 클릭 시 바로 선택
            />
          ))}
        </div>
        <button className="close-btn" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
