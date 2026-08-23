// pages/CronMonitor/CronHistoryColumns.jsx
// Column definitions for the Ping History table
// Same pattern as getDownApisColumns / getSlowApisColumns in apiDashboard.jsx
// • No rank column — NewTableConfig handles row numbers via showRowNumbers
// • Actions as last column with MoreVertical 3-dot dropdown

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Bell, RefreshCw, Copy } from "lucide-react";

// ── Status badge ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  ok:      { color: "#16a34a", bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", label: "On Time"  },
  late:    { color: "#d97706", bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200",   label: "Late"     },
  missing: { color: "#dc2626", bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200",     label: "Missing"  },
};

function StatusBadge({ status }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.ok;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${s.bg} ${s.text} ${s.border}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

// ── Duration bar + value ──────────────────────────────────────────────────────
function DurationCell({ dur, durRaw, maxDur }) {
  const pct = maxDur > 0 ? Math.round((durRaw / maxDur) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-[5px] bg-[#f0f2f7] rounded-full overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-[12px] text-[#1c1f2e]">{dur}</span>
    </div>
  );
}

// ── 3-dot actions dropdown ────────────────────────────────────────────────────
function ActionsDropdown({ row, onView, onAlert, onRestart }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = [
    { icon: <Eye size={12} />,       label: "View Detail",  fn: onView    },
    { icon: <Bell size={12} />,      label: "Send Alert",   fn: onAlert   },
    { icon: <RefreshCw size={12} />, label: "Retry Job",    fn: onRestart },
    { icon: <Copy size={12} />,      label: "Copy Row",
      fn: () => navigator.clipboard?.writeText(`${row.time} | ${row.job} | ${row.status} | ${row.dur}`) },
  ];

  return (
    <div ref={ref} className="relative flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center w-6 h-6 rounded border border-[#e9ebf0] bg-white text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-[#eff4ff] transition-colors cursor-pointer"
      >
        <MoreVertical size={12} />
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-[999] w-[156px] bg-white border border-[#e9ebf0] rounded-xl shadow-lg py-1 overflow-hidden">
          {items.map(({ icon, label, fn }) => (
            <button
              key={label}
              onClick={() => { fn?.(row); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-[7px] text-[12.5px] text-[#1c1f2e] hover:bg-[#f5f7ff] hover:text-[#2563eb] transition-colors text-left"
            >
              <span className="text-[#6b7280]">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
// maxDur is passed as context so DurationCell can compute the bar width
export const getCronHistoryColumns = ({ onView, onAlert, onRestart, maxDur = 1200 } = {}) => [
  {
    accessor: "time",
    header: "Time",
    cell: (row) => (
      <span className="font-mono text-[11.5px] text-[#6b7280]">{row.time}</span>
    ),
  },
  {
    accessor: "job",
    header: "Job",
    cell: (row) => (
      <span className="text-[12.5px] font-medium text-[#1c1f2e]">{row.job}</span>
    ),
  },
  {
    accessor: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    accessor: "dur",
    header: "Duration",
    cell: (row) => (
      <DurationCell dur={row.dur} durRaw={row.durRaw} maxDur={maxDur} />
    ),
  },
  {
    accessor: "latency",
    header: "Latency",
    cell: (row) => (
      <span className="font-mono text-[12px] text-[#1c1f2e]">{row.latency}</span>
    ),
  },
  {
    accessor: "ip",
    header: "IP",
    cell: (row) => (
      <span className="font-mono text-[11px] text-[#6b7280]">{row.ip}</span>
    ),
  },
  {
    accessor: "exit",
    header: "Exit Code",
    cell: (row) => (
      <span className="font-mono text-[12px]" style={{
        color: row.exit === "0" ? "#16a34a" : row.exit === "—" ? "#dc2626" : "#d97706",
      }}>
        {row.exit}
      </span>
    ),
  },
  {
    accessor: "actions",
    header: "Actions",
    cell: (row) => (
      <ActionsDropdown
        row={row}
        onView={onView}
        onAlert={onAlert}
        onRestart={onRestart}
      />
    ),
  },
];