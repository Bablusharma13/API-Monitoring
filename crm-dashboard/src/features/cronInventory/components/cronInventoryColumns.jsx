// columns/cronInventoryColumns.jsx
// Column definitions for the Cron Inventory table.
// Follows the exact same pattern as cronhistorycolumns.jsx:
//   export function getCronInventoryColumns({ onEdit, onRunNow, onToggle, ... })

import { Play, Pencil } from "lucide-react";

// ─── Status config (mirrors STATUS_CFG in CronHeartbeatMonitor) ───────────────
const STATUS_CFG = {
  ok:     { bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200", dot: "#16a34a", label: "Healthy" },
  late:   { bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200",   dot: "#d97706", label: "Late"    },
  fail:   { bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200",     dot: "#dc2626", label: "Failed"  },
  paused: { bg: "bg-gray-100",    text: "text-gray-600",    border: "border-gray-200",    dot: "#6b7280", label: "Paused"  },
};

const ENV_CFG = {
  Production: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  Staging:    { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  Dev:        { bg: "bg-gray-100",  text: "text-gray-600",   border: "border-gray-200"   },
  "CI/CD":    { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Data:       { bg: "bg-cyan-50",   text: "text-cyan-700",   border: "border-cyan-200"   },
  Infra:      { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
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
  const segs   = 10;
  const filled = Math.round((pct / 100) * segs);
  const color  = pct >= 99 ? "#16a34a" : pct >= 95 ? "#d97706" : "#dc2626";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-[1.5px]">
        {Array.from({ length: segs }, (_, i) => (
          <div
            key={i}
            style={{ width: 5, height: 12, borderRadius: 2, background: i < filled ? color : "#f0f2f7" }}
          />
        ))}
      </div>
      <span className="font-mono text-[11.5px]" style={{ color }}>{pct.toFixed(1)}%</span>
    </div>
  );
}

// ─── Inline cron editor ───────────────────────────────────────────────────────
function CronCell({ row, onSave }) {
  return (
    <div className="flex flex-col gap-0.5">
      <input
        defaultValue={row.cron}
        onBlur={(e) => onSave?.(row.id, e.target.value)}
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
    <label
      className="relative w-[32px] h-[17px] cursor-pointer flex-shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className={`absolute inset-0 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-gray-200"}`} />
      <div className={`absolute top-[3px] w-3 h-3 bg-white rounded-full shadow transition-transform ${checked ? "left-[17px]" : "left-[2px]"}`} />
    </label>
  );
}

// ─── Main export — same signature as getCronHistoryColumns ────────────────────
/**
 * getCronInventoryColumns({ onEdit, onRunNow, onToggle, onSaveCron })
 *
 * Returns column definitions for NewTableConfig.
 */
export function getCronInventoryColumns({ onEdit, onRunNow, onToggle, onSaveCron } = {}) {
  return [
    // ── Task Name ──────────────────────────────────────────────────────────
    {
      id:       "name",
      Header:   "TASK NAME",
      accessor: "name",
      minWidth: 220,
      cell: (row) => (
        <div className="flex flex-col gap-0.5 max-w-[220px]">
          <span
            className="text-[12.5px] font-medium text-[#1c1f2e] truncate"
            title={row.name}
          >
            {row.name}
          </span>
          <span className="font-mono text-[10px] text-[#6b7280]">{row.id}</span>
        </div>
      ),
    },

    // ── Schedule ───────────────────────────────────────────────────────────
    {
      id:       "cron",
      Header:   "SCHEDULE",
      accessor: "cron",
      cell: (row) => (
        <CronCell row={row} onSave={onSaveCron} />
      ),
    },

    // ── Status ─────────────────────────────────────────────────────────────
    {
      id:       "status",
      Header:   "STATUS",
      accessor: "status",
      cell: (row) => {
        const s = STATUS_CFG[row.status] ?? STATUS_CFG.paused;
        return <Badge cfg={s} label={s.label} />;
      },
    },

    // ── Environment ────────────────────────────────────────────────────────
    {
      id:       "env",
      Header:   "ENVIRONMENT",
      accessor: "env",
      cell: (row) => {
        const cfg = ENV_CFG[row.env] ?? ENV_CFG.Dev;
        return <Badge cfg={cfg} label={row.env} />;
      },
    },

    // ── Category ───────────────────────────────────────────────────────────
    {
      id:       "category",
      Header:   "CATEGORY",
      accessor: "category",
      cell: (row) => (
        <span className="text-[12px] text-[#6b7280]">{row.category}</span>
      ),
    },

    // ── Last Run ───────────────────────────────────────────────────────────
    {
      id:       "lastRunSecs",
      Header:   "LAST RUN",
      accessor: "lastRunSecs",
      cell: (row) => {
        const s = row.lastRunSecs;
        const label =
          !s              ? "—" :
          s < 60          ? `${s}s ago` :
          s < 3600        ? `${Math.floor(s / 60)}m ago` :
          s < 86400       ? `${Math.floor(s / 3600)}h ago` :
                            `${Math.floor(s / 86400)}d ago`;
        return <span className="font-mono text-[11.5px] text-[#6b7280]">{label}</span>;
      },
    },

    // ── Next Run ───────────────────────────────────────────────────────────
    {
      id:       "nextRunSecs",
      Header:   "NEXT RUN",
      accessor: "nextRunSecs",
      cell: (row) => {
        const s = row.nextRunSecs;
        if (!s) return <span className="text-[#6b7280]">—</span>;
        const label =
          s < 60    ? `${s}s` :
          s < 3600  ? `${Math.floor(s / 60)}m` :
          s < 86400 ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m` :
                      `${Math.floor(s / 86400)}d`;
        const color = s < 60 ? "#16a34a" : "#1c1f2e";
        const bg    = s < 60 ? "#f0fdf4" : "#f8f9fc";
        const bd    = s < 60 ? "#bbf7d0" : "#e9ebf0";
        return (
          <span
            className="font-mono text-[11px] px-1.5 py-0.5 rounded"
            style={{ color, background: bg, border: `1px solid ${bd}` }}
          >
            {label}
          </span>
        );
      },
    },

    // ── Duration ───────────────────────────────────────────────────────────
    {
      id:       "durationSecs",
      Header:   "DURATION",
      accessor: "durationSecs",
      cell: (row) => {
        const s = row.durationSecs;
        const label =
          s < 60    ? `${s}s` :
          s < 3600  ? `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s` :
                      `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`;
        return <span className="font-mono text-[12px] text-[#1c1f2e]">{label}</span>;
      },
    },

    // ── 30d Uptime ─────────────────────────────────────────────────────────
    {
      id:       "uptime30",
      Header:   "30D UPTIME",
      accessor: "uptime30",
      cell: (row) => <UptimeBar pct={row.uptime30} />,
    },

    // ── Owner ──────────────────────────────────────────────────────────────
    {
      id:       "owner",
      Header:   "OWNER",
      accessor: "owner",
      cell: (row) => <span className="text-[12px] text-[#6b7280]">{row.owner}</span>,
    },

    // ── Tags ───────────────────────────────────────────────────────────────
    {
      id:       "tags",
      Header:   "TAGS",
      accessor: "tags",
      cell: (row) => (
        <div className="flex gap-1.5 flex-nowrap">
          {(row.tags || []).slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f0f2f7] text-[#6b7280] whitespace-nowrap"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },

    // ── Actions ────────────────────────────────────────────────────────────
    // NOTE: id must NOT be "actions" — NewTableConfig's normaliseColumns()
    // silently drops any incoming column with that id (it reserves "actions"
    // for its own generic RowActions column, which we don't use here).
    {
      id:       "rowActions",
      Header:   "ACTIONS",
      accessor: "rowActions",
      width:    110,
      cell: (row) => (
        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Run now */}
          <button
            title="Run now"
            onClick={() => onRunNow?.(row.id)}
            className="w-[26px] h-[26px] flex items-center justify-center rounded border border-[#e9ebf0] bg-white text-[#6b7280] hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex-shrink-0"
          >
            <Play size={10} />
          </button>

          {/* Edit */}
          <button
            title="Edit task"
            onClick={() => onEdit?.(row)}
            className="w-[26px] h-[26px] flex items-center justify-center rounded border border-[#e9ebf0] bg-white text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-blue-50 transition-colors flex-shrink-0"
          >
            <Pencil size={10} />
          </button>

          {/* Enable / disable toggle */}
          <Toggle
            checked={row.enabled}
            onChange={(checked) => onToggle?.(row.id, checked)}
          />
        </div>
      ),
    },
  ];
}