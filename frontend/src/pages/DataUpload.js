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
  const [myDepartment, setMyDepartment] = useState("");

  // 페이지 로드 시 로그인 확인 및 부서 정보 세팅
  useEffect(() => {
    const token = localStorage.getItem("token");
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

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const uploadImage = async () => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }

    try {
      const response = await uploadImageAPI(file);

      console.log("업로드 성공:", response.data);
      alert("업로드 성공!");

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

      // 403일 경우 권한 관련 안내
      if (error.response?.status === 403) {
        alert("권한이 없습니다. 로그인 상태를 확인하세요.");
        navigate("/"); // 필요 시 로그인 페이지로 이동
      } else {
        // 백엔드 메시지 출력 또는 기본 안내
        alert(error.response?.data?.detail || "업로드 중 오류가 발생했습니다.");
      }
    }
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
              업로드
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
