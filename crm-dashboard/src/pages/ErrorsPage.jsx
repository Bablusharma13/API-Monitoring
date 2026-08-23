import { useState, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import { RefreshIcon, AddIcon } from "../components/ui/Icons";

// ── DATA ──────────────────────────────────────────────────────────────────────
const DONUT_DATA = [
  { label: "404 Not Found", val: 38, color: "#6b7280" },
  { label: "422 Validation", val: 27, color: "#d97706" },
  { label: "429 Rate Limit", val: 18, color: "#4f46e5" },
  { label: "500 Server Err", val: 11, color: "#dc2626" },
  { label: "503 Unavailable", val: 6, color: "#ea580c" },
];

const ALERTS = [
  {
    sev: "critical",
    color: "#dc2626",
    bg: "bg-red-50",
    title: "Magna Cloud — error rate 3.4%",
    meta: "POST /api/v2/contacts/bulk · 5xx spike",
    time: "2m ago",
  },
  {
    sev: "critical",
    color: "#dc2626",
    bg: "bg-red-50",
    title: "Pulsar Labs — error rate 2.8%",
    meta: "POST /api/v2/deals · SLO breached",
    time: "4m ago",
  },
  {
    sev: "critical",
    color: "#dc2626",
    bg: "bg-red-50",
    title: "503 on /api/v1/reports",
    meta: "3 tenants affected · infra issue",
    time: "7m ago",
  },
  {
    sev: "warning",
    color: "#d97706",
    bg: "bg-amber-50",
    title: "Velox Inc — error rate rising",
    meta: "1.2% · approaching SLO threshold",
    time: "12m ago",
  },
  {
    sev: "warning",
    color: "#d97706",
    bg: "bg-amber-50",
    title: "429 rate limit spike",
    meta: "Strata AI · 18% of errors",
    time: "19m ago",
  },
  {
    sev: "warning",
    color: "#d97706",
    bg: "bg-amber-50",
    title: "Crest Digital — 422 errors up",
    meta: "Validation failures · /api/v2/leads",
    time: "31m ago",
  },
  {
    sev: "warning",
    color: "#d97706",
    bg: "bg-amber-50",
    title: "Flux Systems — 404 spike",
    meta: "Possible breaking change in client",
    time: "44m ago",
  },
];

const TIMELINE = [
  {
    icon: "error",
    bg: "bg-red-50",
    color: "text-red-600",
    title: "503 spike on reporting endpoints",
    sub: "Infra issue — 3 tenants · p99 >2s",
    time: "7m ago",
  },
  {
    icon: "warning",
    bg: "bg-amber-50",
    color: "text-amber-600",
    title: "429 rate limit burst — Strata AI",
    sub: "820 rps → 980 rps · cap exceeded",
    time: "19m ago",
  },
  {
    icon: "check",
    bg: "bg-green-50",
    color: "text-green-600",
    title: "Error rate normalised — Nexus Corp",
    sub: "Resolved after deploy rollback v3.1.8",
    time: "38m ago",
  },
  {
    icon: "error",
    bg: "bg-red-50",
    color: "text-red-600",
    title: "422 wave on /contacts/bulk",
    sub: "Velox Inc · malformed payload batch",
    time: "1h ago",
  },
  {
    icon: "check",
    bg: "bg-green-50",
    color: "text-green-600",
    title: "Incident INC-3039 resolved",
    sub: "Payment auth errors — 22min duration",
    time: "2h ago",
  },
];

const ENDPOINTS = [
  {
    m: "POST",
    path: "/api/v2/contacts/bulk",
    tenant: "Magna Cloud",
    tc: "#dc2626",
    rps: 290,
    e4: 0.8,
    e5: 3.4,
  },
  {
    m: "POST",
    path: "/api/v2/deals",
    tenant: "Pulsar Labs",
    tc: "#ea580c",
    rps: 387,
    e4: 0.6,
    e5: 2.8,
  },
  {
    m: "GET",
    path: "/api/v1/reports",
    tenant: "Apex Systems",
    tc: "#64748b",
    rps: 14,
    e4: 0.2,
    e5: 1.9,
  },
  {
    m: "PUT",
    path: "/api/v2/leads/:id",
    tenant: "Crest Digital",
    tc: "#db2777",
    rps: 121,
    e4: 1.4,
    e5: 0.4,
  },
  {
    m: "GET",
    path: "/api/v1/analytics",
    tenant: "Velox Inc",
    tc: "#16a34a",
    rps: 88,
    e4: 1.2,
    e5: 0.2,
  },
  {
    m: "POST",
    path: "/api/v1/users/auth",
    tenant: "Flux Systems",
    tc: "#ef4444",
    rps: 48,
    e4: 0.9,
    e5: 0.3,
  },
  {
    m: "GET",
    path: "/api/v1/contacts",
    tenant: "Nexus Corp",
    tc: "#2563eb",
    rps: 820,
    e4: 0.2,
    e5: 0.1,
  },
  {
    m: "DEL",
    path: "/api/v1/leads/:id",
    tenant: "Delphi Sys",
    tc: "#d97706",
    rps: 55,
    e4: 0.7,
    e5: 0.0,
  },
];

const TENANTS = [
  { name: "Magna Cloud", color: "#dc2626", err: 3.4 },
  { name: "Pulsar Labs", color: "#ea580c", err: 2.8 },
  { name: "Apex Systems", color: "#64748b", err: 1.9 },
  { name: "Crest Digital", color: "#db2777", err: 1.4 },
  { name: "Velox Inc", color: "#16a34a", err: 1.2 },
  { name: "Flux Systems", color: "#ef4444", err: 0.9 },
  { name: "Delphi Sys", color: "#d97706", err: 0.9 },
  { name: "Orbis Tech", color: "#7c3aed", err: 0.6 },
  { name: "Nexus Corp", color: "#2563eb", err: 0.3 },
  { name: "Strata AI", color: "#0891b2", err: 0.4 },
  { name: "Aether Co", color: "#4f46e5", err: 0.2 },
  { name: "Solaris Tech", color: "#059669", err: 0.1 },
];

const METHOD_STYLE = {
  GET: { bg: "bg-blue-50", text: "text-blue-700" },
  POST: { bg: "bg-green-50", text: "text-green-700" },
  PUT: { bg: "bg-amber-50", text: "text-amber-700" },
  DEL: { bg: "bg-red-50", text: "text-red-700" },
};

const ENDPOINT_GROUPS = {
  Request: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Errors: { hex: "#dc2626", bg: "bg-red-50", text: "text-red-600" },
  Status: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// ── SEEDED RNG ────────────────────────────────────────────────────────────────
function seededRnd(seed, min, max) {
  const x = Math.sin(seed + 1) * 10000;
  return +((x - Math.floor(x)) * (max - min) + min).toFixed(2);
}

// ── ERROR RATE LINE CHART (SVG) ───────────────────────────────────────────────
function ErrorRateChart() {
  const w = 700,
    h = 160,
    padL = 36,
    padR = 12,
    padT = 8,
    padB = 24;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const pts = 24;

  const rate5xx = Array.from(
    { length: pts },
    (_, i) => seededRnd(i * 7, 0.05, 0.45) + (i > 14 && i < 17 ? 1.2 : 0.1),
  );
  const rate4xx = Array.from({ length: pts }, (_, i) =>
    seededRnd(i * 11, 0.3, 0.9),
  );

  const yMax = 2.5;
  const toX = (i) => padL + (i / (pts - 1)) * chartW;
  const toY = (v) => padT + chartH - (Math.min(v, yMax) / yMax) * chartH;

  const line5 = rate5xx
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`,
    )
    .join(" ");
  const area5 = `${line5} L${(padL + chartW).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;
  const line4 = rate4xx
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`,
    )
    .join(" ");
  const area4 = `${line4} L${(padL + chartW).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;

  // SLO line at 2%
  const sloY = toY(2);
  const yTicks = [0, 1, 2];
  const xTicks = [0, 6, 12, 18, 23];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 160 }}>
      {yTicks.map((t) => {
        const y = toY(t);
        return (
          <g key={t}>
            <line
              x1={padL}
              y1={y}
              x2={padL + chartW}
              y2={y}
              stroke="#e9ebf0"
              strokeWidth="1"
              opacity="0.5"
            />
            <text
              x={padL - 4}
              y={y + 4}
              textAnchor="end"
              fill="#9ca3af"
              fontSize="10"
              fontFamily="DM Mono, monospace"
            >
              {t}%
            </text>
          </g>
        );
      })}
      {/* SLO dashed line */}
      <line
        x1={padL}
        y1={sloY}
        x2={padL + chartW}
        y2={sloY}
        stroke="#9ca3af"
        strokeWidth="1"
        strokeDasharray="4,4"
        opacity="0.6"
      />
      <text
        x={padL + chartW - 4}
        y={sloY - 3}
        textAnchor="end"
        fill="#9ca3af"
        fontSize="9"
        opacity="0.7"
      >
        SLO 2%
      </text>
      {/* Areas */}
      <path d={area4} fill="#d97706" opacity="0.07" />
      <path d={area5} fill="#dc2626" opacity="0.1" />
      {/* Lines */}
      <path d={line4} stroke="#d97706" strokeWidth="2" fill="none" />
      <path d={line5} stroke="#dc2626" strokeWidth="2" fill="none" />
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
  const cx = 65,
    cy = 65,
    r = 48,
    sw = 18;
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
        style={{ width: 130, height: 130 }}
      >
        <svg
          width="130"
          height="130"
          viewBox="0 0 130 130"
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
              stroke={DONUT_DATA[i].color + "99"}
              strokeWidth={sw}
              strokeDasharray={`${a.dash} ${circ - a.dash}`}
              strokeDashoffset={-a.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-[18px] text-gray-800"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            0.8%
          </div>
          <div className="text-[10px] text-gray-400">error rate</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2.5">
        {DONUT_DATA.map((d) => (
          <div key={d.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-[2px] flex-shrink-0"
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

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Errors() {
  const [timeRange, setTimeRange] = useState("24h");
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);

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

  const timelineIcons = {
    error: (
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
        <line x1="12" y1="16" x2="12.01" y2="16" />
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
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
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

  const errColor = (v, thresh1, thresh2) =>
    v > thresh1
      ? "text-red-600"
      : v > thresh2
        ? "text-amber-600"
        : "text-gray-400";

  const errBadge = (v) => {
    if (v > 2) return <Badge value="Breached" variant="down" />;
    if (v > 1) return <Badge value="At risk" variant="warning" />;
    return <Badge value="OK" variant="active" />;
  };

  const stats = [
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
      count: "0.8%",
      title: "Overall Error Rate",
      badgeText: "▼ −0.3% vs yesterday",
      badgeBg: "bg-green-50",
      badgeTextColor: "text-green-600",
      delta: "▼ −0.3% vs yesterday",
      deltaColor: "text-green-600",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dc2626"
          strokeWidth="1.8"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
        </svg>
      ),
      count: "46.8k",
      countColor: "text-red-600",
      title: "Server Errors Today",
      badgeText: "▲ +2.1k vs yesterday",
      badgeBg: "bg-red-50",
      badgeTextColor: "text-red-600",
      delta: "▲ +2.1k vs yesterday",
      deltaColor: "text-red-600",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d97706"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      count: "128k",
      countColor: "text-amber-600",
      title: "Client Errors Today",
      badgeText: "▼ −8k vs yesterday",
      badgeBg: "bg-amber-50",
      badgeTextColor: "text-amber-600",
      delta: "▼ −8k vs yesterday",
      deltaColor: "text-green-600",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dc2626"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      count: "3",
      countColor: "text-red-600",
      title: "SLO Breached",
      badgeText: "▲ +1 vs yesterday",
      badgeBg: "bg-red-50",
      badgeTextColor: "text-red-600",
      delta: "▲ +1 vs yesterday",
      deltaColor: "text-red-600",
    },
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
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        </svg>
      ),
      count: "7",
      countColor: "text-blue-600",
      title: "Active Alerts",
      badgeText: "▲ +3 this hour",
      badgeBg: "bg-amber-50",
      badgeTextColor: "text-amber-600",
      delta: "▲ +3 this hour",
      deltaColor: "text-amber-600",
    },
  ];

  const endpointCols = [
    {
      id: "m",
      name: "Method",
      width: 80,
      group: "Request",
      cell: (row) => {
        const s = METHOD_STYLE[row.m] || {
          bg: "bg-gray-100",
          text: "text-gray-600",
        };
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded font-mono text-[11px] font-medium ${s.bg} ${s.text}`}
          >
            {row.m}
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
        <span className="font-mono text-[12px] text-gray-800">{row.path}</span>
      ),
    },
    {
      id: "tenant",
      name: "Tenant",
      width: 140,
      group: "Request",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <div
            className="w-3.5 h-3.5 rounded-[3px] flex-shrink-0"
            style={{ background: row.tc }}
          />
          <span className="text-[12.5px] text-gray-700">{row.tenant}</span>
        </div>
      ),
    },
    {
      id: "rps",
      name: "RPS",
      width: 70,
      group: "Request",
      cell: (row) => <span className="font-mono text-[12px]">{row.rps}</span>,
    },
    {
      id: "e4",
      name: "4xx",
      width: 70,
      group: "Errors",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.e4 > 1 ? "text-amber-600" : "text-gray-400"}`}
        >
          {row.e4}%
        </span>
      ),
    },
    {
      id: "e5",
      name: "5xx",
      width: 70,
      group: "Errors",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.e5 > 0.5 ? "text-red-600" : "text-gray-400"}`}
        >
          {row.e5}%
        </span>
      ),
    },
    {
      id: "total",
      name: "Err %",
      width: 70,
      group: "Errors",
      cell: (row) => {
        const t = +(row.e4 + row.e5).toFixed(1);
        return (
          <span
            className={`font-mono text-[12px] font-medium ${t > 2 ? "text-red-600" : t > 1 ? "text-amber-600" : "text-gray-400"}`}
          >
            {t}%
          </span>
        );
      },
    },
    {
      id: "bar",
      name: "Error bar",
      width: 120,
      group: "Errors",
      disableSortBy: true,
      cell: (row) => {
        const t = +(row.e4 + row.e5).toFixed(1);
        const bw = Math.min(100, Math.round((t / 4) * 100));
        const c = t > 2 ? "bg-red-500" : t > 1 ? "bg-amber-500" : "bg-gray-300";
        return (
          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${c}`}
              style={{ width: `${bw}%` }}
            />
          </div>
        );
      },
    },
    {
      id: "status",
      name: "Status",
      width: 100,
      group: "Status",
      disableSortBy: true,
      cell: (row) => errBadge(+(row.e4 + row.e5).toFixed(1)),
    },
  ];

  const filteredEndpoints = useMemo(
    () =>
      ENDPOINTS.filter(
        (e) =>
          !query ||
          e.path.toLowerCase().includes(query.toLowerCase()) ||
          e.tenant.toLowerCase().includes(query.toLowerCase()) ||
          e.m.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const paginated = filteredEndpoints.slice(
    pageIndex * pageLimit,
    (pageIndex + 1) * pageLimit,
  );

  return (
    <div className="container-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="Errors"
          breadcrumbs={[
            { label: "Home", href: "#" },
            { label: "Golden Signals", href: "#" },
            { label: "Errors" },
          ]}
        />
        <div className="flex items-center gap-2">
          <RangeBtns
            options={["1h", "6h", "24h", "7d", "30d"]}
            active={timeRange}
            onChange={setTimeRange}
          />
          <ActionButton action="refresh" label="Refresh" icon={RefreshIcon} />
          <ActionButton action="search" label="Create Alert" icon={AddIcon} />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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

        {/* Error Rate Chart + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Error Rate Chart */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div
                className="flex items-center gap-1.5 text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                </svg>
                Error Rate — Last 24h
              </div>
              <div className="flex items-center gap-4 text-[11.5px] text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded-full bg-red-500 inline-block" />
                  5xx
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded-full bg-amber-500 inline-block" />
                  4xx
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 border-t border-dashed border-gray-400 inline-block" />
                  SLO 2%
                </span>
              </div>
            </div>
            <div className="px-5 py-4">
              <ErrorRateChart />
            </div>
          </div>

          {/* Error Breakdown Donut */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Error Breakdown
            </div>
            <div className="px-5 py-4">
              <ErrorDonut />
            </div>
          </div>
        </div>

        {/* Active Alerts + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Active Alerts */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div
                className="text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Active Alerts
              </div>
              <Badge value="7 open" variant="down" />
            </div>
            <div>
              {ALERTS.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50/30 transition-colors cursor-pointer"
                >
                  <div
                    className="w-0.5 rounded-full self-stretch flex-shrink-0"
                    style={{ background: a.color }}
                  />
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${a.bg}`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={a.color}
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] text-gray-800">
                        {a.title}
                      </span>
                      <Badge
                        value={a.sev}
                        variant={a.sev === "critical" ? "down" : "warning"}
                      />
                    </div>
                    <div className="text-[11.5px] text-gray-400">{a.meta}</div>
                  </div>
                  <span className="font-mono text-[11px] text-gray-400 flex-shrink-0 ml-1">
                    {a.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Recent Error Events
            </div>
            <div className="px-5 py-4 flex flex-col gap-0">
              {TIMELINE.map((e, i) => (
                <div key={i} className="flex gap-3 pb-4 relative">
                  {i < TIMELINE.length - 1 && (
                    <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-gray-100" />
                  )}
                  <div
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${e.bg} ${e.color}`}
                  >
                    {timelineIcons[e.icon]}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="text-[13px] text-gray-800">{e.title}</div>
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

        {/* Top Error Endpoints Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <Table
            columns={endpointCols}
            group={ENDPOINT_GROUPS}
            tableName="error-endpoints"
            data={paginated}
            loading={false}
            enableSearch={true}
            searchInput={query}
            setSearchInput={(val) => {
              setQuery(val);
              setPageIndex(0);
            }}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            pageLimit={pageLimit}
            setPageLimit={setPageLimit}
            paginationData={{
              totalCount: filteredEndpoints.length,
              totalPages: Math.ceil(filteredEndpoints.length / pageLimit) || 1,
            }}
            sortField={sortField}
            setSortField={setSortField}
            sortType={sortType}
            setSortType={setSortType}
            activeFilters={{}}
            setActiveFilters={() => {}}
            // additionalControls={
            //   <div className="flex items-center gap-2 text-[11.5px] text-gray-400">
            //     <span>Sorted by error rate ↓</span>
            //     <button className="px-2.5 py-1 border border-gray-200 rounded-md text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
            //       View all
            //     </button>
            //   </div>
            // }
          />
        </div>

        {/* Tenant Error Rate Bars */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <div
              className="text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Error Rate by Tenant
            </div>
            <Badge value="SLO: <2%" variant="beta" />
          </div>
          <div className="px-5 py-4 flex flex-col gap-2.5">
            {TENANTS.map((t) => {
              const barW = Math.min(100, Math.round((t.err / 4) * 100));
              const barColor =
                t.err > 2
                  ? "bg-red-500"
                  : t.err > 1
                    ? "bg-amber-500"
                    : "bg-green-500";
              const textColor =
                t.err > 2
                  ? "text-red-600"
                  : t.err > 1
                    ? "text-amber-600"
                    : "text-green-600";
              return (
                <div key={t.name} className="flex items-center gap-3">
                  <div
                    className="w-[22px] h-[22px] rounded-[5px] flex-shrink-0"
                    style={{ background: t.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[13px] text-gray-800">
                        {t.name}
                      </span>
                      <span
                        className={`font-mono text-[12px] ml-2 flex-shrink-0 ${textColor}`}
                      >
                        {t.err}%
                      </span>
                    </div>
                    <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor}`}
                        style={{ width: `${barW}%` }}
                      />
                      {/* SLO line at 50% = 2% */}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-red-300 opacity-50"
                        style={{ left: "50%" }}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0">{errBadge(t.err)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
