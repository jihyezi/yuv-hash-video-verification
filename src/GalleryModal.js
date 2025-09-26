export default function GalleryModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* 닫기 버튼 */}
        <button className="modal-close" onClick={onClose}>×</button>

        {/* 상단 헤더 */}
        <div className="g-header">
          <h1 className="g-title">내 갤러리</h1>
          <div className="g-toolbar">
            <button 
              className="g-primary"
              onClick={() => onSelect({ id: 1, src: "/img/laptop.jpg" })}
            >
              원본 선택
            </button>
          </div>
        </div>

        {/* 갤러리 그리드 */}
        <div className="g-grid">
          {/* 여기에 사진 카드들 */}
        </div>
      </div>
    </div>
  );
}
