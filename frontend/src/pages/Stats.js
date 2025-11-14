// src/pages/Stats.js
import React from "react";
import "./Stats.css";

export default function Stats() {
  const logs = [
    {
      time: "2025-01-14 09:12",
      user: "홍길동(마케팅팀)",
      type: "파일 업로드",
      file: "test_v1_factory.png",
      status: "정상",
      ip: "10.24.76.8",
    },
    {
      time: "2025-01-14 09:07",
      user: "관리자",
      type: "파일 검증",
      file: "final_image.png",
      status: "위조 의심",
      ip: "10.12.33",
    },
    {
      time: "2025-01-14 08:55",
      user: "김민수(디자인팀)",
      type: "파일 업로드",
      file: "draft_mockup.png",
      status: "정상",
      ip: "192.168.1",
    },
  ];

  return (
    <div className="stats-container">
      <h1 className="stats-title">실시간 활동 로그</h1>

      <div className="stats-table-wrapper">
        <table className="stats-table">
          <thead>
            <tr>
              <th>시간</th>
              <th>사용자</th>
              <th>활동 유형</th>
              <th>대상 객체</th>
              <th>상태</th>
              <th>IP 주소</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.time}</td>
                <td>{log.user}</td>
                <td>{log.type}</td>
                <td>{log.file}</td>
                <td>
                  <span
                    className={
                      log.status === "정상"
                        ? "status-normal"
                        : "status-warning"
                    }
                  >
                    {log.status}
                  </span>
                </td>
                <td>{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
