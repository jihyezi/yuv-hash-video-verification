import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import uploadIcon from "../img/upload_.svg";
import "./DataUpload.css";
import { uploadImageAPI } from "../api/api";

<<<<<<< HEAD
export default function DataUpload({ userDept }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
<<<<<<< HEAD
=======
  const [myDepartment, setMyDepartment] = useState("");

  // 페이지 로드 시 로그인 확인 및 부서 정보 세팅
=======
export default function DataUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [myDepartment, setMyDepartment] = useState("");

>>>>>>> a760379 (feat:  수정사항 구현)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedDept = localStorage.getItem("department");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/");
      return;
    }
    setMyDepartment(savedDept || "부서 정보 없음");
  }, [navigate]);
>>>>>>> 3cc8b91 (d)

  const handleFileChange = (fileObj) => {
    if (fileObj) {
      setFile(fileObj);
      setPreviewUrl(URL.createObjectURL(fileObj));
    }
  };

  // -------------------------------
  // 🔥 드래그 앤 드롭 기능 추가
  // ------------------------------- #11.26하린 수정
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

<<<<<<< HEAD
  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
  };

=======
>>>>>>> a760379 (feat:  수정사항 구현)
  const uploadImage = async () => {
    if (!file) {
      alert("파일을 선택해주세요.");
      return;
    }

    try {
      const response = await uploadImageAPI(file);
      alert("업로드 성공!");

      navigate("/project", {
        state: {
          newImage: {
            name: file.name,
            img: previewUrl,
<<<<<<< HEAD
            team: userDept || "부서 정보 없음",
            id: response.data.file_data?.id
=======
            team: myDepartment,
            id: response.data.file_data?.id,
>>>>>>> a760379 (feat:  수정사항 구현)
          },
        },
      });
    } catch (error) {
<<<<<<< HEAD
      console.error("업로드 실패:", error);
=======
      alert(error.response?.data?.detail || "업로드 중 오류가 발생했습니다.");
    }
  };
>>>>>>> a760379 (feat:  수정사항 구현)

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

        <div
          className={`upload-box ${isDragging ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!previewUrl ? (
            <label className="drop-zone">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files[0])}
                className="file-input"
              />
              <div className="drop-content">
                <img src={uploadIcon} alt="업로드" className="upload-icon" />
                <p>
                  이미지 파일을 선택하거나<br />
                  <strong>여기로 끌어오세요</strong>
                </p>
              </div>
            </label>
          ) : (
            <div className="image-preview-container">
              <img src={previewUrl} alt="미리보기" className="drop-preview" />
            </div>
          )}

<<<<<<< HEAD
=======
          {/* 부서 정보 표시 */}
          <div className="team-select" style={{ marginTop: "20px" }}>
            <label>업로드 폴더 (자동 지정):</label>
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
                marginTop: "5px",
              }}
            />
          </div>
>>>>>>> a760379 (feat:  수정사항 구현)

          <div className="button-container">
    <button className="upload-btn" onClick={uploadImage}>
        업로드
    </button>
</div> 
        </div>
      </main>
    </div>
  );
}
