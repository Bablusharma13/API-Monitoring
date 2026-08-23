import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import { ExportIcon } from "../components/ui/Icons";

// ── DATA ──────────────────────────────────────────────────────────────────────
const SLO_TENANTS = [
  { name: "Nexus Corp", color: "#2563eb", p95: 188, slo: 600, ok: true },
  { name: "Orbis Tech", color: "#7c3aed", p95: 244, slo: 600, ok: true },
  { name: "Strata AI", color: "#0891b2", p95: 201, slo: 600, ok: true },
  { name: "Aether Co", color: "#4f46e5", p95: 196, slo: 600, ok: true },
  { name: "Solaris Tech", color: "#059669", p95: 165, slo: 600, ok: true },
  { name: "Delphi Sys", color: "#d97706", p95: 280, slo: 600, ok: true },
  { name: "Velox Inc", color: "#16a34a", p95: 312, slo: 600, ok: true },
  { name: "Crest Digital", color: "#db2777", p95: 310, slo: 600, ok: true },
  { name: "Magna Cloud", color: "#dc2626", p95: 390, slo: 600, ok: true },
  { name: "Pulsar Labs", color: "#ea580c", p95: 428, slo: 600, ok: true },
  { name: "Vertex Labs", color: "#7c3aed", p95: 520, slo: 600, ok: true },
  { name: "Nova Platforms", color: "#a855f7", p95: 612, slo: 600, ok: false },
  { name: "Flux Systems", color: "#ef4444", p95: 680, slo: 600, ok: false },
  { name: "Apex Systems", color: "#64748b", p95: 740, slo: 600, ok: false },
];

const ENDPOINTS = [
  {
    m: "POST",
    path: "/api/v2/contacts/bulk",
    tenant: "Magna Cloud",
    color: "#dc2626",
    p50: 380,
    p95: 740,
    p99: 1100,
    rps: 28,
  },
  {
    m: "GET",
    path: "/api/v1/reports/export",
    tenant: "Apex Systems",
    color: "#64748b",
    p50: 340,
    p95: 680,
    p99: 980,
    rps: 12,
  },
  {
    m: "POST",
    path: "/api/v2/deals",
    tenant: "Pulsar Labs",
    color: "#ea580c",
    p50: 310,
    p95: 428,
    p99: 620,
    rps: 198,
  },
  {
    m: "GET",
    path: "/api/v1/analytics",
    tenant: "Velox Inc",
    color: "#16a34a",
    p50: 220,
    p95: 390,
    p99: 580,
    rps: 44,
  },
  {
    m: "PUT",
    path: "/api/v2/leads/:id",
    tenant: "Crest Digital",
    color: "#db2777",
    p50: 180,
    p95: 312,
    p99: 440,
    rps: 88,
  },
  {
    m: "GET",
    path: "/api/v1/contacts",
    tenant: "Nexus Corp",
    color: "#2563eb",
    p50: 90,
    p95: 188,
    p99: 280,
    rps: 820,
  },
  {
    m: "GET",
    path: "/api/v2/pipelines",
    tenant: "Aether Co",
    color: "#4f46e5",
    p50: 72,
    p95: 144,
    p99: 210,
    rps: 62,
  },
  {
    m: "GET",
    path: "/api/v1/activities",
    tenant: "Solaris Tech",
    color: "#059669",
    p50: 64,
    p95: 118,
    p99: 170,
    rps: 144,
  },
];

const HIST_BUCKETS = [
  "0–50",
  "50–100",
  "100–200",
  "200–300",
  "300–400",
  "400–500",
  "500–600",
  "600–800",
  "800+",
];
const HIST_COUNTS = [420, 1840, 4200, 3100, 1800, 920, 440, 180, 60];

const METHOD_STYLE = {
  GET: { bg: "bg-blue-50", text: "text-blue-700" },
  POST: { bg: "bg-green-50", text: "text-green-700" },
  PUT: { bg: "bg-amber-50", text: "text-amber-700" },
  DEL: { bg: "bg-red-50", text: "text-red-700" },
};

const ENDPOINT_GROUPS = {
  Request: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Latency: { hex: "#d97706", bg: "bg-amber-50", text: "text-amber-600" },
  Details: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// ── SEEDED RNG ────────────────────────────────────────────────────────────────
function seededRnd(seed, min, max) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.round((x - Math.floor(x)) * (max - min) + min);
}
function smooth(arr, n = 3) {
  return arr.map((_, i) => {
    const s = arr.slice(Math.max(0, i - n), i + n + 1);
    return Math.round(s.reduce((a, b) => a + b, 0) / s.length);
  });
}

// ── PERCENTILE CHART (SVG) ────────────────────────────────────────────────────
function PercentileChart() {
  const w = 800,
    h = 220,
    padL = 44,
    padR = 12,
    padT = 8,
    padB = 24;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const pts = 24;

  const p50raw = Array.from(
    { length: pts },
    (_, i) => seededRnd(i * 7, 220, 340) + (i > 10 && i < 17 ? 60 : 0),
  );
  const p50 = smooth(p50raw);
  const p95 = smooth(
    p50.map((v, i) => Math.round(v * 1.2 + seededRnd(i * 11, 20, 60))),
  );
  const p99 = smooth(
    p95.map((v, i) => Math.round(v * 1.5 + seededRnd(i * 13, 40, 100))),
  );

  const yMax = 900;
  const toX = (i) => padL + (i / (pts - 1)) * chartW;
  const toY = (v) => padT + chartH - (Math.min(v, yMax) / yMax) * chartH;

  const makeLine = (data) =>
    data
      .map(
        (v, i) =>
          `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`,
      )
      .join(" ");
  const makeArea = (data) => {
    const line = makeLine(data);
    return `${line} L${(padL + chartW).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;
  };

  const yTicks = [0, 200, 400, 600, 800];
  const xTicks = [0, 6, 12, 18, 23];
  const sloY = toY(600);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 200 }}>
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
              {t}ms
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
        stroke="#dc2626"
        strokeWidth="1.5"
        strokeDasharray="6,4"
        opacity="0.6"
      />
      <text
        x={padL + chartW - 4}
        y={sloY - 4}
        textAnchor="end"
        fill="#dc2626"
        fontSize="9"
        opacity="0.7"
      >
        SLO 600ms
      </text>
      {/* p50 area */}
      <path d={makeArea(p50)} fill="#2563eb" opacity="0.07" />
      {/* Lines */}
      <path d={makeLine(p50)} stroke="#2563eb" strokeWidth="2" fill="none" />
      <path d={makeLine(p95)} stroke="#d97706" strokeWidth="2" fill="none" />
      <path
        d={makeLine(p99)}
        stroke="#dc2626"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4,3"
      />
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

// ── HISTOGRAM (SVG) ───────────────────────────────────────────────────────────
function HistogramChart() {
  const w = 520,
    h = 190,
    padL = 40,
    padR = 12,
    padT = 8,
    padB = 24;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const maxCount = Math.max(...HIST_COUNTS);
  const barW = chartW / HIST_COUNTS.length - 4;
  const yTicks = [0, 1000, 2000, 3000, 4000];

  const toY = (v) => padT + chartH - (v / maxCount) * chartH;
  const toX = (i) => padL + i * (chartW / HIST_COUNTS.length) + 2;

  const barColor = (i) => (i >= 7 ? "#dc2626" : i >= 5 ? "#d97706" : "#2563eb");
  const barOpacity = (i) => (i >= 7 ? 0.4 : i >= 5 ? 0.4 : 0.25);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 170 }}>
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
              {t >= 1000 ? t / 1000 + "k" : t}
            </text>
          </g>
        );
      })}
      {HIST_COUNTS.map((count, i) => {
        const x = toX(i);
        const barH = (count / maxCount) * chartH;
        const y = toY(count);
        const color = barColor(i);
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={color}
              opacity={barOpacity(i)}
              rx="3"
            />
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.min(barH, 2)}
              fill={color}
              opacity="0.9"
              rx="1"
            />
          </g>
        );
      })}
      {HIST_BUCKETS.map((label, i) => {
        const x = toX(i) + barW / 2;
        return (
          <text
            key={i}
            x={x}
            y={padT + chartH + 16}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="9"
            fontFamily="DM Mono, monospace"
          >
            {label.replace("–", "-")}
          </text>
        );
      })}
    </svg>
  );
}

// ── TENANT COMPARISON BAR (SVG horizontal) ────────────────────────────────────
function TenantBarChart() {
  const sorted = [...SLO_TENANTS].sort((a, b) => b.p95 - a.p95).slice(0, 10);
  const w = 700,
    h = 200,
    padL = 90,
    padR = 12,
    padT = 4,
    padB = 20;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const rowH = chartH / sorted.length;
  const xMax = 800;
  const xTicks = [0, 200, 400, 600, 800];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 190 }}>
      {/* X grid + labels */}
      {xTicks.map((t) => {
        const x = padL + (t / xMax) * chartW;
        return (
          <g key={t}>
            <line
              x1={x}
              y1={padT}
              x2={x}
              y2={padT + chartH}
              stroke="#e9ebf0"
              strokeWidth="1"
              opacity="0.6"
            />
            <text
              x={x}
              y={padT + chartH + 14}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="10"
              fontFamily="DM Mono, monospace"
            >
              {t}ms
            </text>
          </g>
        );
      })}
      {/* SLO line */}
      {(() => {
        const x = padL + (600 / xMax) * chartW;
        return (
          <line
            x1={x}
            y1={padT}
            x2={x}
            y2={padT + chartH}
            stroke="#dc2626"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            opacity="0.5"
          />
        );
      })()}
      {/* Bars */}
      {sorted.map((t, i) => {
        const y = padT + i * rowH + rowH * 0.2;
        const bh = rowH * 0.6;
        const barW = (t.p95 / xMax) * chartW;
        const color = t.ok ? "#2563eb" : "#dc2626";
        return (
          <g key={i}>
            <text
              x={padL - 6}
              y={y + bh / 2 + 4}
              textAnchor="end"
              fill="#1c1f2e"
              fontSize="11"
              fontFamily="DM Sans, sans-serif"
            >
              {t.name.split(" ")[0]}
            </text>
            <rect
              x={padL}
              y={y}
              width={barW}
              height={bh}
              fill={color}
              opacity={t.ok ? 0.27 : 0.27}
              rx="3"
            />
            <rect
              x={padL}
              y={y}
              width={Math.min(barW, 1.5)}
              height={bh}
              fill={color}
              opacity="0.8"
            />
            <text
              x={padL + barW + 4}
              y={y + bh / 2 + 4}
              fill={color}
              fontSize="10"
              fontFamily="DM Mono, monospace"
            >
              {t.p95}ms
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Latency() {
  const [timeRange, setTimeRange] = useState("24h");
  const [chartRange, setChartRange] = useState("24h");
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

  const stats = [
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="1.8"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      iconBg: "bg-blue-50",
      count: "284ms",
      title: "Avg Latency (p50)",
      badgeText: "p50",
      badgeBg: "bg-blue-50",
      badgeTextColor: "text-blue-600",
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d97706"
          strokeWidth="1.8"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      iconBg: "bg-amber-50",
      count: "312ms",
      countColor: "text-amber-600",
      title: "p95 Latency",
      badgeText: "p95",
      badgeBg: "bg-amber-50",
      badgeTextColor: "text-amber-600",
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dc2626"
          strokeWidth="1.8"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      iconBg: "bg-red-50",
      count: "610ms",
      countColor: "text-red-600",
      title: "p99 Latency",
      badgeText: "p99",
      badgeBg: "bg-red-50",
      badgeTextColor: "text-red-600",
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="1.8"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      iconBg: "bg-green-50",
      count: "21",
      countColor: "text-green-600",
      title: "SLO Met Tenants",
      badgeText: "Met",
      badgeBg: "bg-green-50",
      badgeTextColor: "text-green-600",
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dc2626"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      iconBg: "bg-red-50",
      count: "3",
      countColor: "text-red-600",
      title: "SLO Breached",
      badgeText: "Breached",
      badgeBg: "bg-red-50",
      badgeTextColor: "text-red-600",
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
            className="w-4 h-4 rounded-[4px] flex-shrink-0"
            style={{ background: row.color }}
          />
          <span className="text-[12.5px] text-gray-700">{row.tenant}</span>
        </div>
      ),
    },
    {
      id: "p50",
      name: "p50",
      width: 80,
      group: "Latency",
      cell: (row) => <span className="font-mono text-[12px]">{row.p50}ms</span>,
    },
    {
      id: "p95",
      name: "p95",
      width: 80,
      group: "Latency",
      cell: (row) => {
        const c =
          row.p95 > 600
            ? "text-red-600"
            : row.p95 > 400
              ? "text-amber-600"
              : "text-gray-700";
        return (
          <span className={`font-mono text-[12px] ${c}`}>{row.p95}ms</span>
        );
      },
    },
    {
      id: "p99",
      name: "p99",
      width: 80,
      group: "Latency",
      cell: (row) => (
        <span className="font-mono text-[12px] text-gray-400">{row.p99}ms</span>
      ),
    },
    {
      id: "rps",
      name: "Req/min",
      width: 80,
      group: "Details",
      cell: (row) => <span className="font-mono text-[12px]">{row.rps}</span>,
    },
    {
      id: "vsSlo",
      name: "vs SLO",
      width: 80,
      group: "Details",
      cell: (row) => {
        const diff = row.p95 - 600;
        return diff > 0 ? (
          <span className="font-mono text-[12px] text-red-600">+{diff}ms</span>
        ) : (
          <span className="font-mono text-[12px] text-green-600">{diff}ms</span>
        );
      },
    },
    {
      id: "status",
      name: "Status",
      width: 90,
      group: "Details",
      disableSortBy: true,
      cell: (row) => {
        if (row.p95 > 600) return <Badge value="Breached" variant="down" />;
        if (row.p95 > 400) return <Badge value="At risk" variant="warning" />;
        return <Badge value="OK" variant="active" />;
      },
    },
  ];

  const paginated = ENDPOINTS.slice(
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
              stroke="#2563eb"
              strokeWidth="1.8"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="Latency"
          breadcrumbs={[
            { label: "Home", href: "#" },
            { label: "Golden Signals", href: "#" },
            { label: "Latency" },
          ]}
        />
        <div className="flex items-center gap-2">
          <RangeBtns
            options={["1h", "6h", "24h", "7d", "30d"]}
            active={timeRange}
            onChange={setTimeRange}
          />
          <ActionButton action="export" label="Export" icon={ExportIcon} />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ),
              iconColor: "text-blue-600",
              count: "284ms",
              countColor: "text-blue-600",
              title: "Avg Latency (p50)",
              badgeText: "p50",
              badgeBg: "bg-blue-50",
              badgeTextColor: "text-blue-600",
            },
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ),
              iconColor: "text-amber-500",
              count: "312ms",
              countColor: "text-amber-600",
              title: "p95 Latency",
              badgeText: "p95",
              badgeBg: "bg-amber-50",
              badgeTextColor: "text-amber-600",
            },
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ),
              iconColor: "text-red-500",
              count: "610ms",
              countColor: "text-red-600",
              title: "p99 Latency",
              badgeText: "p99",
              badgeBg: "bg-red-50",
              badgeTextColor: "text-red-600",
            },
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ),
              iconColor: "text-green-600",
              count: "21",
              countColor: "text-green-600",
              title: "SLO Met Tenants",
              badgeText: "Met",
              badgeBg: "bg-green-50",
              badgeTextColor: "text-green-600",
            },
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              ),
              iconColor: "text-red-500",
              count: "3",
              countColor: "text-red-600",
              title: "SLO Breached",
              badgeText: "Breached",
              badgeBg: "bg-red-50",
              badgeTextColor: "text-red-600",
            },
          ].map((s, i) => (
            <StatCard
              key={i}
              icon={s.icon}
              iconColor={s.iconColor}
              count={s.count}
              countColor={s.countColor}
              title={s.title}
              
            />
          ))}
        </div>

        {/* Percentile Chart */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                Latency Percentiles Over Time
              </div>
              <span className="text-[12px] text-gray-400">Last 24h</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-[12px] text-gray-400">
                {[
                  { color: "#2563eb", label: "p50" },
                  { color: "#d97706", label: "p95" },
                  { color: "#dc2626", label: "p99", dash: true },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5">
                    <span
                      className="w-4 flex-shrink-0"
                      style={{
                        height: l.dash ? 0 : 3,
                        background: l.dash ? undefined : l.color,
                        borderTop: l.dash ? `2px dashed ${l.color}` : undefined,
                        borderRadius: 2,
                      }}
                    />
                    {l.label}
                  </span>
                ))}
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-4 flex-shrink-0"
                    style={{
                      height: 0,
                      borderTop: "2px dashed #dc2626",
                      opacity: 0.5,
                    }}
                  />
                  SLO 600ms
                </span>
              </div>
              <RangeBtns
                options={["6h", "24h", "7d"]}
                active={chartRange}
                onChange={setChartRange}
              />
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="mb-4">
              <div
                className="text-[24px] font-light text-gray-800 leading-none"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                312ms <span className="text-[14px] text-gray-400">p95 avg</span>
              </div>
              <div className="text-[12px] text-gray-400 mt-1">
                p50: 284ms · p99: 610ms · SLO: 600ms
              </div>
            </div>
            <PercentileChart />
          </div>
        </div>

        {/* Histogram + SLO Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Histogram */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-1.5 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="18" y="3" width="4" height="18" />
                <rect x="10" y="8" width="4" height="13" />
                <rect x="2" y="13" width="4" height="8" />
              </svg>
              Latency Distribution
            </div>
            <div className="px-5 py-4">
              <HistogramChart />
            </div>
          </div>

          {/* SLO Compliance */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div
                className="text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                SLO Compliance by Tenant
              </div>
              <Badge value="SLO: p95 < 600ms" variant="beta" />
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
              {SLO_TENANTS.map((t) => {
                const pct = Math.min(100, Math.round((t.p95 / t.slo) * 100));
                const barColor = t.ok
                  ? pct > 70
                    ? "bg-amber-500"
                    : "bg-green-500"
                  : "bg-red-500";
                const textColor = t.ok
                  ? pct > 70
                    ? "text-amber-600"
                    : "text-green-600"
                  : "text-red-600";
                return (
                  <div
                    key={t.name}
                    className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-100 last:border-b-0"
                  >
                    <div
                      className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0"
                      style={{ background: t.color }}
                    >
                      {t.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[12.5px] text-gray-700 truncate">
                          {t.name}
                        </span>
                        <span
                          className={`font-mono text-[12px] ml-2 flex-shrink-0 ${textColor}`}
                        >
                          {t.p95}ms
                        </span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {t.ok ? (
                        <Badge value="Met" variant="active" />
                      ) : (
                        <Badge value="Breached" variant="down" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Slowest Endpoints Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <Table
            columns={endpointCols}
            group={ENDPOINT_GROUPS}
            tableName="latency-endpoints"
            data={paginated}
            loading={false}
            enableSearch={false}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            pageLimit={pageLimit}
            setPageLimit={setPageLimit}
            paginationData={{
              totalCount: ENDPOINTS.length,
              totalPages: Math.ceil(ENDPOINTS.length / pageLimit) || 1,
            }}
            sortField={sortField}
            setSortField={setSortField}
            sortType={sortType}
            setSortType={setSortType}
            activeFilters={{}}
            setActiveFilters={() => {}}
            // additionalControls={
            //   <div className="flex items-center gap-2">
            //     <span className="text-[11.5px] text-gray-400">
            //       Sorted by p95 ↓
            //     </span>
            //     <button className="px-2.5 py-1 border border-gray-200 rounded-md text-[11.5px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
            //       View all
            //     </button>
            //   </div>
            // }
          />
        </div>

        {/* Tenant Latency Comparison */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <div
              className="text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Tenant Latency Comparison
            </div>
            <div className="flex items-center gap-3 text-[12px] text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-blue-500 opacity-30 inline-block" />
                Within SLO
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded-sm bg-red-500 opacity-30 inline-block" />
                Breached
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-4 inline-block"
                  style={{ borderTop: "1.5px dashed #dc2626", opacity: 0.5 }}
                />
                SLO 600ms
              </span>
              <span className="text-[11.5px] text-gray-400">
                p95 · sorted by latency ↓
              </span>
            </div>
          </div>
          <div className="px-5 py-4">
            <TenantBarChart />
          </div>
        </div>
      </div>
    </div>
  );
}
