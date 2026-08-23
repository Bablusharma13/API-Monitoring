import { useState, useEffect, useRef, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import { ExportIcon, RefreshIcon } from "../components/ui/Icons";

// ── DATA ──────────────────────────────────────────────────────────────────────
const TENANTS = [
  {
    name: "Magna Cloud",
    color: "#dc2626",
    cpu: 88,
    mem: 74,
    db: 91,
    net: 52,
    disk: 61,
  },
  {
    name: "Pulsar Labs",
    color: "#ea580c",
    cpu: 81,
    mem: 68,
    db: 78,
    net: 48,
    disk: 54,
  },
  {
    name: "Crest Digital",
    color: "#db2777",
    cpu: 71,
    mem: 62,
    db: 68,
    net: 41,
    disk: 47,
  },
  {
    name: "Velox Inc",
    color: "#16a34a",
    cpu: 74,
    mem: 58,
    db: 61,
    net: 44,
    disk: 38,
  },
  {
    name: "Delphi Sys",
    color: "#d97706",
    cpu: 67,
    mem: 54,
    db: 58,
    net: 39,
    disk: 42,
  },
  {
    name: "Orbis Tech",
    color: "#7c3aed",
    cpu: 61,
    mem: 51,
    db: 54,
    net: 36,
    disk: 34,
  },
  {
    name: "Nexus Corp",
    color: "#2563eb",
    cpu: 52,
    mem: 48,
    db: 38,
    net: 31,
    disk: 28,
  },
  {
    name: "Strata AI",
    color: "#0891b2",
    cpu: 48,
    mem: 44,
    db: 42,
    net: 28,
    disk: 24,
  },
];

const GAUGES = [
  {
    id: "cpu",
    label: "CPU Saturation",
    sub: "All tenants · avg",
    value: 71,
    warnAt: 80,
    statusText: "Watch — warn at 80%",
    statusColor: "text-amber-600",
  },
  {
    id: "mem",
    label: "Memory Usage",
    sub: "All tenants · avg",
    value: 58,
    warnAt: 85,
    statusText: "Normal — warn at 85%",
    statusColor: "text-blue-600",
  },
  {
    id: "db",
    label: "DB Connection Pool",
    sub: "prod-db-cluster-01",
    value: 64,
    warnAt: 70,
    statusText: "Watch — warn at 70%",
    statusColor: "text-amber-600",
  },
  {
    id: "net",
    label: "Network I/O",
    sub: "Ingress + Egress",
    value: 43,
    warnAt: 75,
    statusText: "Healthy — warn at 75%",
    statusColor: "text-green-600",
  },
];

const SAT_TABLE_GROUPS = {
  Identity: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  CPU: { hex: "#d97706", bg: "bg-amber-50", text: "text-amber-600" },
  Memory: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Resources: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
  Status: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getGaugeColor(v) {
  if (v < 33) return "#22c55e";
  if (v < 55) return "#84cc16";
  if (v < 70) return "#eab308";
  if (v < 85) return "#f97316";
  return "#ef4444";
}

function satColor(v, warn) {
  if (v >= warn) return "text-red-600";
  if (v >= warn * 0.85) return "text-amber-600";
  return "text-gray-400";
}

function SatBar({ v, warn }) {
  const color =
    v >= warn
      ? "bg-red-500"
      : v >= warn * 0.85
        ? "bg-amber-500"
        : "bg-green-500";
  return (
    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${Math.min(100, v)}%` }}
      />
    </div>
  );
}

// ── GAUGE COMPONENT (SVG half-arc) ────────────────────────────────────────────
function GaugeChart({ value, warnAt }) {
  const cx = 140,
    cy = 140,
    r = 110,
    sw = 16;
  const startAngle = Math.PI,
    total = Math.PI;
  const steps = 100;

  const segments = Array.from({ length: steps }, (_, i) => {
    const a1 = startAngle + (total * i) / steps;
    const a2 = startAngle + (total * (i + 1)) / steps;
    const x1 = cx + r * Math.cos(a1),
      y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2),
      y2 = cy + r * Math.sin(a2);
    const color = getGaugeColor(i);
    const filled = i < Math.round((steps * value) / 100);
    return { x1, y1, x2, y2, color, filled, i };
  });

  // Warn marker
  const wa = startAngle + (warnAt / 100) * total;
  const wx1 = cx + (r - sw) * Math.cos(wa),
    wy1 = cy + (r - sw) * Math.sin(wa);
  const wx2 = cx + (r + sw) * Math.cos(wa),
    wy2 = cy + (r + sw) * Math.sin(wa);

  // Needle
  const na = startAngle + (value / 100) * total;
  const nx = cx + (r - 22) * Math.cos(na),
    ny = cy + (r - 22) * Math.sin(na);

  // Ticks
  const ticks = [0, 25, 50, 75, 100];

  return (
    <svg width="200" height="120" viewBox="0 0 280 160">
      {segments.map((s, i) => (
        <path
          key={i}
          d={`M${s.x1.toFixed(2)},${s.y1.toFixed(2)} A${r},${r} 0 0,1 ${s.x2.toFixed(2)},${s.y2.toFixed(2)}`}
          stroke={s.color}
          strokeWidth={sw}
          fill="none"
          opacity={s.filled ? 1 : 0.18}
        />
      ))}
      <line
        x1={wx1.toFixed(1)}
        y1={wy1.toFixed(1)}
        x2={wx2.toFixed(1)}
        y2={wy2.toFixed(1)}
        stroke="#dc2626"
        strokeWidth="2"
        opacity="0.7"
      />
      {ticks.map((t) => {
        const a = startAngle + (t / 100) * total;
        const tx = cx + (r + 22) * Math.cos(a),
          ty = cy + (r + 22) * Math.sin(a);
        return (
          <text
            key={t}
            x={tx.toFixed(1)}
            y={(ty + 4).toFixed(1)}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="10"
            fontFamily="DM Sans, sans-serif"
          >
            {t}
          </text>
        );
      })}
      <line
        x1={cx}
        y1={cy}
        x2={nx.toFixed(2)}
        y2={ny.toFixed(2)}
        stroke="#1c1f2e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="5" fill="#1c1f2e" />
    </svg>
  );
}

// ── RESOURCE TREND LINE CHART (SVG-based) ─────────────────────────────────────
function ResourceTrendChart() {
  const pts = 48;
  const w = 800,
    h = 200,
    padL = 40,
    padR = 16,
    padT = 10,
    padB = 30;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const smooth = (arr) =>
    arr.map((v, i) => {
      const s = arr.slice(Math.max(0, i - 2), i + 3);
      return Math.round(s.reduce((a, b) => a + b, 0) / s.length);
    });

  const seededRnd = (seed, min, max) => {
    const x = Math.sin(seed) * 10000;
    return Math.round((x - Math.floor(x)) * (max - min) + min);
  };

  const cpu = smooth(
    Array.from(
      { length: pts },
      (_, i) => seededRnd(i * 7 + 1, 55, 78) + (i > 28 && i < 36 ? 12 : 0),
    ),
  );
  const mem = smooth(
    Array.from({ length: pts }, (_, i) => seededRnd(i * 11 + 2, 50, 66)),
  );
  const dbpool = smooth(
    Array.from({ length: pts }, (_, i) => seededRnd(i * 13 + 3, 55, 72)),
  );
  const net = smooth(
    Array.from({ length: pts }, (_, i) => seededRnd(i * 17 + 4, 35, 52)),
  );

  const toPath = (data) => {
    return data
      .map((v, i) => {
        const x = padL + (i / (pts - 1)) * chartW;
        const y = padT + chartH - (v / 100) * chartH;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const toArea = (data) => {
    const line = toPath(data);
    const lastX = (padL + chartW).toFixed(1);
    const firstX = padL.toFixed(1);
    const bottom = (padT + chartH).toFixed(1);
    return `${line} L${lastX},${bottom} L${firstX},${bottom} Z`;
  };

  const yTicks = [0, 25, 50, 75, 100];
  const xTicks = [0, 6, 12, 18, 24, 30, 36, 42, 47];

  const lines = [
    { data: cpu, color: "#d97706", dash: "", area: true, opacity: 0.1 },
    { data: mem, color: "#2563eb", dash: "", area: false, opacity: 0 },
    { data: dbpool, color: "#7c3aed", dash: "4,3", area: false, opacity: 0 },
    { data: net, color: "#0891b2", dash: "2,4", area: false, opacity: 0 },
  ];

  // Warn line at 80%
  const warnY = padT + chartH - (80 / 100) * chartH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 220 }}>
      {/* Grid */}
      {yTicks.map((t) => {
        const y = padT + chartH - (t / 100) * chartH;
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
              x={padL - 6}
              y={y + 4}
              textAnchor="end"
              fill="#9ca3af"
              fontSize="10"
            >
              {t}%
            </text>
          </g>
        );
      })}
      {/* Warn dashed line */}
      <line
        x1={padL}
        y1={warnY}
        x2={padL + chartW}
        y2={warnY}
        stroke="#dc2626"
        strokeWidth="1"
        strokeDasharray="4,4"
        opacity="0.5"
      />
      <text
        x={padL + chartW - 4}
        y={warnY - 3}
        textAnchor="end"
        fill="#dc2626"
        fontSize="9"
        opacity="0.7"
      >
        warn 80%
      </text>
      {/* X axis labels */}
      {xTicks.map((i) => {
        const x = padL + (i / (pts - 1)) * chartW;
        const h = Math.floor(i / 2);
        const label =
          h.toString().padStart(2, "0") + (i % 2 === 0 ? ":00" : ":30");
        return (
          <text
            key={i}
            x={x}
            y={padT + chartH + 16}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="10"
          >
            {label}
          </text>
        );
      })}
      {/* Areas */}
      {lines
        .filter((l) => l.area)
        .map((l, i) => (
          <path
            key={`area-${i}`}
            d={toArea(l.data)}
            fill={l.color}
            opacity={l.opacity}
          />
        ))}
      {/* Lines */}
      {lines.map((l, i) => (
        <path
          key={`line-${i}`}
          d={toPath(l.data)}
          stroke={l.color}
          strokeWidth={i === 3 ? 1.5 : 2}
          fill="none"
          strokeDasharray={l.dash}
        />
      ))}
    </svg>
  );
}

// ── TENANT CPU BAR CHART (SVG) ────────────────────────────────────────────────
function TenantCpuChart() {
  const w = 480,
    h = 220,
    padL = 48,
    padR = 16,
    padT = 10,
    padB = 30;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const barGroupW = chartW / TENANTS.length;
  const barW = barGroupW * 0.35;
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 220 }}>
      {yTicks.map((t) => {
        const y = padT + chartH - (t / 100) * chartH;
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
              x={padL - 5}
              y={y + 4}
              textAnchor="end"
              fill="#9ca3af"
              fontSize="10"
            >
              {t}%
            </text>
          </g>
        );
      })}
      {TENANTS.map((t, i) => {
        const cx = padL + barGroupW * i + barGroupW / 2;
        const cpuH = (t.cpu / 100) * chartH;
        const memH = (t.mem / 100) * chartH;
        const label = t.name.split(" ")[0];
        return (
          <g key={i}>
            <rect
              x={cx - barW - 1}
              y={padT + chartH - cpuH}
              width={barW}
              height={cpuH}
              fill="rgba(217,119,6,.75)"
              rx="2"
            />
            <rect
              x={cx + 1}
              y={padT + chartH - memH}
              width={barW}
              height={memH}
              fill="rgba(37,99,235,.45)"
              rx="2"
            />
            <text
              x={cx}
              y={padT + chartH + 16}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="10"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── CPU SHARE DONUT (SVG) ─────────────────────────────────────────────────────
function CpuShareDonut() {
  const data = TENANTS.slice(0, 6).map((t) => ({
    label: t.name.split(" ")[0],
    value: t.cpu,
    color: t.color,
  }));
  const total = data.reduce((a, b) => a + b.value, 0);
  const cx = 90,
    cy = 90,
    r = 60,
    sw = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  const arcs = data.map((d) => {
    const dash = (d.value / total) * circ;
    const arc = { dash, offset, color: d.color };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div
        className="relative flex-shrink-0"
        style={{ width: 180, height: 180 }}
      >
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
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
              stroke={a.color}
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
            4.2k
          </div>
          <div className="text-[10px] text-gray-400">total cores</div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {data.map((d) => (
          <div
            key={d.label}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: d.color }}
              />
              <span className="text-[12.5px] text-gray-700">{d.label}</span>
            </div>
            <div className="font-mono text-[12px] text-gray-400">
              {d.value}%{" "}
              <span className="text-gray-300">
                {((d.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Saturation() {
  const [timeRange, setTimeRange] = useState("24h");
  const [resRange, setResRange] = useState("24h");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sortField, setSortField] = useState("cpu");
  const [sortType, setSortType] = useState("desc");

  const stats = [
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
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
        </svg>
      ),
      count: "71%",
      countColor: "text-amber-600",
      title: "Avg CPU",
      badgeText: "▲ +5% vs yesterday",
      badgeBg: "bg-amber-50",
      badgeTextColor: "text-amber-600",
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
          <path d="M2 2h20v8H2z" />
          <path d="M2 14h20v8H2z" />
        </svg>
      ),
      count: "58%",
      countColor: "text-blue-600",
      title: "Avg Memory",
      badgeText: "▼ −2% vs yesterday",
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
          stroke="#7c3aed"
          strokeWidth="1.8"
        >
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      ),
      count: "64%",
      countColor: "text-purple-600",
      title: "DB Pool Usage",
      badgeText: "▲ +9% vs yesterday",
      badgeBg: "bg-amber-50",
      badgeTextColor: "text-amber-600",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0891b2"
          strokeWidth="1.8"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      ),
      count: "43%",
      countColor: "text-cyan-600",
      title: "Network I/O",
      badgeText: "▼ −3% vs yesterday",
      badgeBg: "bg-green-50",
      badgeTextColor: "text-green-600",
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
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      count: "2",
      countColor: "text-red-600",
      title: "Near-limit Tenants",
      badgeText: "▲ +1 this hour",
      badgeBg: "bg-red-50",
      badgeTextColor: "text-red-600",
    },
  ];

  const columns = [
    {
      id: "name",
      name: "Tenant",
      width: 160,
      group: "Identity",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-[18px] h-[18px] rounded-[4px] flex-shrink-0"
            style={{ background: row.color }}
          />
          <span className="text-[13px] text-gray-800">{row.name}</span>
        </div>
      ),
    },
    {
      id: "cpu",
      name: "CPU %",
      width: 90,
      group: "CPU",
      cell: (row) => (
        <span className={`font-mono text-[12px] ${satColor(row.cpu, 80)}`}>
          {row.cpu}%
        </span>
      ),
    },
    {
      id: "cpuBar",
      name: "CPU bar",
      width: 100,
      group: "CPU",
      disableSortBy: true,
      cell: (row) => <SatBar v={row.cpu} warn={80} />,
    },
    {
      id: "mem",
      name: "Memory %",
      width: 100,
      group: "Memory",
      cell: (row) => (
        <span className={`font-mono text-[12px] ${satColor(row.mem, 85)}`}>
          {row.mem}%
        </span>
      ),
    },
    {
      id: "memBar",
      name: "Mem bar",
      width: 100,
      group: "Memory",
      disableSortBy: true,
      cell: (row) => <SatBar v={row.mem} warn={85} />,
    },
    {
      id: "db",
      name: "DB Pool %",
      width: 100,
      group: "Resources",
      cell: (row) => (
        <span className={`font-mono text-[12px] ${satColor(row.db, 80)}`}>
          {row.db}%
        </span>
      ),
    },
    {
      id: "net",
      name: "Network",
      width: 90,
      group: "Resources",
      cell: (row) => (
        <span className={`font-mono text-[12px] ${satColor(row.net, 75)}`}>
          {row.net}%
        </span>
      ),
    },
    {
      id: "disk",
      name: "Disk I/O",
      width: 90,
      group: "Resources",
      cell: (row) => (
        <span className={`font-mono text-[12px] ${satColor(row.disk, 80)}`}>
          {row.disk}%
        </span>
      ),
    },
    {
      id: "status",
      name: "Status",
      width: 100,
      group: "Status",
      disableSortBy: true,
      cell: (row) => {
        const critical = row.cpu >= 85 || row.db >= 85;
        const warning = !critical && (row.cpu >= 70 || row.db >= 70);
        if (critical) return <Badge value="Critical" variant="down" />;
        if (warning) return <Badge value="Warning" variant="warning" />;
        return <Badge value="OK" variant="active" />;
      },
    },
  ];

  const sortedTenants = useMemo(() => {
    return [...TENANTS].sort((a, b) => b.cpu - a.cpu);
  }, []);

  const paginated = sortedTenants.slice(
    pageIndex * pageLimit,
    (pageIndex + 1) * pageLimit,
  );

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
              stroke="#d97706"
              strokeWidth="1.8"
            >
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-6" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="Saturation"
          breadcrumbs={[
            { label: "Home", href: "#" },
            { label: "Golden Signals", href: "#" },
            { label: "Saturation" },
          ]}
        />
        <div className="flex items-center gap-2">
          <RangeBtns
            options={["1h", "6h", "24h", "7d", "30d"]}
            active={timeRange}
            onChange={setTimeRange}
          />
          <ActionButton action="refresh" label="Refresh" icon={RefreshIcon} />
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
              badgeText={s.badgeText}
              badgeBg={s.badgeBg}
              badgeTextColor={s.badgeTextColor}
            />
          ))}
        </div>

        {/* Gauge Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAUGES.map((g) => (
            <div
              key={g.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center hover:border-gray-300 transition-colors"
            >
              <div
                className="text-[14px] text-gray-800 mb-0.5"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {g.label}
              </div>
              <div className="text-[11.5px] text-gray-400 mb-3">{g.sub}</div>
              <GaugeChart value={g.value} warnAt={g.warnAt} />
              <div
                className="text-[28px] text-gray-800 font-light mt-1.5 leading-none"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {g.value}%
              </div>
              <div className={`text-[12px] mt-1 ${g.statusColor}`}>
                {g.value >= g.warnAt ? "⚠" : "✓"} {g.statusText}
              </div>
            </div>
          ))}
        </div>

        {/* Resource Trend */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
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
                Resource Utilisation Over Time
              </div>
              <span className="text-[12px] text-gray-400">
                Last 24h · 30-min intervals
              </span>
            </div>
            <div className="flex items-center gap-2">
              <RangeBtns
                options={["6h", "24h", "48h"]}
                active={resRange}
                onChange={setResRange}
              />
              <ActionButton action="export" label="Export" icon={ExportIcon} />
            </div>
          </div>
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
              <div>
                <div
                  className="text-[26px] text-gray-800 font-light leading-none"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  71%{" "}
                  <span className="text-[16px] text-gray-400">peak CPU</span>
                </div>
                <div className="text-[12px] text-gray-400 mt-1">
                  Avg across all tenants · Last 24h
                </div>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {[
                  { color: "#d97706", dash: false, label: "CPU" },
                  { color: "#2563eb", dash: false, label: "Memory" },
                  { color: "#7c3aed", dash: true, label: "DB Pool" },
                  { color: "#0891b2", dash: true, label: "Network" },
                  {
                    color: "#dc2626",
                    dash: true,
                    label: "Warn 80%",
                    opacity: 0.5,
                  },
                ].map((l) => (
                  <div
                    key={l.label}
                    className="flex items-center gap-1.5 text-[12.5px] text-gray-400"
                  >
                    <div
                      className="w-4 h-0.5 flex-shrink-0 rounded-full"
                      style={{
                        background: l.color,
                        opacity: l.opacity || 1,
                        borderTop: l.dash ? `2px dashed ${l.color}` : undefined,
                        height: l.dash ? 0 : undefined,
                      }}
                    />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
            <ResourceTrendChart />
          </div>
        </div>

        {/* Tenant CPU Bar + CPU Share Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tenant CPU Bar */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div
                className="flex items-center gap-2 text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                >
                  <rect x="18" y="3" width="4" height="18" />
                  <rect x="10" y="8" width="4" height="13" />
                  <rect x="2" y="13" width="4" height="8" />
                </svg>
                CPU by Tenant
                <span className="text-[12px] text-gray-400 font-normal">
                  Current · sorted desc
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  CPU %
                </div>
                <div className="flex items-center gap-1.5 text-[12.5px] text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500 opacity-60" />
                  Memory %
                </div>
              </div>
            </div>
            <div className="px-5 py-4">
              <TenantCpuChart />
            </div>
          </div>

          {/* CPU Share Donut */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              CPU Share by Tenant
            </div>
            <div className="px-5 py-4">
              <CpuShareDonut />
            </div>
          </div>
        </div>

        {/* Saturation Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <Table
            columns={columns}
            group={SAT_TABLE_GROUPS}
            tableName="saturation-tenants"
            data={paginated}
            loading={false}
            enableSearch={false}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            pageLimit={pageLimit}
            setPageLimit={setPageLimit}
            paginationData={{
              totalCount: TENANTS.length,
              totalPages: Math.ceil(TENANTS.length / pageLimit) || 1,
            }}
            sortField={sortField}
            setSortField={setSortField}
            sortType={sortType}
            setSortType={setSortType}
            activeFilters={{}}
            setActiveFilters={() => {}}
            // additionalControls={
            //   <div className="flex items-center gap-2 text-[11.5px] text-gray-400">
            //     <span>Sorted by CPU ↓</span>
            //     <button className="px-2.5 py-1 border border-gray-200 rounded-md text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
            //       View all
            //     </button>
            //   </div>
            // }
          />
        </div>
      </div>
    </div>
  );
}
