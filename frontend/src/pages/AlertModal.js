import React from "react";
import "./AlertModal.css";

export default function AlertModal({ message, onClose }) {
  return (
    <div className="alert-modal-overlay">
      <div className="alert-modal">
        <div className="alert-icon">⚠️</div>
        <h2 className="alert-title">접근 제한</h2>
        <p className="alert-message">{message}</p>
        <button className="alert-btn" onClick={onClose}>확인</button>
      </div>
    </div>
  );
}
