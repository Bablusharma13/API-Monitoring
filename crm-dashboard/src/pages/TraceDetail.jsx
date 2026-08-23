import { useState } from "react";
import { Badge } from "../components/ui/Badge";
import { ActionButton } from "../components/ui/ActionButton";
import {
  AlertIcon,
  BellIcon,
  ExportIcon,
  ShareIcon,
} from "../components/ui/Icons";
import { StatCard } from "../components/ui/StatCard3";
import { Section } from "../components/ui/Section";

// ── DATA ──────────────────────────────────────────────────────────────────────
const TOTAL = 488;

const SERVICES = {
  "API Gateway": { color: "#2563eb", bg: "#eff4ff" },
  Auth: { color: "#7c3aed", bg: "#f5f3ff" },
  "CRM API": { color: "#16a34a", bg: "#f0fdf4" },
  Database: { color: "#d97706", bg: "#fffbeb" },
  Cache: { color: "#0891b2", bg: "#ecfeff" },
  Queue: { color: "#ea580c", bg: "#fff7ed" },
};

const SPANS = [
  {
    id: "s01",
    name: "POST /api/v2/deals",
    service: "API Gateway",
    op: "http.server",
    start: 0,
    dur: 488,
    depth: 0,
    error: false,
    slow: true,
  },
  {
    id: "s02",
    name: "jwt.verify",
    service: "Auth",
    op: "auth.middleware",
    start: 4,
    dur: 18,
    depth: 1,
    error: false,
    slow: false,
  },
  {
    id: "s03",
    name: "tenant.resolve",
    service: "Auth",
    op: "auth.middleware",
    start: 23,
    dur: 8,
    depth: 1,
    error: false,
    slow: false,
  },
  {
    id: "s04",
    name: "deal.create handler",
    service: "CRM API",
    op: "app.handler",
    start: 32,
    dur: 450,
    depth: 1,
    error: false,
    slow: true,
  },
  {
    id: "s05",
    name: "contact.findById",
    service: "CRM API",
    op: "orm.query",
    start: 36,
    dur: 22,
    depth: 2,
    error: false,
    slow: false,
  },
  {
    id: "s06",
    name: "cache.get → MISS",
    service: "Cache",
    op: "redis.get",
    start: 36,
    dur: 6,
    depth: 3,
    error: false,
    slow: false,
  },
  {
    id: "s07",
    name: "db.contacts.findOne",
    service: "Database",
    op: "pg.query",
    start: 43,
    dur: 22,
    depth: 3,
    error: false,
    slow: false,
  },
  {
    id: "s08",
    name: "deal.validate",
    service: "CRM API",
    op: "app.validate",
    start: 60,
    dur: 12,
    depth: 2,
    error: false,
    slow: false,
  },
  {
    id: "s09",
    name: "db.deals.insert",
    service: "Database",
    op: "pg.query",
    start: 74,
    dur: 244,
    depth: 2,
    error: false,
    slow: true,
  },
  {
    id: "s10",
    name: "cache.invalidate pipeline",
    service: "Cache",
    op: "redis.pipeline",
    start: 320,
    dur: 28,
    depth: 2,
    error: false,
    slow: false,
  },
  {
    id: "s11",
    name: "queue.publish deal.created",
    service: "Queue",
    op: "amqp.publish",
    start: 350,
    dur: 32,
    depth: 2,
    error: false,
    slow: false,
  },
  {
    id: "s12",
    name: "http.response serialize",
    service: "CRM API",
    op: "app.serialize",
    start: 385,
    dur: 20,
    depth: 2,
    error: false,
    slow: false,
  },
];

const SPAN_STATS = {
  "API Gateway": { spans: 1, dur: 488 },
  Auth: { spans: 2, dur: 26 },
  "CRM API": { spans: 4, dur: 306 },
  Database: { spans: 2, dur: 266 },
  Cache: { spans: 2, dur: 34 },
  Queue: { spans: 1, dur: 32 },
};

const LOGS = [
  {
    t: "10:42:18.001",
    level: "info",
    svc: "API Gateway",
    msg: "Received POST /api/v2/deals from 10.0.1.42",
  },
  {
    t: "10:42:18.005",
    level: "info",
    svc: "Auth",
    msg: "JWT verified · tenant_nx_001 · usr_pm_00041",
  },
  {
    t: "10:42:18.025",
    level: "debug",
    svc: "Auth",
    msg: "Tenant resolved · plan=Enterprise · region=ap-south-1",
  },
  {
    t: "10:42:18.033",
    level: "info",
    svc: "CRM API",
    msg: "deal.create invoked · contact_id=cnt_8f2a1b",
  },
  {
    t: "10:42:18.038",
    level: "debug",
    svc: "Cache",
    msg: "cache.get contacts:cnt_8f2a1b → MISS",
  },
  {
    t: "10:42:18.044",
    level: "debug",
    svc: "Database",
    msg: "SELECT * FROM contacts WHERE id=cnt_8f2a1b LIMIT 1",
  },
  {
    t: "10:42:18.063",
    level: "info",
    svc: "CRM API",
    msg: "Contact found · validation passed",
  },
  {
    t: "10:42:18.075",
    level: "warn",
    svc: "Database",
    msg: "Slow query detected · 244ms · INSERT INTO deals · missing index on tenant_id+stage",
  },
  {
    t: "10:42:18.320",
    level: "debug",
    svc: "Cache",
    msg: "cache.invalidate · deals:tenant_nx_001:* · 4 keys purged",
  },
  {
    t: "10:42:18.352",
    level: "info",
    svc: "Queue",
    msg: "Published deal.created · deal_9c3x7b · routing_key=crm.deals",
  },
  {
    t: "10:42:18.406",
    level: "info",
    svc: "CRM API",
    msg: "Response serialized · 201 Created · deal_9c3x7b",
  },
  {
    t: "10:42:18.488",
    level: "info",
    svc: "API Gateway",
    msg: "Response sent · 201 · 488ms · 1.2 KB",
  },
];

const SPAN_TAGS = {
  Database: [
    ["db.system", "postgresql"],
    ["db.operation", "INSERT"],
    ["db.table", "deals"],
    ["db.rows_affected", "1"],
    ["peer.address", "prod-db-01:5432"],
  ],
  Cache: [
    ["cache.system", "redis"],
    ["cache.hit", "false"],
    ["cache.key", "contacts:cnt_8f2a1b"],
  ],
  Auth: [
    ["auth.type", "JWT"],
    ["auth.tenant", "tenant_nx_001"],
    ["auth.user", "usr_pm_00041"],
    ["auth.scope", "read write"],
  ],
};

const LEVEL_STYLE = {
  info: "bg-blue-50 text-blue-700",
  warn: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-700",
  debug: "bg-gray-100 text-gray-500",
};

// ── WATERFALL TICKS ───────────────────────────────────────────────────────────
const TICKS = [0, 100, 200, 300, 400, 488];

// ── SPAN DRAWER ───────────────────────────────────────────────────────────────
function SpanDrawer({ span, onClose }) {
  if (!span) return null;
  const svc = SERVICES[span.service] || { color: "#9ca3af", bg: "#f3f4f6" };
  const pct = Math.round((span.dur / TOTAL) * 100);
  const parentSpan =
    span.depth > 0
      ? SPANS.find((x) => x.depth === span.depth - 1 && x.start <= span.start)
      : null;

  const tags = SPAN_TAGS[span.service] || [
    ["http.method", "POST"],
    ["http.url", "/api/v2/deals"],
    ["http.status_code", "201"],
    ["http.flavor", "1.1"],
  ];

  const spanLogs = LOGS.filter((l) => l.svc === span.service);

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/20 z-[198]"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 w-[400px] h-full bg-white border-l border-gray-200 z-[199] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11.5px]"
                style={{ background: svc.bg, color: svc.color }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: svc.color }}
                />
                {span.service}
              </span>
              {span.slow && <Badge value="Slow" variant="warning" />}
              {span.error && <Badge value="Error" variant="down" />}
              {!span.error && <Badge value="OK" variant="active" />}
            </div>
            <div className="text-[13.5px] text-gray-800 leading-snug">
              {span.name}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">
              span_id: {span.id} · depth {span.depth}
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
          {/* Duration bar */}
          <div className="mb-5">
            <div className="flex justify-between mb-1.5">
              <span className="text-[12.5px] text-gray-400">Duration</span>
              <span
                className="text-[20px] font-light"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  color:
                    span.dur > 200
                      ? "#d97706"
                      : span.dur > 100
                        ? "#1c1f2e"
                        : "#16a34a",
                }}
              >
                {span.dur}ms
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 bg-gray-100 rounded-full flex-1 overflow-hidden relative">
                <div
                  className="h-full rounded-full absolute transition-all duration-500"
                  style={{ width: `${pct}%`, background: svc.color }}
                />
              </div>
              <span className="font-mono text-[11px] text-gray-400">
                {pct}% of trace
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[11px] text-gray-400">
                start: +{span.start}ms
              </span>
              <span className="text-[11px] text-gray-400">
                total: {TOTAL}ms
              </span>
            </div>
          </div>

          {/* Span info */}
          <div className="mb-4">
            <div className="text-[10.5px] uppercase tracking-wider text-gray-400 mb-2">
              Span info
            </div>
            {[
              ["Operation", span.op],
              ["Service", span.service],
              ["Start offset", `+${span.start}ms`],
              ["Duration", `${span.dur}ms`],
              ["Depth", `Level ${span.depth}`],
              ["Parent span", parentSpan?.id || "root"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0 gap-3"
              >
                <span className="text-[12px] text-gray-400 flex-shrink-0">
                  {k}
                </span>
                <span className="font-mono text-[12px] text-gray-700 text-right">
                  {v}
                </span>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="mb-4">
            <div className="text-[10.5px] uppercase tracking-wider text-gray-400 mb-2">
              Tags
            </div>
            {tags.map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0 gap-3"
              >
                <span className="font-mono text-[11px] text-gray-400 flex-shrink-0">
                  {k}
                </span>
                <span className="font-mono text-[11.5px] text-green-600 text-right">
                  "{v}"
                </span>
              </div>
            ))}
          </div>

          {/* Span logs */}
          <div>
            <div className="text-[10.5px] uppercase tracking-wider text-gray-400 mb-2">
              Logs for this span
            </div>
            {spanLogs.length === 0 ? (
              <span className="text-[11px] text-gray-400">
                No logs for this span
              </span>
            ) : (
              spanLogs.map((l, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 py-1.5 border-b border-gray-100 last:border-b-0 text-[12px]"
                >
                  <span className="font-mono text-[11px] text-gray-400 flex-shrink-0">
                    {l.t}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono font-medium flex-shrink-0 ${LEVEL_STYLE[l.level] || "bg-gray-100 text-gray-500"}`}
                  >
                    {l.level.toUpperCase()}
                  </span>
                  <span
                    className={
                      l.level === "warn" ? "text-amber-600" : "text-gray-700"
                    }
                  >
                    {l.msg}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── WATERFALL ─────────────────────────────────────────────────────────────────
function Waterfall({ activeSpanId, onSpanClick }) {
  return (
    <div className="overflow-hidden">
      <div style={{ minWidth: 700 }}>
        {/* Header */}
        <div className="flex border-b-2 border-gray-200 bg-gray-50/80 sticky top-0 z-10">
          <div className="w-[300px] flex-shrink-0 px-3.5 py-2 text-[10.5px] text-gray-400 uppercase tracking-wider border-r border-gray-200">
            Span / Service
          </div>
          <div className="flex-1 relative h-8">
            {TICKS.map((ms) => {
              const pct = (ms / TOTAL) * 100;
              return (
                <div key={ms} className="absolute" style={{ left: `${pct}%` }}>
                  <span className="absolute top-1.5 font-mono text-[9.5px] text-gray-400 -translate-x-[30px]">
                    {ms}ms
                  </span>
                  <div
                    className="absolute top-7 w-px bg-gray-200"
                    style={{ height: SPANS.length * 36 + 200 }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Span rows */}
        {SPANS.map((span) => {
          const svc = SERVICES[span.service] || {
            color: "#9ca3af",
            bg: "#f3f4f6",
          };
          const left = (span.start / TOTAL) * 100;
          const width = Math.max((span.dur / TOTAL) * 100, 0.5);
          const indent = span.depth * 16;
          const isActive = activeSpanId === span.id;

          return (
            <div
              key={span.id}
              onClick={() => onSpanClick(span.id)}
              className={`flex items-center border-b border-gray-100 min-h-[36px] cursor-pointer transition-colors ${
                isActive
                  ? "bg-blue-50"
                  : span.error
                    ? "bg-red-50/40"
                    : "hover:bg-blue-50/30"
              }`}
            >
              {/* Name cell */}
              <div
                className="w-[300px] flex-shrink-0 border-r border-gray-100 flex items-center gap-1.5 overflow-hidden"
                style={{
                  paddingLeft: 14 + indent,
                  paddingRight: 14,
                  paddingTop: 4,
                  paddingBottom: 4,
                }}
              >
                {span.depth > 0 && (
                  <div
                    className="absolute flex-shrink-0"
                    style={{ left: 14, width: indent }}
                  >
                    <div className="flex items-end" style={{ height: 18 }}>
                      <div
                        style={{
                          width: indent - 8,
                          height: 1,
                          background: "#e9ebf0",
                        }}
                      />
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderLeft: "1px solid #e9ebf0",
                          borderBottom: "1px solid #e9ebf0",
                          flexShrink: 0,
                        }}
                      />
                    </div>
                  </div>
                )}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: svc.color }}
                />
                <div className="overflow-hidden">
                  <div className="text-[12px] text-gray-800 truncate">
                    {span.name}
                  </div>
                  <div className="text-[10.5px] text-gray-400 truncate">
                    {span.service} · {span.op}
                  </div>
                </div>
              </div>

              {/* Timeline cell */}
              <div className="flex-1 relative h-9 overflow-hidden">
                {/* Bar */}
                <div
                  className="absolute h-4 top-1/2 -translate-y-1/2 rounded-[3px] flex items-center overflow-hidden"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: svc.color,
                    minWidth: 3,
                    outline: span.slow ? `1.5px solid ${svc.color}` : "none",
                    outlineOffset: 1,
                  }}
                >
                  {span.dur > 30 && (
                    <span className="font-mono text-[9.5px] text-white/90 px-1.5 truncate">
                      {span.dur}ms
                    </span>
                  )}
                </div>
                {/* Duration label */}
                <span
                  className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px]"
                  style={{ color: span.slow ? "#d97706" : "#9ca3af" }}
                >
                  {span.dur}ms
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SERVICE MAP ───────────────────────────────────────────────────────────────
const SERVICE_ICONS = {
  "API Gateway": (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  Auth: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  "CRM API": (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Database: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  Cache: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
    </svg>
  ),
  Queue: (
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
};

const SVC_COLS = [
  ["API Gateway"],
  ["Auth", "CRM API"],
  ["Database", "Cache", "Queue"],
];

function Arrow() {
  return (
    <div className="flex items-center flex-shrink-0 px-2">
      <div className="relative flex items-center">
        <div className="w-8 h-px bg-gray-200" />
        <div
          className="absolute right-0 w-0 h-0"
          style={{
            borderTop: "4px solid transparent",
            borderBottom: "4px solid transparent",
            borderLeft: "6px solid #e9ebf0",
          }}
        />
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function TraceDetail() {
  const [activeSpanId, setActiveSpanId] = useState(null);

  const activeSpan = activeSpanId
    ? SPANS.find((s) => s.id === activeSpanId)
    : null;

  const handleSpanClick = (id) => {
    setActiveSpanId((prev) => (prev === id ? null : id));
  };

  const stats = [
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
      iconColor: "text-amber-500",
      count: "488ms",
      countColor: "text-amber-600",
      badge: "p95 baseline: 312ms",
      badgeBg: "bg-amber-50",
      badgeTextColor: "text-amber-600",
      title: "Total Latency",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      ),
      iconColor: "text-purple-600",
      count: "244ms",
      countColor: "text-purple-700",
      badge: "50% of total trace",
      badgeBg: "bg-purple-50",
      badgeTextColor: "text-purple-600",
      title: "DB Query Time",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
      iconColor: "text-green-600",
      count: "12",
      countColor: "text-green-600",
      badge: "0 errors · 1 slow",
      badgeBg: "bg-green-50",
      badgeTextColor: "text-green-600",
      title: "Total Spans",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
        </svg>
      ),
      iconColor: "text-cyan-600",
      count: "5",
      countColor: "text-cyan-600",
      badge: "API · Auth · DB · Cache · Queue",
      badgeBg: "bg-cyan-50",
      badgeTextColor: "text-cyan-600",
      title: "Services Touched",
    },
  ];

  return (
    <div
      className={`container-page transition-all duration-300 ${activeSpan ? "mr-[400px]" : ""}`}
    >
      {/* Page Header */}
      <div className="flex items-center justify-between ">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
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
            <span className="inline-flex px-2 py-0.5 rounded font-mono text-[11px] font-medium bg-green-50 text-green-700">
              POST
            </span>
            <span className="font-mono text-[16px] text-gray-800">
              /api/v2/deals
            </span>
            <Badge value="201" variant="active" />
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-gray-400">
            <a href="#" className="hover:text-blue-600">
              Home
            </a>
            <span className="opacity-40">/</span>
            <a href="#" className="hover:text-blue-600">
              Request Log
            </a>
            <span className="opacity-40">/</span>
            <span className="text-gray-700">Trace a1b2c3d4e5f6</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton action="save" label="Share" icon={ShareIcon} />
          <ActionButton action="export" label="Export" icon={ExportIcon} />
          <ActionButton action="search" label="Alert on this" icon={BellIcon} />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <Section>
          {/* Identity Bar */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex flex-wrap">
              {[
                { label: "Trace ID", val: "a1b2c3d4e5f6g7h8", mono: true },
                {
                  label: "Total Duration",
                  val: "488ms",
                  color: "#d97706",
                  outfit: true,
                },
                { label: "Spans", val: "12 spans" },
                { label: "Services", val: "5 services" },
                { label: "Tenant", val: "Nexus Corp" },
                { label: "User", val: "priya.mehta" },
                { label: "Time", val: "10:42:18 UTC", mono: true },
                { label: "Status", badge: "201 Created" },
              ].map((item, i, arr) => (
                <div
                  key={item.label}
                  className={`px-5 py-2 flex flex-col justify-center ${i < arr.length - 1 ? "border-r border-gray-200" : ""}`}
                >
                  <div className="text-[10.5px] text-gray-400 uppercase tracking-wider mb-1">
                    {item.label}
                  </div>
                  {item.badge ? (
                    <Badge value={item.badge} variant="active" />
                  ) : (
                    <div
                      className={`text-[13px] ${item.mono ? "font-mono text-[12px]" : ""}`}
                      style={{
                        color: item.color || "#1c1f2e",
                        fontFamily: item.outfit
                          ? "'Outfit', sans-serif"
                          : undefined,
                        fontSize: item.outfit ? 16 : undefined,
                      }}
                    >
                      {item.val}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <StatCard
                key={i}
                icon={s.icon}
                iconColor={s.iconColor}
                count={s.count}
                countColor={s.countColor}
                title={s.title}
                badgeText={s.badge}
                badgeBg={s.badgeBg}
                badgeTextColor={s.badgeTextColor}
              />
            ))}
          </div>
        </Section>

        <Section>
          {/* Waterfall */}
          <div className="bg-white border border-gray-200 rounded-xl ">
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
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                Span Waterfall
                <Badge value="12 spans" variant="default" />
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {Object.entries(SERVICES).map(([name, svc]) => (
                  <span
                    key={name}
                    className="flex items-center gap-1.5 text-[10.5px] text-gray-400"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-[2px] flex-shrink-0"
                      style={{ background: svc.color }}
                    />
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <Waterfall
              activeSpanId={activeSpanId}
              onSpanClick={handleSpanClick}
            />
          </div>
        </Section>

        <Section>
          {/* Service Map + Span Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Service Map */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Service Map
              </div>
              <div className="px-8 py-5 flex items-center justify-between gap-2">
                {SVC_COLS.map((col, ci) => (
                  <div key={ci} className="flex items-center gap-10">
                    <div className="flex flex-col gap-3 items-center">
                      {col.map((svcName) => {
                        const svc = SERVICES[svcName] || {
                          color: "#9ca3af",
                          bg: "#f3f4f6",
                        };
                        return (
                          <div
                            key={svcName}
                            className="flex flex-col items-center gap-1.5 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div
                              className="w-11 h-11 rounded-[10px] flex items-center justify-center border-2 border-transparent hover:border-blue-400 transition-colors"
                              style={{ background: svc.bg }}
                            >
                              <div style={{ color: svc.color }}>
                                {SERVICE_ICONS[svcName]}
                              </div>
                            </div>
                            <div className="text-[11px] text-gray-400 text-center leading-snug">
                              {svcName}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {ci < SVC_COLS.length - 1 && <Arrow />}
                  </div>
                ))}
              </div>
            </div>

            {/* Span Summary */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Span Summary
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {[
                        "Service",
                        "Operation",
                        "Duration",
                        "% of trace",
                        "Status",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-2 text-[10.5px] uppercase tracking-wider text-gray-400 font-normal"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(SPAN_STATS).map(([svcName, d]) => {
                      const svc = SERVICES[svcName] || { color: "#9ca3af" };
                      const pct = Math.round((d.dur / TOTAL) * 100);
                      const isSlow = d.dur > 200;
                      return (
                        <tr
                          key={svcName}
                          className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50"
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ background: svc.color }}
                              />
                              <span className="text-[13px] text-gray-700">
                                {svcName}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="font-mono text-[11.5px] text-gray-400">
                              {d.spans} span{d.spans > 1 ? "s" : ""}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`font-mono text-[12px] ${isSlow ? "text-amber-600" : "text-gray-700"}`}
                            >
                              {d.dur}ms
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                                <div
                                  className="h-full rounded-full opacity-80"
                                  style={{
                                    width: `${pct}%`,
                                    background: svc.color,
                                  }}
                                />
                              </div>
                              <span className="font-mono text-[11px] text-gray-400">
                                {pct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            {isSlow ? (
                              <Badge value="Slow" variant="warning" />
                            ) : (
                              <Badge value="OK" variant="active" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          {/* Request + Response */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Request */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <div
                  className="text-[14px] text-gray-800"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Request
                </div>
                <Badge value="POST /api/v2/deals" variant="beta" />
              </div>
              <div className="px-5 py-4 flex flex-col gap-4">
                <div>
                  <div className="text-[11px] text-gray-400 mb-2">Headers</div>
                  {[
                    ["Authorization", "Bearer eyJhbGci…x4f2"],
                    ["Content-Type", "application/json"],
                    ["X-Tenant-ID", "tenant_nx_001"],
                    ["X-Request-ID", "a1b2c3d4e5f6"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0 gap-3"
                    >
                      <span className="font-mono text-[11.5px] text-blue-600 flex-shrink-0">
                        {k}
                      </span>
                      <span className="font-mono text-[11.5px] text-gray-400 text-right truncate">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 mb-2">Body</div>
                  <div className="bg-[#1c1f2e] rounded-lg p-3.5 font-mono text-[11.5px] leading-relaxed">
                    <span className="text-slate-400">{"{"}</span>
                    {"\n"}
                    {"  "}
                    <span className="text-blue-300">"title"</span>:{" "}
                    <span className="text-green-300">
                      "Enterprise License — Q4"
                    </span>
                    ,{"\n"}
                    {"  "}
                    <span className="text-blue-300">"value"</span>:{" "}
                    <span className="text-yellow-300">48000</span>,{"\n"}
                    {"  "}
                    <span className="text-blue-300">"stage"</span>:{" "}
                    <span className="text-green-300">"proposal"</span>,{"\n"}
                    {"  "}
                    <span className="text-blue-300">"contact_id"</span>:{" "}
                    <span className="text-green-300">"cnt_8f2a1b"</span>,{"\n"}
                    {"  "}
                    <span className="text-blue-300">"owner_id"</span>:{" "}
                    <span className="text-green-300">"usr_pm_00041"</span>,
                    {"\n"}
                    {"  "}
                    <span className="text-blue-300">"close_date"</span>:{" "}
                    <span className="text-green-300">"2025-12-31"</span>,{"\n"}
                    {"  "}
                    <span className="text-blue-300">"currency"</span>:{" "}
                    <span className="text-green-300">"USD"</span>
                    {"\n"}
                    <span className="text-slate-400">{"}"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Response */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <div
                  className="text-[14px] text-gray-800"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Response
                </div>
                <Badge value="201 Created · 488ms" variant="active" />
              </div>
              <div className="px-5 py-4 flex flex-col gap-4">
                <div>
                  <div className="text-[11px] text-gray-400 mb-2">Headers</div>
                  {[
                    ["Content-Type", "application/json; charset=utf-8"],
                    ["X-Request-ID", "a1b2c3d4e5f6"],
                    ["X-Response-Time", "488ms"],
                    ["Location", "/api/v2/deals/deal_9c3x"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0 gap-3"
                    >
                      <span className="font-mono text-[11.5px] text-blue-600 flex-shrink-0">
                        {k}
                      </span>
                      <span className="font-mono text-[11.5px] text-gray-400 text-right truncate">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 mb-2">Body</div>
                  <div className="bg-[#1c1f2e] rounded-lg p-3.5 font-mono text-[11.5px] leading-relaxed">
                    <span className="text-slate-400">{"{"}</span>
                    {"\n"}
                    {"  "}
                    <span className="text-blue-300">"id"</span>:{" "}
                    <span className="text-green-300">"deal_9c3x7b"</span>,{"\n"}
                    {"  "}
                    <span className="text-blue-300">"title"</span>:{" "}
                    <span className="text-green-300">
                      "Enterprise License — Q4"
                    </span>
                    ,{"\n"}
                    {"  "}
                    <span className="text-blue-300">"value"</span>:{" "}
                    <span className="text-yellow-300">48000</span>,{"\n"}
                    {"  "}
                    <span className="text-blue-300">"stage"</span>:{" "}
                    <span className="text-green-300">"proposal"</span>,{"\n"}
                    {"  "}
                    <span className="text-blue-300">"status"</span>:{" "}
                    <span className="text-green-300">"active"</span>,{"\n"}
                    {"  "}
                    <span className="text-blue-300">"created_at"</span>:{" "}
                    <span className="text-green-300">
                      "2025-10-15T10:42:18Z"
                    </span>
                    {"\n"}
                    <span className="text-slate-400">{"}"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          {/* Correlated Logs */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div
                className="flex items-center gap-2 text-[14px] text-gray-800"
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Correlated Logs
                <Badge value="trace: a1b2c3d4" variant="default" />
              </div>
              <ActionButton
                action="save"
                label="Open in Log Explorer"
                icon={null}
              />
            </div>
            <div className="px-5 py-3">
              {LOGS.map((l, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 py-1.5 border-b border-gray-100 last:border-b-0"
                >
                  <span className="font-mono text-[11px] text-gray-400 flex-shrink-0 min-w-[90px]">
                    {l.t}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium flex-shrink-0 ${LEVEL_STYLE[l.level] || "bg-gray-100 text-gray-500"}`}
                  >
                    {l.level.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1.5 flex-shrink-0 min-w-[90px]">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        background: SERVICES[l.svc]?.color || "#9ca3af",
                      }}
                    />
                    <span className="text-[11.5px] text-gray-400">{l.svc}</span>
                  </span>
                  <span
                    className={`text-[12.5px] ${l.level === "warn" ? "text-amber-600" : l.level === "error" ? "text-red-600" : "text-gray-700"}`}
                  >
                    {l.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Span Drawer */}
      {activeSpan && (
        <SpanDrawer span={activeSpan} onClose={() => setActiveSpanId(null)} />
      )}
    </div>
  );
}
