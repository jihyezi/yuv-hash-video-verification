import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DataUpload.css";
import axiosInstance from "../api";

export default function DataUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("프론트엔드팀");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // 실제 업로드 함수
  const uploadImage = async () => {
    console.log("--- 업로드 함수 실행됨 ---");

    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosInstance.post(
        "http://localhost:8000/gallery/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("업로드 성공:", response.data);

      // 업로드 성공 후 Project 페이지로 이동
      navigate("/project", {
        state: {
          newImage: {
            name: file.name,
            img: previewUrl,
            team: selectedTeam,
          },
        },
      });
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
          진위 검증을 위해 원본 영상을 안전하게 등록하고 보관하세요.
        </p>

        <div className="upload-box">
          {!previewUrl ? (
            <label className="drop-zone">
              <input
                type="file"
                accept="image/*, video/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <div className="drop-content">
                <img src="/img/upload_.svg" alt="업로드" className="upload-icon" />
                <p>
                  이미지 파일을 선택<br />
                  또는 파일을 여기로 끌어 놓으세요
                </p>
              </div>
            </label>
          ) : (
            <div className="image-preview-container">
              <img src={previewUrl} alt="미리보기" className="drop-preview" />
            </div>
          )}

          <div className="team-select">
            <label>폴더 선택: </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="프론트엔드팀">프론트엔드팀</option>
              <option value="백엔드팀">백엔드팀</option>
              <option value="데이터베이스팀">데이터베이스팀</option>
            </select>
          </div>

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
