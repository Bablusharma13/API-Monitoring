import { useState, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import SingleSelect from "../components/ui/SingleSelect";
import { ExportIcon, AddIcon } from "../components/ui/Icons";

// ── DATA ──────────────────────────────────────────────────────────────────────
const SLOS = [
  {
    id: "SLO-001",
    name: "Uptime SLO",
    signal: "Uptime",
    target: "99.9%",
    current: "99.98%",
    budget: 87,
    burn: 0.43,
    status: "met",
    objective: "p(uptime) ≥ 99.9%",
    window: "30 days",
    breaches: 0,
    rule: "RUL-002",
    owner: "Arjun Kumar",
    tenantBreaches: [],
  },
  {
    id: "SLO-002",
    name: "p95 Latency SLO",
    signal: "Latency",
    target: "600ms",
    current: "312ms",
    budget: 76,
    burn: 0.8,
    status: "met",
    objective: "p95 < 600ms",
    window: "30 days",
    breaches: 0,
    rule: "RUL-002",
    owner: "Arjun Kumar",
    tenantBreaches: [],
  },
  {
    id: "SLO-003",
    name: "Error Rate SLO",
    signal: "Errors",
    target: "< 2%",
    current: "0.8%",
    budget: 92,
    burn: 0.27,
    status: "met",
    objective: "error_rate < 2%",
    window: "30 days",
    breaches: 0,
    rule: "RUL-001",
    owner: "Priya Mehta",
    tenantBreaches: [],
  },
  {
    id: "SLO-004",
    name: "Throughput SLO",
    signal: "Throughput",
    target: "1.2k rps",
    current: "820 rps",
    budget: 68,
    burn: 1.1,
    status: "met",
    objective: "rps ≥ 1,200",
    window: "30 days",
    breaches: 0,
    rule: "RUL-009",
    owner: "Arjun Kumar",
    tenantBreaches: [],
  },
  {
    id: "SLO-005",
    name: "p99 Latency SLO",
    signal: "Latency",
    target: "1s",
    current: "610ms",
    budget: 18,
    burn: 3.2,
    status: "risk",
    objective: "p99 < 1,000ms",
    window: "30 days",
    breaches: 1,
    rule: "RUL-005",
    owner: "Rohan Sharma",
    tenantBreaches: ["Magna Cloud", "Pulsar Labs"],
  },
  {
    id: "SLO-006",
    name: "Enterprise Uptime",
    signal: "Uptime",
    target: "99.95%",
    current: "99.91%",
    budget: 14,
    burn: 4.1,
    status: "risk",
    objective: "p(uptime) ≥ 99.95%",
    window: "30 days",
    breaches: 2,
    rule: "RUL-002",
    owner: "Priya Mehta",
    tenantBreaches: ["Flux Systems"],
  },
  {
    id: "SLO-007",
    name: "Critical Error SLO",
    signal: "Errors",
    target: "< 0.5%",
    current: "0.8%",
    budget: 0,
    burn: 8.4,
    status: "breached",
    objective: "5xx_rate < 0.5%",
    window: "30 days",
    breaches: 3,
    rule: "RUL-001",
    owner: "Arjun Kumar",
    tenantBreaches: ["Magna Cloud", "Apex Systems", "Flux Systems"],
  },
  {
    id: "SLO-008",
    name: "Rate Limit SLO",
    signal: "Throughput",
    target: "< 5% 429",
    current: "2.1%",
    budget: 58,
    burn: 0.9,
    status: "met",
    objective: "rate_429 < 5%",
    window: "30 days",
    breaches: 0,
    rule: "RUL-007",
    owner: "Dev Nair",
    tenantBreaches: [],
  },
];

const TENANTS_COMPLIANCE = [
  {
    n: "Nexus Corp",
    c: "#2563eb",
    plan: "Enterprise",
    uptime: "99.98%",
    lat: "Met",
    err: "Met",
    thru: "Met",
    ok: 4,
  },
  {
    n: "Orbis Tech",
    c: "#7c3aed",
    plan: "Pro",
    uptime: "99.96%",
    lat: "Met",
    err: "Met",
    thru: "Met",
    ok: 4,
  },
  {
    n: "Strata AI",
    c: "#0891b2",
    plan: "Pro",
    uptime: "99.94%",
    lat: "Met",
    err: "Met",
    thru: "Met",
    ok: 4,
  },
  {
    n: "Aether Co",
    c: "#4f46e5",
    plan: "Enterprise",
    uptime: "99.97%",
    lat: "Met",
    err: "Met",
    thru: "Watch",
    ok: 3,
  },
  {
    n: "Velox Inc",
    c: "#16a34a",
    plan: "Pro",
    uptime: "99.91%",
    lat: "Watch",
    err: "Met",
    thru: "Met",
    ok: 3,
  },
  {
    n: "Delphi Sys",
    c: "#d97706",
    plan: "Starter",
    uptime: "99.88%",
    lat: "Watch",
    err: "Watch",
    thru: "Met",
    ok: 2,
  },
  {
    n: "Magna Cloud",
    c: "#dc2626",
    plan: "Enterprise",
    uptime: "99.72%",
    lat: "Breach",
    err: "Breach",
    thru: "Watch",
    ok: 0,
  },
  {
    n: "Flux Systems",
    c: "#ef4444",
    plan: "Pro",
    uptime: "99.81%",
    lat: "Watch",
    err: "Breach",
    thru: "Met",
    ok: 1,
  },
];

const INCIDENTS = [
  {
    icon: "error",
    bg: "bg-red-50",
    color: "text-red-600",
    title: "SLO-007 breached — Critical Error SLO",
    sub: "5xx rate hit 0.8% · Magna Cloud + 2 others",
    time: "2d ago",
  },
  {
    icon: "check",
    bg: "bg-green-50",
    color: "text-green-600",
    title: "SLO-002 recovered — p95 Latency SLO",
    sub: "Budget restored after infra fix",
    time: "5d ago",
  },
  {
    icon: "warning",
    bg: "bg-amber-50",
    color: "text-amber-600",
    title: "SLO-005 at risk — p99 Latency",
    sub: "Budget fell below 20% · burn rate 3.2×",
    time: "1w ago",
  },
  {
    icon: "error",
    bg: "bg-red-50",
    color: "text-red-600",
    title: "SLO-006 breached — Enterprise Uptime",
    sub: "Flux Systems · 99.81% vs 99.95% target",
    time: "2w ago",
  },
  {
    icon: "check",
    bg: "bg-green-50",
    color: "text-green-600",
    title: "SLO-001 back on track — Uptime SLO",
    sub: "Budget replenished · now at 87%",
    time: "3w ago",
  },
];

const STATUS_COLOR = { met: "#16a34a", risk: "#d97706", breached: "#dc2626" };
const SIG_COLOR = {
  Uptime: "#2563eb",
  Latency: "#d97706",
  Errors: "#dc2626",
  Throughput: "#16a34a",
  Traffic: "#0891b2",
};

const TENANT_TABLE_GROUPS = {
  Identity: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  "SLO Status": { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Overall: { hex: "#3293c3ff", bg: "bg-cyan-50", text: "text-cyan-600" },
};

// ── SEEDED RNG ────────────────────────────────────────────────────────────────
function seededRnd(seed, a, b) {
  const x = Math.sin(seed + 1) * 10000;
  return +((x - Math.floor(x)) * (b - a) + a).toFixed(3);
}
function smooth(arr) {
  return arr.map((v, i) => {
    const s = arr.slice(Math.max(0, i - 2), i + 3);
    return +(s.reduce((a, b) => a + b, 0) / s.length).toFixed(3);
  });
}

// ── BURN RATE CHART (SVG) ─────────────────────────────────────────────────────
function BurnRateChart() {
  const w = 700,
    h = 160,
    padL = 36,
    padR = 12,
    padT = 8,
    padB = 20;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const pts = 30;

  const uptimeBurn = smooth(
    Array.from({ length: pts }, (_, i) => seededRnd(i * 7, 0.2, 0.6)),
  );
  const latencyBurn = smooth(
    Array.from(
      { length: pts },
      (_, i) => seededRnd(i * 11, 0.4, 1.0) + (i > 22 ? i * 0.12 : 0),
    ),
  );
  const errorBurn = smooth(
    Array.from(
      { length: pts },
      (_, i) => seededRnd(i * 13, 0.3, 0.8) + (i > 25 ? i * 0.2 : 0),
    ),
  );

  const maxV = Math.max(...uptimeBurn, ...latencyBurn, ...errorBurn, 1);
  const toX = (i) => padL + (i / (pts - 1)) * chartW;
  const toY = (v) => padT + chartH - (Math.min(v, maxV) / maxV) * chartH;

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

  const yTicks = [0, 1, 2, 3];
  const xTicks = [0, 7, 14, 21, 29];

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
              {t}×
            </text>
          </g>
        );
      })}
      {/* Reference line at 1× */}
      <line
        x1={padL}
        y1={toY(1)}
        x2={padL + chartW}
        y2={toY(1)}
        stroke="#dc2626"
        strokeWidth="1"
        strokeDasharray="4,4"
        opacity="0.4"
      />
      <path d={makeArea(errorBurn)} fill="#dc262612" />
      <path
        d={makeLine(uptimeBurn)}
        stroke="#2563eb"
        strokeWidth="2"
        fill="none"
      />
      <path
        d={makeLine(latencyBurn)}
        stroke="#d97706"
        strokeWidth="2"
        fill="none"
      />
      <path
        d={makeLine(errorBurn)}
        stroke="#dc2626"
        strokeWidth="2"
        fill="none"
      />
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
          D{i + 1}
        </text>
      ))}
    </svg>
  );
}

// ── COMPLIANCE DONUT (SVG) ────────────────────────────────────────────────────
function ComplianceDonut() {
  const data = [
    { val: 5, color: "#16a34a" },
    { val: 2, color: "#d97706" },
    { val: 1, color: "#dc2626" },
  ];
  const total = 8;
  const cx = 75,
    cy = 75,
    r = 56,
    sw = 20;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = data.map((d) => {
    const dash = (d.val / total) * circ;
    const arc = { dash, offset, color: d.color };
    offset += dash;
    return arc;
  });
  return (
    <div className="flex items-center gap-7">
      <div
        className="relative flex-shrink-0"
        style={{ width: 150, height: 150 }}
      >
        <svg
          width="150"
          height="150"
          viewBox="0 0 150 150"
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
            className="text-[24px] text-gray-800"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            63%
          </div>
          <div className="text-[11px] text-gray-400">compliant</div>
        </div>
      </div>
      <div className="flex flex-col gap-0">
        {[
          { label: "Met", color: "#16a34a", count: "5 / 8" },
          { label: "At risk", color: "#d97706", count: "2 / 8" },
          { label: "Breached", color: "#dc2626", count: "1 / 8" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-b-0 gap-6"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-[12.5px] text-gray-700">{item.label}</span>
            </div>
            <span className="font-mono text-[12px] text-gray-400">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DRAWER BURN CHART (SVG) ───────────────────────────────────────────────────
function DrawerBurnChart({ slo }) {
  const w = 400,
    h = 80,
    padL = 32,
    padR = 8,
    padT = 4,
    padB = 16;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const pts = 30;
  const color =
    slo.budget < 15 ? "#dc2626" : slo.budget < 30 ? "#d97706" : "#16a34a";

  const remaining = smooth(
    Array.from({ length: pts }, (_, i) =>
      Math.max(
        0,
        slo.budget +
          (i / 29) * 20 -
          ((i / 29) * slo.burn * 8 + seededRnd(i * 7, -3, 3)),
      ),
    ),
  );
  const maxV = 100;
  const toX = (i) => padL + (i / (pts - 1)) * chartW;
  const toY = (v) => padT + chartH - (Math.min(v, maxV) / maxV) * chartH;
  const linePath = remaining
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`,
    )
    .join(" ");
  const areaPath = `${linePath} L${(padL + chartW).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 60 }}>
      {[0, 50, 100].map((t) => {
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
              x={padL - 3}
              y={y + 4}
              textAnchor="end"
              fill="#9ca3af"
              fontSize="9"
            >
              {t}%
            </text>
          </g>
        );
      })}
      <path d={areaPath} fill={color} opacity="0.1" />
      <path d={linePath} stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

// ── STATUS BADGE COMPONENT ────────────────────────────────────────────────────
function SLOStatusBadge({ status }) {
  if (status === "met") return <Badge value="Met" variant="active" />;
  if (status === "risk") return <Badge value="At risk" variant="warning" />;
  if (status === "breached") return <Badge value="Breached" variant="down" />;
  return null;
}

function StatusCell({ v }) {
  if (v === "Met") return <Badge value="Met" variant="active" />;
  if (v === "Watch") return <Badge value="Watch" variant="warning" />;
  if (v === "Breach") return <Badge value="Breach" variant="down" />;
  return <span>{v}</span>;
}

// ── SLO CARD ──────────────────────────────────────────────────────────────────
function SLOCard({ slo, isActive, onClick }) {
  const budgetColor =
    slo.budget < 15 ? "#dc2626" : slo.budget < 30 ? "#d97706" : "#16a34a";
  const burnColor =
    slo.burn > 3 ? "#dc2626" : slo.burn > 1.5 ? "#d97706" : "#16a34a";

  const cardBg =
    slo.status === "breached"
      ? "bg-red-50/30"
      : slo.status === "risk"
        ? "bg-amber-50/20"
        : "bg-white";
  const borderColor = isActive
    ? "border-blue-500 shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
    : slo.status === "breached"
      ? "border-red-200"
      : slo.status === "risk"
        ? "border-amber-200"
        : "border-gray-200 hover:border-gray-300";

  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-xl overflow-hidden cursor-pointer transition-all ${cardBg} ${borderColor}`}
    >
      {/* Status bar */}
      <div className="h-[3px] w-full" />
      <div className="p-4 pb-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: SIG_COLOR[slo.signal] || "#9ca3af" }}
              />
              <span className="text-[11px] text-gray-400">{slo.signal}</span>
              <span className="font-mono text-[11px] text-gray-300">
                {slo.id}
              </span>
            </div>
            <div className="text-[13.5px] text-gray-800">{slo.name}</div>
          </div>
          <SLOStatusBadge status={slo.status} />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
          {[
            { val: slo.target, label: "Target", color: "text-gray-800" },
            {
              val: slo.current,
              label: "Current",
              color: `text-[${STATUS_COLOR[slo.status]}]`,
            },
            { val: `${slo.burn}×`, label: "Burn rate", color: "" },
          ].map((m, i) => (
            <div key={i} className="bg-gray-50 rounded-lg px-2.5 py-2">
              <div
                className="text-[16px] font-light leading-none mb-0.5"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color:
                    i === 1
                      ? STATUS_COLOR[slo.status]
                      : i === 2
                        ? burnColor
                        : "#1c1f2e",
                }}
              >
                {m.val}
              </div>
              <div className="text-[10.5px] text-gray-400">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Budget bar */}
        <div className="flex justify-between mb-1.5 text-[12px]">
          <span className="text-gray-400">Error budget</span>
          <span className="font-mono" style={{ color: budgetColor }}>
            {slo.budget}% remaining
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${slo.budget}%`, background: budgetColor }}
          />
        </div>

        {/* Tenant breaches */}
        {slo.tenantBreaches.length > 0 && (
          <div className="text-[11px] text-red-600 mt-2">
            {slo.tenantBreaches.length} tenant
            {slo.tenantBreaches.length > 1 ? "s" : ""} breaching:{" "}
            {slo.tenantBreaches.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}

// ── DRAWER ────────────────────────────────────────────────────────────────────
function SLODrawer({ slo, onClose }) {
  if (!slo) return null;
  const budgetColor =
    slo.budget < 15 ? "#dc2626" : slo.budget < 30 ? "#d97706" : "#16a34a";
  const burnColor =
    slo.burn > 3
      ? "text-red-600"
      : slo.burn > 1.5
        ? "text-amber-600"
        : "text-green-600";

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/30 z-[998]"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 w-[440px] h-full bg-white border-l border-gray-200 z-[999] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <SLOStatusBadge status={slo.status} />
              <span className="font-mono text-[11.5px] text-gray-400">
                {slo.id}
              </span>
            </div>
            <div className="text-[14.5px] text-gray-800">{slo.name}</div>
            <div className="text-[11.5px] text-gray-400 mt-0.5">
              {slo.signal} · {slo.window}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors ml-2 flex-shrink-0"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Budget gauge */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-[12.5px] text-gray-700">
                Error budget remaining
              </span>
              <span
                className="text-[18px] font-light"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color: budgetColor,
                }}
              >
                {slo.budget}%
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${slo.budget}%`, background: budgetColor }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[11px] text-gray-400">
                Budget used: {100 - slo.budget}%
              </span>
              <span className="text-[11px] text-gray-400">
                Resets in {30 - Math.round(slo.burn * 5)} days
              </span>
            </div>
          </div>

          {/* Drawer burn chart */}
          <div className="mb-5">
            <div className="text-[11px] text-gray-400 mb-2">
              Error budget burn rate — last 30d
            </div>
            <DrawerBurnChart slo={slo} />
          </div>

          {/* Key stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
            {[
              { label: "Target", value: slo.target, color: "text-gray-800" },
              {
                label: "Current (30d)",
                value: slo.current,
                color: ``,
                style: { color: STATUS_COLOR[slo.status] },
              },
              { label: "Burn rate", value: `${slo.burn}×`, color: burnColor },
              {
                label: "Signal",
                value: slo.signal,
                color: "text-gray-700",
                small: true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-gray-50 rounded-lg px-3.5 py-2.5"
              >
                <div className="text-[11px] text-gray-400 mb-1">
                  {item.label}
                </div>
                <div
                  className={`text-[18px] font-light leading-none ${item.color} ${item.small ? "text-[13px]" : ""}`}
                  style={{
                    fontFamily: item.small ? undefined : "'Outfit', sans-serif",
                    ...item.style,
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="text-[10.5px] uppercase tracking-wider text-gray-400 mb-2">
            Details
          </div>
          {[
            ["Objective", slo.objective],
            ["Window", slo.window],
            ["Breaches (30d)", String(slo.breaches)],
            ["Alert rule", slo.rule],
            ["Owner", slo.owner],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0 text-[13px]"
            >
              <span className="text-gray-400">{k}</span>
              <span className="font-mono text-[12px] text-gray-700">{v}</span>
            </div>
          ))}

          {/* Tenants breaching */}
          {slo.tenantBreaches.length > 0 && (
            <div className="mt-5">
              <div className="text-[10.5px] uppercase tracking-wider text-gray-400 mb-2">
                Tenants breaching this SLO
              </div>
              {slo.tenantBreaches.map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-b-0 text-[13px] text-gray-800"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {t}
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
            <button className="flex items-center justify-center py-2 bg-blue-600 text-white text-[12.5px] rounded-lg hover:bg-blue-700 transition-colors">
              Edit SLO
            </button>
            <button className="flex items-center justify-center py-2 border border-gray-200 text-[12.5px] text-gray-500 rounded-lg hover:border-gray-300 transition-colors">
              View History
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function SLODashboard() {
  const [period, setPeriod] = useState("30d");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sigFilter, setSigFilter] = useState(null);
  const [query, setQuery] = useState("");
  const [activeSLO, setActiveSLO] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);

  const filteredSLOs = useMemo(
    () =>
      SLOS.filter((s) => {
        if (statusFilter === "met" && s.status !== "met") return false;
        if (statusFilter === "risk" && s.status !== "risk") return false;
        if (statusFilter === "breached" && s.status !== "breached")
          return false;
        if (sigFilter && s.signal !== sigFilter) return false;
        if (
          query &&
          !s.name.toLowerCase().includes(query.toLowerCase()) &&
          !s.signal.toLowerCase().includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [statusFilter, sigFilter, query],
  );

  const tenantColumns = [
    {
      id: "name",
      name: "Tenant",
      width: 160,
      group: "Identity",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-[4px] flex-shrink-0"
            style={{ background: row.c }}
          />
          <span className="text-[13px] text-gray-800">{row.n}</span>
        </div>
      ),
    },
    {
      id: "plan",
      name: "Plan",
      width: 100,
      group: "Identity",
      cell: (row) => <Badge value={row.plan} variant="default" />,
    },
    {
      id: "uptime",
      name: "Uptime SLO",
      width: 140,
      group: "SLO Status",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <StatusCell v={row.lat} />
          <span className="font-mono text-[11px] text-gray-400">
            {row.uptime}
          </span>
        </div>
      ),
    },
    {
      id: "lat",
      name: "Latency SLO",
      width: 110,
      group: "SLO Status",
      cell: (row) => <StatusCell v={row.lat} />,
    },
    {
      id: "err",
      name: "Error SLO",
      width: 110,
      group: "SLO Status",
      cell: (row) => <StatusCell v={row.err} />,
    },
    {
      id: "thru",
      name: "Throughput",
      width: 110,
      group: "SLO Status",
      cell: (row) => <StatusCell v={row.thru} />,
    },
    {
      id: "ok",
      name: "Overall",
      width: 110,
      group: "Overall",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-11 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round((row.ok / 4) * 100)}%`,
                background:
                  row.ok === 4
                    ? "#16a34a"
                    : row.ok >= 2
                      ? "#d97706"
                      : "#dc2626",
              }}
            />
          </div>
          <span className="font-mono text-[11.5px] text-gray-400">
            {row.ok}/4
          </span>
        </div>
      ),
    },
  ];

  const paginated = TENANTS_COMPLIANCE.slice(
    pageIndex * pageLimit,
    (pageIndex + 1) * pageLimit,
  );

  const incidentIcons = {
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
      </svg>
    ),
  };

  const RangeBtns = () => (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
      {["7d", "30d", "90d"].map((p) => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={`px-3 py-1 text-[12px] border-r last:border-r-0 border-gray-200 transition-colors ${period === p ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
        >
          {p}
        </button>
      ))}
    </div>
  );

  const stats = [
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
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
      count: "8",
      countColor: "text-blue-600",
      title: "Total SLOs",
      badgeText: "Across 4 signals",
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
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      count: "5",
      countColor: "text-green-600",
      title: "SLOs On Track",
      badgeText: "63% healthy",
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
          stroke="#d97706"
          strokeWidth="1.8"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
      ),
      count: "2",
      countColor: "text-amber-600",
      title: "At Risk",
      badgeText: "Budget < 20%",
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
          stroke="#dc2626"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      count: "1",
      countColor: "text-red-600",
      title: "SLOs Breached",
      badgeText: "▲ +1 this week",
      badgeBg: "bg-red-50",
      badgeTextColor: "text-red-600",
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
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      count: "74%",
      countColor: "text-cyan-600",
      title: "Avg Budget Left",
      badgeText: "▲ +3% vs last period",
      badgeBg: "bg-cyan-50",
      badgeTextColor: "text-cyan-600",
    },
  ];

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
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="SLO Dashboard"
          breadcrumbs={[
            { label: "Home", href: "#" },
            { label: "Entities", href: "#" },
            { label: "SLO Dashboard" },
          ]}
        />
        <div className="flex items-center gap-2">
          <RangeBtns />
          <ActionButton action="export" label="Export" icon={ExportIcon} />
          <ActionButton action="search" label="New SLO" icon={AddIcon} />
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

        {/* Burn rate chart + Compliance donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  stroke="#d97706"
                  strokeWidth="2"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                </svg>
                Error Budget Burn Rate — Last 30 Days
              </div>
              <div className="flex items-center gap-4 text-[11.5px] text-gray-400">
                {[
                  { color: "#2563eb", label: "Uptime" },
                  { color: "#d97706", label: "Latency" },
                  { color: "#dc2626", label: "Errors" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-0.5 rounded-full flex-shrink-0"
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-5 py-4">
              <BurnRateChart />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Overall Compliance
            </div>
            <div className="px-5 py-4">
              <ComplianceDonut />
            </div>
          </div>
        </div>

        {/* Filter + SLO Cards */}
        <div className="flex flex-col gap-4">
          {/* Filter bar */}
          <div className="flex bg-white items-center gap-2 border border-gray-200 rounded-xl p-2">
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-white min-w-[220px]">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c2c8d4"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search SLOs…"
                className="border-none outline-none text-[13px] text-gray-800 bg-transparent w-full placeholder-gray-300"
              />
            </div>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
              {[
                { id: "all", label: "All 8" },
                { id: "met", label: "Met", dot: "#16a34a" },
                { id: "risk", label: "At risk", dot: "#d97706" },
                { id: "breached", label: "Breached", dot: "#dc2626" },
              ].map(({ id, label, dot }) => (
                <button
                  key={id}
                  onClick={() => setStatusFilter(id)}
                  className={`px-3 py-1 text-[12px] flex items-center gap-1.5 border-r last:border-r-0 border-gray-200 transition-colors ${statusFilter === id ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                >
                  {dot && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background:
                          statusFilter === id ? "rgba(255,255,255,0.7)" : dot,
                      }}
                    />
                  )}
                  {label}
                </button>
              ))}
            </div>
            <SingleSelect
              value={sigFilter}
              onChange={setSigFilter}
              placeholder="All Signals"
              options={[
                { value: null, label: "All Signals" },
                { value: "Uptime", label: "Uptime", dot: "#2563eb" },
                { value: "Latency", label: "Latency", dot: "#d97706" },
                { value: "Errors", label: "Errors", dot: "#dc2626" },
                { value: "Throughput", label: "Throughput", dot: "#16a34a" },
              ]}
              className="max-w-[140px] border-gray-200"
            />
            <span className="text-[12px] text-gray-400 ml-auto">
              {filteredSLOs.length} SLO{filteredSLOs.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* SLO Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredSLOs.map((slo) => (
              <SLOCard
                key={slo.id}
                slo={slo}
                isActive={activeSLO?.id === slo.id}
                onClick={() =>
                  setActiveSLO(activeSLO?.id === slo.id ? null : slo)
                }
              />
            ))}
            {filteredSLOs.length === 0 && (
              <div className="col-span-2 py-12 text-center text-gray-400 text-[13px]">
                No SLOs match your filters
              </div>
            )}
          </div>
        </div>

        {/* Tenant Compliance Table */}
        <div className="overflow-hidden">
          <Table
            columns={tenantColumns}
            group={TENANT_TABLE_GROUPS}
            tableName="slo-tenant-compliance"
            data={paginated}
            loading={false}
            enableSearch={true}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            pageLimit={pageLimit}
            setPageLimit={setPageLimit}
            paginationData={{
              totalCount: TENANTS_COMPLIANCE.length,
              totalPages: Math.ceil(TENANTS_COMPLIANCE.length / pageLimit) || 1,
            }}
            sortField={sortField}
            setSortField={setSortField}
            sortType={sortType}
            setSortType={setSortType}
            activeFilters={{}}
            setActiveFilters={() => {}}
            additionalControls={
              <span className="text-[11.5px] text-gray-400">30-day window</span>
            }
          />
        </div>

        {/* Incident History */}
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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              SLO Breach History
            </div>
            <button className="px-2.5 py-1 border border-gray-200 rounded-md text-[11.5px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
              Full history
            </button>
          </div>
          <div className="px-5 py-4 flex flex-col gap-0">
            {INCIDENTS.map((e, i) => (
              <div key={i} className="flex gap-3 pb-3.5 relative">
                {i < INCIDENTS.length - 1 && (
                  <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-gray-100" />
                )}
                <div
                  className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${e.bg} ${e.color}`}
                >
                  {incidentIcons[e.icon]}
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

      {/* Drawer */}
      {activeSLO && (
        <SLODrawer slo={activeSLO} onClose={() => setActiveSLO(null)} />
      )}
    </div>
  );
}
