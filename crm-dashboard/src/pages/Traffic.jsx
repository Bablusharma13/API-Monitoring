import { useState, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import { ExportIcon } from "../components/ui/Icons";

// ── DATA ──────────────────────────────────────────────────────────────────────
const METHODS = [
  { label: "GET", val: 58, color: "#2563eb" },
  { label: "POST", val: 28, color: "#16a34a" },
  { label: "PUT", val: 9, color: "#d97706" },
  { label: "DEL", val: 5, color: "#dc2626" },
];

const TENANTS = [
  { name: "Nexus Corp", color: "#2563eb", rps: 820, pct: 19 },
  { name: "Orbis Tech", color: "#7c3aed", rps: 614, pct: 14 },
  { name: "Velox Inc", color: "#16a34a", rps: 541, pct: 13 },
  { name: "Strata AI", color: "#0891b2", rps: 498, pct: 12 },
  { name: "Pulsar Labs", color: "#ea580c", rps: 387, pct: 9 },
  { name: "Delphi Sys", color: "#d97706", rps: 334, pct: 8 },
  { name: "Others (18)", color: "#9ca3af", rps: 1006, pct: 25 },
];

const ENDPOINTS = [
  {
    m: "GET",
    path: "/api/v1/contacts",
    rps: 910,
    today: "1.31M",
    pct: 22,
    size: "2.4KB",
    trend: "+8%",
  },
  {
    m: "POST",
    path: "/api/v2/deals",
    rps: 544,
    today: "783k",
    pct: 13,
    size: "4.1KB",
    trend: "+14%",
  },
  {
    m: "GET",
    path: "/api/v1/activities",
    rps: 488,
    today: "703k",
    pct: 12,
    size: "3.8KB",
    trend: "+5%",
  },
  {
    m: "PUT",
    path: "/api/v2/leads/:id",
    rps: 401,
    today: "578k",
    pct: 10,
    size: "1.9KB",
    trend: "+2%",
  },
  {
    m: "GET",
    path: "/api/v2/pipelines",
    rps: 378,
    today: "545k",
    pct: 9,
    size: "6.2KB",
    trend: "-3%",
  },
  {
    m: "POST",
    path: "/api/v2/contacts/bulk",
    rps: 290,
    today: "418k",
    pct: 7,
    size: "18KB",
    trend: "+22%",
  },
  {
    m: "GET",
    path: "/api/v1/users",
    rps: 244,
    today: "351k",
    pct: 6,
    size: "1.2KB",
    trend: "+1%",
  },
  {
    m: "DEL",
    path: "/api/v1/leads/:id",
    rps: 188,
    today: "271k",
    pct: 5,
    size: "0.4KB",
    trend: "-1%",
  },
];

const METHOD_STYLE = {
  GET: { bg: "bg-blue-50", text: "text-blue-700" },
  POST: { bg: "bg-green-50", text: "text-green-700" },
  PUT: { bg: "bg-amber-50", text: "text-amber-700" },
  DEL: { bg: "bg-red-50", text: "text-red-700" },
};

const ENDPOINT_GROUPS = {
  Method: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Volume: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Traffic: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
  Details: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// ── SEEDED RNG ────────────────────────────────────────────────────────────────
function seededRnd(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  return Math.round((x - Math.floor(x)) * (max - min) + min);
}

// ── TRAFFIC LINE CHART (SVG) ──────────────────────────────────────────────────
function TrafficChart() {
  const w = 900,
    h = 200,
    padL = 44,
    padR = 16,
    padT = 10,
    padB = 28;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const pts = 24;

  const total = Array.from({ length: pts }, (_, i) => {
    if (i < 6) return seededRnd(i * 7 + 1, 300, 800);
    if (i < 10) return seededRnd(i * 7 + 1, 2800, 4200);
    if (i < 14) return seededRnd(i * 7 + 1, 5000, 6800);
    if (i < 20) return seededRnd(i * 7 + 1, 3500, 5200);
    return seededRnd(i * 7 + 1, 1200, 2800);
  });
  const ok = total.map((v, i) =>
    Math.round(v * (0.97 + seededRnd(i * 3, 0, 100) / 5000)),
  );
  const fail = total.map((v, i) => v - ok[i]);

  const maxVal = Math.max(...total);
  const yMax = Math.ceil(maxVal / 1000) * 1000;

  const toX = (i) => padL + (i / (pts - 1)) * chartW;
  const toY = (v) => padT + chartH - (v / yMax) * chartH;

  const linePath = total
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`,
    )
    .join(" ");
  const areaPath = `${linePath} L${(padL + chartW).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;

  const yTicks = [0, 2000, 4000, 6000];
  const xTicks = [0, 6, 12, 18, 23];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 180 }}>
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
      {/* Bars */}
      {total.map((v, i) => {
        const bw = Math.max(2, chartW / pts - 3);
        const x = toX(i) - bw / 2;
        const okH = (ok[i] / yMax) * chartH;
        const failH = (fail[i] / yMax) * chartH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={toY(ok[i])}
              width={bw}
              height={okH}
              fill="#16a34a22"
              rx="1"
            />
            <rect
              x={x}
              y={toY(v)}
              width={bw}
              height={failH}
              fill="#dc262622"
              rx="1"
            />
          </g>
        );
      })}
      {/* Area */}
      <path d={areaPath} fill="#2563eb" opacity="0.06" />
      {/* Line */}
      <path d={linePath} stroke="#2563eb" strokeWidth="2.5" fill="none" />
      {/* X axis labels */}
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

// ── METHOD DONUT (SVG) ────────────────────────────────────────────────────────
function MethodDonut() {
  const total = METHODS.reduce((a, b) => a + b.val, 0);
  const cx = 70,
    cy = 70,
    r = 52,
    sw = 20;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  const arcs = METHODS.map((m) => {
    const dash = (m.val / total) * circ;
    const arc = { dash, offset, color: m.color };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex items-center gap-7">
      <div
        className="relative flex-shrink-0"
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
              stroke={METHODS[i].color + "99"}
              strokeWidth={sw}
              strokeDasharray={`${a.dash} ${circ - a.dash}`}
              strokeDashoffset={-a.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="text-[20px] text-gray-800"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            5.84M
          </div>
          <div className="text-[10px] text-gray-400">total</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2.5">
        {METHODS.map((m) => (
          <div key={m.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-[3px] flex-shrink-0"
                style={{ background: m.color }}
              />
              <span className="text-[13px] text-gray-700">{m.label}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${m.val}%`, background: m.color }}
                />
              </div>
              <span className="font-mono text-[12px] text-gray-400 min-w-[32px] text-right">
                {m.val}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HEATMAP ───────────────────────────────────────────────────────────────────
function Heatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekendFactor = [1, 1, 1, 1, 1, 0.55, 0.35];

  const baseRps = (h, seed) => {
    if (h < 6) return seededRnd(seed, 100, 400);
    if (h < 10) return seededRnd(seed, 1800, 3500);
    if (h < 14) return seededRnd(seed, 4000, 6800);
    if (h < 19) return seededRnd(seed, 3000, 5500);
    if (h < 22) return seededRnd(seed, 1500, 3000);
    return seededRnd(seed, 400, 1200);
  };

  const grid = days.map((d, di) =>
    hours.map((h, hi) =>
      Math.round(baseRps(h, di * 100 + hi * 7) * weekendFactor[di]),
    ),
  );

  const allVals = grid.flat();
  const maxV = Math.max(...allVals);

  const toColor = (v) => {
    const colors = [
      "#e0f2fe",
      "#7dd3fc",
      "#38bdf8",
      "#0ea5e9",
      "#0284c7",
      "#2563eb",
    ];
    const i = Math.min(5, Math.floor((v / maxV) * 6));
    return colors[i];
  };

  return (
    <div className="chart-scroll-x">
      <div className="min-w-[560px]">
      {/* Hour labels */}
      <div className="flex mb-1.5 pl-11">
        <div
          className="grid gap-0.5 flex-1"
          style={{ gridTemplateColumns: "repeat(24, 1fr)" }}
        >
          {hours.map((h) => (
            <div
              key={h}
              className="text-center font-mono text-[9px] text-gray-400"
            >
              {h % 3 === 0 ? h.toString().padStart(2, "0") : ""}
            </div>
          ))}
        </div>
      </div>
      {/* Rows */}
      <div className="flex flex-col gap-0.5">
        {grid.map((row, di) => (
          <div key={days[di]} className="flex items-center gap-1.5">
            <div className="w-9 text-[11px] text-gray-400 text-right flex-shrink-0">
              {days[di]}
            </div>
            <div
              className="grid gap-0.5 flex-1"
              style={{ gridTemplateColumns: "repeat(24, 1fr)" }}
            >
              {row.map((v, hi) => (
                <div
                  key={hi}
                  title={`${v.toLocaleString()} rps`}
                  className="h-5 rounded-[3px]"
                  style={{ background: toColor(v) }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] text-gray-400">
        Each cell = requests/min average for that hour. Darker = higher traffic.
      </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Traffic() {
  const [timeRange, setTimeRange] = useState("24h");
  const [chartRange, setChartRange] = useState("24h");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);
  const [query, setQuery] = useState("");

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
          stroke="#16a34a"
          strokeWidth="1.8"
        >
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      iconBg: "bg-green-50",
      count: "4.2k",
      countColor: "text-green-600",
      title: "Requests / min",
      badgeText: "Live",
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
          stroke="#2563eb"
          strokeWidth="1.8"
        >
          <path d="M18 20V10" />
          <path d="M12 20V4" />
          <path d="M6 20v-6" />
        </svg>
      ),
      iconBg: "bg-blue-50",
      count: "6.8k",
      countColor: "text-blue-600",
      title: "Peak RPS (14:00)",
      badgeText: "Today",
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
          stroke="#7c3aed"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      iconBg: "bg-purple-50",
      count: "5.84M",
       countColor: "text-purple-600",
      title: "Total Requests Today",
      badgeText: "24h",
      badgeBg: "bg-purple-50",
      badgeTextColor: "text-purple-600",
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0891b2"
          strokeWidth="1.8"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      iconBg: "bg-cyan-50",
      count: "142",
      countColor: "text-cyan-600",
      title: "Active Users",
      badgeText: "Now",
      badgeBg: "bg-cyan-50",
      badgeTextColor: "text-cyan-600",
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
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      iconBg: "bg-green-50",
      count: "+12%",
      countColor: "text-green-600",
      title: "vs Yesterday",
      badgeText: "↑ Up",
      badgeBg: "bg-green-50",
      badgeTextColor: "text-green-600",
    },
  ];

  const columns = [
    {
      id: "m",
      name: "Method",
      width: 90,
      group: "Method",
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
      width: 180,
      group: "Method",
      cell: (row) => (
        <span className="font-mono text-[12px] text-gray-800">{row.path}</span>
      ),
    },
    {
      id: "rps",
      name: "RPS",
      width: 80,
      group: "Volume",
      cell: (row) => <span className="font-mono text-[12px]">{row.rps}</span>,
    },
    {
      id: "today",
      name: "Req today",
      width: 100,
      group: "Volume",
      cell: (row) => <span className="font-mono text-[12px]">{row.today}</span>,
    },
    {
      id: "pct",
      name: "GET%",
      width: 70,
      group: "Volume",
      cell: (row) => <span className="font-mono text-[12px]">{row.pct}%</span>,
    },
    {
      id: "trafficBar",
      name: "Traffic share",
      width: 160,
      group: "Traffic",
      disableSortBy: true,
      cell: (row) => {
        const barW = Math.round((row.rps / ENDPOINTS[0].rps) * 100);
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${barW}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-gray-400">
              {row.pct}%
            </span>
          </div>
        );
      },
    },
    {
      id: "size",
      name: "Avg size",
      width: 90,
      group: "Details",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-gray-400">
          {row.size}
        </span>
      ),
    },
    {
      id: "trend",
      name: "Trend",
      width: 80,
      group: "Details",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}
        >
          {row.trend}
        </span>
      ),
    },
  ];

  const filteredEndpoints = useMemo(
    () =>
      ENDPOINTS.filter(
        (e) =>
          !query ||
          e.path.toLowerCase().includes(query.toLowerCase()) ||
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
              stroke="#16a34a"
              strokeWidth="1.8"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="Traffic"
          breadcrumbs={[
            { label: "Home", href: "#" },
            { label: "Golden Signals", href: "#" },
            { label: "Traffic" },
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
          {stats.map((s, i) => (
            <StatCard
              key={i}
              icon={s.icon}
              count={s.count}
              countColor={s.countColor}
              title={s.title}
            //   badgeText={s.badgeText}
            //   badgeBg={s.badgeBg}
            //   badgeTextColor={s.badgeTextColor}
            />
          ))}
        </div>

        {/* Main Traffic Chart */}
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
                  stroke="#16a34a"
                  strokeWidth="2"
                >
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                </svg>
                Requests per Minute
              </div>
              <span className="text-[12px] text-gray-400">Last 24h</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4">
                {[
                  { color: "#2563eb", label: "Total RPS" },
                  { color: "#16a34a", label: "Successful" },
                  { color: "#dc2626", label: "Failed" },
                ].map((l) => (
                  <div
                    key={l.label}
                    className="flex items-center gap-1.5 text-[12px] text-gray-400"
                  >
                    <div
                      className="w-3.5 h-0.5 rounded-full flex-shrink-0"
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </div>
                ))}
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
                className="text-[24px] text-gray-800 font-light leading-none"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                4.2k <span className="text-[14px] text-gray-400">req/min</span>
              </div>
              <div className="text-[12px] text-gray-400 mt-1">
                Peak 6.8k at 14:00 · Total today: 5.84M
              </div>
            </div>
            <TrafficChart />
          </div>
        </div>

        {/* Method Breakdown + Tenant Share */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Method Donut */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Requests by Method
            </div>
            <div className="px-5 py-4">
              <MethodDonut />
            </div>
          </div>

          {/* Tenant Traffic Share */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Traffic Share by Tenant
            </div>
            <div className="px-5 py-4 flex flex-col gap-2.5">
              {TENANTS.map((t) => (
                <div key={t.name} className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-[5px] flex-shrink-0"
                    style={{ background: t.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-[12.5px] text-gray-700 truncate">
                        {t.name}
                      </span>
                      <span className="font-mono text-[11.5px] text-gray-400 flex-shrink-0 ml-2">
                        {t.rps} rps · {t.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full opacity-80"
                        style={{ width: `${t.pct}%`, background: t.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Endpoints Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <Table
            columns={columns}
            group={ENDPOINT_GROUPS}
            tableName="top-endpoints"
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
            //     <span>Sorted by RPS ↓</span>
            //     <button className="px-2.5 py-1 border border-gray-200 rounded-md text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
            //       View all
            //     </button>
            //   </div>
            // }
          />
        </div>

        {/* Heatmap */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <div
              className="text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Traffic Heatmap — Requests by Hour &amp; Day
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-gray-400">
              <span>Low</span>
              <div className="flex gap-0.5">
                {["#e0f2fe", "#7dd3fc", "#38bdf8", "#0ea5e9", "#2563eb"].map(
                  (c) => (
                    <div
                      key={c}
                      className="w-3.5 h-3.5 rounded-[3px]"
                      style={{ background: c }}
                    />
                  ),
                )}
              </div>
              <span>High</span>
            </div>
          </div>
          <div className="px-6 py-5">
            <Heatmap />
          </div>
        </div>
      </div>
    </div>
  );
}
