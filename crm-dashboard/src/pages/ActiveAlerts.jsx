import { useState, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { RefreshIcon, AddIcon, AckIcon } from "../components/ui/Icons";

// ── DATA ──────────────────────────────────────────────────────────────────────
const ALERTS = [
  {
    id: "ALT-001",
    sev: "critical",
    signal: "Errors",
    title: "Magna Cloud — error rate 3.4%",
    meta: "POST /api/v2/contacts/bulk · error SLO breached",
    tenant: "Magna Cloud",
    tenantColor: "#dc2626",
    endpoint: "/api/v2/contacts/bulk",
    rule: "Error Rate > 2%",
    value: "3.4%",
    threshold: "> 2%",
    duration: "24m",
    time: "09:44 UTC",
    triggeredAgo: "24m ago",
    users: 7,
    channels: ["Slack #alerts", "PagerDuty", "Email: ops@"],
  },
  {
    id: "ALT-002",
    sev: "critical",
    signal: "Saturation",
    title: "Magna Cloud — CPU at 88%",
    meta: "prod-cluster-01 · saturation threshold exceeded",
    tenant: "Magna Cloud",
    tenantColor: "#dc2626",
    endpoint: "prod-db-cluster-01",
    rule: "CPU Saturation > 80%",
    value: "88%",
    threshold: "> 80%",
    duration: "24m",
    time: "09:44 UTC",
    triggeredAgo: "24m ago",
    users: 7,
    channels: ["Slack #infra", "PagerDuty"],
  },
  {
    id: "ALT-003",
    sev: "critical",
    signal: "Latency",
    title: "Pulsar Labs — p99 latency 1.8s",
    meta: "POST /api/v2/deals · latency SLO breached",
    tenant: "Pulsar Labs",
    tenantColor: "#ea580c",
    endpoint: "/api/v2/deals",
    rule: "p99 Latency > 1s",
    value: "1.8s",
    threshold: "> 1s",
    duration: "18m",
    time: "09:50 UTC",
    triggeredAgo: "18m ago",
    users: 9,
    channels: ["Slack #alerts", "Email: ops@"],
  },
  {
    id: "ALT-004",
    sev: "warning",
    signal: "Errors",
    title: "Velox Inc — error rate rising",
    meta: "GET /api/v1/leads · approaching SLO threshold",
    tenant: "Velox Inc",
    tenantColor: "#16a34a",
    endpoint: "/api/v1/leads",
    rule: "Error Rate > 1%",
    value: "1.2%",
    threshold: "> 1%",
    duration: "12m",
    time: "09:56 UTC",
    triggeredAgo: "12m ago",
    users: 14,
    channels: ["Slack #alerts"],
  },
  {
    id: "ALT-005",
    sev: "warning",
    signal: "Saturation",
    title: "DB Pool at 72% · prod-db-cluster-01",
    meta: "Shared connection pool · watch threshold",
    tenant: "All",
    tenantColor: "#6b7280",
    endpoint: "prod-db-cluster-01",
    rule: "DB Pool > 70%",
    value: "72%",
    threshold: "> 70%",
    duration: "18m",
    time: "09:50 UTC",
    triggeredAgo: "18m ago",
    users: 0,
    channels: ["Slack #infra"],
  },
  {
    id: "ALT-006",
    sev: "warning",
    signal: "Traffic",
    title: "Strata AI — rate limit spike",
    meta: "429 errors rising · 18% of all errors",
    tenant: "Strata AI",
    tenantColor: "#0891b2",
    endpoint: "/api/v2/contacts",
    rule: "429 Rate > 5%",
    value: "18%",
    threshold: "> 5%",
    duration: "31m",
    time: "09:37 UTC",
    triggeredAgo: "31m ago",
    users: 19,
    channels: ["Slack #alerts", "Email: dev@"],
  },
  {
    id: "ALT-007",
    sev: "warning",
    signal: "Latency",
    title: "Crest Digital — p95 latency degraded",
    meta: "p95 310ms · SLO budget at 48%",
    tenant: "Crest Digital",
    tenantColor: "#db2777",
    endpoint: "/api/v2/leads",
    rule: "p95 Latency > 250ms",
    value: "310ms",
    threshold: "> 250ms",
    duration: "44m",
    time: "09:24 UTC",
    triggeredAgo: "44m ago",
    users: 6,
    channels: ["Email: ops@"],
  },
];

const RULES = [
  {
    name: "Error Rate > 2%",
    signal: "Errors",
    cond: "rate > 2%",
    fires: 3,
    active: true,
  },
  {
    name: "p95 Latency > 600ms",
    signal: "Latency",
    cond: "p95 > 600ms",
    fires: 1,
    active: true,
  },
  {
    name: "CPU > 80%",
    signal: "Saturation",
    cond: "cpu > 80%",
    fires: 2,
    active: true,
  },
  {
    name: "DB Pool > 70%",
    signal: "Saturation",
    cond: "pool > 70%",
    fires: 1,
    active: true,
  },
  {
    name: "p99 Latency > 1s",
    signal: "Latency",
    cond: "p99 > 1s",
    fires: 1,
    active: true,
  },
  {
    name: "429 Rate > 5%",
    signal: "Traffic",
    cond: "429s > 5%",
    fires: 0,
    active: false,
  },
];

const RESOLVED = [
  {
    title: "Nexus Corp — latency spike resolved",
    sub: "p95 returned to 144ms · 6m TTR",
    time: "38m ago",
  },
  {
    title: "Auth service — 503 errors cleared",
    sub: "Infra fix deployed · 22m TTR",
    time: "1h ago",
  },
  {
    title: "Pulsar Labs — error rate normalised",
    sub: "Rolled back v2.1.4 · 11m TTR",
    time: "2h ago",
  },
  {
    title: "DB pool pressure relieved",
    sub: "Query optimisation deployed · 8m TTR",
    time: "3h ago",
  },
  {
    title: "Delphi Sys — rate limit reset",
    sub: "Quota window rolled over",
    time: "5h ago",
  },
];

const SIG_DATA = [
  { label: "Errors", val: 10, color: "#dc2626" },
  { label: "Latency", val: 7, color: "#d97706" },
  { label: "Saturation", val: 5, color: "#7c3aed" },
  { label: "Traffic", val: 3, color: "#2563eb" },
];
const sigTotal = SIG_DATA.reduce((s, d) => s + d.val, 0);

function seededRnd(seed, a, b) {
  const x = Math.sin(seed + 1) * 10000;
  return +((x - Math.floor(x)) * (b - a) + a).toFixed(2);
}

// ── VOLUME CHART (SVG) ────────────────────────────────────────────────────────
function VolumeChart() {
  const w = 700,
    h = 150,
    padL = 8,
    padR = 8,
    padT = 8,
    padB = 24;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const pts = 24;
  const crit = Array.from({ length: pts }, (_, i) =>
    Math.round(Math.abs(seededRnd(i * 7, 0, 3))),
  );
  const warn = Array.from({ length: pts }, (_, i) =>
    Math.round(Math.abs(seededRnd(i * 11, 0, 5))),
  );
  const maxV = Math.max(...crit.map((c, i) => c + warn[i]));
  const toX = (i) => padL + (i / (pts - 1)) * chartW;
  const bw = Math.max(2, chartW / pts - 4);
  const xTicks = [0, 6, 12, 18, 23];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 130 }}>
      {[0, 2, 4, 6].map((t) => {
        const y = padT + chartH - (t / (maxV || 6)) * chartH;
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
      {crit.map((c, i) => {
        const x = toX(i) - bw / 2;
        const wH = ((warn[i] || 0) / (maxV || 1)) * chartH;
        const cH = (c / (maxV || 1)) * chartH;
        const bottom = padT + chartH;
        return (
          <g key={i}>
            <rect
              x={x}
              y={bottom - wH}
              width={bw}
              height={wH}
              fill="rgba(217,119,6,.5)"
              rx="2"
            />
            <rect
              x={x}
              y={bottom - wH - cH}
              width={bw}
              height={cH}
              fill="rgba(220,38,38,.7)"
              rx="2"
            />
          </g>
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

// ── SIGNAL DONUT (SVG) ────────────────────────────────────────────────────────
function SignalDonut() {
  const cx = 65,
    cy = 65,
    r = 48,
    sw = 18;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = SIG_DATA.map((d) => {
    const dash = (d.val / sigTotal) * circ;
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
              stroke={SIG_DATA[i].color}
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
            25
          </div>
          <div className="text-[10px] text-gray-400">total today</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-0">
        {SIG_DATA.map((d) => (
          <div
            key={d.label}
            className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: d.color }}
              />
              <span className="text-[12.5px] text-gray-700">{d.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((d.val / sigTotal) * 100)}%`,
                    background: d.color,
                  }}
                />
              </div>
              <span className="font-mono text-[11.5px] text-gray-400 min-w-[18px] text-right">
                {d.val}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SPARK LINE (SVG) for drawer ───────────────────────────────────────────────
function SparkLine({ alert }) {
  const w = 380,
    h = 60;
  const pts = Array.from({ length: 24 }, (_, i) => {
    const base =
      alert.sev === "critical"
        ? parseFloat(alert.value) * 0.6
        : parseFloat(alert.value) * 0.7;
    let v = base + seededRnd(i * 7, -1, 1) * base * 0.4;
    if (i >= 21)
      v = parseFloat(alert.value) * (i === 21 ? 1.1 : i === 22 ? 1.2 : 1);
    return Math.max(0, v);
  });
  const maxV = Math.max(...pts);
  const minV = Math.min(...pts);
  const range = maxV - minV || 1;
  const toX = (i) => (i / (pts.length - 1)) * w;
  const toY = (v) => h - ((v - minV) / range) * (h - 8) - 4;
  const path = pts
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`,
    )
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const color = alert.sev === "critical" ? "#dc2626" : "#d97706";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 60 }}>
      <path d={area} fill={color} opacity="0.1" />
      <path d={path} stroke={color} strokeWidth="2" fill="none" />
    </svg>
  );
}

// ── ALERT DRAWER ──────────────────────────────────────────────────────────────
function AlertDrawer({ alert, onClose }) {
  if (!alert) return null;
  const isCrit = alert.sev === "critical";

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/30 z-[998]"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 w-[420px] h-full bg-white border-l border-gray-200 z-[999] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge
                value={isCrit ? "Critical" : "Warning"}
                variant={isCrit ? "down" : "warning"}
              />
              <span className="font-mono text-[11px] text-gray-400">
                {alert.id}
              </span>
            </div>
            <div className="text-[14px] text-gray-800 leading-snug">
              {alert.title}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors ml-3 flex-shrink-0"
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
          {/* Spark chart */}
          <div className="mb-5">
            <div className="text-[11px] text-gray-400 mb-1.5">
              Signal value — last 2h
            </div>
            <SparkLine alert={alert} />
          </div>

          {/* 4 KPI boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
            {[
              { label: "Signal", value: alert.signal, mono: false },
              { label: "Current value", value: alert.value, outfit: true },
              { label: "Threshold", value: alert.threshold, mono: true },
              { label: "Duration", value: alert.duration, mono: true },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-gray-50 rounded-lg px-3.5 py-2.5"
              >
                <div className="text-[11px] text-gray-400 mb-1">
                  {item.label}
                </div>
                <div
                  className={`${item.outfit ? "text-[18px] font-light" : item.mono ? "font-mono text-[13px]" : "text-[13px]"} text-gray-800`}
                  style={
                    item.outfit
                      ? { fontFamily: "'Outfit', sans-serif" }
                      : undefined
                  }
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Context */}
          <div className="text-[10.5px] uppercase tracking-wider text-gray-400 mb-2">
            Context
          </div>
          {[
            ["Tenant", alert.tenant],
            ["Endpoint", alert.endpoint],
            ["Triggered by", alert.rule],
            ["Triggered at", alert.time],
            [
              "Impacted users",
              alert.users > 0 ? `${alert.users} impacted` : "N/A",
            ],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0 text-[13px]"
            >
              <span className="text-gray-400">{k}</span>
              <span className="font-mono text-[12px] text-gray-700">{v}</span>
            </div>
          ))}

          {/* Channels */}
          <div className="text-[10.5px] uppercase tracking-wider text-gray-400 mt-4 mb-2">
            Notification channels
          </div>
          <div className="flex flex-col gap-0">
            {alert.channels.map((ch) => (
              <div
                key={ch}
                className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-b-0 text-[12.5px] text-gray-700"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {ch}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
            <button className="flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-[12.5px] rounded-lg hover:bg-blue-700 transition-colors">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Acknowledge
            </button>
            <button className="flex items-center justify-center py-2 border border-gray-200 text-[12.5px] text-gray-500 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors">
              View Tenant
            </button>
            <button className="flex items-center justify-center py-2 border border-gray-200 text-[12.5px] text-gray-500 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors">
              View Trace
            </button>
            <button className="flex items-center justify-center py-2 border border-red-200 text-[12.5px] text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              Silence 1h
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── ALERT CARD ────────────────────────────────────────────────────────────────
const SIG_ICON_PATH = {
  Errors: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </>
  ),
  Latency: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  Traffic: <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />,
  Saturation: (
    <>
      <path d="M18 20V10" />
      <path d="M12 20V4" />
      <path d="M6 20v-6" />
    </>
  ),
};

function AlertCard({ alert, active, onOpen }) {
  const isCrit = alert.sev === "critical";
  const barColor = isCrit ? "bg-red-500" : "bg-amber-500";
  const cardBg = isCrit ? "bg-white" : "bg-amber-50/40";

  return (
    <div
      onClick={() => onOpen(alert)}
      className={`flex items-stretch overflow-hidden border rounded-xl cursor-pointer transition-all hover:shadow-md ${cardBg} ${active ? "border-blue-500 shadow-[0_0_0_3px_rgba(37,99,235,0.08)]" : isCrit ? "border-red-200" : "border-amber-200"}`}
    >
      {/* Severity bar */}
      <div className={`w-1 flex-shrink-0 rounded-l-xl ${barColor}`} />
      {/* Body */}
      <div className="flex-1 px-4 py-3.5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge
                value={isCrit ? "Critical" : "Warning"}
                variant={isCrit ? "down" : "warning"}
              />
              <div className="flex items-center gap-1 text-[12px] text-gray-400">
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {SIG_ICON_PATH[alert.signal]}
                </svg>
                {alert.signal}
              </div>
              <span className="font-mono text-[11px] text-gray-400">
                {alert.id}
              </span>
            </div>
            <div className="text-[13.5px] text-gray-800 leading-snug">
              {alert.title}
            </div>
          </div>
          <span className="font-mono text-[11px] text-gray-400 flex-shrink-0 whitespace-nowrap">
            {alert.triggeredAgo}
          </span>
        </div>
        <div className="text-[12px] text-gray-400 mb-2.5">{alert.meta}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3.5 h-3.5 rounded-[3px] flex-shrink-0"
              style={{ background: alert.tenantColor }}
            />
            <span className="text-[11.5px] text-gray-400">{alert.tenant}</span>
          </div>
          <span className="font-mono text-[11.5px] text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded-[4px]">
            {alert.value}
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-0.5 border border-gray-200 rounded text-[11.5px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              Acknowledge
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-0.5 border border-gray-200 rounded text-[11.5px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              View trace
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-0.5 border border-red-200 rounded text-[11.5px] text-red-500 hover:bg-red-50 transition-colors"
            >
              Silence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function ActiveAlerts() {
  const [sevFilter, setSevFilter] = useState("all");
  const [signalFilter, setSignalFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [query, setQuery] = useState("");
  const [activeAlert, setActiveAlert] = useState(null);
  const [ackedAll, setAckedAll] = useState(false);

  const filtered = useMemo(
    () =>
      ALERTS.filter((a) => {
        if (sevFilter !== "all" && a.sev !== sevFilter) return false;
        if (signalFilter && a.signal !== signalFilter) return false;
        if (tenantFilter && a.tenant !== tenantFilter) return false;
        if (
          query &&
          !a.title.toLowerCase().includes(query.toLowerCase()) &&
          !a.tenant.toLowerCase().includes(query.toLowerCase()) &&
          !a.signal.toLowerCase().includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [sevFilter, signalFilter, tenantFilter, query],
  );

  const stats = [
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
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      count: "7",
      countColor: "text-red-600",
      title: "Open Alerts",
      badgeText: "▲ +3 this hour",
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
          stroke="#dc2626"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      count: "3",
      countColor: "text-red-600",
      title: "Critical",
      badgeText: "Needs immediate action",
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
          stroke="#d97706"
          strokeWidth="1.8"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
        </svg>
      ),
      count: "4",
      countColor: "text-amber-600",
      title: "Warning",
      badgeText: "Monitor closely",
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
          stroke="#16a34a"
          strokeWidth="1.8"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      count: "18",
      countColor: "text-green-600",
      title: "Resolved Today",
      badgeText: "Avg TTR: 14m",
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
          stroke="#0891b2"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      count: "14m",
      countColor: "text-cyan-600",
      title: "Avg Resolution Time",
      badgeText: "▼ −3m vs yesterday",
      badgeBg: "bg-cyan-50",
      badgeTextColor: "text-cyan-600",
    },
  ];

  const FilterPill = ({ id, label, count, color }) => (
    <button
      onClick={() => setSevFilter(id)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-[12.5px] transition-all whitespace-nowrap ${sevFilter === id ? "border-blue-600 text-blue-600 bg-blue-50" : "border-gray-200 text-gray-500 bg-white hover:border-blue-600 hover:text-blue-600"}`}
    >
      {color && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
      )}
      {label}
      {count !== undefined && (
        <span className="font-mono text-[11px]">{count}</span>
      )}
    </button>
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
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="Active Alerts"
          breadcrumbs={[
            { label: "Home", href: "#" },
            { label: "Operations", href: "#" },
            { label: "Active Alerts" },
          ]}
        />
        <div className="flex items-center gap-2">
          <ActionButton action="refresh" label="Refresh" icon={RefreshIcon} />
          <ActionButton action="save" label="Ack all" icon={AckIcon} onClick={() => setAckedAll(true)} />
          <ActionButton action="search" label="New Rule" icon={AddIcon} />
        </div>
      </div>

      <div
        className={`flex flex-col gap-5 transition-opacity ${ackedAll ? "opacity-40 pointer-events-none" : ""}`}
      >
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Volume chart */}
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
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                </svg>
                Alert Volume — Last 24h
              </div>
              <div className="flex items-center gap-3 text-[11.5px] text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-red-500 opacity-70 inline-block" />
                  Critical
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[2px] bg-amber-500 opacity-70 inline-block" />
                  Warning
                </span>
              </div>
            </div>
            <div className="px-5 py-4">
              <VolumeChart />
            </div>
          </div>

          {/* Signal donut */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Alerts by Signal
            </div>
            <div className="px-5 py-4">
              <SignalDonut />
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 min-w-[240px] focus-within:border-blue-500 transition-colors">
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search alerts, tenants, signals…"
              className="border-none outline-none text-[13px] text-gray-800 bg-transparent w-full placeholder-gray-300"
            />
          </div>
          {/* Sev pills */}
          <FilterPill id="all" label="All" count={7} />
          <FilterPill
            id="critical"
            label="Critical"
            count={3}
            color="#dc2626"
          />
          <FilterPill id="warning" label="Warning" count={4} color="#d97706" />
          {/* Signal filter */}
          <select
            value={signalFilter}
            onChange={(e) => setSignalFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12.5px] text-gray-500 outline-none cursor-pointer hover:border-blue-500 transition-colors bg-white"
          >
            <option value="">All Signals</option>
            {["Latency", "Traffic", "Errors", "Saturation"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {/* Tenant filter */}
          <select
            value={tenantFilter}
            onChange={(e) => setTenantFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12.5px] text-gray-500 outline-none cursor-pointer hover:border-blue-500 transition-colors bg-white"
          >
            <option value="">All Tenants</option>
            {[
              "Magna Cloud",
              "Pulsar Labs",
              "Velox Inc",
              "Strata AI",
              "Crest Digital",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <span className="text-[12px] text-gray-400 ml-auto">
            {filtered.length} alert{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Alert list */}
        <div className="flex flex-col gap-2.5">
          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl py-12 flex flex-col items-center gap-2">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="1.5"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              </svg>
              <div className="text-[14px] text-gray-400">
                No alerts match the current filters
              </div>
            </div>
          ) : (
            filtered.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                active={activeAlert?.id === a.id}
                onOpen={setActiveAlert}
              />
            ))
          )}
        </div>

        {/* Rules + Resolved */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Alert rules table */}
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
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M20 12h2M2 12h2M17.66 17.66l1.41 1.41M4.93 4.93l1.41 1.41" />
                </svg>
                Alert Rules
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11.5px] text-gray-400">
                  12 active rules
                </span>
                <button className="px-2.5 py-1 border border-gray-200 rounded-md text-[11.5px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                  Manage
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {[
                      "Rule name",
                      "Signal",
                      "Condition",
                      "Fires",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 h-8 text-[10.5px] font-normal text-gray-400 text-left tracking-widest uppercase whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RULES.map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      <td className="px-4 h-10 text-[13px] text-gray-800">
                        {r.name}
                      </td>
                      <td className="px-4 h-10">
                        <Badge value={r.signal} variant="default" />
                      </td>
                      <td className="px-4 h-10 font-mono text-[11.5px] text-gray-400">
                        {r.cond}
                      </td>
                      <td
                        className="px-4 h-10 font-mono text-[12px]"
                        style={{ color: r.fires > 0 ? "#dc2626" : "#9ca3af" }}
                      >
                        {r.fires}x today
                      </td>
                      <td className="px-4 h-10">
                        <Badge
                          value={r.active ? "Active" : "Paused"}
                          variant={r.active ? "active" : "default"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recently resolved */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Recently Resolved
            </div>
            <div className="px-5 py-4 flex flex-col gap-0">
              {RESOLVED.map((e, i) => (
                <div key={i} className="flex gap-3 pb-3.5 relative">
                  {i < RESOLVED.length - 1 && (
                    <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-gray-100" />
                  )}
                  <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10 bg-green-50 text-green-600">
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

      {/* Drawer */}
      {activeAlert && (
        <AlertDrawer alert={activeAlert} onClose={() => setActiveAlert(null)} />
      )}
    </div>
  );
}
