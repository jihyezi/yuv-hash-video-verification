import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import uploadIcon from "../img/upload_.svg";
import "./DataUpload.css";
import { uploadImageAPI } from "../api/api";
import heic_icon from "../img/heic_icon.jpeg";

export default function DataUpload({ userDept }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (fileObj) => {
    if (fileObj) {
      setFile(fileObj);
      const isHeic = fileObj.name.toLowerCase().endsWith('.heic');

      if (isHeic) {
        setPreviewUrl(heic_icon);
      } else {
        setPreviewUrl(URL.createObjectURL(fileObj));
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current.click();
  };

  const uploadImage = async () => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }

    try {
      const response = await uploadImageAPI(file);
      alert("업로드 성공!");

      const isHeic = file.name.toLowerCase().endsWith('.heic');

      navigate("/project", {
        state: {
          newImage: {
            name: file.name,
            img: isHeic ? heic_icon : previewUrl,
            team: userDept || "부서 정보 없음",
            id: response.data.file_data?.id
          },
        },
      });
    } catch (error) {
      console.error("업로드 실패:", error);

      if (error.response?.status === 403) {
        alert("권한이 없습니다. 로그인 상태를 확인하세요.");
        navigate("/");
      } else {
        alert(error.response?.data?.detail || "업로드 중 오류가 발생했습니다.");
      }
    }
  };

  const isHeicFile = file && file.name.toLowerCase().endsWith('.heic');

  return (
    <div className="page-container">
      <main className="upload-page">
        <h1 className="upload-title">데이터 등록</h1>
        <p className="upload-subtitle">
          진위 검증을 위해 원본 영상을 안전하게 등록하세요.
        </p>

        <div
          className={`data-upload-box ${isDragging ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!previewUrl ? (
            <label className="upload-drop-zone">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="file-input"
              />
              <div className="upload-drop-content">
                <img src={uploadIcon} alt="업로드" className="upload-icon" />
                <p>
                  이미지 파일을 선택하거나<br />
                  <strong>여기로 끌어오세요</strong>
                </p>
              </div>
            </label>
          ) : (
            <div className="image-preview-container">
              <img src={previewUrl} alt="미리보기" className="upload-drop-preview" />
            </div>
          )}

          <div className="upload-button-container">
            {!file ? (
              <button className="upload-btn" onClick={handleSelectFileClick}>
                이미지 파일 선택
              </button>
            ) : (
              <>
                <button className="reset-btn" onClick={handleReset}>
                  재업로드
                </button>
                <button className="upload-btn" onClick={uploadImage}>
                  업로드하기
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}