import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import uploadIcon from "../img/upload_.svg";
import "./DataUpload.css";
import { uploadImageAPI } from "../api/api";


export default function DataUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // 내 부서 정보 (화면 표시용)
  const [myDepartment, setMyDepartment] = useState("");

  // 1. 페이지 로드 시 내 부서 정보 가져오기
  useEffect(() => {
    // 로컬 스토리지에서 정보 확인
    const token = localStorage.getItem("access_token");
    const savedDept = localStorage.getItem("department");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/"); // 로그인 페이지로 이동
      return;
    }

    setMyDepartment(savedDept || "부서 정보 없음");
  }, [navigate]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  // 실제 업로드 함수
  const uploadImage = async () => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }

    try {
      // ★ [핵심 수정] 복잡한 설정 없이 함수 하나로 끝!
      // 주소(/gallery/upload)와 토큰 처리는 api.js가 다 해줍니다.
      const response = await uploadImageAPI(file);

      console.log("업로드 성공:", response.data);
      alert("업로드 성공!");

      // 업로드 성공 후 Project 페이지로 이동
      navigate("/project", {
        state: {
          newImage: {
            name: file.name,
            img: previewUrl,
            team: myDepartment,
            id: response.data.file_data?.id 
          },
        },
      });
    } catch (error) {
      console.error("업로드 실패:", error);
      // 백엔드가 보낸 에러 메시지가 있으면 띄워줌
      alert(error.response?.data?.detail || "업로드 중 오류가 발생했습니다.");
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

          {/* 부서 정보 보여주기 (읽기 전용) */}
          <div className="team-select" style={{ marginTop: "20px" }}>
            <label>업로드 폴더 (자동 지정): </label>
            <input
              type="text"
              value={myDepartment}
              readOnly
              className="dept-input"
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#f0f0f0",
                border: "1px solid #ccc",
                borderRadius: "4px",
                color: "#555",
                fontWeight: "bold",
                marginTop: "5px"
              }}
            />
          </div>

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
