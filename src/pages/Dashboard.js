import React from "react";
import "./Dashboard.css";
import StatCard from "../components/StatCard";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const storageData = [
  { name: "Used", value: 30 },
  { name: "Free", value: 70 },
];
const apiData = [
  { name: "Used", value: 60 },
  { name: "Free", value: 40 },
];

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
  return (
    <div className="dashboard">
      {/* 상단 버튼 */}
      <div className="actions">
        <button className="action-btn">새 자산 등록</button>
        <button className="action-btn">빠른 검증</button>
      </div>

      {/* 핵심 지표 */}
      <section className="stats-section">
        <h2>핵심 지표 (지난 30일)</h2>
        <div className="stat-cards">
          <StatCard title="등록된 건수" value="1,420건" change="+15%" positive />
          <StatCard title="총 API 호출횟수" value="8,120회" change="+22%" positive />
          <StatCard title="위조 의심 발견" value="10건" change="-" />
          <StatCard title="사용자" value="33/340" change="-" />
        </div>
      </section>

      {/* 현재 사용량 */}
      <section className="usage-section">
        <h2>현재 사용량 현황</h2>
        <div className="charts">
          <div className="chart-card">
            <h3>스토리지 사용량</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={storageData} innerRadius={50} outerRadius={70} dataKey="value">
                  <Cell fill="#3b82f6" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>API 호출량</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={apiData} innerRadius={50} outerRadius={70} dataKey="value">
                  <Cell fill="#10b981" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 실시간 로그 + 파일 저장 현황 */}
      <section className="bottom-section">
        <div className="activity-log">
          <h2>실시간 활동 로그</h2>
          <ul>
            {activityLogs.map((log, index) => (
              <li key={index}>{log}</li>
            ))}
          </ul>
        </div>

        <div className="saved-files">
          <h2>파일 저장 현황</h2>
          <table>
            <thead>
              <tr>
                <th>파일명</th>
                <th>저장일시</th>
                <th>크기</th>
              </tr>
            </thead>
            <tbody>
              {savedFiles.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>{file.date}</td>
                  <td>{file.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
