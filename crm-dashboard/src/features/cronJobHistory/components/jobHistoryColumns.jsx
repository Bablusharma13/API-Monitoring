// /jobHistoryColumns.jsx
// Column definitions for the Job History run table.
// Same pattern as cronhistorycolumns.jsx / cronInventoryColumns.jsx:
//   export function getJobHistoryColumns({ onView, onReplay, onIncident, maxDur })

import { Search, RefreshCw, AlertTriangle } from "lucide-react";
import { fmtDur } from "../hooks/useJobHistory";

// ─── Outcome badge ────────────────────────────────────────────────────────────
export function OutcomeBadge({ outcome }) {
  const map = {
    success: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "#16a34a", label: "Success" },
    failed:  { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "#dc2626", label: "Failed"  },
    timeout: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "#d97706", label: "Timeout" },
    skipped: { bg: "bg-gray-100",   text: "text-gray-600",    border: "border-gray-200",    dot: "#6b7280", label: "Skipped" },
  };
  const s = map[outcome] ?? map.skipped;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${s.bg} ${s.text} ${s.border}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

// ─── Trigger badge ────────────────────────────────────────────────────────────
function TriggerBadge({ trigger }) {
  const map = {
    manual:   { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Manual"   },
    retry:    { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  label: "Retry"    },
    schedule: { bg: "bg-gray-100",  text: "text-gray-600",   border: "border-gray-200",   label: "Schedule" },
  };
  const s = map[trigger] ?? map.schedule;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

// ─── Duration bar ─────────────────────────────────────────────────────────────
function DurBar({ run, maxDur }) {
  const pct   = Math.round((run.duration / Math.max(maxDur, 1)) * 100);
  const color = run.outcome === "success"
    ? run.duration > run.avgDur * 1.4 ? "#d97706" : "#16a34a"
    : "#dc2626";
  return (
    <div className="flex items-center gap-2">
      <div className="w-[100px] h-[6px] bg-[#f0f2f7] rounded-full overflow-hidden flex-shrink-0">
        <div style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: 3 }} />
      </div>
      <span className="font-mono text-[12px] text-[#1c1f2e]">{fmtDur(run.duration)}</span>
    </div>
  );
}

// ─── Drift cell ───────────────────────────────────────────────────────────────
function DriftCell({ drift, avgDur }) {
  if (Math.abs(drift) < avgDur * 0.05) {
    return <span className="text-[11px] text-[#6b7280]">~avg</span>;
  }
  const pct   = ((drift / avgDur) * 100).toFixed(0);
  const color = drift > 0
    ? (drift > avgDur * 0.4 ? "#dc2626" : "#d97706")
    : "#16a34a";
  return (
    <span className="font-mono text-[12px]" style={{ color }}>
      {drift > 0 ? "+" : ""}{pct}%
    </span>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * getJobHistoryColumns({ onView, onReplay, onIncident, maxDur })
 */
export function getJobHistoryColumns({ onView, onReplay, onIncident, maxDur = 1 } = {}) {
  return [
    // ── Run # ──────────────────────────────────────────────────────────────
    {
      id:       "num",
      Header:   "RUN #",
      accessor: "num",
      cell: (row) => (
        <span className="font-mono text-[12px] text-[#6b7280]">#{row.num}</span>
      ),
    },

    // ── Started ────────────────────────────────────────────────────────────
    {
      id:       "started",
      Header:   "STARTED",
      accessor: "started",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-[#6b7280]">
          {row.started?.toLocaleString("en-GB", {
            day: "2-digit", month: "short",
            hour: "2-digit", minute: "2-digit",
          })}
        </span>
      ),
    },

    // ── Outcome ────────────────────────────────────────────────────────────
    {
      id:       "outcome",
      Header:   "OUTCOME",
      accessor: "outcome",
      cell: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <OutcomeBadge outcome={row.outcome} />
          {row.anomaly && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
              ⚡ anomaly
            </span>
          )}
        </div>
      ),
    },

    // ── Duration ───────────────────────────────────────────────────────────
    {
      id:       "duration",
      Header:   "DURATION",
      accessor: "duration",
      cell: (row) => <DurBar run={row} maxDur={maxDur} />,
    },

    // ── vs Avg ─────────────────────────────────────────────────────────────
    {
      id:       "drift",
      Header:   "VS AVG",
      accessor: "drift",
      cell: (row) => <DriftCell drift={row.drift} avgDur={row.avgDur} />,
    },

    // ── Exit Code ──────────────────────────────────────────────────────────
    {
      id:       "exit",
      Header:   "EXIT CODE",
      accessor: "exit",
      cell: (row) => (
        <span
          className="font-mono text-[12px]"
          style={{
            color: row.exit === 0 ? "#16a34a" : row.exit === -1 ? "#6b7280" : "#dc2626",
          }}
        >
          {row.exit >= 0 ? row.exit : "N/A"}
        </span>
      ),
    },

    // ── Triggered By ───────────────────────────────────────────────────────
    {
      id:       "trigger",
      Header:   "TRIGGERED BY",
      accessor: "trigger",
      cell: (row) => <TriggerBadge trigger={row.trigger} />,
    },

    // ── Server ─────────────────────────────────────────────────────────────
    {
      id:       "server",
      Header:   "SERVER",
      accessor: "server",
      cell: (row) => (
        <span className="text-[12px] text-[#6b7280]">{row.server}</span>
      ),
    },

    // ── Actions ────────────────────────────────────────────────────────────
    {
      id:       "actions",
      Header:   "",
      accessor: "actions",
      width:    110,
      cell: (row) => (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            title="View logs"
            onClick={() => onView?.(row)}
            className="w-[26px] h-[26px] flex items-center justify-center rounded border border-[#e9ebf0] bg-white text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-blue-50 transition-colors flex-shrink-0"
          >
            <Search size={10} />
          </button>
          <button
            title="Replay run"
            onClick={() => onReplay?.(row)}
            className="w-[26px] h-[26px] flex items-center justify-center rounded border border-[#e9ebf0] bg-white text-[#6b7280] hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex-shrink-0"
          >
            <RefreshCw size={10} />
          </button>
          {row.outcome !== "success" && row.outcome !== "skipped" && (
            <button
              title="Open incident"
              onClick={() => onIncident?.(row)}
              className="w-[26px] h-[26px] flex items-center justify-center rounded border border-[#e9ebf0] bg-white text-[#6b7280] hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
            >
              <AlertTriangle size={10} />
            </button>
          )}
        </div>
      ),
    },
  ];
}