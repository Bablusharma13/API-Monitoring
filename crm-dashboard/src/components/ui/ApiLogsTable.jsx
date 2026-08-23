import React from "react";

export default function ApiLogsTable({ rows = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="h-8 px-4 text-left text-[10.5px] text-[#6b7280] uppercase tracking-[0.05em] border-b border-[#e9ebf0] bg-[#fafbfc]">Time</th>
            <th className="h-8 px-4 text-left text-[10.5px] text-[#6b7280] uppercase tracking-[0.05em] border-b border-[#e9ebf0] bg-[#fafbfc]">Status</th>
            <th className="h-8 px-4 text-left text-[10.5px] text-[#6b7280] uppercase tracking-[0.05em] border-b border-[#e9ebf0] bg-[#fafbfc]">Code</th>
            <th className="h-8 px-4 text-left text-[10.5px] text-[#6b7280] uppercase tracking-[0.05em] border-b border-[#e9ebf0] bg-[#fafbfc]">Response</th>
            <th className="h-8 px-4 text-left text-[10.5px] text-[#6b7280] uppercase tracking-[0.05em] border-b border-[#e9ebf0] bg-[#fafbfc]">Message</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${row.time}-${row.message}`} className="border-b border-[#f3f5f9] last:border-0 hover:bg-[#f5f7ff]">
              <td className="h-[38px] px-4 text-[12.5px] font-mono text-[#c2c8d4]">{row.time}</td>
              <td className="h-[38px] px-4"><span className={`badge ${row.levelCls} text-[10.5px]`}>{row.level}</span></td>
              <td className={`h-[38px] px-4 text-[12.5px] font-mono ${row.codeCls}`}>{row.code}</td>
              <td className={`h-[38px] px-4 text-[12.5px] font-mono ${row.responseCls || "text-[#6b7280]"}`}>{row.response}</td>
              <td className="h-[38px] px-4 text-[12.5px] text-[#4b5563]">{row.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
