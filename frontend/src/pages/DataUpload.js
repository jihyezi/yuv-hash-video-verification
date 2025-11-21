import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DataUpload.css";
import uploadIcon from "../img/upload_.svg";

export default function DataUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [userTeam, setUserTeam] = useState(""); // 로그인 시 등록된 부서 저장

  // 페이지 로드 시 로그인 체크
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const department = localStorage.getItem("department");

    if (!token || !department) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    setUserTeam(department); // 부서 자동 설정
  }, [navigate]);

  // 파일 선택
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // 업로드
  const uploadImage = async () => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.post(
        "http://localhost:8000/images/gallery/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // 인증 토큰
          },
        }
      );

      console.log("업로드 성공:", response.data);
      alert("업로드 성공!");

      // 업로드 후 초기화
      setFile(null);
      setPreviewUrl(null);

    } catch (error) {
      console.error("업로드 실패:", error);
      alert("업로드 중 오류가 발생했습니다.");
    }
  };

  // 재업로드
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
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="file-input"
              />
              <div className="drop-content">
                <img src={uploadIcon} alt="업로드" className="upload-icon" />
                <p>
                  이미지 또는 영상 파일 선택<br />
                  또는 파일을 이곳으로 끌어 놓으세요
                </p>
                <p style={{ marginTop: "8px", fontSize: "12px", color: "#555" }}>
                  업로드는 "{userTeam}" 부서로 자동 등록됩니다
                </p>
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
              업로드
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
