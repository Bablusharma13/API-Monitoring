import { useState, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import { ExportIcon, RefreshIcon } from "../components/ui/Icons";
import { useGetTenantEndpointExplorerQuery } from "../features/tenants/hooks/query/useGetEndpointExplorerQuery";
import { useGetTenantDashboardQuery } from "../features/tenants/hooks/query/useGetTenantDashboardSummary";
import { Link } from "react-router-dom";

// ── DATA ──────────────────────────────────────────────────────────────────────
const TENANT_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#16a34a",
  "#0891b2",
  "#ea580c",
  "#d97706",
  "#4f46e5",
  "#dc2626",
];

const getTenantColor = (initials) => {
  let hash = 0;
  for (let i = 0; i < initials.length; i++)
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  return TENANT_COLORS[Math.abs(hash) % TENANT_COLORS.length];
};

const DONUT_DATA = [
  { label: "404 Not Found", val: 38, color: "#6b7280" },
  { label: "422 Validation", val: 28, color: "#d97706" },
  { label: "429 Rate Limit", val: 18, color: "#4f46e5" },
  { label: "500 Server Err", val: 10, color: "#dc2626" },
  { label: "503 Unavailable", val: 6, color: "#ea580c" },
];

const METHOD_STYLE = {
  GET: { bg: "bg-blue-50", text: "text-blue-700" },
  POST: { bg: "bg-green-50", text: "text-green-700" },
  PUT: { bg: "bg-amber-50", text: "text-amber-700" },
  DELETE: { bg: "bg-red-50", text: "text-red-700" },
  DEL: { bg: "bg-red-50", text: "text-red-700" },
};

// ── SEEDED RNG ────────────────────────────────────────────────────────────────
function seededRnd(seed, min, max) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.round((x - Math.floor(x)) * (max - min) + min);
}

// ── MAIN TRAFFIC CHART (SVG) ──────────────────────────────────────────────────
function MainChart() {
  const w = 800,
    h = 200,
    padL = 48,
    padR = 56,
    padT = 8,
    padB = 24;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const pts = 24;

  const traffic = Array.from({ length: pts }, (_, i) => {
    if (i >= 8 && i <= 11) return seededRnd(i * 7, 3800, 5200);
    if (i >= 12 && i <= 17) return seededRnd(i * 7, 4800, 6800);
    if (i >= 0 && i <= 5) return seededRnd(i * 7, 400, 1200);
    return seededRnd(i * 7, 1800, 3800);
  });
  const latency = traffic.map((v, i) =>
    Math.round(120 + (v / 6800) * 490 + seededRnd(i * 11, -30, 30)),
  );
  const errors = traffic.map(
    (v, i) => +((v / 6800) * 1.8 + seededRnd(i * 13, 0, 50) / 100).toFixed(2),
  );

  const maxTraffic = 7000,
    maxLat = 700,
    maxErr = 5;
  const toX = (i) => padL + (i / (pts - 1)) * chartW;
  const toTY = (v) => padT + chartH - (v / maxTraffic) * chartH;
  const toLY = (v) => padT + chartH - (v / maxLat) * chartH;

  const latLine = latency
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toLY(v).toFixed(1)}`,
    )
    .join(" ");
  const errLine = errors
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${(padT + chartH - (v / maxErr) * chartH).toFixed(1)}`,
    )
    .join(" ");
  const errArea = `${errLine} L${toX(pts - 1).toFixed(1)},${(padT + chartH).toFixed(1)} L${toX(0).toFixed(1)},${(padT + chartH).toFixed(1)} Z`;

  const yTicks = [0, 2000, 4000, 6000];
  const xTicks = [0, 6, 12, 18, 23];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 180 }}>
      {yTicks.map((t) => {
        const y = toTY(t);
        return (
          <g key={t}>
            <line
              x1={padL}
              y1={y}
              x2={padL + chartW}
              y2={y}
              stroke="#e9ebf0"
              strokeWidth="1"
              opacity="0.6"
            />
            <text
              x={padL - 5}
              y={y + 4}
              textAnchor="end"
              fill="#9ca3af"
              fontSize="10"
              fontFamily="DM Mono, monospace"
            >
              {t >= 1000 ? t / 1000 + "k" : t}
            </text>
          </g>
        );
      })}
      {/* Right Y axis (latency) */}
      {[0, 200, 400, 600].map((t) => {
        const y = toLY(t);
        return (
          <text
            key={t}
            x={padL + chartW + 5}
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
      {/* Bars */}
      {traffic.map((v, i) => {
        const bw = Math.max(2, chartW / pts - 4);
        const x = toX(i) - bw / 2;
        const barH = (v / maxTraffic) * chartH;
        return (
          <rect
            key={i}
            x={x}
            y={toTY(v)}
            width={bw}
            height={barH}
            fill="#2563eb18"
            rx="1"
          />
        );
      })}
      {/* Error area */}
      <path d={errArea} fill="#dc262610" />
      <path d={errLine} stroke="#dc2626" strokeWidth="1.5" fill="none" />
      {/* Latency line */}
      <path d={latLine} stroke="#d97706" strokeWidth="2" fill="none" />
      {/* X labels */}
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

// ── ERROR DONUT (SVG) ─────────────────────────────────────────────────────────
function ErrorDonut() {
  const total = DONUT_DATA.reduce((a, b) => a + b.val, 0);
  const cx = 80,
    cy = 80,
    r = 58,
    sw = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = DONUT_DATA.map((d) => {
    const dash = (d.val / total) * circ;
    const arc = { dash, offset, color: d.color };
    offset += dash;
    return arc;
  });
  return (
    <div className="flex items-center gap-6">
      <div
        className="relative flex-shrink-0"
        style={{ width: 160, height: 160 }}
      >
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          className="-rotate-90"
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#f0f2f7"
            strokeWidth={sw}
          />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={DONUT_DATA[i].color}
              strokeWidth={sw}
              strokeDasharray={`${a.dash} ${circ - a.dash}`}
              strokeDashoffset={-a.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-[22px] font-semibold text-gray-800"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            0.8%
          </div>
          <div className="text-[11px] text-gray-400">Error rate</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-0">
        {DONUT_DATA.map((d) => (
          <div
            key={d.label}
            className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: d.color }}
              />
              <span className="text-[12.5px] text-gray-700">{d.label}</span>
            </div>
            <span className="font-mono text-[12px] text-gray-400">
              {d.val}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SIGNAL METER ROW ──────────────────────────────────────────────────────────
function SignalRow({
  icon,
  iconBg,
  name,
  sub,
  val,
  valColor,
  barPct,
  barColor,
  sloLabel,
}) {
  return (
    <div className="flex items-center gap-3.5 px-5 py-3.5 border-b border-gray-100 last:border-b-0">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-[13px] text-gray-800 font-medium">{name}</div>
        <div className="text-[11px] text-gray-400">{sub}</div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5">
          <div
            className="h-full rounded-full"
            style={{ width: `${barPct}%`, background: barColor }}
          />
        </div>
      </div>
      <div className="text-right">
        <div
          className="text-[18px] leading-none"
          style={{ fontFamily: "'Outfit', sans-serif", color: valColor }}
        >
          {val}
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">{sloLabel}</div>
      </div>
    </div>
  );
}

// ── TENANT TABLE GROUPS ───────────────────────────────────────────────────────
const TENANT_GROUPS = {
  Identity: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Performance: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Status: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

const ENDPOINT_GROUPS = {
  Request: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Metrics: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Traffic: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function GlobalDashboard() {
  const [timeRange, setTimeRange] = useState("24h");
  const [tPageIndex, setTPageIndex] = useState(0);
  const [tPageLimit, setTPageLimit] = useState(10);
  const [ePageIndex, setEPageIndex] = useState(0);
  const [ePageLimit, setEPageLimit] = useState(10);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [eSortField, setESortField] = useState(null);
  const [eSortType, setESortType] = useState(null);
  const [eSearchQuery, setESearchQuery] = useState("");

  const { data: endpointExplorerData, isLoading: isTenantEndpointLoading } =
    useGetTenantEndpointExplorerQuery(
      ePageIndex + 1,
      ePageLimit,
      eSearchQuery,
      eSortField,
      eSortType,
    );

  const { data: tenantDashboardData, isLoading: isTenantsLoading } =
    useGetTenantDashboardQuery(
      tPageIndex,
      tPageLimit,
      searchQuery,
      sortField,
      sortType,
    );

  const summary = tenantDashboardData?.summary;
  const tenants = tenantDashboardData?.tenants ?? [];
  const tenantPagination = tenantDashboardData?.pagination;

  const endpoints = endpointExplorerData?.data ?? [];
  const endpointPagination = endpointExplorerData?.pagination;

  const maxRps = endpoints.length
    ? Math.max(...endpoints.map((e) => e.totalHits ?? 0))
    : 0;

  // Sparkline data (seeded, consistent)
  const spLatency = Array.from(
    { length: 20 },
    (_, i) => seededRnd(i * 7 + 1, 200, 360) + (i === 16 ? 120 : 0),
  );
  const spTraffic = Array.from({ length: 20 }, (_, i) =>
    seededRnd(i * 11 + 2, 2600, 5000),
  );
  const spErrors = Array.from({ length: 20 }, (_, i) =>
    Math.max(0.1, seededRnd(i * 13 + 3, 4, 14) / 10),
  );
  const spSat = Array.from({ length: 20 }, (_, i) =>
    seededRnd(i * 17 + 4, 52, 80),
  );

  const tenantCols = [
    {
      id: "name",
      name: "Tenant",
      width: 200,
      group: "Identity",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
            style={{ background: getTenantColor(row.initials) }}
          >
            {row.initials}
          </div>
          <Link to={`/dashboard/tenants/${row._id}`} className="text-blue-500">
            <span className="text-[13px]">{row.company}</span>
          </Link>
        </div>
      ),
    },
    {
      id: "totalRequests",
      name: "Requests",
      width: 100,
      group: "Performance",
      cell: (row) => (
        <span className="font-mono text-[12.5px]">
          {row.totalRequests?.toLocaleString()}
        </span>
      ),
    },
    {
      id: "uptime",
      name: "Uptime",
      width: 90,
      group: "Performance",
      cell: (row) => {
        const c =
          row.uptime >= 99
            ? "text-green-600"
            : row.uptime >= 95
              ? "text-amber-600"
              : "text-red-600";
        return (
          <span className={`font-mono text-[12.5px] ${c}`}>{row.uptime}%</span>
        );
      },
    },
    {
      id: "errorRate",
      name: "Errors",
      width: 90,
      group: "Performance",
      cell: (row) => {
        const c =
          row.errorRate > 100
            ? "text-red-600"
            : row.errorRate > 10
              ? "text-amber-600"
              : "text-gray-400";
        return (
          <span className={`font-mono text-[12.5px] ${c}`}>
            {row.errorRate?.toLocaleString()}
          </span>
        );
      },
    },
    {
      id: "status",
      name: "Status",
      width: 100,
      group: "Status",
      disableSortBy: true,
      cell: (row) => {
        if (row.uptime >= 95) return <Badge value="Healthy" variant="active" />;
        if (row.uptime >= 90)
          return <Badge value="Warning" variant="warning" />;
        return <Badge value="Critical" variant="down" />;
      },
    },
  ];

  const endpointCols = [
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
      id: "path",
      name: "Endpoint",
      width: 220,
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
      id: "rps",
      name: "RPS",
      width: 70,
      group: "Metrics",
      cell: (row) => (
        <span className="font-mono text-[12.5px]">
          {row.totalHits?.toLocaleString()}
        </span>
      ),
    },
    {
      id: "lat",
      name: "p95",
      width: 80,
      group: "Metrics",
      cell: (row) => {
        const c =
          row.avgLatency > 400
            ? "text-red-600"
            : row.avgLatency > 250
              ? "text-amber-600"
              : "text-gray-700";
        return (
          <span className={`font-mono text-[12.5px] ${c}`}>
            {row.avgLatency}ms
          </span>
        );
      },
    },
  ];

  return (
    <div className="container-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="Tenant Dashboard"
          breadcrumbs={[{ label: "Global Dashboard" }]}
        />
      </div>

      <div className="flex flex-col gap-5">
        {/* Status Bar */}

        {/* KPI Cards */}
        <div className="grid-kpi-4">
          {[
            {
              title: "Avg Latency (p95)",
              val: `${Math.round(summary?.avgLatency ?? 0)} ms`,
              badge: "p95",
              badgeBg: "bg-amber-50",
              badgeText: "text-amber-600",
              iconBg: "bg-blue-50",
              icon: (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ),
              spark: spLatency,
              sparkColor: "#d97706",
              delta: "Across all tenants",
              deltaUp: false,
              sub: `${summary?.totalRequests?.toLocaleString() ?? 0} total requests`,
            },
            {
              title: "Requests / min",
              val: summary?.rpm?.toFixed(1) ?? "0",
              badge: "RPM",
              badgeBg: "bg-green-50",
              badgeText: "text-green-600",
              iconBg: "bg-green-50",
              icon: (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              ),
              spark: spTraffic,
              sparkColor: "#16a34a",
              delta: "Aggregated rate",
              deltaUp: true,
              sub: `${summary?.totalRequests?.toLocaleString() ?? 0} total`,
            },
            {
              title: "Error Rate (4+5xx)",
              val: "0.8%",
              badge: "Healthy",
              badgeBg: "bg-green-50",
              badgeText: "text-green-600",
              iconBg: "bg-red-50",
              icon: (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ),
              spark: spErrors,
              sparkColor: "#dc2626",
              delta: "−0.3% vs yesterday",
              deltaUp: true,
              sub: "5xx · 0.2%",
            },
            {
              title: "Avg CPU Saturation",
              val: "-CS-",
              badge: "Watch",
              badgeBg: "bg-amber-50",
              badgeText: "text-amber-600",
              iconBg: "bg-amber-50",
              icon: (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                >
                  <path d="M18 20V10" />
                  <path d="M12 20V4" />
                  <path d="M6 20v-6" />
                </svg>
              ),
              spark: spSat,
              sparkColor: "#d97706",
              delta: "+5% vs yesterday",
              deltaUp: false,
              sub: "DB Pool · 58%",
            },
          ].map((kpi) => (
            <div
              key={kpi.title}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 ${kpi.iconBg}`}
                >
                  {kpi.icon}
                </div>
                <div className="text-[22px] text-gray-800  mb-1">{kpi.val}</div>
              </div>

              <div className="text-[12px] text-gray-400 mb-2">{kpi.title}</div>
            </div>
          ))}
        </div>

        {/* Main Chart + Signal Health */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          {/* Traffic & Latency chart */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between flex-wrap gap-3">
              <div
                className="flex items-center gap-2 text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                </svg>
                Traffic &amp; Latency -CS-
                <span className="text-[12px] text-gray-400 font-normal">
                  / Last 24h
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] sm:text-[12px] text-gray-400">
                {[
                  { color: "#2563eb", label: "Requests/min", bar: true },
                  { color: "#d97706", label: "p95 Latency" },
                  { color: "#dc2626", label: "Errors" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5">
                    <span
                      className={`flex-shrink-0 ${l.bar ? "w-3.5 h-2 rounded-sm opacity-40" : "w-3.5 h-0.5 rounded-full"}`}
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-5 pt-4 pb-0">
              <MainChart />
            </div>
            {/* Mini stats */}
            <div className="grid-kpi-mini-4">
              {[
                {
                  val: "5.84M",
                  valColor: "text-blue-600",
                  label: "Total requests today",
                },
                {
                  val: "46.8k",
                  valColor: "text-red-600",
                  label: "Errors today",
                },
                {
                  val: "6.8k",
                  valColor: "text-amber-600",
                  label: "Peak RPS (14:00)",
                },
                {
                  val: "99.94%",
                  valColor: "text-gray-800",
                  label: "Uptime (30d)",
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 ${i < 3 ? "border-r border-gray-100" : ""}`}
                >
                  <div
                    className={`text-[18px] font-medium leading-none ${m.valColor}`}
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {m.val}
                  </div>
                  <div className="text-[11.5px] text-gray-400 mt-1">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signal Health */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div
                className="flex items-center gap-1.5 text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Signal Health -CS-
              </div>
              <Badge value="All Nominal" variant="active" />
            </div>
            <SignalRow
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
              iconBg="bg-blue-50"
              name="Latency"
              sub="p95 response time"
              val={`${Math.round(summary?.avgLatency ?? 0)} ms`}
              valColor="#d97706"
              barPct={52}
              barColor="#d97706"
              sloLabel="SLO: 600ms"
            />
            <SignalRow
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                </svg>
              }
              iconBg="bg-green-50"
              name="Traffic"
              sub="Requests per minute"
              val={summary?.rpm?.toFixed(1)}
              valColor="#16a34a"
              barPct={62}
              barColor="#16a34a"
            />
            <SignalRow
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              }
              iconBg="bg-red-50"
              name="Errors"
              sub="4xx + 5xx error rate"
              val="0.8%"
              valColor="#16a34a"
              barPct={8}
              barColor="#16a34a"
              sloLabel="SLO: <2%"
            />
            <SignalRow
              icon={
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                >
                  <path d="M18 20V10" />
                  <path d="M12 20V4" />
                  <path d="M6 20v-6" />
                </svg>
              }
              iconBg="bg-amber-50"
              name="Saturation"
              sub="Avg CPU utilization"
              val="-CS-"
              valColor="#d97706"
              barPct={71}
              barColor="#d97706"
              sloLabel="Warn: 80%"
            />
          </div>
        </div>

        {/* Tenant Health + Active Alerts */}
        <div className="grid grid-cols-1 gap-4">
          {/* Tenant Table */}
          <div className="overflow-hidden">
            <Table
              columns={tenantCols}
              group={TENANT_GROUPS}
              tableName="global-tenants"
              data={tenants}
              loading={isTenantsLoading}
              enableSearch={true}
              searchInput={searchQuery}
              setSearchInput={(val) => {
                setSearchQuery(val);
                setTPageIndex(0);
              }}
              showRowNumbers={false}
              pageIndex={tPageIndex}
              setPageIndex={setTPageIndex}
              pageLimit={tPageLimit}
              setPageLimit={setTPageLimit}
              paginationData={{
                totalCount: tenantPagination?.total ?? tenants.length,
                totalPages: tenantPagination?.totalPages ?? 1,
              }}
              sortField={sortField}
              setSortField={setSortField}
              sortType={sortType}
              setSortType={setSortType}
              activeFilters={{}}
              setActiveFilters={() => {}}
            />
          </div>
        </div>

        {/* Top Endpoints + Error Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Endpoint Table */}
          <div className=" overflow-hidden">
            <Table
              columns={endpointCols}
              group={ENDPOINT_GROUPS}
              tableName="global-endpoints"
              data={endpoints}
              loading={isTenantEndpointLoading}
              enableSearch={true}
              searchInput={eSearchQuery}
              setSearchInput={(val) => {
                setESearchQuery(val);
                setEPageIndex(0);
              }}
              pageIndex={ePageIndex}
              setPageIndex={setEPageIndex}
              pageLimit={ePageLimit}
              setPageLimit={setEPageLimit}
              paginationData={{
                totalCount: endpointPagination?.total ?? endpoints.length,
                totalPages: endpointPagination?.pages ?? 1,
              }}
              sortField={eSortField}
              setSortField={setESortField}
              sortType={eSortType}
              setSortType={setESortType}
              activeFilters={{}}
              setActiveFilters={() => {}}
              showRowNumbers={false}
              //   additionalControls={
              //     <div className="flex items-center gap-2">
              //       <span className="text-[12px] text-gray-400">By traffic</span>
              //       <button className="px-2.5 py-1 border border-gray-200 rounded-md text-[11.5px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
              //         View all
              //       </button>
              //     </div>
              //   }
            />
          </div>

          {/* Error Breakdown Donut */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-1.5 text-[14px] text-gray-800 flex-shrink-0"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Error Breakdown -CS-
            </div>
            <div className="px-5 py-4 flex-1">
              <ErrorDonut />
            </div>
            <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between flex-shrink-0">
              <span className="text-[13px] text-gray-700">
                Top error endpoint
              </span>
              <span className="font-mono text-[11.5px] text-red-600">
                POST /api/v2/contacts/bulk
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



