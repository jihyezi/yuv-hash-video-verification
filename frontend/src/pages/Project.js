import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axiosConfig";
import "./Project.css";
import CertificateModal from "./CertificateModal";
import { generateCertificateAPI } from "../api/api";

export default function Project() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [images, setImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await apiClient.get("/auth/departments");
      setDepartments(res.data || []);
      if (res.data.length > 0) {
        setSelectedDept(res.data[0]);
        fetchImages(res.data[0].id);
      }
    } catch (error) {
      console.error("부서 목록 불러오기 실패:", error);
    }
  };

  const fetchImages = async (deptId) => {
    try {
      const res = await apiClient.get("/project/list", {
        params: { department_id: deptId },
      });
      setImages(res.data || []);
    } catch (error) {
      console.error("이미지 불러오기 실패:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedImage) return alert("삭제할 이미지를 선택하세요!");

    try {
      const confirmDelete = window.confirm(`${selectedImage.title} 파일을 정말 삭제하시겠습니까?`);
      if (!confirmDelete) return;

      const res = await apiClient.delete("/project/delete", {
        params: { image_id: selectedImage.id },
      });

      if (res.status === 200) {
        alert("삭제 완료!");
        fetchImages(selectedDept.id);
        setSelectedImage(null);
      }
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const filteredImages = images.filter((img) =>
    img.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateCertificate = async () => {
    if (!selectedImage) return alert("증명서를 발급할 이미지를 선택하세요!");

    try {
      const res = await generateCertificateAPI(selectedImage);

      const pdfBlob = new Blob([res.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      setCertificateData({
        certificateId: `CERT-${selectedImage.id}`,
        fileName: selectedImage.title,
        requestedAt: new Date().toISOString().split("T")[0],
        pdfUrl: pdfUrl,
      });

      setShowCertificate(true);
    } catch (e) {
      console.error("증명서 생성 실패:", e);
      alert("증명서 생성 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="project-container">
      <div className="folder-sidebar">
        <h3>부서별 폴더</h3>
        <ul className="folder-list">
          {departments.map((dept) => (
            <li
              key={dept.id}
              className={`team ${selectedDept?.id === dept.id ? "active" : ""}`}
              onClick={() => {
                setSelectedDept(dept);
                fetchImages(dept.id);
              }}
            >
              📁 {dept.name}
            </li>
          ))}
        </ul>

        <button className="trash-btn">
          <FaTrashAlt /> 휴지통
        </button>
      </div>

      <div className="file-area">
        <div className="file-actions">
          <button>폴더생성</button>
          <button
            onClick={() => {
               if (!selectedImage) {
              alert("사진을 선택해주세요!");
        return;
          }

    navigate("/detect", {
      state: {
        quickImage: { id: selectedImage.id, url: selectedImage.url },
          },
      });
          }}
          >
          빠른 검증
          </button>

          <button onClick={handleGenerateCertificate}>
            증명서 발급
          </button>
          <button className="delete" onClick={handleDelete}>
            삭제
          </button>
        </div>

        <div className="path-search">
          <div className="current-path">{selectedDept ? selectedDept.name : "부서 선택"}</div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="사진 이름으로 검색해 보세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button>
              <FaSearch /> 검색
            </button>
          </div>
        </div>

        <div className="file-list">
          {filteredImages.length > 0 ? (
            filteredImages.map((img) => (
              <div
                key={img.id}
                className={`file-card ${selectedImage?.id === img.id ? "selected" : ""}`}
                onClick={() =>
                  setSelectedImage({
                    id: img.id,
                    url: img.full_url,
                    title: img.title,
                  })
                }
              >
                <img src={img.full_url} alt={img.title} />
                <p>{img.title}</p>
                <span>등록일 {img.created_at?.split("T")[0]}</span>
              </div>
            ))
          ) : (
            <p>등록된 이미지가 없습니다.</p>
          )}
        </div>
      </div>

      {showCertificate && (
        <CertificateModal data={certificateData} onClose={() => setShowCertificate(false)} />
      )}
    </div>
  );
}
