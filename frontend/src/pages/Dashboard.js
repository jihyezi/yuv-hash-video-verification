import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "../components/StatCard";
import { getDashboardStatsAPI, getActivityLogsAPI, getRecentFilesAPI } from "../api/api";

const activityLogs = [
  "🔹 사용자 '홍길동'이 파일을 등록했습니다.",
  "🔹 시스템에서 자동 검증이 수행되었습니다.",
  "🔹 관리자 계정으로 로그인했습니다.",
  "🔹 파일 'sample01.jpg'이 검증 통과했습니다.",
  "🔹 파일 'report_2025.pdf' 업로드 완료.",
];

const savedFiles = [
  { name: "sample01.jpg", date: "2025-10-30 15:42", size: "1.2MB" },
  { name: "report_2025.pdf", date: "2025-10-29 20:11", size: "3.8MB" },
  { name: "logo.png", date: "2025-10-29 13:02", size: "512KB" },
  { name: "document.docx", date: "2025-10-28 09:55", size: "2.4MB" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  // 1. 통계 상태 관리 (초기값 0)
  const [stats, setStats] = useState({
    gallery_count: 0,
    api_count: 0,
    user_count: 0,
    forgery_count: 0,
    storage_usage: "0 MB"
  });

  // 2. 차트 데이터 상태 관리
  const [storageData, setStorageData] = useState([
    { name: "Used", value: 0 },
    { name: "Free", value: 100 },
  ]);
  const [apiData, setApiData] = useState([
    { name: "Used", value: 0 },
    { name: "Free", value: 100 },
  ]);

  // 3. 로그용 상태 관리
  const [logs, setLogs] = useState([]);
  const [files, setFiles] = useState([]);

  // 4. 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes, filesRes] = await Promise.all([
          getDashboardStatsAPI(),
          getActivityLogsAPI(),
          getRecentFilesAPI()
        ]);

        // 통계 데이터 처리
        const data = statsRes.data;
        setStats(data);
        updateCharts(data);

        // 로그&파일 데이터 처리
        setLogs(logsRes.data);
        setFiles(filesRes.data);

        console.log("📊 데이터 로드 완료");
      } catch (error) {
        console.error("대시보드 데이터 로드 실패:", error);
      }
    };
    fetchData();
  }, []);

  const updateCharts = (data) => {
    // (1) 스토리지 차트: 1GB(1024MB)를 기준으로 사용량 계산
    const usageValue = parseFloat(data.storage_usage.split(" ")[0]);
    const isGB = data.storage_usage.includes("GB");
    const usageMB = isGB ? usageValue * 1024 : usageValue;

    // 전체 1024MB 중 사용량 비율
    const storageUsed = Math.min(usageMB, 1024);
    setStorageData([
      { name: "Used", value: storageUsed },
      { name: "Free", value: 1024 - storageUsed }
    ]);

    // (2) API 차트: 월 10,000회 무료라고 가정하고 비율 계산
    const apiLimit = 1000;
    const apiUsed = Math.min(data.api_count, apiLimit);
    setApiData([
      { name: "Used", value: apiUsed },
      { name: "Free", value: apiLimit - apiUsed }
    ]);
  };

  const getLogMessage = (log) => {
    switch (log.activity_type) {
      case "UPLOAD": return `사용자 '${log.username}'님이 파일을 등록했습니다.`;
      case "LOGIN": return `${log.username} 계정으로 로그인했습니다.`;
      case "VERIFY": return `파일 '${log.target_object}' 검증이 수행되었습니다.`;
      case "FORGERY_DETECTED": return `🚨 파일 '${log.target_object}'에서 위변조가 감지되었습니다.`;
      default: return `[${log.activity_type}] ${log.target_object || ""}`;
    }
  };

  // 5. 헬퍼 함수: 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    }).replace(/\./g, '-').replace(/ /g, ' ').trim();
  };

  const goToDataUpload = () => navigate("/data");
  const goToDetect = () => navigate("/detect");

  return (
    <div className="dashboard">
      {/* 상단 버튼 */}
      <div className="actions">
        <button className="action-btn" onClick={goToDataUpload}>
          새 자산 등록
        </button>
        <button className="action-btn2" onClick={goToDetect}>
          빠른 검증
        </button>
      </div>

      {/* 아래는 기존 내용 그대로 */}
      <section className="stats-section">
        <h2>핵심 지표 (지난 30일)</h2>
        <div className="stat-cards">

          <StatCard title="등록된 건수" value={`${stats.gallery_count.toLocaleString()}건`} change="+15% vs 전월" positive />
          <StatCard title="총 API 호출횟수" value={`${stats.api_count.toLocaleString()}회`} change="+22% vs 전월" positive />
          <StatCard title="위조 의심 발견" value={`${stats.forgery_count}건`} change="-" />
          <StatCard title="사용자" value={`${stats.user_count}명`} change="-" />
        </div>
      </section>

      <section className="usage-section">
        <h2>현재 사용량 현황</h2>
        <div className="charts">
          <div className="chart-card">
            <h3>스토리지 사용량 ({stats.storage_usage})</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={storageData} innerRadius={40} outerRadius={70} dataKey="value">
                  <Cell fill="#3b82f6" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>


          <div className="chart-card">
            <h3>API 호출량 ({stats.api_count} / 1,000)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={apiData} innerRadius={40} outerRadius={70} dataKey="value">
                  <Cell fill="#10b981" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="bottom-section">
        {/* 로그 섹션 수정 */}
        <div className="activity-log">
          <h2>실시간 활동 로그</h2>
          <ul>
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <li key={index}>
                  🔹 {getLogMessage(log)}
                  <span style={{ fontSize: "0.8em", color: "#888", marginLeft: "8px" }}>
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </li>
              ))
            ) : (
              <li>최근 활동 내역이 없습니다.</li>
            )}
          </ul>
        </div>

        <div className="saved-files">
          <h2>파일 저장 현황</h2>
          <table>
            <thead>
              <tr>
                <th>파일명</th>
                <th>저장일시</th>
                <th>사용자 (부서)</th>
              </tr>
            </thead>
            <tbody>
              {files.length > 0 ? (
                files.map((file, index) => (
                  <tr key={index}>
                    {/* file_name과 title 중 백엔드가 보내주는 키값 사용 */}
                    <td>{file.file_name || file.title}</td>
                    <td>{formatDate(file.created_at)}</td>
                    <td>{file.username} ({file.department})</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                    등록된 파일이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
