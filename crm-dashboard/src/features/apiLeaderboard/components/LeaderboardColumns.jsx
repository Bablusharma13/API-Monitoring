// columns/LeaderboardColumns.jsx
// Column definitions for the API Leaderboard full ranking table
// Mirrors the HTML reference (apileaderboard.html) column structure exactly
// • Rank column is provided here (not from NewTableConfig index) to render medal bubbles
// • Actions as last column — 3-dot MoreVertical dropdown (same pattern as other tables)

import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Eye,
  AlertTriangle,
  RefreshCw,
  Bell,
  Copy,
} from "lucide-react";
import { Link } from "react-router-dom";

// ── Actions dropdown (3-dot menu — same pattern used across all other tables) ─
function ActionsDropdown({ row, onView, onAlert, onRestart, onIncident }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = [
    { icon: <Eye size={12} />, label: "View Details", fn: onView },
    {
      icon: <AlertTriangle size={12} />,
      label: "Open Incident",
      fn: onIncident,
    },
    { icon: <RefreshCw size={12} />, label: "Restart Check", fn: onRestart },
    { icon: <Bell size={12} />, label: "Send Alert", fn: onAlert },
    {
      icon: <Copy size={12} />,
      label: "Copy API Name",
      fn: () => navigator.clipboard?.writeText(row.name),
    },
  ];

  return (
    <div
      ref={ref}
      className="relative flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center w-6 h-6 rounded border border-[#e9ebf0] bg-white text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-[#eff4ff] transition-colors cursor-pointer"
      >
        <MoreVertical size={12} />
      </button>

      {open && (
        <div className="absolute right-0 top-7 z-[999] w-[168px] bg-white border border-[#e9ebf0] rounded-xl shadow-lg py-1 overflow-hidden">
          {items.map(({ icon, label, fn }) => (
            <button
              key={label}
              onClick={() => {
                fn?.(row);
                setOpen(false);
              }}
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

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const MAP = {
    active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      label: "Active",
    },
    down: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
      label: "Down",
    },
    warning: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
      label: "Warning",
    },
    maintenance: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-200",
      dot: "bg-gray-400",
      label: "Maintenance",
    },
  };
  const s = MAP[status?.toLowerCase()] ?? MAP.active;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full text-[13px]  ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ── Score bar ────────────────────────────────────────────────────────────────
function ScoreBar({ score }) {
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#d97706" : "#dc2626";
  const textColor =
    score >= 80
      ? "text-emerald-600"
      : score >= 60
        ? "text-amber-600"
        : "text-red-600";
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <span
        className={`text-[13px]  w-7 flex-shrink-0 ${textColor}`}
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {score}
      </span>
      <div className="flex-1 h-[5px] bg-[#f0f2f7] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ── Risk bar ─────────────────────────────────────────────────────────────────
function RiskBar({ risk }) {
  const color = risk >= 70 ? "#dc2626" : risk >= 40 ? "#d97706" : "#16a34a";
  const textColor =
    risk >= 70
      ? "text-red-600"
      : risk >= 40
        ? "text-amber-600"
        : "text-emerald-600";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <span className={`text-[13px] w-6 flex-shrink-0 ${textColor}`}>
        {risk}
      </span>
      <div className="flex-1 h-[4px] bg-[#f0f2f7] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${risk}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ── Rank bubble ──────────────────────────────────────────────────────────────
function RankBubble({ rank }) {
  const cls =
    rank === 1
      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_2px_6px_rgba(245,158,11,0.35)]"
      : rank === 2
        ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
        : rank === 3
          ? "bg-gradient-to-br from-amber-600 to-amber-900 text-white"
          : "bg-[#f3f4f6] text-[#6b7280]";
  return (
    <div
      className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-semibold flex-shrink-0 ${cls}`}
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {rank}
    </div>
  );
}

// ── Mini badges inline under API name ────────────────────────────────────────
const BADGE_DEF = {
  "Most Stable": { bg: "bg-emerald-50", text: "text-emerald-700", icon: "🏆" },
  Fastest: { bg: "bg-blue-50", text: "text-blue-700", icon: "⚡" },
  Critical: { bg: "bg-red-50", text: "text-red-600", icon: "🔴" },
  Rising: { bg: "bg-purple-50", text: "text-purple-700", icon: "📈" },
  Streak: { bg: "bg-amber-50", text: "text-amber-700", icon: "🔥" },
};

function ApiBadges({ badges = [] }) {
  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {badges.map((b) => {
        const s = BADGE_DEF[b] ?? {
          bg: "bg-gray-100",
          text: "text-gray-500",
          icon: "",
        };
        return (
          <span
            key={b}
            className={`inline-flex items-center gap-0.5 px-1.5 py-px rounded text-[10.5px] font-medium ${s.bg} ${s.text}`}
          >
            {s.icon} {b}
          </span>
        );
      })}
    </div>
  );
}

// ── Trend cell ───────────────────────────────────────────────────────────────
function TrendCell({ trend }) {
  if (trend === 0)
    return <span className="text-[13px] text-[#6b7280]">→ 0%</span>;
  const isUp = trend > 0;
  return (
    <span
      className={`flex items-center gap-1 text-[13px]  ${isUp ? "text-emerald-600" : "text-red-600"}`}
    >
      {isUp ? "↑" : "↓"} {isUp ? "+" : ""}
      {trend.toFixed(1)}%
    </span>
  );
}

// ── Streak cell ──────────────────────────────────────────────────────────────
function StreakCell({ streak }) {
  if (!streak) return <span className="text-[11px] text-[#6b7280]">—</span>;
  return (
    <span className="inline-flex items-center gap-1 text-[13px]  text-emerald-700  rounded-full">
      🔥 {streak}d
    </span>
  );
}

// ── Category badge ────────────────────────────────────────────────────────────
function CatBadge({ cat }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[13px] ">
      {cat}
    </span>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export const getLeaderboardColumns = ({
  onView,
  onAlert,
  onRestart,
  onIncident,
} = {}) => [
  {
    accessor: "rank",
    header: "Rank",
    group: "Identity",
    cell: (row) => <RankBubble rank={row.rank} />,
  },
  {
    accessor: "name",
    header: "API Name",
    group: "Identity",
    cell: (row) => (
      <Link
        to={`/dashboard/apis/${row.id}`}
        className="min-w-[140px] text-blue-500"
      >
        <span className="text-[13px] ">{row.name}</span>
        <ApiBadges badges={row.badges ?? []} />
      </Link>
    ),
  },
  {
    accessor: "status",
    header: "Status",
    group: "Identity",
    cell: (row) => <StatusBadge status={row.status ?? "active"} />,
  },
  {
    accessor: "score",
    header: "Score",
    group: "Performance",
    cell: (row) => <ScoreBar score={row.score ?? 0} />,
  },
  {
    accessor: "uptime",
    header: "Uptime",
    group: "Performance",
    cell: (row) => {
      const val =
        typeof row.uptime === "number" ? row.uptime : parseFloat(row.uptime);
      const color =
        val >= 99.5
          ? "text-emerald-600"
          : val >= 97
            ? "text-amber-600"
            : "text-red-600";
      return <span className={`text-[13px]  ${color}`}>{val}%</span>;
    },
  },
  {
    accessor: "resp",
    header: "Avg Resp",
    group: "Performance",
    cell: (row) => {
      if (!row.resp)
        return <span className="text-[13px] text-red-600">Down</span>;
      const color =
        row.resp > 1000
          ? "text-red-600"
          : row.resp > 500
            ? "text-amber-600"
            : "text-[#1c1f2e]";
      return <span className={`text-[13px] ${color}`}>{row.resp}ms</span>;
    },
  },
  {
    accessor: "downtime",
    header: "Downtime",
    group: "Performance",
    cell: (row) => (
      <span
        className="text-[12px] text-[#6b7280]"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {row.downtime ?? "0 min"}
      </span>
    ),
  },
  {
    accessor: "inc",
    header: "Incidents",
    group: "Reliability",
    cell: (row) => {
      const color =
        row.inc > 5
          ? "text-red-600"
          : row.inc > 2
            ? "text-amber-600"
            : "text-[#1c1f2e]";
      return <span className={`text-[13px]  ${color}`}>{row.inc}</span>;
    },
  },
  {
    accessor: "risk",
    header: "Risk",
    group: "Reliability",
    cell: (row) => <RiskBar risk={row.risk ?? 0} />,
  },
  {
    accessor: "trend",
    header: "Trend",
    group: "Trends",
    cell: (row) => <TrendCell trend={row.trend ?? 0} />,
  },
  {
    accessor: "streak",
    header: "Streak",
    group: "Trends",
    cell: (row) => <StreakCell streak={row.streak} />,
  },
  {
    accessor: "cat",
    header: "Category",
    group: "Meta",
    cell: (row) => <CatBadge cat={row.cat ?? "—"} />,
  },
  {
    accessor: "owner",
    header: "Owner",
    group: "Meta",
    cell: (row) => <span className="text-[13px] ">{row.owner ?? "—"}</span>,
  },
];
