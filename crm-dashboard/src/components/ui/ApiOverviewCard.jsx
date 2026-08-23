import React from "react";

export default function ApiOverviewCard({ title, badge, rows = [] }) {
  return (
    <div className="bg-white border border-[#e9ebf0] rounded-[10px] p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="text-[11px] uppercase tracking-[0.08em] text-[#6b7280]">{title}</div>
        {badge ? <span className={`badge ${badge.cls} text-[10.5px]`}>{badge.label}</span> : null}
      </div>
      {rows.map((row) => (
        <div key={row.key} className="flex items-center justify-between py-1.5 border-b border-[#f3f5f9] last:border-0">
          <span className="text-[12px] text-[#6b7280]">{row.key}</span>
          <span className={`text-[12.5px] font-mono ${row.valueClass || "text-[#1c1f2e]"}`}>{row.value}</span>
        </div>
      ))}
    </div>
  );
}
