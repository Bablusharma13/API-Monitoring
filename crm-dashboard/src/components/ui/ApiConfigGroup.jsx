import React from "react";

export default function ApiConfigGroup({ title, icon, action, rows = [] }) {
  return (
    <div className="bg-white border border-[#e9ebf0] rounded-[12px] overflow-hidden">
      <div className="px-4 py-2.5 bg-[#fafbfc] border-b border-[#e9ebf0] flex items-center gap-2">
        {icon}
        <span className="text-[12px] tracking-[0.08em] uppercase text-[#1c1f2e]">{title}</span>
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      <div>
        {rows.map((row) => (
          <div key={row.key} className="flex items-start gap-4 px-4 py-2.5 border-b border-[#f3f5f9] last:border-0">
            <div className="w-[150px] shrink-0 text-[12.5px] text-[#6b7280]">{row.key}</div>
            <div className="flex-1 min-w-0">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
