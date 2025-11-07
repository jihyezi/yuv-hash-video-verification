import React from "react";
import "./StatCard.css"; // 혹시 별도 css 쓰면 유지

export default function StatCard({ title, value, change, positive }) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <div className="value">{value}</div>
      {change && (
        <div className={`change ${positive ? "positive" : "negative"}`}>
          {change}
        </div>
      )}
    </div>
  );
}
