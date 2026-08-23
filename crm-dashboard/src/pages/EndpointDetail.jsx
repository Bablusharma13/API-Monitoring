import { useState, useMemo } from "react";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import { ExportIcon, RefreshIcon } from "../components/ui/Icons";
import { Link, useSearchParams } from "react-router-dom";
import { useGetEndpointSummaryQuery } from "../features/tenants/hooks/query/useGetEndpointSummaryQuery";
import { useGetEndpointTenantsQuery } from "../features/tenants/hooks/query/useGetEndpointTenantsQuery";

const CODES = [
  { label: "200 OK", val: 96.2, color: "#16a34a" },
  { label: "201 Created", val: 3.6, color: "#0891b2" },
  { label: "400 Bad Req", val: 0.1, color: "#d97706" },
  { label: "404 Not Found", val: 0.08, color: "#f97316" },
  { label: "500 Server", val: 0.02, color: "#dc2626" },
];

const EVENTS = [
  {
    type: "check",
    bg: "bg-green-50",
    color: "text-green-600",
    title: "Deploy v3.2.1 — no regression",
    sub: "p95 unchanged post-deploy",
    time: "1h ago",
  },
  {
    type: "warning",
    bg: "bg-amber-50",
    color: "text-amber-600",
    title: "Latency spike at 14:22",
    sub: "Max hit 380ms · resolved in 4 min",
    time: "6h ago",
  },
  {
    type: "check",
    bg: "bg-green-50",
    color: "text-green-600",
    title: "Alert resolved — back to baseline",
    sub: "p95 returned to 144ms",
    time: "6h ago",
  },
  {
    type: "alert",
    bg: "bg-amber-50",
    color: "text-amber-600",
    title: "Auto-alert triggered",
    sub: "p95 exceeded 250ms threshold",
    time: "6h ago",
  },
  {
    type: "user",
    bg: "bg-blue-50",
    color: "text-blue-600",
    title: "New tenant onboarded",
    sub: "Pulsar Labs · 12 rps baseline",
    time: "2d ago",
  },
];

const TENANT_GROUPS = {
  Identity: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Performance: { hex: "#d97706", bg: "bg-amber-50", text: "text-amber-600" },
  Details: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

const LOG_GROUPS = {
  Request: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Response: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Context: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
};

// ── SEEDED RNG ────────────────────────────────────────────────────────────────
function seededRnd(seed, a, b) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.round((x - Math.floor(x)) * (b - a) + a);
}
function smooth(arr) {
  return arr.map((v, i) => {
    const s = arr.slice(Math.max(0, i - 2), i + 3);
    return Math.round(s.reduce((a, b) => a + b, 0) / s.length);
  });
}

// ── SIGNAL CHART (SVG) ────────────────────────────────────────────────────────
function SignalChart() {
  const w = 700,
    h = 180,
    padL = 40,
    padR = 44,
    padT = 8,
    padB = 24;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const pts = 24;

  const rawRps = Array.from({ length: pts }, (_, i) =>
    i < 6
      ? seededRnd(i * 7, 200, 500)
      : i < 10
        ? seededRnd(i * 7, 600, 900)
        : i < 18
          ? seededRnd(i * 7, 750, 1200)
          : seededRnd(i * 7, 400, 700),
  );
  const rps = smooth(rawRps);
  const p95 = smooth(
    rps.map((v, i) =>
      Math.round(80 + (v / 1200) * 120 + seededRnd(i * 11, -15, 15)),
    ),
  );
  const errors = Array.from(
    { length: pts },
    (_, i) => seededRnd(i * 13, 0, 20) / 100,
  );

  const maxRps = 1400,
    maxLat = 250,
    maxErr = 0.3;
  const toX = (i) => padL + (i / (pts - 1)) * chartW;
  const toRY = (v) => padT + chartH - (v / maxRps) * chartH;
  const toLY = (v) => padT + chartH - (v / maxLat) * chartH;

  const latLine = p95
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

  const yTicks = [0, 400, 800, 1200];
  const xTicks = [0, 6, 12, 18, 23];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 160 }}>
      {yTicks.map((t) => {
        const y = toRY(t);
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
              {t > 0 ? t + "r" : "0"}
            </text>
          </g>
        );
      })}
      {rps.map((v, i) => {
        const bw = Math.max(2, chartW / pts - 3);
        const x = toX(i) - bw / 2;
        return (
          <rect
            key={i}
            x={x}
            y={toRY(v)}
            width={bw}
            height={(v / maxRps) * chartH}
            fill="#2563eb18"
            rx="1"
          />
        );
      })}
      <path d={errArea} fill="#dc262610" />
      <path d={errLine} stroke="#dc2626" strokeWidth="1.5" fill="none" />
      <path d={latLine} stroke="#d97706" strokeWidth="2" fill="none" />
      {[0, 100, 200].map((t) => (
        <text
          key={t}
          x={padL + chartW + 5}
          y={padT + chartH - (t / maxLat) * chartH + 4}
          textAnchor="start"
          fill="#d97706"
          fontSize="10"
          fontFamily="DM Mono, monospace"
          opacity="0.7"
        >
          {t}ms
        </text>
      ))}
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
  const buckets = [
    "0–25",
    "25–50",
    "50–100",
    "100–150",
    "150–200",
    "200–300",
    "300–400",
    "400+",
  ];
  const counts = [280, 1840, 8200, 6100, 2800, 920, 180, 40];
  const w = 500,
    h = 170,
    padL = 36,
    padR = 8,
    padT = 8,
    padB = 24;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const maxC = Math.max(...counts);
  const barW = chartW / counts.length - 3;
  const toX = (i) => padL + i * (chartW / counts.length) + 1.5;
  const toY = (v) => padT + chartH - (v / maxC) * chartH;
  const barColor = (i) => (i >= 6 ? "#dc2626" : i >= 5 ? "#d97706" : "#2563eb");
  const barOp = (i) => (i >= 5 ? 0.4 : 0.25);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 140 }}>
      {[0, 2000, 4000, 6000, 8000].map((t) => {
        const y = toY(t);
        return (
          <g key={t}>
            <line
              x1={padL}
              y1={y}
              x2={padL + chartW}
              y2={y}
              stroke="#f0f2f7"
              strokeWidth="1"
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
      {counts.map((count, i) => {
        const x = toX(i);
        const barH = (count / maxC) * chartH;
        const color = barColor(i);
        return (
          <g key={i}>
            <rect
              x={x}
              y={toY(count)}
              width={barW}
              height={barH}
              fill={color}
              opacity={barOp(i)}
              rx="3"
            />
            <rect
              x={x}
              y={toY(count)}
              width={barW}
              height={Math.min(barH, 2)}
              fill={color}
              opacity="0.8"
              rx="1"
            />
          </g>
        );
      })}
      {buckets.map((label, i) => (
        <text
          key={i}
          x={toX(i) + barW / 2}
          y={padT + chartH + 16}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="9"
          fontFamily="DM Mono, monospace"
        >
          {label}
        </text>
      ))}
    </svg>
  );
}

// ── RESPONSE CODE DONUT (SVG) ─────────────────────────────────────────────────
function CodeDonut() {
  const total = CODES.reduce((a, b) => a + b.val, 0);
  const cx = 70,
    cy = 70,
    r = 52,
    sw = 20;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = CODES.map((d) => {
    const dash = (d.val / total) * circ;
    const arc = { dash, offset, color: d.color };
    offset += dash;
    return arc;
  });

  return (
    <div>
      <div
        className="relative mx-auto mb-4"
        style={{ width: 140, height: 140 }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
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
              stroke={CODES[i].color}
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
            99.9%
          </div>
          <div className="text-[10px] text-gray-400">success</div>
        </div>
      </div>
      <div className="flex flex-col gap-0">
        {CODES.map((c) => (
          <div
            key={c.label}
            className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: c.color }}
              />
              <span className="text-[12.5px] text-gray-700">{c.label}</span>
            </div>
            <span className="font-mono text-[12px] text-gray-400">
              {c.val}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── EVENT ICON ────────────────────────────────────────────────────────────────
const EventIcon = ({ type }) => {
  const icons = {
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
    alert: (
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
    user: (
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
  };
  return icons[type] || null;
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function EndpointDetail() {
  const [timeRange, setTimeRange] = useState("24h");
  const [tPageIndex, setTPageIndex] = useState(0);
  const [tPageLimit, setTPageLimit] = useState(25);
  const [lPageIndex, setLPageIndex] = useState(0);
  const [lPageLimit, setLPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const [searchParams] = useSearchParams();
  const endpoint = searchParams.get("endpoint");
  const method = searchParams.get("method");

  const { data: summary } = useGetEndpointSummaryQuery(endpoint, method);

  const sortByMap = {
    name: "tenantName",
    rps: "rps",
    p95: "p95",
    p99: "p99",
    err: "errorRate",
  };
  const { data: tenantsData, isLoading: tenantsLoading } =
    useGetEndpointTenantsQuery(
      endpoint,
      method,
      tPageIndex + 1,
      tPageLimit,
      searchInput,
      sortField ? sortByMap[sortField] : null,
      sortType,
    );

  console.log("tenant data", tenantsData);

  const tenants = useMemo(() => {
    const colors = [
      "#2563eb",
      "#7c3aed",
      "#0891b2",
      "#4f46e5",
      "#16a34a",
      "#059669",
      "#d97706",
      "#ea580c",
    ];
    return (tenantsData?.data || []).map((row, i) => ({
      ...row,
      name: row.tenantName,
      err: row.errorRate,
      color: colors[i % colors.length],
    }));
  }, [tenantsData]);

  const stats = useMemo(() => {
    if (!summary) return [];

    const formatNum = (n) => {
      if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
      if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
      return n?.toLocaleString();
    };

    return [
      {
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        ),
        iconColor: "text-blue-600",
        count: summary.requestPerMinute,
        countColor: "text-blue-600",
        title: "Requests / min",
      },
      {
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        ),
        iconColor: "text-green-600",
        count: `${summary.latency}ms`,
        countColor: "text-green-600",
        title: "Latency (p95)",
      },
      {
        icon: (
          <svg
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
        iconColor: "text-gray-600",
        count: `${summary.errorRate}%`,
        title: "Error Rate",
      },
      {
        icon: (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
        iconColor: "text-purple-600",
        count: formatNum(summary.totalRequests),
        countColor: "text-purple-600",
        title: "Total Requests",
      },
    ];
  }, [summary]);

  const tenantCols = [
    {
      id: "name",
      name: "Tenant",
      width: 160,
      group: "Identity",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-[4px] flex-shrink-0"
            style={{ background: row.color }}
          />
          <Link
            to={`/dashboard/tenants/${row._id}`}
            className="text-[12.5px] text-blue-500"
          >
            {row.name}
          </Link>
        </div>
      ),
    },
    {
      id: "rps",
      name: "RPS",
      width: 70,
      group: "Identity",
      cell: (row) => <span className="font-mono text-[12px]">{row.rps}</span>,
    },
    {
      id: "p95",
      name: "p95",
      width: 80,
      group: "Performance",
      cell: (row) => {
        const c =
          row.p95 > 300
            ? "text-red-600"
            : row.p95 > 150
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
      group: "Performance",
      cell: (row) => (
        <span className="font-mono text-[12px] text-gray-400">{row.p99}ms</span>
      ),
    },
    {
      id: "err",
      name: "Err %",
      width: 70,
      group: "Performance",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.err > 0.2 ? "text-amber-600" : "text-gray-400"}`}
        >
          {row.err}%
        </span>
      ),
    },
  ];

  return (
    <div className="container-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className="inline-flex px-3 py-1 rounded-lg font-mono text-[12px] font-medium bg-blue-50 text-blue-700">
              {method}
            </span>
            <span className="font-mono text-[18px] text-gray-800">
              {endpoint}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-gray-400">
            <Link to={"/dashboard/tenant"} className="hover:text-blue-600">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <Link
              to={"/dashboard/endpoint-explorer"}
              className="hover:text-blue-600"
            >
              Endpoints
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-gray-700">
              {method} {endpoint}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton action="refresh" label="Refresh" icon={RefreshIcon} />
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-500 hover:border-gray-300 transition-colors">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            </svg>
            Alert -CS-
          </button>
          <ActionButton action="export" label="Export -CS-" icon={ExportIcon} />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Identity Bar */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex flex-wrap">
            {[
              { label: "Full path", val: endpoint, mono: true },
              {
                label: "Last called",
                val: summary?.lastCalled?.slice(0, 10),
                mono: true,
                color: "text-green-600",
              },
              {
                label: "SLO (p95 <600ms) -CS-",
                val: "-CS-",
                badge2: true,
              },
            ].map((item, i, arr) => (
              <div
                key={item.label}
                className={`px-5 py-3.5 flex flex-col justify-center ${i < arr.length - 1 ? "border-r border-gray-200" : ""}`}
              >
                <div className="text-[11px] text-gray-400 mb-1">
                  {item.label}
                </div>
                {item.badge && <Badge value="v1" variant="default" />}
                {item.badge2 && (
                  <Badge value="Met · 96% budget left" variant="active" />
                )}
                {!item.badge && !item.badge2 && (
                  <div
                    className={`text-[13px] ${item.mono ? "font-mono text-[12.5px]" : ""} ${item.color || "text-gray-800"}`}
                  >
                    {item.val}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StatCard
              key={i}
              icon={s.icon}
              iconColor={s.iconColor}
              count={s.count}
              countColor={s.countColor}
              title={s.title}
              badgeText={s.badgeText}
              badgeBg={s.badgeBg}
              badgeTextColor={s.badgeTextColor}
            />
          ))}
        </div>

        {/* Signal Chart + Percentile Breakdown */}
        <div
          className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4"
        >
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
                  stroke="#2563eb"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                Traffic · Latency · Errors — Last 24h -CS-
              </div>
              <div className="flex items-center gap-4 text-[11.5px] text-gray-400">
                {[
                  { color: "#2563eb", label: "RPS", bar: true },
                  { color: "#d97706", label: "p95" },
                  { color: "#dc2626", label: "Err %" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5">
                    <span
                      className={`flex-shrink-0 ${l.bar ? "w-3 h-2 rounded-sm opacity-25" : "w-3 h-0.5 rounded-full"}`}
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-5 py-4">
              <SignalChart />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Latency Percentiles -CS-
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              {[
                {
                  label: "p50",
                  val: "72ms",
                  valColor: "text-green-600",
                  pct: 12,
                  barColor: "bg-green-500",
                  sub: "SLO: 600ms · 88% headroom",
                },
                {
                  label: "p95",
                  val: "144ms",
                  valColor: "text-green-600",
                  pct: 24,
                  barColor: "bg-green-500",
                  sub: "SLO target · 76% headroom",
                },
                {
                  label: "p99",
                  val: "210ms",
                  valColor: "text-amber-600",
                  pct: 35,
                  barColor: "bg-amber-400",
                  sub: "Approaching watch zone",
                },
                {
                  label: "Max (24h)",
                  val: "380ms",
                  valColor: "text-amber-600",
                  pct: 63,
                  barColor: "bg-amber-400",
                  sub: "Peak at 14:22 UTC",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] text-gray-700">
                      {item.label}
                    </span>
                    <span className={`font-mono text-[12px] ${item.valColor}`}>
                      {item.val}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.barColor}`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {item.sub}
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12.5px] text-gray-400">
                    Error budget used
                  </span>
                  <span className="font-mono text-[12px] text-green-600">
                    4%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: "4%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Table + Response Code Donut */}
        <div
          className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4"
        >
          <div className="overflow-hidden">
            <Table
              columns={tenantCols}
              group={TENANT_GROUPS}
              tableName="endpoint-tenants"
              data={tenants}
              loading={tenantsLoading}
              enableSearch={true}
              pageIndex={tPageIndex}
              setPageIndex={setTPageIndex}
              pageLimit={tPageLimit}
              setPageLimit={setTPageLimit}
              paginationData={{
                totalCount: tenantsData?.pagination.total || 0,
                totalPages: tenantsData?.pagination.totalPages || 1,
              }}
              sortField={sortField}
              setSortField={setSortField}
              sortType={sortType}
              setSortType={setSortType}
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              activeFilters={{}}
              setActiveFilters={() => {}}
              showRowNumbers={false}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Response Codes -CS-
            </div>
            <div className="px-5 py-4">
              <CodeDonut />
            </div>
          </div>
        </div>

        {/* Histogram + Event Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              Latency Distribution -CS-
            </div>
            <div className="px-5 py-4">
              <HistogramChart />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Event History -CS-
            </div>
            <div className="px-4 py-4 flex flex-col gap-0">
              {EVENTS.map((e, i) => (
                <div key={i} className="flex gap-3 pb-4 relative">
                  {i < EVENTS.length - 1 && (
                    <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-gray-100" />
                  )}
                  <div
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${e.bg} ${e.color}`}
                  >
                    <EventIcon type={e.type} />
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
      </div>
    </div>
  );
}
