import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import uploadIcon from "../img/upload_.svg";
import "./DataUpload.css";

export default function DataUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const uploadImage = async () => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await apiClient.post(
        "/gallery/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("업로드 성공:", response.data);
      navigate("/project");

    } catch (error) {
      console.error("업로드 실패:", error);
      alert("업로드 중 오류가 발생했습니다.");
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="page-container">
      <main className="upload-page">
        <h1 className="upload-title">데이터 등록</h1>
        <p className="upload-subtitle">
          진위 검증을 위해 원본 영상을 안전하게 등록하세요.
        </p>

        <div className="upload-box">
          {!previewUrl ? (
            <label className="drop-zone">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />

              <div className="drop-content">
                <img src={uploadIcon} alt="업로드" className="upload-icon" />
                <p>이미지 파일을 선택하거나<br />여기로 끌어오세요.</p>
              </div>
            </label>
          ) : (
            <div className="image-preview-container">
              <img src={previewUrl} alt="미리보기" className="drop-preview" />
            </div>
          )}

          <div className="button-container">
            {previewUrl && (
              <button className="reset-btn" onClick={handleReset}>
                재업로드
              </button>
            )}
            <button className="upload-btn" onClick={uploadImage}>
              이미지 업로드
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
