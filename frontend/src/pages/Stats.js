// src/pages/Stats.js
import React, { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "./Stats.css";

export default function Stats() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws/logs");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WebSocket connected");

        client.subscribe("/topic/logs", (msg) => {
          const log = JSON.parse(msg.body);
          setLogs((prev) => [log, ...prev]);
        });
      },
    });

    client.activate();
    return () => client.deactivate();
  }, []);

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
                <td>{log.timestamp}</td>
                <td>{log.user}</td>
                <td>{log.actionType}</td>
                <td>{log.image}</td>
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
