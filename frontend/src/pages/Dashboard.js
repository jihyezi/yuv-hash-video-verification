import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "../components/StatCard";
import { getDashboardStatsAPI, getActivityLogsAPI, getRecentFilesAPI } from "../api/api";

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
        console.log("📦 [전체 로그 데이터]", logsRes.data);
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

  const formatTimeBracket = (dateString) => {
    if (!dateString) return "[-:-]";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `[${hours}:${minutes}]`;
  };

  const renderLogContent = (log) => {
    const user = log.username || "시스템";
    const target = log.target_object || "";
    const time = formatTimeBracket(log.created_at);

    const type = log.activity_type;
    const status = log.status || "";

    const TimePrefix = <span className="log-time-prefix">{time}</span>;
    const UserSpan = <span className="log-user">{user}</span>;

    if (type === "로그인") {
      return (
        <p>{TimePrefix} {UserSpan} 님이 시스템에 로그인했습니다.</p>
      );
    }

    else if (type === "파일 등록" || type === "업로드") {
      return (
        <p>{TimePrefix} {UserSpan} 님이 <strong>'{target}'</strong> 을(를) 등록했습니다.</p>
      );
    }

    else if (type === "파일 삭제") {
      return (
        <p>{TimePrefix} {UserSpan} 님이 <strong>'{target}'</strong> 을(를) 삭제했습니다.</p>
      );
    }

    else if (type === "파일 검증") {
      if (status === "실패") {
        return (
          <p>
            {TimePrefix} {UserSpan} 님이 올린 <strong>'{target}'</strong> 에서
            위변조가 감지되었습니다.
          </p>
        );
      } else {
        return (
          <p>{TimePrefix} {UserSpan} 님이 <strong>'{target}'</strong> 의 무결성 검증을 실행했습니다.</p>
        );
      }
    }

    else {
      return (
        <p>{TimePrefix} {UserSpan}: {type} - {target}</p>
      );
    }
  };

  const getLogIcon = (log) => {
    // 실패 상태이거나, 위변조 감지 타입이면 경고 아이콘
    if (log.status === "실패" || log.activity_type === "위변조 감지") {
      return <div className="log-icon-circle warning">⚠️</div>;
    }
    return <div className="log-icon-circle success">✅</div>;
  };

  const formatFileName = (fileName, nameLimit = 10) => {
    if (!fileName) return "";
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex === -1) {
      if (fileName.length <= nameLimit) return fileName;
      return fileName.substring(0, nameLimit) + "...";
    }
    const extension = fileName.substring(lastDotIndex);
    const namePart = fileName.substring(0, lastDotIndex);

    if (namePart.length <= nameLimit) return fileName;

    const frontPart = namePart.substring(0, 6);
    const backPart = namePart.substring(namePart.length - 3);
    return `${frontPart}...${backPart}${extension}`;
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

  const goToStats = () => navigate("/stats");

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
        <div className="activity-log">
          <h2>실시간 활동 로그</h2>
          <ul>
            {logs.length > 0 ? (
              logs.slice(0, 6).map((log, index) => (
                <li key={index}>
                  {getLogIcon(log)}
                  <div className="log-content">
                    {renderLogContent(log)}
                  </div>
                </li>
              ))
            ) : (
              <li>최근 활동 내역이 없습니다.</li>
            )}
          </ul>
          {logs.length > 0 && (
            <div
              onClick={goToStats}
              className="add-button">
              더보기
            </div>
          )}
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
                    <td>{formatFileName(file.file_name || file.title)}</td>
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
      </section >
    </div >
  );
}