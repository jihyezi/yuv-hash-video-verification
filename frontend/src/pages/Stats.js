import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { fetchActivityLogAPI } from "../api/api.js";
import "./Stats.css";

export default function Stats() {
  const [logs, setLogs] = useState([]);

  // 1️⃣ 페이지 처음 로딩 시 REST API로 기존 로그 가져오기
  useEffect(() => {
    const loadInitialLogs = async () => {
      try {
        const data = await fetchActivityLogAPI(100); // limit 100
        setLogs(data);
      } catch (error) {
        console.error("초기 로그 불러오기 실패:", error);
      }
    };
    loadInitialLogs();
  }, []);

  // 2️⃣ WebSocket 연결하여 실시간 로그 받기
  useEffect(() => {
    const socket = new SockJS("http://localhost:8000/ws/logs");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WebSocket connected");

        client.subscribe("/topic/logs", (msg) => {
          const newLog = JSON.parse(msg.body);
          // 실시간 로그가 들어오면 기존 로그 위에 추가
          setLogs((prev) => [newLog, ...prev]);
        });
      },
    });
    client.activate();
    return () => client.deactivate();
  }, []);

  const formatLogDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}(${weekDay}) ${hours}:${minutes}`;
  };

  return (
    <div className="stats-container">
      <h1 className="stats-title">실시간 활동 로그</h1>

      <div className="stats-table-wrapper">
        <table className="stats-table">
          <colgroup>
            <col width="18%" />
            <col width="12%" />
            <col width="12%" />
            <col width="35%" />
            <col width="10%" />
            <col width="13%" />
          </colgroup>

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
            {logs.map((log, index) => {
              const isSuccess = log.status && (
                log.status.includes("정상") ||
                log.status.toLowerCase().includes("success") ||
                log.status.includes("완료") ||
                log.status.includes("성공") ||
                log.status.includes("원본 인증") ||
                log.status.includes("통과")
              );

              return (
                <tr key={index}>
                  <td className="td-time">{formatLogDate(log.created_at || log.timestamp)}</td>
                  <td className="td-user">{log.username || log.user}</td>
                  <td className="td-type">{log.activity_type || log.actionType}</td>

                  {/* 파일명이 길면 말줄임표 처리 + 툴팁 */}
                  <td className="td-target" title={log.target_object || log.image}>
                    {log.target_object || log.image}
                  </td>

                  <td>
                    <span className={`status-badge ${isSuccess ? "success" : "warning"}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="td-ip">{log.ip_address || log.ip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}