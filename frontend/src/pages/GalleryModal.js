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
        <h2>사진 선택</h2>
        <div className="gallery-grid">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`gallery-${idx}`}
              className="gallery-item"
              onClick={() => {
                onSelect(img);  // 부모에 선택 전달
                onClose();      // 모달 닫기
              }}
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
