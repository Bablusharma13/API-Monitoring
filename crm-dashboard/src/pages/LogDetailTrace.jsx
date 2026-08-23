import { useState, useEffect } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/ui/StatCard3";
import {
  BackIcon,
  CopyIcon,
  ExportIcon,
  IncidentIcon,
} from "../components/ui/Icons";
import { Table } from "../components/TableComponents/Table";
import { Section } from "../components/ui/Section";

// ── SYNTAX HIGHLIGHT ─────────────────────────────────────────────────────────
function syntaxHL(obj) {
  return JSON.stringify(obj, null, 2)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (m) => {
        if (/^"/.test(m))
          return `<span class="${/:$/.test(m) ? "text-blue-300" : "text-green-300"}">${m}</span>`;
        if (/true|false/.test(m))
          return `<span class="text-pink-300">${m}</span>`;
        if (/null/.test(m)) return `<span class="text-slate-400">${m}</span>`;
        return `<span class="text-yellow-300">${m}</span>`;
      },
    );
}

// ── DATA ─────────────────────────────────────────────────────────────────────
const SPANS = [
  {
    name: "payment-api (root)",
    start: 0,
    dur: 30214,
    status: 503,
    indent: 0,
    state: "err",
    label: "30,214ms — timeout",
  },
  {
    name: "↳ auth validation",
    start: 2,
    dur: 18,
    status: 200,
    indent: 1,
    state: "ok",
    label: "18ms",
  },
  {
    name: "↳ db: customer lookup",
    start: 22,
    dur: 31,
    status: 200,
    indent: 1,
    state: "ok",
    label: "31ms",
  },
  {
    name: "↳ payment-gateway call",
    start: 55,
    dur: 30000,
    status: 503,
    indent: 1,
    state: "err",
    label: "30,000ms — timeout",
  },
  {
    name: "    ↳ TCP connect",
    start: 55,
    dur: 120,
    status: 200,
    indent: 2,
    state: "warn",
    label: "120ms — slow",
  },
];
const TOTAL_MS = 30214;

const PIPELINE_STAGES = [
  {
    name: "Ingest",
    state: "ok",
    time: "14:24:12.441 UTC",
    dur: "2ms",
    detail: [
      ["Source", "API gateway · us-east-1"],
      ["Worker", "worker-3"],
      ["Buffer", "Ingest buf (22% full)"],
      ["Action", "Accepted — enqueued"],
    ],
  },
  {
    name: "Parser",
    state: "ok",
    time: "14:24:12.443 UTC",
    dur: "4ms",
    detail: [
      ["Format", "JSON · valid"],
      ["Fields parsed", "18 / 18"],
      ["Schema", "payment-api v2.4.1"],
      ["Action", "Parsed — enqueued"],
    ],
  },
  {
    name: "Enricher",
    state: "warn",
    time: "14:24:12.447 UTC",
    dur: "42ms",
    detail: [
      ["Geo lookup", "US · New York · 38ms"],
      ["Risk scored", "88 / 100 (high)"],
      ["Buffer lag", "Buf 3 at 79% — +38ms delay"],
      ["Action", "Enriched — enqueued (slow)"],
    ],
  },
  {
    name: "Router",
    state: "ok",
    time: "14:24:12.489 UTC",
    dur: "1ms",
    detail: [
      ["Rule matched", "level:error → Hot store"],
      ["Split", "Hot (80%) selected"],
      ["Action", "Routed → Hot Writer"],
    ],
  },
  {
    name: "Writer",
    state: "err",
    time: "14:24:12.490 UTC",
    dur: "—",
    detail: [
      ["Attempt", "1 of 3 (all failed)"],
      ["Error", "Disk write timeout — hot-node-01"],
      ["DLQ", "Moved to dlq-001"],
      ["Action", "❌ Write failed after 3 retries"],
    ],
  },
];

const REQ_PAYLOAD = {
  method: "POST",
  url: "https://api.payment.io/v2/charge",
  headers: {
    Authorization: "Bearer eyJhbGci••••",
    "Content-Type": "application/json",
    "X-Correlation-ID": "req_4F8KM2XA",
    "X-Api-Version": "2.4.1",
  },
  body: {
    amount: 1000,
    currency: "USD",
    card_token: "tok_test_xxx",
    customer_id: "cus_12345",
    description: "Order #8821",
    idempotency_key: "idem_4F8KM2XA",
  },
};
const RES_PAYLOAD = {
  status: 503,
  statusText: "Service Unavailable",
  headers: {
    "Content-Type": "application/json",
    "X-Request-ID": "req_4F8KM2XA",
    "Retry-After": "30",
  },
  body: {
    error: "service_unavailable",
    message: "Upstream payment gateway did not respond within 30s timeout",
    code: 503,
    retry_after: 30,
    trace_id: "req_4F8KM2XA",
  },
};

const REQUEST_HEADERS = [
  [
    "Authorization",
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwYXltZW50LWFwaSJ9••••",
  ],
  ["Content-Type", "application/json"],
  ["X-Correlation-ID", "req_4F8KM2XA"],
  ["X-Api-Version", "2.4.1"],
  ["X-Forwarded-For", "10.42.18.1"],
  ["User-Agent", "SyberFort-Monitor/2.4"],
  ["Accept-Encoding", "gzip, deflate, br"],
  ["Content-Length", "182"],
];

const RELATED_LOGS = [
  {
    time: "14:24:12.441",
    stage: "Ingest",
    lvl: "error",
    status: 503,
    dur: "2ms",
    msg: "Accepted into pipeline — enqueued",
    cls: "ok",
  },
  {
    time: "14:24:12.443",
    stage: "Parser",
    lvl: "info",
    status: 200,
    dur: "4ms",
    msg: "JSON parsed — 18 fields extracted",
    cls: "ok",
  },
  {
    time: "14:24:12.447",
    stage: "Enricher",
    lvl: "warn",
    status: 200,
    dur: "42ms",
    msg: "Geo lookup slow — 38ms (threshold: 20ms)",
    cls: "warn",
  },
  {
    time: "14:24:12.489",
    stage: "Router",
    lvl: "info",
    status: 200,
    dur: "1ms",
    msg: "Routed to Hot store writer",
    cls: "ok",
  },
  {
    time: "14:24:12.490",
    stage: "Writer",
    lvl: "error",
    status: 503,
    dur: "—",
    msg: "Write failed — disk timeout hot-node-01",
    cls: "err",
  },
  {
    time: "14:24:12.491",
    stage: "Writer",
    lvl: "error",
    status: 503,
    dur: "—",
    msg: "Retry 1/3 — write failed again",
    cls: "err",
  },
  {
    time: "14:24:12.493",
    stage: "Writer",
    lvl: "error",
    status: 503,
    dur: "—",
    msg: "Retry 2/3 — write failed again",
    cls: "err",
  },
  {
    time: "14:24:12.496",
    stage: "DLQ",
    lvl: "warn",
    status: 503,
    dur: "—",
    msg: "Moved to dead-letter queue dlq-001",
    cls: "warn",
  },
];

const SIMILAR_ERRORS = [
  { api: "payment-api", code: 503, count: 22, ago: "2m ago" },
  { api: "email-gateway", code: 503, count: 9, ago: "5m ago" },
  { api: "legacy-v1-api", code: 504, count: 3, ago: "4h ago" },
];

// ── TOAST ─────────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };
  return { toast, showToast };
}

// ── SECTION LABEL ─────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 mb-2.5 mt-4 first:mt-0">
    {children}
    <span className="flex-1 h-px bg-gray-200" />
  </div>
);

// ── CARD ─────────────────────────────────────────────────────────────────────
const Card = ({ children, className = "", borderColor = "" }) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl overflow-hidden mb-4 ${borderColor} ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ children, className = "" }) => (
  <div
    className={`flex items-center justify-between px-[18px] py-3 border-b border-gray-100 bg-[#fafbfc] ${className}`}
  >
    {children}
  </div>
);
const CardTitle = ({ children }) => (
  <div className="flex items-center gap-2 text-[13px] font-medium text-gray-800">
    {children}
  </div>
);
const CardBody = ({ children, className = "" }) => (
  <div className={`p-[18px] ${className}`}>{children}</div>
);

// ── KPI CARD ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, iconBg, value, valueColor, label }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center gap-3">
    <div
      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
    >
      {icon}
    </div>
    <div>
      <div
        className={`font-light text-[22px] leading-none mb-0.5 ${valueColor || "text-gray-800"}`}
        style={{ fontFamily: "system-ui" }}
      >
        {value}
      </div>
      <div className="text-[11.5px] text-gray-400">{label}</div>
    </div>
  </div>
);

// ── WATERFALL ─────────────────────────────────────────────────────────────────
function Waterfall({ showToast }) {
  const ticks = [0, 5000, 10000, 15000, 20000, 25000, 30000];
  const stateColor = { ok: "#16a34a", err: "#dc2626", warn: "#d97706" };
  const dotClass = {
    ok: "bg-green-50 border-green-500",
    err: "bg-red-50 border-red-500",
    warn: "bg-amber-50 border-amber-500",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
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
          Trace: req_4F8KM2XA
        </CardTitle>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-gray-400">
            Total: <span className="font-mono text-red-600">30,214ms</span>
          </span>
          <span className="text-[12px] text-gray-400">5 spans</span>
          <button
            onClick={() => showToast("Collapsed all spans")}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] border border-gray-200 rounded-md hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            Collapse
          </button>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <div style={{ minWidth: 700 }}>
          {/* Ruler header */}
          <div className="flex items-center border-b-2 border-gray-200 bg-[#fafbfc] text-[10.5px] text-gray-400 uppercase tracking-wider">
            <div className="w-[260px] shrink-0 px-3.5 py-2 border-r border-gray-200">
              Service / Span
            </div>
            <div className="flex-1 px-3 py-2 relative h-[28px]">
              {ticks.map((t) => {
                const pct = (t / TOTAL_MS) * 100;
                return (
                  <div
                    key={t}
                    className="absolute top-0 bottom-0 w-px bg-gray-200"
                    style={{ left: `${pct}%` }}
                  >
                    <span className="absolute bottom-1 left-0.5 text-[9.5px] text-gray-400 whitespace-nowrap">
                      {t === 0 ? "0" : t >= 1000 ? `${t / 1000}s` : `${t}ms`}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="w-[50px] shrink-0 px-3 py-2 border-l border-gray-200 text-right">
              Status
            </div>
          </div>

          {/* Span rows */}
          {SPANS.map((s, i) => {
            const left = (s.start / TOTAL_MS) * 100;
            const width = Math.max(0.5, (s.dur / TOTAL_MS) * 100);
            const col = stateColor[s.state];
            const dur =
              s.dur >= 1000 ? `${(s.dur / 1000).toFixed(1)}s` : `${s.dur}ms`;
            return (
              <div
                key={i}
                onClick={() => showToast(`Span: ${s.name.trim()} · ${s.dur}ms`)}
                className={`flex items-stretch border-b border-gray-100 last:border-0 cursor-pointer transition-colors hover:bg-gray-50
                  ${s.state === "err" ? "bg-red-50 hover:bg-red-100/60" : ""}`}
              >
                <div className="w-[260px] shrink-0 flex items-center gap-2 px-3.5 py-2.5 border-r border-gray-100">
                  <div style={{ width: s.indent * 14, flexShrink: 0 }} />
                  <div
                    className={`w-2.5 h-2.5 rounded-full border-2 shrink-0 ${dotClass[s.state]}`}
                  />
                  <div className="flex-1 text-[12.5px] text-gray-800 truncate">
                    {s.name.trim()}
                  </div>
                  <div className="font-mono text-[11px] text-gray-400 shrink-0">
                    {dur}
                  </div>
                </div>
                <div className="flex-1 px-3 py-2.5 relative flex items-center">
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                    <div className="relative w-full h-3 rounded">
                      <div
                        className="absolute h-3 rounded flex items-center pl-1.5 overflow-hidden"
                        style={{
                          left: `${left}%`,
                          width: `${width}%`,
                          background: col,
                          opacity: 0.85,
                        }}
                      >
                        {width > 8 && (
                          <span className="text-[10px] text-white font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                            {s.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-[50px] shrink-0 flex items-center justify-end px-3 border-l border-gray-100">
                  <span
                    className={`font-mono text-[11.5px] ${s.status >= 500 ? "text-red-600" : s.status >= 400 ? "text-amber-600" : "text-green-600"}`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

// ── PIPELINE STAGE JOURNEY ────────────────────────────────────────────────────
function PipelineJourney() {
  const stateMap = {
    ok: {
      circle: "bg-green-50 border-green-500",
      line: "bg-green-200",
      badge: <Badge variant="active" value="Ok" />,
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    err: {
      circle: "bg-red-50 border-red-500",
      line: "bg-red-200",
      badge: <Badge variant="down" value="Failed" />,
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dc2626"
          strokeWidth="2.5"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
    warn: {
      circle: "bg-amber-50 border-amber-500",
      line: "bg-amber-200",
      badge: <Badge variant="warning" value="Slow" />,
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d97706"
          strokeWidth="2.5"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
      ),
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="8" width="4" height="8" rx="1" />
            <rect x="10" y="5" width="4" height="14" rx="1" />
            <rect x="18" y="10" width="4" height="6" rx="1" />
          </svg>
          BAP Pipeline — this log entry's journey
        </CardTitle>
        <Badge variant="down" value="Failed at Writer" />
      </CardHeader>
      <CardBody>
        {PIPELINE_STAGES.map((s, i) => {
          const isLast = i === PIPELINE_STAGES.length - 1;
          const sm = stateMap[s.state];
          return (
            <div
              key={s.name}
              className="flex items-start gap-0 py-3 border-b border-gray-100 last:border-0"
            >
              {/* Circle + vertical line */}
              <div className="flex flex-col items-center w-8 shrink-0 mt-0.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 z-10 ${sm.circle}`}
                >
                  {sm.icon}
                </div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-[20px] mt-1 ${sm.line}`}
                  />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 pl-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-medium text-gray-800">
                    {s.name}
                  </span>
                  {sm.badge}
                  <span className="font-mono text-[11px] text-gray-400 ml-1">
                    {s.dur}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-gray-400 mb-2">
                  {s.time}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-[12px] flex flex-col gap-1">
                  {s.detail.map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-gray-400 w-[110px] shrink-0">
                        {k}
                      </span>
                      <span className="font-mono text-gray-800">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}

const LOG_GROUPS = {
  Timestamp: { hex: "#d97706", bg: "bg-amber-50", text: "text-amber-600" },
  Request: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Response: { hex: "#0891b2", bg: "bg-cyan-50", text: "text-cyan-600" },
  Details: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
};

// ── RELATED LOGS TABLE ────────────────────────────────────────────────────────
function RelatedLogs({ showToast }) {
  const lvlBadge = (l) => {
    if (l === "error") return <Badge variant="down" value="ERR" />;
    if (l === "warn") return <Badge variant="warning" value="WARN" />;
    return <Badge variant="beta" value="INFO" />;
  };

  const columns = [
    {
      id: "time",
      name: "Time",
      width: 50,
      group: "Timestamp",
      cell: (row) => (
        <span className="font-mono text-[11px] text-gray-400">{row.time}</span>
      ),
    },
    {
      id: "stage",
      name: "Stage",
      width: 10,
      group: "Request",
      cell: (row) => <Badge variant="Test" value={row.stage} />,
    },
    {
      id: "lvl",
      name: "Level",
      width: 80,
      group: "Request",
      cell: (row) => lvlBadge(row.lvl),
    },
    {
      id: "status",
      name: "Status",
      width: 20,
      group: "Response",
      cell: (row) => (
        <span
          className={`font-mono text-[11.5px] ${
            row.status >= 500
              ? "text-red-600"
              : row.status >= 400
                ? "text-amber-600"
                : "text-green-600"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "dur",
      name: "Duration",
      width: 20,
      group: "Response",
      cell: (row) => (
        <span className="font-mono text-[11px] text-gray-400">{row.dur}</span>
      ),
    },
    {
      id: "msg",
      name: "Message",
      group: "Details",
      width: 200,
      cell: (row) => (
        <span className="text-[12px] text-gray-700 truncate">{row.msg}</span>
      ),
    },
  ];

  return (
    <Card className="mb-0">
      <CardHeader>
        <CardTitle>
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
          req_4F8KM2XA · 8 related entries
        </CardTitle>
        <ActionButton
          action="export"
          onClick={() => showToast("Searching full correlation in Explorer")}
          label="View all in Explorer"
          icon={null}
        />
      </CardHeader>

      <Table
        columns={columns}
        tableName="related-logs"
        group={LOG_GROUPS}
        data={RELATED_LOGS}
        loading={false}
        enableSearch={false}
        pageIndex={0}
        setPageIndex={() => {}}
        pageLimit={RELATED_LOGS.length}
        setPageLimit={() => {}}
        paginationData={{
          totalCount: RELATED_LOGS.length,
          totalPages: 1,
        }}
        onRowClick={(row) => showToast(`Opening: ${row.stage} entry`)}
        sortField={null}
        setSortField={() => {}}
        sortType={null}
        setSortType={() => {}}
        activeFilters={{}}
        setActiveFilters={() => {}}
      />
    </Card>
  );
}

// ── SIDE PANEL ────────────────────────────────────────────────────────────────
function SidePanel({ showToast }) {
  const SideSection = ({ title, children }) => (
    <div className="px-4 py-3.5 border-b border-gray-100 last:border-0">
      <div className="text-[10.5px] uppercase tracking-widest text-gray-400 mb-2.5">
        {title}
      </div>
      {children}
    </div>
  );
  const SRow = ({ k, v, vClass = "" }) => (
    <div className="flex items-start justify-between py-1.5 border-b border-gray-100 last:border-0 gap-2.5 text-[12px]">
      <span className="text-gray-400 shrink-0">{k}</span>
      <span
        className={`font-mono text-[11.5px] text-right break-all ${vClass || "text-gray-800"}`}
      >
        {v}
      </span>
    </div>
  );

  const actionBtns = [
    {
      label: "Create Incident",
      action: "search",
      icon: () => (
        // ← arrow function mein wrap karo
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
      ),
      toast: "Incident created from this log",
    },
    {
      label: "Replay Request",
      action: "save",
      icon: () => (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      ),
      toast: "Replaying request…",
    },
    {
      label: "Find Similar Errors",
      action: "save",
      icon: () => (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      toast: "Searching similar errors",
    },
    {
      label: "Retry from DLQ",
      action: "save",
      icon: () => (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      ),
      toast: "Retried from dead-letter queue",
    },
    {
      label: "View in Pipeline Monitor",
      action: "save",
      icon: () => (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="2" y="8" width="4" height="8" rx="1" />
          <rect x="10" y="5" width="4" height="14" rx="1" />
          <rect x="18" y="10" width="4" height="6" rx="1" />
        </svg>
      ),
      toast: "Navigated to pipeline monitor",
    },
    {
      label: "Suppress Alerts",
      action: "delete",
      icon: () => (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
      ),
      toast: "Log suppressed for 30 min",
    },
  ];

  return (
    <div className="w-[300px] shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
      <SideSection title="Log Entry">
        <SRow k="Log ID" v="log_0047" />
        <SRow
          k="Correlation ID"
          v={
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => showToast("Searching by correlation ID")}
            >
              req_4F8KM2XA
            </span>
          }
        />
        <SRow k="Timestamp" v="2024-03-28 14:24:12.441" />
        <SRow k="Level" v="ERROR" vClass="text-red-600" />
        <SRow k="Tier" v="Hot" vClass="text-blue-600" />
        <SRow k="Region" v="us-east-1" />
      </SideSection>

      <SideSection title="API">
        <SRow k="Name" v="payment-api" />
        <SRow k="Version" v="v2.4.1" />
        <SRow k="Method" v="POST" />
        <SRow k="Endpoint" v="/v2/charge" />
        <SRow k="Status code" v="503" vClass="text-red-600" />
        <SRow k="Response time" v="— (timeout)" vClass="text-red-600" />
        <SRow k="Payload size" v="3,412 bytes" />
      </SideSection>

      <SideSection title="Pipeline">
        <SRow k="Ingest stage" v="✓ 2ms" vClass="text-green-600" />
        <SRow k="Parser stage" v="✓ 4ms" vClass="text-green-600" />
        <SRow k="Enricher stage" v="⚠ 42ms" vClass="text-amber-600" />
        <SRow k="Router stage" v="✓ 1ms" vClass="text-green-600" />
        <SRow k="Writer stage" v="✗ Error" vClass="text-red-600" />
        <SRow k="Total pipeline" v="49ms" vClass="text-amber-600" />
        <SRow k="Worker" v="worker-3" />
        <SRow k="Buffer lag" v="+38ms (Buf 3)" vClass="text-amber-600" />
      </SideSection>

      <SideSection title="Storage">
        <SRow k="Tier" v="Hot" vClass="text-blue-600" />
        <SRow k="Ingested at" v="14:24:12.441" />
        <SRow k="Written at" v="Failed" vClass="text-red-600" />
        <SRow k="Retry #" v="3 / 3" vClass="text-amber-600" />
        <SRow k="Dead-letter" v="Yes — dlq-001" vClass="text-red-600" />
        <SRow k="Rotation rule" v="Hot → Cold after 48h" />
        <SRow k="TTL" v="47h 35m remaining" />
      </SideSection>

      <SideSection title="Actions">
        <div className="flex flex-col gap-1.5">
          {actionBtns.map(({ label, action, icon, toast }) => {
            return (
              <ActionButton
                key={label}
                action={action}
                onClick={() => showToast(toast)}
                label={label}
                icon={icon}
                className="justify-center"
              />
            );
          })}
        </div>
      </SideSection>

      <SideSection title="Similar Errors (1h)">
        <div className="flex flex-col gap-2">
          {SIMILAR_ERRORS.map((s) => (
            <div
              key={s.api}
              onClick={() => showToast(`Searching ${s.api} errors`)}
              className="flex items-center gap-2 p-2.5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-gray-800 truncate">
                  {s.api}
                </div>
                <div className="text-[11px] text-gray-400">
                  HTTP {s.code} · {s.count}x · {s.ago}
                </div>
              </div>
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>
      </SideSection>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LogDetail() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") showToast("← Log 46 of 1,247");
      if (e.key === "ArrowRight") showToast("→ Log 48 of 1,247");
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const Btn = ({ children, onClick, variant = "default" }) => {
    const cls = {
      default:
        "border-gray-200 text-gray-500 bg-white hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50",
      primary: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700",
    }[variant];
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] border rounded-lg transition-colors whitespace-nowrap cursor-pointer ${cls}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden text-[#1c1f2e] text-sm antialiased container-page">
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* PAGE HEADER */}
        <div className="border-b border-gray-200 pb-3.5 shrink-0">
          <div className="flex items-start justify-between gap-4">
            {/* LEFT → Page Header */}
            <PageHeader
              className="flex flex-col gap-1.5"
              icon={
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  <circle cx="5" cy="12" r="2" />
                </svg>
              }
              title="Log Detail / Trace"
              breadcrumbs={[
                { label: "Dashboard", href: "#" },
                { label: "Logs", href: "#" },
                { label: "Log Explorer", href: "/log-explorer" },
                { label: "req_4F8KM2XA" },
              ]}
            />

            {/* RIGHT → STACKED */}
            <div className="flex flex-col items-end gap-2">
              {/* Top → Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <ActionButton
                  action="save"
                  onClick={() => navigate("/log-explorer")}
                  label={"Back to Explorer"}
                  icon={BackIcon}
                />
                <ActionButton
                  action="save"
                  onClick={() => showToast("Log entry copied to clipboard")}
                  label={"Copy"}
                  icon={CopyIcon}
                />
                <ActionButton
                  action="save"
                  onClick={() => showToast("Incident opened from this trace")}
                  label={"Open Incident"}
                  icon={IncidentIcon}
                />

                <ActionButton
                  action="search"
                  lick={() => showToast("Full trace exported as JSON")}
                  label={"Export Trace"}
                  icon={ExportIcon}
                />
              </div>

              {/* Bottom → Prev / Next */}
              <div className="flex items-center gap-1.5 text-[11.5px] text-gray-500">
                <div className="flex items-center gap-1.5 pl-2 ">
                  <button
                    onClick={() => showToast("← Log 46 of 1,247")}
                    className="bg-white inline-flex items-center gap-1 px-2 py-1 text-[12px] border border-gray-200 rounded-md hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Prev
                  </button>

                  <span className="text-[11px] text-gray-400 whitespace-nowrap">
                    Log 47 of 1,247
                  </span>

                  <button
                    onClick={() => showToast("→ Log 48 of 1,247")}
                    className="bg-white inline-flex items-center gap-1 px-2 py-1 text-[12px] border border-gray-200 rounded-md hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    Next
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* MAIN COLUMN */}
          <div className="flex-1 overflow-y-auto pr-6 py-5 min-w-0">
            <Section>
              {/* HERO CARD */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 font-mono text-[12px] text-gray-400 mb-2">
                  <Badge value="Error" variant="down" />
                  <span>req_4F8KM2XA</span>
                  <span className="text-gray-300">·</span>
                  <span>2024-03-28 14:24:12.441 UTC</span>
                  <Badge value="Hot" variant="beta" />
                </div>

                <div className="text-[20px] font-light text-gray-800 mb-3.5 leading-snug tracking-tight">
                  Service Unavailable — upstream timeout on payment gateway
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge value="503" variant="down" />
                  <Badge value="POST" />
                  <Badge value="payment-api" variant="category" />
                  <Badge value="/v2/charge" />
                  <span className="text-gray-300 text-[12px]">·</span>
                  <span className="text-[12.5px] text-gray-400">Resp:</span>
                  <span className="font-mono text-[12.5px] text-red-600">
                    0ms (timeout)
                  </span>
                  <span className="text-gray-300 text-[12px]">·</span>
                  <span className="text-[12.5px] text-gray-400">us-east-1</span>
                  <span className="text-gray-300 text-[12px]">·</span>
                  <span className="text-[12.5px] text-gray-400">worker-3</span>
                </div>
              </div>
            </Section>

            <Section>
              {/* KPI ROW */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                <StatCard
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  }
                  iconColor="text-red-600"
                  count="30s"
                  countColor="text-red-600"
                  title="Timeout"
                />
                <StatCard
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  }
                  iconColor="text-blue-600"
                  count="cus_123"
                  countColor="text-blue-600"
                  title="Customer ID"
                />
                <StatCard
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  }
                  iconColor="text-amber-600"
                  count="88"
                  countColor="text-amber-600"
                  title="Risk Score"
                />
                <StatCard
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#16a34a"
                      strokeWidth="2"
                    >
                      <polyline points="16 3 21 3 21 8" />
                      <line x1="4" y1="20" x2="21" y2="3" />
                    </svg>
                  }
                  iconColor="text-green-600"
                  count="5"
                  countColor="text-green-600"
                  title="Span Count"
                />
                <StatCard
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="2"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-4 0v2" />
                    </svg>
                  }
                  iconColor="text-purple-700"
                  count="3.4KB"
                  countColor="text-purple-700"
                  title="Payload Size"
                />
              </div>
            </Section>

            <Section>
              {/* WATERFALL */}
              <SectionLabel>Distributed Trace — Waterfall</SectionLabel>
              <Waterfall showToast={showToast} />
            </Section>

            <Section>
              {/* PIPELINE JOURNEY */}
              <SectionLabel>Pipeline Stage Journey</SectionLabel>
              <PipelineJourney showToast={showToast} />
            </Section>

            <Section>
              {/* REQUEST / RESPONSE PAYLOADS */}
              <SectionLabel>Request &amp; Response Payloads</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                {/* Request */}
                <Card className="mb-0">
                  <CardHeader>
                    <CardTitle>
                      <Badge variant="beta" value="POST" />
                      /v2/charge — Request
                    </CardTitle>
                    <ActionButton
                      action="export"
                      onClick={() => showToast("Request copied")}
                      label="Copy"
                      icon={CopyIcon}
                    />
                  </CardHeader>
                  <CardBody className="p-3">
                    <div
                      className="bg-slate-800 rounded-lg p-3.5 font-mono text-[12px] leading-[1.85] max-h-[280px] overflow-auto"
                      dangerouslySetInnerHTML={{
                        __html: syntaxHL(REQ_PAYLOAD),
                      }}
                    />
                  </CardBody>
                </Card>
                {/* Response */}
                <Card className="mb-0 border-red-200">
                  <CardHeader className="bg-red-50">
                    <CardTitle>
                      <Badge variant="down" value="503" />
                      Response — Error
                    </CardTitle>
                    <ActionButton
                      action="export"
                      onClick={() => showToast("Response copied")}
                      label="Copy"
                      icon={CopyIcon}
                    />
                  </CardHeader>
                  <CardBody className="p-3">
                    <div
                      className="bg-slate-800 rounded-lg p-3.5 font-mono text-[12px] leading-[1.85] max-h-[280px] overflow-auto"
                      dangerouslySetInnerHTML={{
                        __html: syntaxHL(RES_PAYLOAD),
                      }}
                    />
                  </CardBody>
                </Card>
              </div>
            </Section>

            <Section>
              {/* REQUEST HEADERS */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Request Headers
                  </CardTitle>
                  <ActionButton
                    action="export"
                    onClick={() => showToast("Headers copied")}
                    label="Copy"
                    icon={CopyIcon}
                  />
                </CardHeader>
                <CardBody className="p-0">
                  <table className="w-full border-collapse">
                    <tbody>
                      {REQUEST_HEADERS.map(([k, v], i) => (
                        <tr
                          key={k}
                          className="border-b border-gray-100 last:border-0"
                        >
                          <td className="px-4 py-2 w-[200px] font-mono text-[11.5px] text-blue-600 font-medium whitespace-nowrap">
                            {k}
                          </td>
                          <td className="px-4 py-2 font-mono text-[11.5px] text-gray-400 break-all">
                            {v}
                          </td>
                          <td className="px-2.5 py-2 w-8">
                            <button
                              onClick={() => showToast(`Copied ${k}`)}
                              className="w-[22px] h-[22px] flex items-center justify-center border border-gray-200 rounded hover:border-blue-400 hover:text-blue-600 transition-colors text-gray-400"
                            >
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <rect
                                  x="9"
                                  y="9"
                                  width="13"
                                  height="13"
                                  rx="2"
                                />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardBody>
              </Card>
            </Section>

            <Section>
              {/* ENRICHMENT */}
              <SectionLabel>Enrichment Data</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-4">
                {/* Geo */}
                <Card className="mb-0">
                  <CardHeader>
                    <CardTitle>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                      </svg>
                      Geo
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    {[
                      ["Country", "US"],
                      ["City", "New York"],
                      ["ISP", "AWS Inc."],
                      ["IP", "10.42.18.1"],
                      ["Latency add", "+38ms"],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between py-1 text-[12.5px]"
                      >
                        <span className="text-gray-400 text-[11px]">{k}</span>
                        <span
                          className={`font-mono text-[12px] ${k === "Latency add" ? "text-amber-600" : "text-gray-800"}`}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </CardBody>
                </Card>
                {/* Risk */}
                <Card className="mb-0">
                  <CardHeader>
                    <CardTitle>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Risk
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="text-center mb-3">
                      <div className="text-[36px] font-light text-red-600 leading-none">
                        88
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        / 100 — High Risk
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: "88%" }}
                      />
                    </div>
                    <div className="text-[11.5px] text-gray-400 mt-2">
                      Factors: repeated 503, critical tag, no failover
                    </div>
                  </CardBody>
                </Card>
                {/* Ownership */}
                <Card className="mb-0">
                  <CardHeader>
                    <CardTitle>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                      Ownership
                    </CardTitle>
                  </CardHeader>
                  <CardBody>
                    {[
                      ["Owner", "Sara R."],
                      ["Team", "Payments"],
                      ["Category", "Payments"],
                      ["Compliance", "SOC2"],
                      ["Tier", "Hot"],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between py-1 text-[12.5px]"
                      >
                        <span className="text-gray-400 text-[11px]">{k}</span>
                        <span
                          className={`font-mono text-[12px] ${k === "Tier" ? "text-blue-600" : "text-gray-800"}`}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              </div>
            </Section>

            <Section>
              {/* RELATED LOGS */}
              <SectionLabel>Related Logs — Same Correlation ID</SectionLabel>
              <RelatedLogs showToast={showToast} />
            </Section>
          </div>

          {/* SIDE PANEL */}
          <SidePanel showToast={showToast} />
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-lg text-[13px] shadow-xl z-[9999]">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6ee7b7"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
