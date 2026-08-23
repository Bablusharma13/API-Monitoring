import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import { ExportIcon, RefreshIcon } from "../components/ui/Icons";
import { useGetAllRequestLogQuery } from "../features/tenants/hooks/query/useGetAllRequestLogsQuery";
import { Link } from "react-router-dom";
import { Minus } from "lucide-react";

const METHOD_STYLE = {
  GET: { bg: "bg-blue-50", text: "text-blue-700" },
  POST: { bg: "bg-green-50", text: "text-green-700" },
  PUT: { bg: "bg-amber-50", text: "text-amber-700" },
  DELETE: { bg: "bg-red-50", text: "text-red-700" },
  PATCH: { bg: "bg-purple-50", text: "text-purple-700" },
};

const LOG_GROUPS = {
  Request: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Response: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Context: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
};

function seededRnd(seed, a, b) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.round((x - Math.floor(x)) * (b - a) + a);
}

function uid(seed) {
  return Math.abs(seededRnd(seed, 0, 99999999))
    .toString(16)
    .padStart(8, "0");
}

function formatTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toTimeString().slice(0, 8);
}

const TENANT_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#16a34a",
  "#0891b2",
  "#ea580c",
  "#d97706",
  "#4f46e5",
  "#dc2626",
];

const getTenantColor = (initials) => {
  let hash = 0;
  for (let i = 0; i < initials.length; i++)
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  return TENANT_COLORS[Math.abs(hash) % TENANT_COLORS.length];
};

// ── PULSE CHART (SVG) ─────────────────────────────────────────────────────────
function PulseChart() {
  const w = 900,
    h = 90,
    padL = 8,
    padR = 8,
    padT = 4,
    padB = 20;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const pts = 30;
  const total = Array.from({ length: pts }, (_, i) =>
    seededRnd(i * 7 + 1, 180, 420),
  );
  const errs = total.map((v, i) =>
    Math.round((v * seededRnd(i * 3, 0, 4)) / 100),
  );
  const maxV = Math.max(...total);
  const toX = (i) => padL + (i / (pts - 1)) * chartW;
  const toY = (v) => padT + chartH - (v / maxV) * chartH;
  const errPath = errs
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`,
    )
    .join(" ");
  const errArea = `${errPath} L${(padL + chartW).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 80 }}>
      {total.map((v, i) => {
        const bw = Math.max(2, chartW / pts - 3);
        const x = toX(i) - bw / 2;
        const barH = (v / maxV) * chartH;
        return (
          <rect
            key={i}
            x={x}
            y={toY(v)}
            width={bw}
            height={barH}
            fill="#2563eb18"
            rx="1"
          />
        );
      })}
      <path d={errArea} fill="#dc262612" />
      <path d={errPath} stroke="#dc2626" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// ── WATERFALL CHART ───────────────────────────────────────────────────────────
function WaterfallChart({ lat }) {
  const segments = [
    { label: "DNS lookup", ms: seededRnd(lat * 2, 1, 8), color: "#2563eb" },
    { label: "TCP connect", ms: seededRnd(lat * 3, 2, 15), color: "#7c3aed" },
    { label: "TLS handshake", ms: seededRnd(lat * 5, 5, 25), color: "#0891b2" },
    { label: "Request sent", ms: seededRnd(lat * 7, 1, 5), color: "#16a34a" },
    {
      label: "Server processing",
      ms: Math.max(10, lat - 60),
      color: "#d97706",
    },
    {
      label: "Response transfer",
      ms: seededRnd(lat * 11, 3, 20),
      color: "#ea580c",
    },
  ];
  let offset = 0;
  return (
    <div>
      {segments.map((s) => {
        const left = Math.round((offset / lat) * 100);
        const width = Math.max(3, Math.round((s.ms / lat) * 100));
        offset += s.ms;
        return (
          <div
            key={s.label}
            className="flex items-center h-7 border-b border-gray-100 last:border-b-0"
          >
            <div className="w-36 text-[11.5px] text-gray-400 px-3 flex-shrink-0 truncate">
              {s.label}
            </div>
            <div className="flex-1 relative h-3.5 bg-gray-50 rounded-sm overflow-hidden">
              <div
                className="absolute h-full rounded-sm flex items-center justify-end pr-1"
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  background: s.color,
                }}
              >
                <span className="text-white text-[10px] font-mono whitespace-nowrap">
                  {s.ms}ms
                </span>
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex gap-3 flex-wrap mt-3">
        {[
          ["DNS", "#2563eb"],
          ["TCP", "#7c3aed"],
          ["TLS", "#0891b2"],
          ["Request", "#16a34a"],
          ["Server", "#d97706"],
          ["Transfer", "#ea580c"],
        ].map(([l, c]) => (
          <span
            key={l}
            className="flex items-center gap-1.5 text-[11.5px] text-gray-400"
          >
            <span
              className="w-2.5 h-2.5 rounded-[2px] flex-shrink-0"
              style={{ background: c }}
            />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── TRACE DRAWER ──────────────────────────────────────────────────────────────
function TraceDrawer({ log, onClose }) {
  const [activeTab, setActiveTab] = useState("overview");
  if (!log) return null;

  const sc = Math.floor(log.statusCode / 100);
  const latColor =
    log.latency > 400
      ? "text-red-600"
      : log.latency > 150
        ? "text-amber-600"
        : "text-green-600";
  const statusColor =
    sc === 2 ? "text-green-600" : sc === 4 ? "text-amber-600" : "text-red-600";
  const isWrite = ["POST", "PUT", "PATCH"].includes(log.method);

  const ctx = [
    ["Tenant", log.tenantId?.name || "—"],
    ["User", log.employeeId?.name || "—"],
    ["IP Address", log.ip],
    ["Endpoint", log.endpoint],
  ];

  const tabs = ["overview", "waterfall", "request", "response", "headers"];

  const CodeBlock = ({ children }) => (
    <pre className="bg-[#1c1f2e] rounded-lg p-4 font-mono text-[11.5px] text-slate-200 leading-relaxed overflow-x-auto">
      {children}
    </pre>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/30 z-[998] transition-opacity duration-300`}
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 w-[480px] h-full bg-white border-l border-gray-200 z-[999] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex px-2 py-0.5 rounded font-mono text-[11px] font-medium ${METHOD_STYLE[log.method]?.bg} ${METHOD_STYLE[log.method]?.text}`}
              >
                {log.method}
              </span>
              <span
                className={`font-mono text-[12px] font-medium ${statusColor}`}
              >
                {log.statusCode}
              </span>
              <Badge
                value={
                  sc === 2
                    ? "Success"
                    : sc === 4
                      ? "Client error"
                      : "Server error"
                }
                variant={sc === 2 ? "active" : sc === 4 ? "warning" : "down"}
              />
            </div>
            <div className="font-mono text-[13px] text-gray-800">
              {log.endpoint}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              Trace: {log._id}
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/60 flex-shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-[13px] border-b-2 transition-all whitespace-nowrap capitalize ${activeTab === tab ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-700"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {[
                  {
                    label: "Total latency",
                    value: `${log.latency}ms`,
                    color: latColor,
                  },
                  {
                    label: "Status",
                    value: log.statusCode,
                    color: statusColor,
                  },
                  {
                    label: "Time",
                    value: formatTime(log.recordedAt),
                    mono: true,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <div className="text-[11px] text-gray-400 mb-1">
                      {item.label}
                    </div>
                    <div
                      className={`text-[20px] font-light ${item.color} ${item.mono ? "font-mono text-[13px]" : ""}`}
                      style={
                        !item.mono
                          ? { fontFamily: "'Outfit', sans-serif" }
                          : undefined
                      }
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10.5px] uppercase tracking-wider text-gray-400 mb-2">
                Context
              </div>
              {ctx.map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0 text-[13px]"
                >
                  <span className="text-gray-400">{k}</span>
                  <span className="font-mono text-[12px]">{v}</span>
                </div>
              ))}
            </div>
          )}

          {/* Waterfall */}
          {activeTab === "waterfall" && (
            <div className="p-5">
              <div className="text-[12px] text-gray-400 mb-3">
                Breakdown of time spent at each stage
              </div>
              <WaterfallChart lat={log.latency} />
            </div>
          )}

          {/* Request */}
          {activeTab === "request" && (
            <div className="p-5">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">
                Request Details
              </div>
              <div className="mb-5">
                {[
                  ["Method", log.method],
                  ["Endpoint", log.endpoint],
                  ["IP", log.ip],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-mono text-[12px] text-blue-600">
                      {k}
                    </span>
                    <span className="font-mono text-[12px] text-gray-700">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">
                Request Body
              </div>
              <CodeBlock>
                {isWrite
                  ? `{\n  "name": "New Contact",\n  "email": "user@example.com",\n  "tenant_id": "tenant_nx_001"\n}`
                  : "// GET request — no body"}
              </CodeBlock>
            </div>
          )}

          {/* Response */}
          {activeTab === "response" && (
            <div className="p-5">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">
                Response Body
              </div>
              <CodeBlock>
                {log.statusCode < 400
                  ? `{\n  "data": [\n    { "id": "cnt_8f2a1b", "name": "Priya Mehta" }\n  ],\n  "meta": { "total": 4821, "page": 1 }\n}`
                  : log.statusCode === 429
                    ? `{\n  "error": "rate_limit_exceeded",\n  "message": "Too many requests",\n  "retry_after": 60\n}`
                    : `{\n  "error": "${log.statusCode < 500 ? "not_found" : "internal_server_error"}",\n  "message": "${log.statusCode < 500 ? "Resource not found" : "An unexpected error occurred"}"\n}`}
              </CodeBlock>
            </div>
          )}

          {/* Headers */}
          {activeTab === "headers" && (
            <div className="p-5">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">
                Request Headers
              </div>
              <div className="mb-5">
                {[
                  ["Authorization", "Bearer eyJhbGci…"],
                  ["Content-Type", "application/json"],
                  ["X-Tenant-ID", log.tenantId?._id || "—"],
                  ["Accept", "application/json"],
                  ["User-Agent", "CRM-SDK/2.1.0"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-mono text-[11.5px] text-blue-600">
                      {k}
                    </span>
                    <span className="font-mono text-[11px] text-gray-400 text-right max-w-[240px] truncate">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">
                Response Headers
              </div>
              <div>
                {[
                  ["Content-Type", "application/json; charset=utf-8"],
                  ["X-Request-ID", log._id],
                  ["X-RateLimit-Remaining", "117"],
                  ["Cache-Control", "no-store"],
                  ["X-Response-Time", `${log.latency}ms`],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-mono text-[11.5px] text-blue-600">
                      {k}
                    </span>
                    <span className="font-mono text-[11px] text-gray-400 text-right max-w-[240px] truncate">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function RequestLog() {
  const [isLive, setIsLive] = useState(true);
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sortField, setSortField] = useState("recordedAt");
  const [sortType, setSortType] = useState("desc");
  const [activeLog, setActiveLog] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  const { data: allrequestLogs, isFetching } = useGetAllRequestLogQuery(
    pageIndex + 1,
    pageLimit,
    query || undefined,
    sortField || undefined,
    sortType || undefined,
  );

  const tableData = allrequestLogs?.data ?? [];
  const pagination = allrequestLogs?.pagination ?? {
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0,
  };
  const summary = allrequestLogs?.stats;

  const columns = [
    {
      id: "recordedAt",
      name: "Time",
      width: 90,
      group: "Request",
      cell: (row) => (
        <span className="font-mono text-[11px] text-gray-400">
          {formatTime(row.recordedAt)}
        </span>
      ),
    },
    {
      id: "method",
      name: "Method",
      width: 80,
      group: "Request",
      cell: (row) => {
        const s = METHOD_STYLE[row.method] || {
          bg: "bg-gray-100",
          text: "text-gray-600",
        };
        return (
          <span
            className={`inline-flex px-2 py-0.5 rounded font-mono text-[11px] font-medium ${s.bg} ${s.text}`}
          >
            {row.method}
          </span>
        );
      },
    },
    {
      id: "endpoint",
      name: "Endpoint",
      width: 220,
      group: "Request",
      cell: (row) => (
        <Link
          to={`/dashboard/endpoint-explorer/endpoint-detail?endpoint=${row.endpoint}&method=${row.method}`}
          className="font-mono text-[12px] text-blue-500"
        >
          {row.endpoint}
        </Link>
      ),
    },
    {
      id: "statusCode",
      name: "Status",
      width: 70,
      group: "Response",
      cell: (row) => {
        const sc = Math.floor(row.statusCode / 100);
        const c =
          sc === 2
            ? "text-green-600"
            : sc === 4
              ? "text-amber-600"
              : "text-red-600";
        return (
          <span className={`font-mono text-[12px] font-medium ${c}`}>
            {row.statusCode}
          </span>
        );
      },
    },
    {
      id: "latency",
      name: "Latency",
      width: 130,
      group: "Response",
      cell: (row) => {
        const c =
          row.latency > 400
            ? "#dc2626"
            : row.latency > 150
              ? "#d97706"
              : "#2563eb";
        const tc =
          row.latency > 400
            ? "text-red-600"
            : row.latency > 150
              ? "text-amber-600"
              : "text-gray-700";
        return (
          <div className="flex items-center gap-1.5">
            <div className="w-14 h-1 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, Math.round((row.latency / 800) * 100))}%`,
                  background: c,
                }}
              />
            </div>
            <span className={`font-mono text-[12px] ${tc}`}>
              {row.latency}ms
            </span>
          </div>
        );
      },
    },
    {
      id: "tenantId",
      name: "Tenant",
      width: 130,
      group: "Context",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-[26px] h-[26px] rounded-[6px] flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
            style={{
              background: getTenantColor(row.tenantId?.name?.slice(0, 1)),
            }}
          >
            {row.tenantId?.name?.slice(0, 1)}
          </div>
          <Link
            to={`/dashboard/tenants/${row.tenantId._id}`}
            className="text-[12.5px] text-blue-500"
          >
            {row.tenantId?.name || "—"}
          </Link>
        </div>
      ),
    },
    {
      id: "employeeId",
      name: "User",
      width: 110,
      group: "Context",
      cell: (row) => {
        if (!row.employeeId?._id) return <Minus />;
        return (
          <div className="flex items-center gap-2.5">
            {row.employeeId?.image_url ? (
              <img
                src={row.employeeId.image_url}
                alt=""
                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0 bg-purple-500">
                {row.employeeId?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
            <Link
              to={`/dashboard/tenants/${row.tenantId._id}/employees/${row.employeeId?._id}`}
              className="flex flex-col cursor-pointer text-blue-500"
            >
              <span className="text-[13px]  leading-tight">
                {row.employeeId?.name}
              </span>
            </Link>
          </div>
        );
      },
    },
    {
      id: "ip",
      name: "IP",
      width: 100,
      group: "Context",
      cell: (row) => (
        <span className="font-mono text-[11px] text-gray-400">{row.ip}</span>
      ),
    },
    ,
  ];

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
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      count: summary?.totalRequestsAllTime?.toLocaleString() || "0",
      countColor: "text-blue-600",
      title: "Total Requests",
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
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      count: `${summary?.avgLatency?.toFixed(0)?.toLocaleString() || "0"}ms`,
      countColor: "text-green-600",
      title: "Avg Latency",
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
          stroke="#16a34a"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
        </svg>
      ),
      count: `${summary?.errorRate || "0"}%`,
      countColor: "text-green-600",
      title: "Error Rate",
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
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      count: summary?.errorRequests || "0",
      countColor: "text-amber-600",
      title: "Error Requests",
      badgeText: "4xx/5xx count",
      badgeBg: "bg-amber-50",
      badgeTextColor: "text-amber-600",
    },
  ];

  const ADDITIONAL_FILTERS = [
    {
      id: "status",
      name: "Status",
      filterName: "statusCode",
      multiSelect: false,
      options: [
        { value: "2", label: "2xx Success" },
        { value: "4", label: "4xx Client error" },
        { value: "5", label: "5xx Server error" },
      ],
    },
    {
      id: "latency",
      name: "Latency",
      filterName: "latency",
      multiSelect: false,
      options: [
        { value: "fast", label: "< 100ms" },
        { value: "med", label: "100–500ms" },
        { value: "slow", label: "> 500ms" },
      ],
    },
    {
      id: "method",
      name: "Method",
      filterName: "method",
      multiSelect: false,
      options: [
        { value: "GET", label: "GET" },
        { value: "POST", label: "POST" },
        { value: "PUT", label: "PUT" },
        { value: "DELETE", label: "DELETE" },
      ],
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
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="Request Log"
          breadcrumbs={[
            { label: "Home", href: "/dashboard/tenant" },
            { label: "Request Log" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Log Table with filters */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <Table
            columns={columns}
            group={LOG_GROUPS}
            tableName="request-log"
            data={tableData}
            loading={isFetching}
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
              totalCount: pagination.total,
              totalPages: pagination.totalPages || 1,
            }}
            onRowClick={(row) => setActiveLog(row)}
            sortField={sortField}
            setSortField={setSortField}
            sortType={sortType}
            setSortType={setSortType}
            activeFilters={activeFilters}
            showRowNumbers={false}
          />
        </div>
      </div>
    </div>
  );
}
