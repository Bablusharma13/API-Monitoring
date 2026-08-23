import { useState, useMemo, useEffect } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import {
  CrossIcon,
  EditIcon,
  ExportIcon,
  RefreshIcon,
} from "../components/ui/Icons";
import { Link, useParams } from "react-router-dom";
import { useGetTenantEmployeeDetailsQuery } from "../features/tenants/hooks/query/useGetTenantEmployeeDetailsQuery";
import { useGetTenantEmployeeMatricsQuery } from "../features/tenants/hooks/query/useGetTenantEmployeeMatrics";

const TIMELINE = [
  {
    icon: "traffic",
    bg: "bg-blue-50",
    color: "text-blue-600",
    title: "Session started",
    sub: "IP 10.0.1.42 · Chrome / macOS",
    time: "2m ago",
  },
  {
    icon: "export",
    bg: "bg-green-50",
    color: "text-green-600",
    title: "Bulk export triggered",
    sub: "1,240 contacts exported · CSV",
    time: "38m ago",
  },
  {
    icon: "role",
    bg: "bg-purple-50",
    color: "text-purple-700",
    title: "Role updated to Admin",
    sub: "Changed from Developer by Arjun K.",
    time: "2d ago",
  },
  {
    icon: "warning",
    bg: "bg-amber-50",
    color: "text-amber-600",
    title: "Rate limit warning",
    sub: "88 rps · approaching 120 cap",
    time: "3d ago",
  },
  //   {
  //     icon: "key",
  //     bg: "bg-green-50",
  //     color: "text-green-600",
  //     title: "API key rotated",
  //     sub: "Key ending ···x4f2 regenerated",
  //     time: "5d ago",
  //   },
  {
    icon: "check",
    bg: "bg-green-50",
    color: "text-green-600",
    title: "User account created",
    sub: "Invited by admin · Mar 2023",
    time: "1y ago",
  },
];

const METHOD_STYLE = {
  GET: { bg: "bg-blue-50", text: "text-blue-700" },
  POST: { bg: "bg-green-50", text: "text-green-700" },
  PUT: { bg: "bg-amber-50", text: "text-amber-700" },
  PATCH: { bg: "bg-purple-50", text: "text-purple-700" },
  DELETE: { bg: "bg-red-50", text: "text-red-700" },
  DEL: { bg: "bg-red-50", text: "text-red-700" },
};

const LOG_GROUPS = {
  Request: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Status: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Meta: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// ── SEEDED RNG ────────────────────────────────────────────────────────────────
function seededRnd(seed, min, max) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.round((x - Math.floor(x)) * (max - min) + min);
}

function smooth(arr) {
  return arr.map((v, i) => {
    const s = arr.slice(Math.max(0, i - 2), i + 3);
    return Math.round(s.reduce((a, b) => a + b, 0) / s.length);
  });
}

// ── CALLS CHART (SVG) ─────────────────────────────────────────────────────────
function CallsChart() {
  const w = 680,
    h = 180,
    padL = 40,
    padR = 50,
    padT = 8,
    padB = 24;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const pts = 24;

  const rawCalls = Array.from({ length: pts }, (_, i) =>
    i < 7
      ? seededRnd(i * 7, 0, 40)
      : i < 10
        ? seededRnd(i * 7, 80, 180)
        : i < 18
          ? seededRnd(i * 7, 200, 380)
          : seededRnd(i * 7, 50, 140),
  );
  const calls = smooth(rawCalls);
  const lat = smooth(
    calls.map((v) =>
      v < 10 ? 0 : Math.round(70 + (v / 380) * 40 + seededRnd(v, -8, 8)),
    ),
  );

  const maxCalls = Math.max(...calls);
  const maxLat = Math.max(...lat);

  const toX = (i) => padL + (i / (pts - 1)) * chartW;
  const toCY = (v) => padT + chartH - (v / maxCalls) * chartH;
  const toLY = (v) => padT + chartH - (v / (maxLat || 1)) * chartH;

  const latPath = lat
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toLY(v).toFixed(1)}`,
    )
    .join(" ");
  const xTicks = [0, 6, 12, 18, 23];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 170 }}>
      {[0, 100, 200, 300].map((t) => {
        const y = toCY(t);
        return (
          <line
            key={t}
            x1={padL}
            y1={y}
            x2={padL + chartW}
            y2={y}
            stroke="#f0f2f7"
            strokeWidth="1"
          />
        );
      })}
      {calls.map((v, i) => {
        const bw = Math.max(2, chartW / pts - 3);
        const x = toX(i) - bw / 2;
        const barH = (v / maxCalls) * chartH;
        return (
          <rect
            key={i}
            x={x}
            y={toCY(v)}
            width={bw}
            height={barH}
            fill="#2563eb22"
            rx="2"
          />
        );
      })}
      <path d={latPath} stroke="#d97706" strokeWidth="2" fill="none" />
      {/* Y axis labels */}
      {[0, 100, 200, 300].map((t) => (
        <text
          key={t}
          x={padL - 4}
          y={toCY(t) + 4}
          textAnchor="end"
          fill="#9ca3af"
          fontSize="10"
          fontFamily="DM Mono, monospace"
        >
          {t}
        </text>
      ))}
      {/* Right axis for latency */}
      {[0, 50, 100, 150].map((t) => {
        const y = toLY(t);
        return (
          <text
            key={t}
            x={padL + chartW + 4}
            y={y + 4}
            textAnchor="start"
            fill="#d97706"
            fontSize="10"
            fontFamily="DM Mono, monospace"
            opacity="0.7"
          >
            {t}ms
          </text>
        );
      })}
      {xTicks.map((i) => (
        <text
          key={i}
          x={toX(i)}
          y={padT + chartH + 16}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="10"
          fontFamily="DM Mono, monospace"
        >
          {i.toString().padStart(2, "0")}:00
        </text>
      ))}
    </svg>
  );
}

// ── TIMELINE ICONS ────────────────────────────────────────────────────────────
const TL_ICONS = {
  traffic: (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  export: (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    </svg>
  ),
  role: (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  ),
  warning: (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
    </svg>
  ),
  key: (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  check: (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function UserDetail() {
  const [chartRange, setChartRange] = useState("24h");
  const [epPageIndex, setEpPageIndex] = useState(0);
  const [epPageLimit, setEpPageLimit] = useState(10);
  const [epSearchInput, setEpSearchInput] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);

  useEffect(() => {
    setEpPageIndex(0);
  }, [epSearchInput, sortField, sortType]);

  const { tenantId, employeeId } = useParams();
  const { data: employeeData } = useGetTenantEmployeeDetailsQuery(
    tenantId,
    employeeId,
  );
  const { data: employeeMatrics, isLoading: isLoadingEmployeeMatrics } =
    useGetTenantEmployeeMatricsQuery(
      tenantId,
      employeeId,
      epPageIndex,
      epPageLimit,
      epSearchInput || undefined,
      sortField || undefined,
      sortType || undefined,
    );

  const summary = employeeMatrics?.summary;

  console.log("summary", summary);

  const IDENTITY_BAR = [
    { label: "User ID", value: employeeId, mono: true },
    { label: "Tenant", value: employeeData?.tenant?.company, mono: false },
    {
      label: "Member since",
      value: employeeData?.employee?.created_at?.slice(0, 10),
      mono: true,
    },
    {
      label: "API Calls",
      value: summary?.totalApiCalls?.toLocaleString() || "0",
      outfit: true,
    },
    {
      label: "Avg latency",
      value: `${summary?.avgLatency || 0}ms`,
      color: "text-green-600",
    },
    {
      label: "Error rate",
      value: `${summary?.errorRate || 0}%`,
      color: summary?.errorRate > 5 ? "text-red-600" : "text-gray-400",
    },
  ];

  const RangeBtns = ({ options, active, onChange }) => (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1 text-[12px] border-r last:border-r-0 border-gray-200 transition-colors ${active === opt ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  const stats = useMemo(() => {
    if (!summary) return [];
    return [
      {
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563eb"
            strokeWidth="1.8"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        ),
        count: summary.totalApiCalls?.toLocaleString() || "0",
        countColor: "text-blue-600",
        title: "API Calls",
        badgeText: `${summary.successCount || 0} success`,
        badgeBg: "bg-blue-50",
        badgeTextColor: "text-blue-600",
      },
      {
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="1.8"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
        count: `${summary.avgLatency || 0}ms`,
        countColor:
          summary.avgLatency > 200 ? "text-amber-600" : "text-green-600",
        title: "Avg Latency",
        badgeBg: summary.errorCount > 0 ? "bg-red-50" : "bg-green-50",
        badgeTextColor:
          summary.errorCount > 0 ? "text-red-600" : "text-green-600",
      },
      {
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ),
        count: `${summary.errorRate || 0}%`,
        countColor:
          summary.errorRate > 5
            ? "text-red-600"
            : summary.errorRate > 1
              ? "text-amber-600"
              : "text-gray-600",
        title: "Error Rate",
        badgeText: `${summary.errorCount || 0} failed`,
        badgeBg: summary.errorCount > 0 ? "bg-red-50" : "bg-gray-50",
        badgeTextColor:
          summary.errorCount > 0 ? "text-red-600" : "text-gray-600",
      },
      {
        icon: (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        count: `${summary.successCount || 0}`,
        countColor: "text-green-600",
        title: "Successful Calls",
        badgeText: `${((summary.successCount / (summary.totalApiCalls || 1)) * 100).toFixed(1)}% rate`,
        badgeBg: "bg-green-50",
        badgeTextColor: "text-green-600",
      },
    ];
  }, [summary]);

  const logCols = [
    {
      id: "method",
      name: "Method",
      width: 80,
      group: "Request",
      cell: (row) => {
        const s = METHOD_STYLE[row.method] || {
          bg: "bg-gray-100",
          text: "text-gray-600",
        };
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded font-mono text-[11px] font-medium ${s.bg} ${s.text}`}
          >
            {row.method}
          </span>
        );
      },
    },
    {
      id: "endpoint",
      name: "Endpoint",
      width: 250,
      group: "Request",
      cell: (row) => (
        <Link
          to={`/dashboard/endpoint-explorer/endpoint-detail?endpoint=${row.endpoint}&method=${row.method}`}
          className="font-mono text-[12px] text-blue-500"
        >
          {row.endpoint}
        </Link>
      ),
    },
    {
      id: "statusCode",
      name: "Status",
      width: 70,
      group: "Status",
      cell: (row) => {
        const isErr = row.statusCode >= 400;
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded font-mono text-[11px] font-medium ${isErr ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
          >
            {row.statusCode}
          </span>
        );
      },
    },
    {
      id: "latency",
      name: "Latency",
      width: 80,
      group: "Status",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.latency > 200 ? "text-amber-600" : "text-gray-700"}`}
        >
          {row.latency}ms
        </span>
      ),
    },
    {
      id: "ip",
      name: "IP",
      width: 140,
      group: "Meta",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-gray-400">{row.ip}</span>
      ),
    },
    {
      id: "recordedAt",
      name: "Time",
      width: 170,
      group: "Meta",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-gray-400">
          {new Date(row.recordedAt).toLocaleString()}
        </span>
      ),
    },
  ];

  const logs = employeeMatrics?.logs || [];
  const pagination = employeeMatrics?.pagination;

  if (!employeeData) return null;

  return (
    <div className="container-page">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-medium text-white flex-shrink-0">
            {employeeData?.employee?.image_url ? (
              <img
                src={employeeData?.employee?.image_url}
                width={40}
                height={40}
                alt="profile"
                className="rounded-full"
              />
            ) : (
              <p
                className="h-11 w-11 rounded-full flex items-center justify-center text-[15px] font-medium"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #2563eb)",
                }}
              >
                {employeeData?.employee?.name.slice(0, 1)}
              </p>
            )}
          </div>
          <div>
            <div
              className="flex items-center gap-2.5 mb-1"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <h1 className="text-[24px] text-gray-800 font-light leading-none">
                {employeeData?.employee?.name}
              </h1>
              <Badge value="Online" variant="active" />
            </div>
            <div className="flex items-center gap-2">
              <Badge value={employeeData?.tenant?.company} variant="beta" />
              <span className="text-[11px] text-gray-400">
                {employeeData?.employee?.email}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton action="refresh" label="Refresh" icon={RefreshIcon} />
          <ActionButton action="export" label="Export -CS-" icon={ExportIcon} />
          <ActionButton action="export" label="Edit -CS-" icon={EditIcon} />
          <ActionButton action="delete" label="Suspend -CS-" icon={CrossIcon} />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Identity Bar */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex flex-wrap">
            {IDENTITY_BAR.map((item, i) => (
              <div
                key={i}
                className="px-5 py-1.5 border-r border-gray-200 last:border-r-0 flex flex-col justify-center min-w-[120px]"
              >
                <div className="text-[11px] text-gray-400 mb-1">
                  {item.label}
                </div>
                {item.badge ? (
                  <Badge value="Admin" variant="category" />
                ) : (
                  <div
                    className={`${item.mono ? "font-mono text-[12.5px]" : item.outfit ? "text-[16px]" : "text-[13px]"} ${item.color || "text-gray-800"}`}
                    style={
                      item.outfit
                        ? { fontFamily: "'Outfit', sans-serif" }
                        : undefined
                    }
                  >
                    {item.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StatCard
              key={i}
              icon={s.icon}
              count={s.count}
              countColor={s.countColor}
              title={s.title}
              badgeText={s.badgeText}
              badgeBg={s.badgeBg}
              badgeTextColor={s.badgeTextColor}
            />
          ))}
        </div>

        {/* Calls Chart + Quota */}
        <div
          className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4"
        >
          {/* Calls Chart */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between flex-wrap gap-3">
              <div
                className="flex items-center gap-2 text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="2"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                </svg>
                API Calls Over Time
                <span className="text-[12px] text-gray-400 font-normal">
                  / Last 24h -CS-
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-[12px] text-gray-400">
                  {[
                    { color: "#2563eb", label: "Calls" },
                    { color: "#d97706", label: "Latency" },
                    { color: "#dc2626", label: "Errors" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div
                        className="w-3.5 h-0.5 rounded-full flex-shrink-0"
                        style={{ background: l.color }}
                      />
                      {l.label}
                    </div>
                  ))}
                </div>
                <RangeBtns
                  options={["24h", "7d", "30d"]}
                  active={chartRange}
                  onChange={setChartRange}
                />
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="mb-4">
                <div
                  className="text-[24px] text-gray-800 font-light leading-none"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  4,820{" "}
                  <span className="text-[14px] text-gray-400">calls today</span>
                </div>
                <div className="text-[12px] text-gray-400 mt-1">
                  Peak 380 calls/h at 14:00
                </div>
              </div>
              <CallsChart />
            </div>
          </div>

          {/* Quota */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Quota &amp; Limits -CS-
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              {[
                {
                  label: "Daily calls",
                  value: "4,820 / 50k",
                  pct: 10,
                  color: "#2563eb",
                  status: "On track",
                  statusColor: "text-green-600",
                  note: "10% used",
                },
                {
                  label: "Monthly calls",
                  value: "84k / 200k",
                  pct: 42,
                  color: "#d97706",
                  status: "Watch",
                  statusColor: "text-amber-600",
                  note: "42% · 12 days left",
                },
                {
                  label: "Rate limit",
                  value: "80 / 120 rps",
                  pct: 67,
                  color: "#2563eb",
                  status: "Fine",
                  statusColor: "text-green-600",
                  note: "67% of cap",
                },
              ].map((q) => (
                <div key={q.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] text-gray-700">{q.label}</span>
                    <span
                      className="font-mono text-[12px]"
                      style={{ color: q.color }}
                    >
                      {q.value}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${q.pct}%`, background: q.color }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[11px] text-gray-400">{q.note}</span>
                    <span className={`text-[11px] ${q.statusColor}`}>
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5">
                {[
                  ["Endpoints accessed", "14"],
                  ["Unique IPs", "2"],
                  ["Sessions today", "3"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-1 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-[12px] text-gray-400">{k}</span>
                    <span className="font-mono text-[12px] text-gray-700">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Endpoints + Timeline */}
        <div
          className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4"
        >
          {/* Request Log Table */}
          <div className=" overflow-hidden">
            <Table
              columns={logCols}
              group={LOG_GROUPS}
              tableName="user-request-log"
              data={logs}
              loading={isLoadingEmployeeMatrics}
              enableSearch={true}
              searchInput={epSearchInput}
              setSearchInput={setEpSearchInput}
              pageIndex={epPageIndex}
              setPageIndex={setEpPageIndex}
              pageLimit={epPageLimit}
              setPageLimit={setEpPageLimit}
              paginationData={{
                totalCount: pagination?.total || logs.length,
                totalPages: pagination?.pages || 1,
              }}
              sortField={sortField}
              setSortField={setSortField}
              sortType={sortType}
              setSortType={setSortType}
              activeFilters={{}}
              setActiveFilters={() => {}}
              showRowNumbers={false}
            />
          </div>

          {/* Activity Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Activity Timeline -CS-
            </div>
            <div className="px-4 py-4 flex flex-col gap-0">
              {TIMELINE.map((e, i) => (
                <div key={i} className="flex gap-3 pb-3.5 relative">
                  {i < TIMELINE.length - 1 && (
                    <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-gray-100" />
                  )}
                  <div
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${e.bg} ${e.color}`}
                  >
                    {TL_ICONS[e.icon]}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="text-[12.5px] text-gray-800">{e.title}</div>
                    <div className="text-[11.5px] text-gray-400">{e.sub}</div>
                    <div className="text-[11px] text-gray-300 mt-0.5">
                      {e.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
