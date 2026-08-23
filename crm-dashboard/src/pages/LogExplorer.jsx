import { useState, useMemo, useEffect, useRef } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { useNavigate } from "react-router-dom";
import { Table } from "../components/TableComponents/Table";
import { ArrowUpRight } from "lucide-react";
import { CopyIcon } from "../components/ui/Icons";
import {
  Drawer as DrawerPanel,
  DrawerSection,
  DrawerRow as DRow,
} from "../components/ui/Drawer";
import ActionsCell from "../components/TableComponents/ActionsCell";
import { Badge } from "../components/ui/Badge";
import SingleSelect from "../components/ui/SingleSelect";
import { Section } from "../components/ui/Section";

// ── DATA GENERATION ────────────────────────────────────────────────────────
const APIS = [
  "payment-api",
  "auth-service",
  "email-gateway",
  "billing-api",
  "cdn-api",
  "user-api",
  "order-api",
  "notify-api",
  "crm-api",
  "report-api",
];
const METHODS = ["POST", "GET", "POST", "PUT", "GET", "POST", "DELETE", "GET"];
const MSGS = [
  "Service Unavailable — upstream timeout",
  "Connection refused to upstream host",
  "Internal Server Error — null reference",
  "Unauthorized — JWT expired",
  "Rate limit exceeded — 429",
  "POST /v2/charge — processed successfully",
  "GET /v3/profile — 200 OK",
  "Geo lookup completed — 67ms",
  "High latency detected — 2.4s threshold exceeded",
  "Parse error — malformed JSON body",
];
const LEVELS = ["error", "error", "error", "warn", "warn", "info", "debug"];
const TIERS = ["hot", "hot", "hot", "hot", "cold"];
const REGIONS = ["us-east-1", "eu-west-1", "ap-southeast-2"];
const STAGES = ["Ingest", "Parser", "Enricher", "Writer"];
const GEOS = [
  "US · New York",
  "DE · Frankfurt",
  "SG · Singapore",
  "GB · London",
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randN = (a, b) => Math.floor(Math.random() * (b - a) + a);
const corrId = () =>
  "req_" + Math.random().toString(36).slice(2, 10).toUpperCase();

const LOGS = Array.from({ length: 120 }, (_, i) => {
  const lvl = rand(LEVELS);
  const api = rand(APIS);
  const code =
    lvl === "error"
      ? rand([500, 502, 503, 504])
      : lvl === "warn"
        ? rand([401, 429, 422])
        : 200;
  const resp =
    lvl === "error" ? 0 : lvl === "warn" ? randN(800, 2800) : randN(30, 500);
  const tier = rand(TIERS);
  const now = Date.now() - i * 18000;
  return {
    id: "log_" + String(i + 1).padStart(4, "0"),
    ts: new Date(now).toISOString().replace("T", " ").slice(0, 23),
    tier,
    lvl,
    api,
    method: rand(METHODS),
    code,
    resp,
    corr: corrId(),
    msg: rand(MSGS),
    region: rand(REGIONS),
    stage: rand(STAGES),
    geo: rand(GEOS),
    risk: randN(5, 95),
    size: randN(120, 8000),
    worker: "worker-" + randN(1, 8),
  };
});

// ── BADGE COMPONENTS ────────────────────────────────────────────────────────
const LevelBadge = ({ level }) => {
  const variantMap = {
    error: "down",
    warn: "warning",
    info: "beta",
    debug: "default",
  };

  return <Badge value={level.toUpperCase()} variant={variantMap[level]} />;
};

const TierBadge = ({ tier }) =>
  tier === "hot" ? (
    <Badge variant="beta" value="Hot" />
  ) : (
    <Badge variant="Go" value="Cold" />
  );

const MethodBadge = ({ method }) => {
  return <Badge value={method} />;
};

const StatusCode = ({ code }) => {
  const variant =
    code >= 500
      ? "down"
      : code >= 400
        ? "warning"
        : code >= 300
          ? "category"
          : "active";

  return <Badge value={String(code)} variant={variant} />;
};

const RespTime = ({ resp, lvl }) => {
  if (lvl === "error" && resp === 0)
    return <span className="font-mono text-[12px] text-red-500">—</span>;
  const color =
    resp > 1000
      ? "text-red-500"
      : resp > 500
        ? "text-amber-500"
        : "text-gray-700";
  return <span className={`font-mono text-[12px] ${color}`}>{resp}ms</span>;
};

// ── TOAST ────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef();
  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast(null), 2600);
  };
  return { toast, showToast };
};

// ── DRAWER ───────────────────────────────────────────────────────────────────
function syntaxHighlight(json) {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (m) => {
        let cls = "text-yellow-300";
        if (/^"/.test(m))
          cls = /:$/.test(m) ? "text-blue-300" : "text-green-300";
        else if (/true|false/.test(m)) cls = "text-pink-300";
        return `<span class="${cls}">${m}</span>`;
      },
    );
}

const DrawerRow = ({ k, v }) => (
  <div className="flex items-start justify-between py-1.5 border-b border-gray-100 last:border-0 gap-3 text-[12.5px]">
    <span className="text-gray-400 shrink-0 w-28">{k}</span>
    <span className="text-gray-800 font-mono text-[12px] text-right break-all">
      {v}
    </span>
  </div>
);

function Drawer({ log, onClose }) {
  const navigate = useNavigate();

  if (!log) return null;

  const json = {
    id: log.id,
    timestamp: log.ts,
    level: log.lvl,
    api: log.api,
    method: log.method,
    status: log.code,
    response_ms: log.resp,
    correlation_id: log.corr,
    message: log.msg,
    region: log.region,
    tier: log.tier,
    enrichment: { geo: log.geo, risk_score: log.risk },
  };

  const sections = [
    {
      title: "Overview",
      rows: [
        ["Timestamp", log.ts],
        ["Level", log.lvl.toUpperCase()],
        ["Tier", log.tier.charAt(0).toUpperCase() + log.tier.slice(1)],
        ["API", log.api],
        ["Status", log.code],
        ["Region", log.region],
        ["Correlation ID", log.corr],
        ["Message", log.msg],
      ],
    },
    {
      title: "Request",
      rows: [
        ["Method", log.method],
        ["Endpoint", "/v2/" + log.api.replace("-api", "")],
        ["Response time", log.resp ? log.resp + "ms" : "—"],
        ["Payload size", log.size + " bytes"],
        ["User-Agent", "SyberFort-Monitor/2.4"],
        ["IP", `10.${randN(0, 255)}.${randN(0, 255)}.1`],
      ],
    },
    {
      title: "Pipeline Info",
      rows: [
        ["Pipeline stage", log.stage],
        ["Worker", log.worker],
        ["Buffer lag", log.lvl === "warn" ? "38ms" : "<1ms"],
        ["Ingest time", log.ts],
        ["Processing time", randN(2, 45) + "ms"],
        ["Route", log.tier === "hot" ? "→ Hot Store" : "→ Cold Store"],
      ],
    },
    {
      title: "Enrichment",
      rows: [
        ["Geo", log.geo],
        ["Risk score", log.risk + " / 100"],
        ["Category", "Payments"],
        ["Owner", "Sara R."],
        ["Compliance", "SOC2"],
        ["Enricher latency", randN(8, 55) + "ms"],
      ],
    },
  ];

  return (
    <DrawerPanel
      isOpen={!!log}
      onClose={onClose}
      size="lg"
      direction="right"
      title={`${log.api} · ${log.id}`}
      subtitle={
        <div className="flex items-center gap-2">
          <ActionButton
            action="export"
            onClick={() => navigate("/log-detail-trace")}
            label="Trace"
            icon={ArrowUpRight}
          />
          <ActionButton
            action="export"
            onClick={() => {}}
            label="Copy"
            icon={CopyIcon}
          />
        </div>
      }
    >
      {sections.map(({ title, rows }) => (
        <DrawerSection key={title} label={title}>
          {rows.map(([k, v]) => (
            <DRow key={k} label={k} value={v} />
          ))}
        </DrawerSection>
      ))}

      {/* Raw Payload */}
      <DrawerSection label="Raw Payload">
        <div
          className="bg-slate-800 rounded-lg p-3.5 font-mono text-[11.5px] leading-relaxed overflow-x-auto max-h-48 overflow-y-auto"
          dangerouslySetInnerHTML={{
            __html: syntaxHighlight(JSON.stringify(json, null, 2)),
          }}
        />
      </DrawerSection>
    </DrawerPanel>
  );
}

// ── HISTOGRAM ────────────────────────────────────────────────────────────────
function Histogram({ logs }) {
  const buckets = useMemo(() => {
    const b = Array.from({ length: 36 }, () => ({ e: 0, w: 0, i: 0 }));
    logs.forEach((l) => {
      const idx = Math.min(35, Math.floor(Math.random() * 36));
      if (l.lvl === "error") b[idx].e++;
      else if (l.lvl === "warn") b[idx].w++;
      else b[idx].i++;
    });
    const max = Math.max(...b.map((x) => x.e + x.w + x.i), 1);
    return b.map((x) => ({
      ...x,
      total: x.e + x.w + x.i,
      pct: Math.max(4, Math.round(((x.e + x.w + x.i) / max) * 100)),
      color: x.e > 0 ? "#dc2626" : x.w > 0 ? "#d97706" : "#2563eb",
    }));
  }, [logs]);

  return (
    <div className="px-5 py-2.5 border-b border-gray-100 shrink-0">
      <div className="flex items-end gap-0.5 h-12">
        {buckets.map((b, i) => (
          <div
            key={i}
            title={`${b.total} logs`}
            className="flex-1 rounded-t min-w-[3px] cursor-pointer transition-opacity hover:opacity-70"
            style={{ height: `${b.pct}%`, background: b.color, opacity: 0.65 }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {["6h ago", "5h", "4h", "3h", "2h", "1h", "Now"].map((l) => (
          <span key={l} className="text-[11px] text-gray-400">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LogExplorer() {
  const [query, setQueryState] = useState('status:500 api:"payment-api"');
  const [tier, setTierState] = useState("all");
  const [timeRange, setTimeRange] = useState("Last 6 hours");
  const [storageTier, setStorageTier] = useState("Hot + Cold");
  const [drawerLog, setDrawerLog] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [sortBy, setSortBy] = useState("Newest first");
  const { toast, showToast } = useToast();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let list = LOGS.filter((l) => {
      if (q) {
        const blob =
          `${l.api} ${l.msg} ${l.lvl} ${l.code} ${l.tier} ${l.corr} ${l.method}`.toLowerCase();
        const words = q
          .replace(/\w+:[^\s]+/g, "")
          .trim()
          .split(/\s+/)
          .filter(Boolean);
        for (const w of words) {
          if (w.length > 1 && !blob.includes(w)) return false;
        }
        if (q.includes("level:error") && l.lvl !== "error") return false;
        if (q.includes("level:warn") && l.lvl !== "warn") return false;
        if (q.includes("status:500") && l.code !== 500) return false;
        if (q.includes("status:503") && l.code !== 503) return false;
        if (q.includes("tier:cold") && l.tier !== "cold") return false;
        if (q.includes("tier:hot") && l.tier !== "hot") return false;
        if (q.includes("resp_ms:>1000") && l.resp <= 1000) return false;
      }
      if (tier !== "all" && l.tier !== tier) return false;
      return true;
    });
    return list;
  }, [query, tier]);

  const page = filtered.slice(0, 25);

  const runSearch = () =>
    showToast(`Found ${filtered.length.toLocaleString()} logs`);

  const quickQueries = [
    { label: "level:error", q: "level:error last:1h" },
    { label: "status:>=500", q: "status:>=500" },
    { label: "payment-api 503", q: "api:payment-api status:503" },
    { label: "cold · Payments", q: "tier:cold category:Payments" },
    { label: "resp > 1s", q: "resp_ms:>1000" },
  ];
  const savedQueries = [
    { label: "5xx Errors", q: "status:500 OR status:503 level:error" },
    { label: "Auth Issues", q: "api:auth-service level:warn OR level:error" },
    { label: "Slow Requests", q: "resp_ms:>2000" },
  ];

  return (
    <div className=" text-[#1c1f2e] font-sans text-sm antialiased container-page">
      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* PAGE HEADER */}
        <div className=" border-b border-gray-200 pb-3.5 shrink-0">
          <div className="flex items-center justify-between gap-4 ">
            {/* LEFT */}
            <PageHeader
              className="flex flex-col gap-1.5"
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
              title="Log Explorer"
              breadcrumbs={[
                { label: "Dashboard", href: "#" },
                { label: "Logs", href: "#" },
                { label: "Log Explorer" },
              ]}
            />

            <div>
              <div className="flex items-center gap-2">
                <ActionButton
                  action="save"
                  onClick={() => showToast("Query saved")}
                  label={"Save Query"}
                />
                <ActionButton
                  action="export"
                  onClick={() => showToast("Exported 1,247 logs")}
                />
                <ActionButton action="search" onClick={runSearch} />
              </div>
              <div className="flex justify-end text-[11.5px] text-gray-500 pt-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  Hot + Cold · 2.4 B total logs
                </div>
              </div>
            </div>
          </div>
        </div>

        <Section>
          {/* SEARCH BAR */}
          <div className=" border-b border-gray-200 py-3.5 shrink-0">
            <div className="flex items-center border-1 border-blue-600 rounded-xl overflow-hidden shadow-[0_0_0_3px_rgba(37,99,235,0.08)]">
              {/* Tier */}
              <div className="flex items-center gap-2 px-3.5 border-r border-gray-200 h-11 shrink-0">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-[11.5px] text-gray-400">Tier</span>
                <select
                  value={storageTier}
                  onChange={(e) => {
                    setStorageTier(e.target.value);
                    showToast("Searching " + e.target.value);
                  }}
                  className="border-0 outline-none font-sans text-[12.5px] text-gray-700 bg-transparent cursor-pointer"
                >
                  <option>Hot + Cold</option>
                  <option>Hot only</option>
                  <option>Cold only</option>
                </select>
              </div>
              {/* Range */}
              <div className="flex items-center gap-2 px-3.5 border-r border-gray-200 h-11 shrink-0">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-[11.5px] text-gray-400">Range</span>
                <select
                  value={timeRange}
                  onChange={(e) => {
                    setTimeRange(e.target.value);
                    showToast("Range: " + e.target.value);
                  }}
                  className="border-0 outline-none font-sans text-[12.5px] text-gray-700 bg-transparent cursor-pointer"
                >
                  <option>Last 15 min</option>
                  <option>Last 1 hour</option>
                  <option>Last 6 hours</option>
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>
              {/* Input */}
              <div className="flex-1 flex items-center gap-2 px-3.5">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQueryState(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") runSearch();
                  }}
                  placeholder='e.g. status:500 api:"payment-api" level:error'
                  className="flex-1 border-0 outline-none font-mono text-[13px] text-gray-800 bg-transparent placeholder:font-sans placeholder:text-gray-300 placeholder:text-[13px]"
                />
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1.5 px-2.5 border-l border-gray-200 h-11 shrink-0">
                <button
                  onClick={() => {
                    setQueryState("");
                    showToast("Query cleared");
                  }}
                  className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md hover:border-blue-400 hover:text-blue-600 text-gray-400 transition-colors"
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
                <button
                  onClick={() => showToast("History panel")}
                  className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md hover:border-blue-400 hover:text-blue-600 text-gray-400 transition-colors"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </button>
                <button
                  onClick={runSearch}
                  className="px-3 py-1 text-[12px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Run
                </button>
              </div>
            </div>
            {/* Hints */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-[11px] text-gray-400 shrink-0">Quick:</span>
              {quickQueries.map(({ label, q }) => (
                <button
                  key={label}
                  onClick={() => setQueryState(q)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-gray-200 rounded-full text-[11.5px] text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all bg-[#f4f6fa] cursor-pointer"
                >
                  <code className="font-mono text-[11px]">{label}</code>
                </button>
              ))}
              <span className="w-px h-3.5 bg-gray-200 mx-1" />
              <span className="text-[11px] text-gray-400 shrink-0">Saved:</span>
              {savedQueries.map(({ label, q }) => (
                <button
                  key={label}
                  onClick={() => setQueryState(q)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-dashed border-gray-200 rounded-full text-[11.5px] text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-all cursor-pointer"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  </svg>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section>
          {/* BODY */}
          <div className="">
            {/* CONTENT */}
            <div className="">
              {/* RESULTS TOOLBAR */}
              <div className="flex items-center gap-2.5 px-5 py-2 border-b border-gray-200 bg-[#fafbfc] shrink-0 flex-wrap">
                <span className="text-[12.5px] font-medium text-gray-800">
                  {filtered.length.toLocaleString()} results
                </span>
                <span className="text-[12px] text-gray-400">
                  in 6h window · 0.24s
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {/* Tier toggle */}
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
                    {[
                      { id: "all", label: "All" },
                      { id: "hot", label: "Hot" },
                      { id: "cold", label: "Cold" },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => setTierState(id)}
                        className={`px-3 py-1 text-[12px] flex items-center gap-1.5 border-r last:border-r-0 border-gray-200 transition-colors
                       ${tier === id ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}
                      >
                        {id !== "all" && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${id === "hot" ? "bg-blue-400" : "bg-cyan-400"} ${tier === id ? "bg-white/70" : ""}`}
                          />
                        )}
                        {label}
                      </button>
                    ))}
                  </div>

                  <SingleSelect
                    value={sortBy}
                    onChange={(val) => {
                      setSortBy(val);
                      showToast("Sorted by: " + val);
                    }}
                    placeholder="Newest first"
                    options={[
                      { value: "Newest first", label: "Newest first" },
                      { value: "Oldest first", label: "Oldest first" },
                      { value: "Slowest response", label: "Slowest response" },
                      { value: "Highest risk", label: "Highest risk" },
                    ]}
                    className="border-gray-200"
                  />
                </div>
              </div>

              {/* HISTOGRAM */}
              <Histogram logs={filtered} />

              {/* LOG TABLE */}
              <div className="">
                <Table
                  group={{
                    Timestamp: {
                      hex: "#d97706",
                      bg: "bg-amber-50",
                      text: "text-amber-600",
                    },
                    Request: {
                      hex: "#2563eb",
                      bg: "bg-blue-50",
                      text: "text-blue-600",
                    },
                    Response: {
                      hex: "#0891b2",
                      bg: "bg-cyan-50",
                      text: "text-cyan-600",
                    },
                    Trace: {
                      hex: "#7c3aed",
                      bg: "bg-purple-50",
                      text: "text-purple-700",
                    },
                    Details: {
                      hex: "#16a34a",
                      bg: "bg-green-50",
                      text: "text-green-700",
                    },
                  }}
                  columns={[
                    {
                      id: "ts",
                      name: "Timestamp",
                      width: 160,
                      group: "Timestamp",
                      cell: (row) => (
                        <span className="font-mono text-[11px] text-gray-400">
                          {row.ts}
                        </span>
                      ),
                    },
                    {
                      id: "tier",
                      name: "Tier",
                      group: "Request",
                      width: 80,
                      cell: (row) => <TierBadge tier={row.tier} />,
                    },
                    {
                      id: "lvl",
                      name: "Level",
                      group: "Request",
                      width: 80,
                      cell: (row) => <LevelBadge level={row.lvl} />,
                    },
                    {
                      id: "api",
                      name: "API",
                      width: 140,
                      group: "Request",
                      cell: (row) => (
                        <span className="text-[12.5px] font-medium text-gray-800">
                          {row.api}
                        </span>
                      ),
                    },
                    {
                      id: "method",
                      name: "Method",
                      group: "Request",
                      width: 80,
                      cell: (row) => <MethodBadge method={row.method} />,
                    },
                    {
                      id: "code",
                      name: "Status",
                      group: "Response",
                      width: 80,
                      cell: (row) => <StatusCode code={row.code} />,
                    },
                    {
                      id: "resp",
                      name: "Resp",
                      group: "Response",
                      width: 80,
                      cell: (row) => <RespTime resp={row.resp} lvl={row.lvl} />,
                    },
                    {
                      id: "corr",
                      name: "Correlation ID",
                      width: 140,
                      group: "Trace",
                      cell: (row) => (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerLog(row);
                          }}
                          className="font-mono text-[11px] text-blue-600 cursor-pointer hover:underline"
                        >
                          {row.corr}
                        </span>
                      ),
                    },
                    {
                      id: "msg",
                      name: "Message",
                      width: 320,
                      group: "Details",
                      cell: (row) => (
                        <span className="text-[12.5px] text-gray-700 truncate">
                          {row.msg}
                        </span>
                      ),
                    },
                    {
                      id: "actions",
                      name: "Actions",
                      width: 80,
                      pinnedRight: true,
                      disableSortBy: true,
                      cell: (row) => (
                        <ActionsCell
                          row={row}
                          actions={[
                            {
                              name: "View",
                              icon: (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              ),
                              onClick: (row) => console.log("View", row),
                            },
                            {
                              name: "Edit",
                              icon: (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              ),
                              onClick: (row) => console.log("Edit", row),
                            },
                            {
                              name: "Delete",
                              danger: true,
                              icon: (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                              ),
                              onClick: (row) => console.log("Delete", row),
                            },
                          ]}
                        />
                      ),
                    },
                  ]}
                  tableName="log-explorer"
                  data={filtered.slice(
                    pageIndex * pageLimit,
                    (pageIndex + 1) * pageLimit,
                  )}
                  loading={false}
                  enableSearch={false}
                  pageIndex={pageIndex}
                  setPageIndex={setPageIndex}
                  pageLimit={pageLimit}
                  setPageLimit={setPageLimit}
                  paginationData={{
                    totalCount: filtered.length,
                    totalPages: Math.ceil(filtered.length / pageLimit) || 1,
                  }}
                  onRowClick={(row) => setDrawerLog(row)}
                  selectable={true}
                  onSelectionChange={(rows) =>
                    setSelected(new Set(rows.map((r) => r.id)))
                  }
                  sortField={sortField}
                  setSortField={setSortField}
                  sortType={sortType}
                  setSortType={setSortType}
                  activeFilters={{}}
                  setActiveFilters={() => {}}
                />
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* DRAWER */}

      <Drawer log={drawerLog} onClose={() => setDrawerLog(null)} />

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-lg text-[13px] shadow-xl z-[9999] animate-[fadeIn_.2s_ease]">
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
