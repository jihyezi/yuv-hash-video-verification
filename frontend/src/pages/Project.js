import React, { useState } from "react";
import { FaFolder, FaTrashAlt, FaSearch } from "react-icons/fa";
import "./Project.css";

const Project = () => {
  const [selectedTeam, setSelectedTeam] = useState("프론트엔드팀");

  const folderData = {
    프론트엔드팀: [
      { type: "folder", name: "참고자료" },
      { type: "image", name: "picture-001", date: "2025.05.29", img: "/images/sample1.png" },
      { type: "image", name: "picture-002", date: "2025.05.29", img: "/images/sample2.png" },
    ],
    백엔드팀: [
      { type: "folder", name: "API 문서" },
      { type: "image", name: "server-log", date: "2025.05.29", img: "/images/sample3.png" },
    ],
    데이터베이스팀: [
      { type: "folder", name: "DB 설계서" },
      { type: "image", name: "ERD-001", date: "2025.05.29", img: "/images/sample4.png" },
    ],
  };

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
          <button>폴더생성</button>
          <button>빠른 검증</button>
          <button>다운로드</button>
          <button className="delete">삭제</button>
        </div>

        {/* 경로 + 검색바 한 줄로 정렬 */}
        <div className="path-search">
          <div className="current-path">SW 개발팀 &gt; {selectedTeam}</div>
          <div className="search-bar">
            <input type="text" placeholder="사진 이름으로 검색해 보세요" />
            <button><FaSearch /> 검색</button>
          </div>
        </div>

        <div className="file-list">
          {folderData[selectedTeam].map((item, index) => (
            <div
              key={index}
              className={`file-card ${item.type === "folder" ? "folder" : ""}`}
            >
              {item.type === "folder" ? (
                <>
                  <FaFolder className="folder-icon" />
                  <p>{item.name}</p>
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
    </div>
  );
};

export default Project;
