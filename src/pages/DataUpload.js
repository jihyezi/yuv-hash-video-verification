import React, { useState } from "react";
import "./DataUpload.css";

export default function DataUpload() {
const [file, setFile] = useState(null);
const [previewUrl, setPreviewUrl] = useState(null);

const handleFileChange = (e) => {
const selectedFile = e.target.files[0];
if (selectedFile) {
setFile(selectedFile);
setPreviewUrl(URL.createObjectURL(selectedFile));
}
};

const handleUpload = () => {
if (!file) {
alert("이미지를 선택해주세요.");
return;
}
alert(`업로드 완료: ${file.name}`);
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
{/* ✅ 파일 미리보기 / 업로드 영역 */}
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

<div className="button-container">
{previewUrl && (
<button className="reset-btn" onClick={handleReset}>
재업로드
</button>
)}
<button className="upload-btn" onClick={handleUpload}>
이미지 업로드하기
</button>
</div>
</div>
</main>
</div>
);
}