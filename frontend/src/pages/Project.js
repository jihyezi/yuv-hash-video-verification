import React, { useState, useEffect } from "react";
import { FaFolder, FaTrashAlt, FaSearch } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import "./Project.css";

const Project = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const newImage = location.state?.newImage || null; // DataUpload에서 넘어온 이미지

  const [selectedTeam, setSelectedTeam] = useState("프론트엔드팀");
  const [selectedImage, setSelectedImage] = useState(null); // 빠른검증용 선택 이미지
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태
  const [folderModal, setFolderModal] = useState(null); // 폴더 클릭 시 모달 상태

  const [folderData, setFolderData] = useState({
    프론트엔드팀: [
      { type: "folder", name: "참고자료", images: [
        { name: "샘플1", img: "/images/sample1.png" },
        { name: "샘플2", img: "/images/sample2.png" },
      ] },
      { type: "image", name: "picture-001", date: "2025.05.29", img: "/images/sample1.png" },
      { type: "image", name: "picture-002", date: "2025.05.29", img: "/images/sample2.png" },
    ],
    백엔드팀: [
      { type: "folder", name: "API 문서", images: [
        { name: "샘플3", img: "/images/sample3.png" },
      ] },
      { type: "image", name: "server-log", date: "2025.05.29", img: "/images/sample3.png" },
    ],
    데이터베이스팀: [
      { type: "folder", name: "DB 설계서", images: [
        { name: "샘플4", img: "/images/sample4.png" },
      ] },
      { type: "image", name: "ERD-001", date: "2025.05.29", img: "/images/sample4.png" },
    ],
  });

  // ✅ DataUpload에서 넘어온 이미지가 있으면 folderData에 추가
  
  useEffect(() => {
  if (newImage) {
    setFolderData((prev) => {
      const exists = prev[newImage.team].some(item => item.img === newImage.img);
      if (exists) return prev; // 이미 추가되어 있으면 그대로
      return {
        ...prev,
        [newImage.team]: [
          ...prev[newImage.team],
          {
            type: "image",
            name: newImage.name,
            date: new Date().toISOString().split("T")[0],
            img: newImage.img,
          },
        ],
      };
    });
    setSelectedTeam(newImage.team);
    navigate(location.pathname, { replace: true, state: {} });
  }
}, [newImage, navigate, location.pathname]);
  

  // 폴더 생성
  const handleCreateFolder = () => {
    const folderName = prompt("새 폴더 이름을 입력하세요:");
    if (!folderName) return;
    setFolderData((prev) => ({
      ...prev,
      [selectedTeam]: [...prev[selectedTeam], { type: "folder", name: folderName, images: [] }],
    }));
  };

  // 이미지 선택
  const handleSelectImage = (item) => {
    if (item.type === "image") setSelectedImage(item.img);
  };

  // 이미지 삭제
  const handleDeleteImage = () => {
    if (!selectedImage) return alert("삭제할 이미지를 선택해주세요.");
    setFolderData((prev) => ({
      ...prev,
      [selectedTeam]: prev[selectedTeam].filter(item => item.img !== selectedImage),
    }));
    setSelectedImage(null);
  };

  // 빠른 검증 이동
  const handleQuickVerify = () => {
    if (!selectedImage) return alert("검증할 이미지를 선택해주세요.");
    navigate("/detect", { state: { quickImage: selectedImage } });
  };

  // 폴더 클릭 시 모달 열기
  const handleOpenFolderModal = (folder) => {
    setFolderModal(folder);
  };

  // 검색 필터
  const filteredFiles = folderData[selectedTeam].filter((item) => {
    if (item.type === "folder") return true;
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="project-container">
      {/* 왼쪽 폴더 영역 */}
      <div className="folder-sidebar">
        <h3>부서별 폴더</h3>
        <ul className="folder-list">
          <li className="team">📁 법무팀</li>
          <li className="team open">
            📂 SW 개발팀
            <ul className="sub-folder">
              {Object.keys(folderData).map((team) => (
                <li
                  key={team}
                  className={selectedTeam === team ? "active" : ""}
                  onClick={() => setSelectedTeam(team)}
                >
                  {team}
                </li>
              ))}
            </ul>
          </li>
          <li className="team">📁 디자인팀</li>
        </ul>

        <button className="trash-btn">
          <FaTrashAlt /> 휴지통
        </button>
      </div>

      {/* 오른쪽 파일 영역 */}
      <div className="file-area">
        <div className="file-actions">
          <button onClick={handleCreateFolder}>폴더생성</button>
          <button onClick={handleQuickVerify}>빠른 검증</button>
          <button>증명서 발급</button>
          <button className="delete" onClick={handleDeleteImage}>삭제</button>
        </div>

        <div className="path-search">
          <div className="current-path">SW 개발팀 &gt; {selectedTeam}</div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="사진 이름으로 검색해 보세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button><FaSearch /> 검색</button>
          </div>
        </div>

        <div className="file-list">
          {filteredFiles.map((item, index) => (
            <div
              key={index}
              className={`file-card ${item.type === "folder" ? "folder" : ""} ${item.img === selectedImage ? "selected" : ""}`}
              onClick={() => item.type === "folder" ? handleOpenFolderModal(item) : handleSelectImage(item)}
            >
              {item.type === "folder" ? (
                <>
                  <FaFolder className="folder-icon" />
                  <p>{item.name}</p>
                  <span>{item.images.length}개 이미지</span>
                </>
              ) : (
                <>
                  <img src={item.img} alt={item.name} />
                  <p>{item.name}</p>
                  <span>등록일 {item.date}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 폴더 모달 */}
      {folderModal && (
        <div className="folder-modal">
          <div className="modal-content">
            <h2>{folderModal.name}</h2>
            <div className="folder-images">
              {folderModal.images.map((img, idx) => (
                <img key={idx} src={img.img} alt={img.name} />
              ))}
            </div>
            <button className="close-btn" onClick={() => setFolderModal(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
