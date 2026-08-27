// columns/cronInventoryColumns.jsx
// Column definitions for the Cron Inventory table — fed real CronJob rows
// (see toInventoryRow in ../hooks/usecronInventory.js), not seed data.
// Same factory-with-handlers pattern as the sibling cron column files
// (cronhistorycolumns.jsx / jobHistoryColumns.jsx):
//   export function getCronInventoryColumns({ onRunNow, onToggle, onSaveCron })

import { Play } from "lucide-react";
import { formatDuration } from "../../../utils/helpers.js";

// Real CronJob.status enum, mapped to short keys by toInventoryRow().
const STATUS_CFG = {
  ok: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "#16a34a", label: "On Time" },
  late: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "#d97706", label: "Late" },
  missing: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "#dc2626", label: "Missing" },
  paused: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200", dot: "#6b7280", label: "Paused" },
  pending: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "#2563eb", label: "Pending" },
};

// ─── Tiny badge ───────────────────────────────────────────────────────────────
function Badge({ cfg, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />}
      {label}
    </span>
  );
}

// ─── Uptime bar ───────────────────────────────────────────────────────────────
function UptimeBar({ pct }) {
  const segs = 10;
  const filled = Math.round((pct / 100) * segs);
  const color = pct >= 99 ? "#16a34a" : pct >= 95 ? "#d97706" : "#dc2626";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-[1.5px]">
        {Array.from({ length: segs }, (_, i) => (
          <div key={i} style={{ width: 5, height: 12, borderRadius: 2, background: i < filled ? color : "#f0f2f7" }} />
        ))}
      </div>
      <span className="font-mono text-[11.5px]" style={{ color }}>{pct.toFixed(1)}%</span>
    </div>
  );
}

// ─── Inline cron editor — now wired to the real update mutation ───────────────
function CronCell({ row, onSave }) {
  return (
    <div className="flex flex-col gap-0.5">
      <input
        defaultValue={row.cron}
        onBlur={(e) => {
          const val = e.target.value.trim();
          if (val && val !== row.cron) onSave?.(row.id, val);
        }}
        onClick={(e) => e.stopPropagation()}
        title="Click to edit schedule"
        className="font-mono text-[11.5px] text-[#6b7280] bg-transparent border-none outline-none cursor-pointer w-full focus:bg-[#f4f6fa] focus:border focus:border-[#2563eb] focus:rounded focus:px-1 focus:py-0.5 focus:text-[#1c1f2e] transition-all"
      />
      <span className="text-[10px] text-[#6b7280]">{row.cronHuman}</span>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <label className="relative w-[32px] h-[17px] cursor-pointer flex-shrink-0" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className={`absolute inset-0 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-gray-200"}`} />
      <div className={`absolute top-[3px] w-3 h-3 bg-white rounded-full shadow transition-transform ${checked ? "left-[17px]" : "left-[2px]"}`} />
    </label>
  );
}

// ─── Main export ────────────────────────────────────────────────────────────
// NOTE: NewTableConfig's normaliseColumns() resolves each column's final id
// as `accessor || id`, and that resolved id is exactly what's sent back as
// `sortBy` for server-side sorting — so sortable columns set `accessor` to
// the real CronJob/Mongo field path ("lastDuration", "stats.uptime30d"),
// even though `cell()` reads the differently-named mapped row field
// (lastDurationMs/uptime30). Also: a raw column `id` of literally "actions"
// is silently dropped by normaliseColumns, hence "rowActions" below.
export function getCronInventoryColumns({ onRunNow, onToggle, onSaveCron } = {}) {
  return [
    {
      id: "name",
      Header: "TASK NAME",
      accessor: "name",
      group: "Identity",
      minWidth: 220,
      cell: (row) => (
        <div className="flex flex-col gap-0.5 max-w-[220px]">
          <span className="text-[12.5px] font-medium text-[#1c1f2e] truncate" title={row.name}>{row.name}</span>
          <span className="font-mono text-[10px] text-[#6b7280]">{row.id}</span>
        </div>
      ),
    },
    {
      id: "cronExpression",
      Header: "SCHEDULE",
      accessor: "cron",
      group: "Schedule",
      disableSortBy: true,
      cell: (row) => <CronCell row={row} onSave={onSaveCron} />,
    },
    {
      id: "status",
      Header: "STATUS",
      accessor: "status",
      group: "Schedule",
      cell: (row) => {
        const s = STATUS_CFG[row.status] ?? STATUS_CFG.paused;
        return <Badge cfg={s} label={s.label} />;
      },
    },
    {
      id: "env",
      Header: "ENVIRONMENT",
      accessor: "env",
      group: "Identity",
      cell: (row) =>
        row.env ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border bg-blue-50 text-blue-700 border-blue-200">{row.env}</span>
        ) : (
          <span className="text-[#c2c8d4]">—</span>
        ),
    },
    {
      id: "category",
      Header: "CATEGORY",
      accessor: "category",
      group: "Identity",
      cell: (row) => <span className="text-[12px] text-[#6b7280]">{row.category || "—"}</span>,
    },
    {
      id: "lastPingAt",
      Header: "LAST RUN",
      accessor: "lastRunLabel",
      group: "Health",
      disableSortBy: true,
      cell: (row) => <span className="font-mono text-[11.5px] text-[#6b7280]">{row.lastRunLabel}</span>,
    },
    {
      id: "nextExpectedAt",
      Header: "NEXT RUN",
      accessor: "nextRunLabel",
      group: "Health",
      disableSortBy: true,
      cell: (row) => {
        const overdue = row.nextRunLabel.startsWith("Overdue") || row.nextRunLabel.startsWith("Missing");
        return (
          <span
            className="font-mono text-[11px] px-1.5 py-0.5 rounded"
            style={{
              color: overdue ? "#dc2626" : "#1c1f2e",
              background: overdue ? "#fef2f2" : "#f8f9fc",
              border: `1px solid ${overdue ? "#fecaca" : "#e9ebf0"}`,
            }}
          >
            {row.nextRunLabel}
          </span>
        );
      },
    },
    {
      id: "lastDuration",
      Header: "DURATION",
      accessor: "lastDuration",
      group: "Health",
      cell: (row) => <span className="font-mono text-[12px] text-[#1c1f2e]">{formatDuration(row.lastDurationMs)}</span>,
    },
    {
      id: "uptime30d",
      Header: "30D UPTIME",
      accessor: "stats.uptime30d",
      group: "Health",
      cell: (row) => <UptimeBar pct={row.uptime30} />,
    },
    {
      id: "owner",
      Header: "OWNER",
      accessor: "owner",
      group: "Identity",
      disableSortBy: true,
      cell: (row) => <span className="text-[12px] text-[#6b7280]">{row.owner || "—"}</span>,
    },
    {
      id: "rowActions",
      Header: "ACTIONS",
      accessor: "rowActions",
      width: 84,
      disableSortBy: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            title="Run now"
            onClick={() => onRunNow?.(row.id)}
            className="w-[26px] h-[26px] flex items-center justify-center rounded border border-[#e9ebf0] bg-white text-[#6b7280] hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex-shrink-0"
          >
            <Play size={10} />
          </button>
          <Toggle checked={row.enabled} onChange={(checked) => onToggle?.(row.id, checked)} />
        </div>
      ),
    },
  ];
}
