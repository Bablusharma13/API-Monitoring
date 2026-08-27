// jobHistoryColumns.jsx
// Column definitions for the Job History "Individual Runs" table — fed real
// Ping records (see toRunRow in ../hooks/useJobHistory.js).
//
// Dropped vs. the old mock, because nothing on the Ping model backs them:
//   - "Server" column        → Ping has no server/worker field
//   - "Exit Code" column     → Ping has no exit-code field
//   - Replay / Incident row actions → no replay or incident-from-ping
//     endpoint exists; a per-row "Run Now" would actually just re-trigger the
//     job on its normal schedule, not replay that specific historical run,
//     so it's left off rather than mislabeled.
// Kept because Ping genuinely has these fields:
//   - "Triggered By" ← Ping.type (scheduled / manual / retry)
//   - "Retries"       ← Ping.retries (shown in the expanded detail panel)

import { formatDuration } from "../../../utils/helpers.js";

// ─── Outcome badge — real Ping.status enum: running/success/failed/timeout/late ──
export function OutcomeBadge({ outcome }) {
  const map = {
    success: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "#16a34a", label: "Success" },
    late: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "#d97706", label: "Late" },
    failed: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "#dc2626", label: "Failed" },
    timeout: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "#dc2626", label: "Timeout" },
    running: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "#2563eb", label: "Running" },
  };
  const s = map[outcome] ?? map.running;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${s.bg} ${s.text} ${s.border}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

// ─── Trigger badge — real Ping.type ────────────────────────────────────────────
function TriggerBadge({ trigger }) {
  const map = {
    manual: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Manual" },
    retry: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Retry" },
    scheduled: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", label: "Scheduled" },
  };
  const s = map[trigger] ?? map.scheduled;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

// ─── Duration bar ─────────────────────────────────────────────────────────────
function DurBar({ run, maxDurationMs }) {
  const pct = Math.round((run.durationMs / Math.max(maxDurationMs, 1)) * 100);
  const color = run.outcome === "success" || run.outcome === "late" ? "#16a34a" : "#dc2626";
  return (
    <div className="flex items-center gap-2">
      <div className="w-[100px] h-[6px] bg-[#f0f2f7] rounded-full overflow-hidden flex-shrink-0">
        <div style={{ width: `${Math.min(pct, 100)}%`, background: color, height: "100%", borderRadius: 3 }} />
      </div>
      <span className="font-mono text-[12px] text-[#1c1f2e]">{formatDuration(run.durationMs)}</span>
    </div>
  );
}

// ─── Drift vs. the job's real average (stats.avgDurationMs) ───────────────────
function DriftCell({ durationMs, avgDurationMs }) {
  if (!avgDurationMs) return <span className="text-[11px] text-[#6b7280]">—</span>;
  const drift = durationMs - avgDurationMs;
  if (Math.abs(drift) < avgDurationMs * 0.05) {
    return <span className="text-[11px] text-[#6b7280]">~avg</span>;
  }
  const pct = ((drift / avgDurationMs) * 100).toFixed(0);
  const color = drift > 0 ? (drift > avgDurationMs * 0.4 ? "#dc2626" : "#d97706") : "#16a34a";
  return (
    <span className="font-mono text-[12px]" style={{ color }}>
      {drift > 0 ? "+" : ""}{pct}%
    </span>
  );
}

/**
 * getJobHistoryColumns({ onView, avgDurationMs, maxDurationMs })
 *
 * NOTE: NewTableConfig's normaliseColumns() resolves each column's final id
 * as `accessor || id`, and that resolved id is exactly what's sent back as
 * `sortBy` on server-side sort. So sortable columns below deliberately set
 * `accessor` to the real Ping/Mongo field name (startedAt/status/duration/
 * type), even though each `cell()` reads its own differently-named mapped
 * row field (started/outcome/durationMs/trigger) — the column identity and
 * the row-rendering are independent here. Also: a raw column `id` of
 * literally "actions" is silently dropped by normaliseColumns, so the row
 * actions column below is "rowActions" instead.
 */
export function getJobHistoryColumns({ onView, avgDurationMs = 0, maxDurationMs = 1 } = {}) {
  return [
    {
      id: "runId",
      Header: "RUN ID",
      accessor: "runId",
      disableSortBy: true,
      cell: (row) => <span className="font-mono text-[11.5px] text-[#2563eb]">{row.runId}</span>,
    },
    {
      id: "startedAt",
      Header: "STARTED",
      accessor: "startedAt",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-[#6b7280]">
          {row.started ? row.started.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
        </span>
      ),
    },
    {
      id: "status",
      Header: "OUTCOME",
      accessor: "status",
      cell: (row) => <OutcomeBadge outcome={row.outcome} />,
    },
    {
      id: "duration",
      Header: "DURATION",
      accessor: "duration",
      cell: (row) => <DurBar run={row} maxDurationMs={maxDurationMs} />,
    },
    {
      id: "vsAvg",
      Header: "VS AVG",
      accessor: "vsAvg",
      disableSortBy: true,
      cell: (row) => <DriftCell durationMs={row.durationMs} avgDurationMs={avgDurationMs} />,
    },
    {
      id: "type",
      Header: "TRIGGERED BY",
      accessor: "type",
      cell: (row) => <TriggerBadge trigger={row.trigger} />,
    },
    {
      id: "rowActions",
      Header: "",
      accessor: "rowActions",
      width: 60,
      disableSortBy: true,
      cell: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            title="View details"
            onClick={() => onView?.(row)}
            className="w-[26px] h-[26px] flex items-center justify-center rounded border border-[#e9ebf0] bg-white text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-blue-50 transition-colors flex-shrink-0"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      ),
    },
  ];
}
