import { useState, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import SingleSelect from "../components/ui/SingleSelect";
import { ExportIcon, RefreshIcon } from "../components/ui/Icons";

// ── DATA ──────────────────────────────────────────────────────────────────────
const ROLES = [
  { label: "Developer", val: 162, color: "#2563eb" },
  { label: "Admin", val: 88, color: "#7c3aed" },
  { label: "Analyst", val: 74, color: "#0891b2" },
  { label: "Viewer", val: 62, color: "#16a34a" },
];

const TENANTS_LIST = [
  { name: "Nexus Corp", color: "#2563eb", users: 28 },
  { name: "Orbis Tech", color: "#7c3aed", users: 21 },
  { name: "Strata AI", color: "#0891b2", users: 19 },
  { name: "Aether Co", color: "#4f46e5", users: 16 },
  { name: "Velox Inc", color: "#16a34a", users: 14 },
  { name: "Delphi Sys", color: "#d97706", users: 11 },
  { name: "Solaris Tech", color: "#059669", users: 12 },
  { name: "Others", color: "#9ca3af", users: 21 },
];

const USERS_DATA = [
  {
    name: "Priya Mehta",
    init: "PM",
    color: "#7c3aed",
    tenant: "Nexus Corp",
    role: "Admin",
    calls: 4820,
    err: 0.1,
    lat: 88,
    last: "2m ago",
    online: true,
  },
  {
    name: "Rohan Sharma",
    init: "RS",
    color: "#0891b2",
    tenant: "Nexus Corp",
    role: "Developer",
    calls: 3210,
    err: 0.2,
    lat: 96,
    last: "5m ago",
    online: true,
  },
  {
    name: "Aisha Kapoor",
    init: "AK",
    color: "#16a34a",
    tenant: "Orbis Tech",
    role: "Developer",
    calls: 2890,
    err: 0.0,
    lat: 82,
    last: "8m ago",
    online: true,
  },
  {
    name: "Dev Nair",
    init: "DN",
    color: "#d97706",
    tenant: "Strata AI",
    role: "Analyst",
    calls: 2640,
    err: 0.4,
    lat: 112,
    last: "11m ago",
    online: true,
  },
  {
    name: "Kavya Reddy",
    init: "KR",
    color: "#ea580c",
    tenant: "Velox Inc",
    role: "Developer",
    calls: 2210,
    err: 1.1,
    lat: 144,
    last: "14m ago",
    online: true,
  },
  {
    name: "Aryan Gupta",
    init: "AG",
    color: "#6366f1",
    tenant: "Aether Co",
    role: "Viewer",
    calls: 1980,
    err: 0.0,
    lat: 76,
    last: "18m ago",
    online: true,
  },
  {
    name: "Meera Iyer",
    init: "MI",
    color: "#059669",
    tenant: "Solaris Tech",
    role: "Developer",
    calls: 1840,
    err: 0.2,
    lat: 92,
    last: "22m ago",
    online: true,
  },
  {
    name: "Vivek Joshi",
    init: "VJ",
    color: "#db2777",
    tenant: "Delphi Sys",
    role: "Admin",
    calls: 1660,
    err: 0.3,
    lat: 104,
    last: "31m ago",
    online: false,
  },
  {
    name: "Neha Bhat",
    init: "NB",
    color: "#2563eb",
    tenant: "Orbis Tech",
    role: "Developer",
    calls: 1420,
    err: 0.1,
    lat: 88,
    last: "44m ago",
    online: false,
  },
  {
    name: "Suresh Patel",
    init: "SP",
    color: "#7c3aed",
    tenant: "Nexus Corp",
    role: "Analyst",
    calls: 1280,
    err: 0.0,
    lat: 72,
    last: "1h ago",
    online: false,
  },
];

const SESSIONS = [
  {
    user: "Priya Mehta",
    tenant: "Nexus Corp",
    start: "10:38",
    dur: "6m 12s",
    calls: 312,
    eps: 8,
    errs: 0,
    ip: "10.0.1.42",
  },
  {
    user: "Rohan Sharma",
    tenant: "Nexus Corp",
    start: "10:35",
    dur: "9m 04s",
    calls: 244,
    eps: 6,
    errs: 2,
    ip: "10.0.1.18",
  },
  {
    user: "Aisha Kapoor",
    tenant: "Orbis Tech",
    start: "10:33",
    dur: "11m 28s",
    calls: 388,
    eps: 9,
    errs: 0,
    ip: "10.0.2.55",
  },
  {
    user: "Dev Nair",
    tenant: "Strata AI",
    start: "10:30",
    dur: "14m 02s",
    calls: 420,
    eps: 11,
    errs: 1,
    ip: "10.0.3.77",
  },
  {
    user: "Kavya Reddy",
    tenant: "Velox Inc",
    start: "10:28",
    dur: "16m 44s",
    calls: 188,
    eps: 5,
    errs: 4,
    ip: "10.0.4.33",
  },
  {
    user: "Aryan Gupta",
    tenant: "Aether Co",
    start: "10:24",
    dur: "20m 15s",
    calls: 96,
    eps: 3,
    errs: 0,
    ip: "10.0.5.11",
  },
  {
    user: "Meera Iyer",
    tenant: "Solaris Tech",
    start: "10:19",
    dur: "25m 08s",
    calls: 276,
    eps: 7,
    errs: 1,
    ip: "10.0.6.44",
  },
  {
    user: "Vivek Joshi",
    tenant: "Delphi Sys",
    start: "09:58",
    dur: "46m 30s",
    calls: 540,
    eps: 12,
    errs: 3,
    ip: "10.0.7.22",
  },
];

const USER_TABLE_GROUPS = {
  Identity: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
  Activity: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Performance: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Status: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

const SESSION_TABLE_GROUPS = {
  Identity: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
  Session: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Metrics: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
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

// ── ACTIVITY CHART (SVG) ──────────────────────────────────────────────────────
function ActivityChart() {
  const w = 700,
    h = 200,
    padL = 44,
    padR = 44,
    padT = 8,
    padB = 24;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const pts = 24;

  const rawUsers = Array.from({ length: pts }, (_, i) =>
    i < 6
      ? seededRnd(i * 7, 8, 25)
      : i < 10
        ? seededRnd(i * 7, 60, 100)
        : i < 18
          ? seededRnd(i * 7, 100, 142)
          : seededRnd(i * 7, 40, 80),
  );
  const users = smooth(rawUsers);
  const calls = users.map((u, i) => seededRnd(i * 11, u * 25, u * 35));

  const maxCalls = Math.max(...calls),
    maxUsers = 150;
  const toX = (i) => padL + (i / (pts - 1)) * chartW;
  const toCY = (v) => padT + chartH - (v / maxCalls) * chartH;
  const toUY = (v) => padT + chartH - (v / maxUsers) * chartH;

  const usersLine = users
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toUY(v).toFixed(1)}`,
    )
    .join(" ");
  const usersArea = `${usersLine} L${(padL + chartW).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;

  const xTicks = [0, 6, 12, 18, 23];
  const yTicks = [0, 1000, 2000, 3000, 4000];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 180 }}>
      {yTicks.map((t) => {
        const y = toCY((t / 4000) * maxCalls);
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
              fontFamily="DM Mono, monospace"
            >
              {t >= 1000 ? (t / 1000).toFixed(0) + "k" : t}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {calls.map((v, i) => {
        const bw = Math.max(2, chartW / pts - 4);
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
      {/* Users area + line */}
      <path d={usersArea} fill="#7c3aed18" />
      <path d={usersLine} stroke="#7c3aed" strokeWidth="2.5" fill="none" />
      {/* Right Y axis (users) */}
      {[0, 50, 100, 142].map((t) => {
        const y = toUY(t);
        return (
          <text
            key={t}
            x={padL + chartW + 5}
            y={y + 4}
            textAnchor="start"
            fill="#7c3aed"
            fontSize="10"
            fontFamily="DM Mono, monospace"
            opacity="0.7"
          >
            {t}u
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

// ── ROLE DONUT (SVG) ──────────────────────────────────────────────────────────
function RoleDonut() {
  const total = ROLES.reduce((a, b) => a + b.val, 0);
  const cx = 65,
    cy = 65,
    r = 48,
    sw = 18;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = ROLES.map((d) => {
    const dash = (d.val / total) * circ;
    const arc = { dash, offset, color: d.color };
    offset += dash;
    return arc;
  });

  return (
    <div>
      <div
        className="relative mx-auto mb-4"
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
              stroke={ROLES[i].color}
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
            386
          </div>
          <div className="text-[10px] text-gray-400">users</div>
        </div>
      </div>
      <div className="flex flex-col gap-0">
        {ROLES.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: r.color }}
              />
              <span className="text-[12.5px] text-gray-700">{r.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((r.val / total) * 100)}%`,
                    background: r.color,
                  }}
                />
              </div>
              <span className="font-mono text-[12px] text-gray-400 min-w-[24px] text-right">
                {r.val}
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
  const palette = ["#ede9fe", "#c4b5fd", "#a78bfa", "#7c3aed", "#5b21b6"];

  const baseUsers = (h, di) => {
    const wday = di < 5;
    if (!wday) return seededRnd(di * 100 + h * 7, 2, 20);
    if (h < 7) return seededRnd(di * 100 + h * 7, 1, 8);
    if (h < 9) return seededRnd(di * 100 + h * 7, 20, 50);
    if (h < 12) return seededRnd(di * 100 + h * 7, 80, 130);
    if (h < 14) return seededRnd(di * 100 + h * 7, 110, 142);
    if (h < 18) return seededRnd(di * 100 + h * 7, 90, 130);
    if (h < 20) return seededRnd(di * 100 + h * 7, 40, 80);
    return seededRnd(di * 100 + h * 7, 5, 25);
  };

  const grid = days.map((d, di) =>
    hours.map((h) =>
      Math.round(
        baseUsers(h, di) *
          (0.85 + seededRnd(di * 100 + h * 7 + 1, 0, 30) / 100),
      ),
    ),
  );
  const maxV = Math.max(...grid.flat());
  const toColor = (v) => palette[Math.min(4, Math.floor((v / maxV) * 5))];

  return (
    <div className="chart-scroll-x">
      <div className="min-w-[560px]">
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
                  title={`${v} users`}
                  className="h-5 rounded-[3px]"
                  style={{ background: toColor(v) }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2.5 text-[11px] text-gray-400">
        Each cell = avg active users for that hour. Darker = more users online.
      </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function UserActivity() {
  const [timeRange, setTimeRange] = useState("24h");
  const [tenantFilter, setTenantFilter] = useState(null);
  const [uPageIndex, setUPageIndex] = useState(0);
  const [uPageLimit, setUPageLimit] = useState(25);
  const [sPageIndex, setSPageIndex] = useState(0);
  const [sPageLimit, setSPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);

  const maxUsers = Math.max(...TENANTS_LIST.map((t) => t.users));
  const maxCalls = Math.max(...USERS_DATA.map((u) => u.calls));

  const filteredUsers = useMemo(
    () =>
      tenantFilter
        ? USERS_DATA.filter((u) => u.tenant === tenantFilter)
        : USERS_DATA,
    [tenantFilter],
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

  const stats = [
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      iconColor: "text-purple-600",
      count: "142",
      countColor: "text-purple-700",
      title: "Users Online",
      badgeText: "▲ +8 vs 1h ago",
      badgeBg: "bg-purple-50",
      badgeTextColor: "text-purple-700",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      iconColor: "text-blue-600",
      count: "386",
      countColor: "text-blue-600",
      title: "Total Users",
      badgeText: "▲ +12 this month",
      badgeBg: "bg-blue-50",
      badgeTextColor: "text-blue-600",
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
      count: "4.2k",
      countColor: "text-green-600",
      title: "Calls / min (users)",
      badgeText: "▲ +12% vs yesterday",
      badgeBg: "bg-green-50",
      badgeTextColor: "text-green-600",
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
      iconColor: "text-cyan-600",
      count: "8.4m",
      countColor: "text-cyan-600",
      title: "Avg Session Length",
      badgeText: "▲ +1.2m vs yesterday",
      badgeBg: "bg-cyan-50",
      badgeTextColor: "text-cyan-600",
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
      iconColor: "text-amber-500",
      count: "0.8%",
      countColor: "text-amber-600",
      title: "User Error Rate",
      badgeText: "▼ −0.2% vs yesterday",
      badgeBg: "bg-amber-50",
      badgeTextColor: "text-amber-600",
    },
  ];

  const userCols = [
    {
      id: "name",
      name: "User",
      width: 180,
      group: "Identity",
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium text-white flex-shrink-0"
            style={{ background: row.color }}
          >
            {row.init}
          </div>
          <div>
            <div className="text-[13px] text-gray-800">{row.name}</div>
            <div className="text-[11px] text-gray-400">{row.role}</div>
          </div>
        </div>
      ),
    },
    {
      id: "tenant",
      name: "Tenant",
      width: 140,
      group: "Identity",
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <div
            className="w-3.5 h-3.5 rounded-[3px] flex-shrink-0"
            style={{
              background:
                TENANTS_LIST.find((t) => t.name === row.tenant)?.color ||
                "#9ca3af",
            }}
          />
          <span className="text-[12.5px] text-gray-700">{row.tenant}</span>
        </div>
      ),
    },
    {
      id: "role",
      name: "Role",
      width: 100,
      group: "Identity",
      cell: (row) => <Badge value={row.role} variant="default" />,
    },
    {
      id: "calls",
      name: "Calls today",
      width: 160,
      group: "Activity",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-14 h-1 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${Math.round((row.calls / maxCalls) * 100)}%` }}
            />
          </div>
          <span className="font-mono text-[12px]">
            {row.calls.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      id: "err",
      name: "Err %",
      width: 80,
      group: "Performance",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.err > 0.5 ? "text-amber-600" : "text-gray-400"}`}
        >
          {row.err}%
        </span>
      ),
    },
    {
      id: "lat",
      name: "Avg latency",
      width: 100,
      group: "Performance",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.lat > 120 ? "text-amber-600" : "text-gray-700"}`}
        >
          {row.lat}ms
        </span>
      ),
    },
    {
      id: "last",
      name: "Last active",
      width: 90,
      group: "Status",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-gray-400">
          {row.last}
        </span>
      ),
    },
    {
      id: "online",
      name: "Status",
      width: 90,
      group: "Status",
      disableSortBy: true,
      cell: (row) => (
        <div
          className={`flex items-center gap-1.5 text-[12px] ${row.online ? "text-green-600" : "text-gray-400"}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${row.online ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}
          />
          {row.online ? "Online" : "Offline"}
        </div>
      ),
    },
  ];

  const sessionCols = [
    {
      id: "user",
      name: "User",
      width: 140,
      group: "Identity",
      cell: (row) => (
        <span className="text-[13px] text-gray-800">{row.user}</span>
      ),
    },
    {
      id: "tenant",
      name: "Tenant",
      width: 120,
      group: "Identity",
      cell: (row) => (
        <span className="text-[12.5px] text-gray-500">{row.tenant}</span>
      ),
    },
    {
      id: "start",
      name: "Session start",
      width: 100,
      group: "Session",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-gray-400">
          {row.start}
        </span>
      ),
    },
    {
      id: "dur",
      name: "Duration",
      width: 100,
      group: "Session",
      cell: (row) => <span className="font-mono text-[12px]">{row.dur}</span>,
    },
    {
      id: "calls",
      name: "API calls",
      width: 90,
      group: "Metrics",
      cell: (row) => (
        <span className="font-mono text-[12px]">
          {row.calls.toLocaleString()}
        </span>
      ),
    },
    {
      id: "eps",
      name: "Endpoints",
      width: 90,
      group: "Metrics",
      cell: (row) => <span className="font-mono text-[12px]">{row.eps}</span>,
    },
    {
      id: "errs",
      name: "Errors",
      width: 80,
      group: "Metrics",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.errs > 2 ? "text-red-600" : row.errs > 0 ? "text-amber-600" : "text-gray-400"}`}
        >
          {row.errs}
        </span>
      ),
    },
    {
      id: "ip",
      name: "IP",
      width: 110,
      group: "Session",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-gray-400">{row.ip}</span>
      ),
    },
    {
      id: "status",
      name: "Status",
      width: 80,
      group: "Metrics",
      disableSortBy: true,
      cell: () => <Badge value="Active" variant="active" />,
    },
  ];

  const uPaginated = filteredUsers.slice(
    uPageIndex * uPageLimit,
    (uPageIndex + 1) * uPageLimit,
  );
  const sPaginated = SESSIONS.slice(
    sPageIndex * sPageLimit,
    (sPageIndex + 1) * sPageLimit,
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
              stroke="#7c3aed"
              strokeWidth="1.8"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="User Activity"
          breadcrumbs={[
            { label: "Home", href: "#" },
            { label: "Entities", href: "#" },
            { label: "User Activity" },
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

        {/* Activity Chart + Role Donut */}
        <div
          className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4"
        >
          {/* Activity Chart */}
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
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Active Users & API Calls
                <span className="text-[12px] text-gray-400 font-normal">
                  / Last 24h
                </span>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-gray-400">
                {[
                  { color: "#7c3aed", label: "Active users" },
                  { color: "#2563eb", label: "API calls", bar: true },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5">
                    <span
                      className={`flex-shrink-0 ${l.bar ? "w-3.5 h-2 rounded-sm opacity-30" : "w-3.5 h-0.5 rounded-full"}`}
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="mb-4">
                <div
                  className="text-[26px] text-gray-800 font-light leading-none"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  142{" "}
                  <span className="text-[16px] text-gray-400">peak online</span>
                </div>
                <div className="text-[12px] text-gray-400 mt-1">
                  Across all 24 tenants · Last 24h
                </div>
              </div>
              <ActivityChart />
            </div>
          </div>

          {/* Role Donut */}
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
                stroke="#7c3aed"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              Users by Role
            </div>
            <div className="px-5 py-4">
              <RoleDonut />
            </div>
          </div>
        </div>

        {/* Users Table + Tenant Breakdown */}
        <div
          className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4"
        >
          {/* Users Table */}
          <div className="overflow-hidden">
            <Table
              columns={userCols}
              group={USER_TABLE_GROUPS}
              tableName="user-activity-users"
              data={uPaginated}
              loading={false}
              enableSearch={true}
              pageIndex={uPageIndex}
              setPageIndex={setUPageIndex}
              pageLimit={uPageLimit}
              setPageLimit={setUPageLimit}
              paginationData={{
                totalCount: filteredUsers.length,
                totalPages: Math.ceil(filteredUsers.length / uPageLimit) || 1,
              }}
              sortField={sortField}
              setSortField={setSortField}
              sortType={sortType}
              setSortType={setSortType}
              activeFilters={{}}
              setActiveFilters={() => {}}
              additionalControls={
                <div className="flex items-center gap-2">
                  <SingleSelect
                    value={tenantFilter}
                    onChange={(val) => {
                      setTenantFilter(val);
                      setUPageIndex(0);
                    }}
                    placeholder="All Tenants"
                    options={[
                      { value: null, label: "All Tenants" },
                      {
                        value: "Nexus Corp",
                        label: "Nexus Corp",
                        dot: "#2563eb",
                      },
                      {
                        value: "Orbis Tech",
                        label: "Orbis Tech",
                        dot: "#7c3aed",
                      },
                      {
                        value: "Strata AI",
                        label: "Strata AI",
                        dot: "#0891b2",
                      },
                      {
                        value: "Velox Inc",
                        label: "Velox Inc",
                        dot: "#16a34a",
                      },
                    ]}
                    className="border-gray-200"
                  />
                  <ActionButton action="export" label="Export" />
                </div>
              }
            />
          </div>

          {/* Tenant Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Users by Tenant
            </div>
            <div className="px-5 py-4 flex flex-col gap-2.5">
              {TENANTS_LIST.map((t) => (
                <div key={t.name} className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-[5px] flex-shrink-0"
                    style={{ background: t.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-[12.5px] text-gray-700">
                        {t.name}
                      </span>
                      <span className="font-mono text-[11.5px] text-gray-400">
                        {t.users} users
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full opacity-80"
                        style={{
                          width: `${Math.round((t.users / maxUsers) * 100)}%`,
                          background: t.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Heatmap */}
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
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              User Activity Heatmap
              <span className="text-[12px] text-gray-400 font-normal">
                / Requests by hour &amp; day
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-gray-400">
              <span>Low</span>
              <div className="flex gap-0.5">
                {["#ede9fe", "#c4b5fd", "#a78bfa", "#7c3aed", "#5b21b6"].map(
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

        {/* Recent Sessions Table */}
        <div className="overflow-hidden">
          <Table
            columns={sessionCols}
            group={SESSION_TABLE_GROUPS}
            tableName="user-activity-sessions"
            data={sPaginated}
            loading={false}
            enableSearch={true}
            pageIndex={sPageIndex}
            setPageIndex={setSPageIndex}
            pageLimit={sPageLimit}
            setPageLimit={setSPageLimit}
            paginationData={{
              totalCount: SESSIONS.length,
              totalPages: Math.ceil(SESSIONS.length / sPageLimit) || 1,
            }}
            sortField={null}
            setSortField={() => {}}
            sortType={null}
            setSortType={() => {}}
            activeFilters={{}}
            setActiveFilters={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
