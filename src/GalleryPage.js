import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./App.css";

export default function GalleryPage() {
  const location = useLocation();

  // 데모 데이터 (백엔드 연결 시 교체)
  const [items] = useState([
    { id: 1, title: "picture-001", date: "2025.05.29", src: "./img/laptop.jpg", },
  ]);

  const [selected, setSelected] = useState(new Set());
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((it) => it.title.toLowerCase().includes(keyword));
  }, [q, items]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allCount = items.length;
  const selCount = selected.size;

  const onDelete = () => {
    if (selCount === 0) return;
    alert(`${selCount}개의 항목을 삭제합니다. (백엔드 연동 필요)`);
  };

  const onCreate = () => {
    // 업로드/등록 페이지로 이동시키거나 모달 열기
    // 예: navigate("/upload");
    alert("위변조 검증하기?");
  };

  return (
    <div className="gallery-page">
      {/* 헤더 (공통 스타일 사용) */}
      <header className="header">
        <Link to="/home" className="logo">혜안</Link>

        <nav className="nav">
          <Link to="/upload"  className={location.pathname === "/upload"  ? "active" : ""}>원본 등록</Link>
          <Link to="/verify"  className={location.pathname === "/verify"  ? "active" : ""}>위변조 검증</Link>
          <Link to="/gallery" className={location.pathname === "/gallery" ? "active" : ""}>내 갤러리</Link>
        </nav>

        <div className="profile-icon">👤</div>
      </header>

      {/* 상단 타이틀/툴바 */}
      <section className="g-container">
        <div className="g-header">
          <div>
            <h1 className="g-title">내 갤러리</h1>
            <div className="g-count">등록한 사진 총 {allCount}개</div>
          </div>

          <div className="g-toolbar">
            <div className="g-btns">
              <button className="g-primary" onClick={onCreate}>위변조 검증하기</button>
              <button className={`g-ghost ${selCount === 0 ? "g-disabled": ""}`} onClick={onDelete} disabled={selCount===0}>삭제</button>
            </div>

            <div className="g-search">
              <span className="g-search-dot">⋯</span>
              <div className="g-search-box">
                <span className="g-search-icon">🔍</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="사진 이름으로 검색해 보세요"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 그리드 */}
        <div className="g-grid">
          {filtered.map((it) => {
            const isSel = selected.has(it.id);
            return (
              <button
                key={it.id}
                type="button"
                className={`g-card ${isSel ? "g-selected" : ""}`}
                onClick={() => toggleSelect(it.id)}
              >
                <div className="g-thumb">
                  {/* 실제 이미지 경로로 교체 */}
                  <img src={it.src} alt={it.title} onError={(e)=>{e.currentTarget.style.opacity="0.2"}} />
                </div>
                <div className="g-meta">
                  <div className="g-name">{it.title}</div>
                  <div className="g-date">등록일 {it.date}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
