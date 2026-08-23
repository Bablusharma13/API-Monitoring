import React, { useState, useEffect, useRef, useCallback } from "react";

const CRM_BASE = import.meta.env.VITE_CRM_BACKEND;
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  Clock,
  Shield,
  Search,
  Download,
  Share2,
  RefreshCw,
  FileText,
  Bell,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Eye,
  RotateCcw,
  VolumeX,
  MoreVertical,
  Copy,
  ArrowLeftRight,
  Pencil,
} from "lucide-react";

import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { InfoCard } from "../../../components/ui/InfoCard";
import { StatCard } from "../../../components/ui/StatCard3.jsx";
import Modal from "../../../components/ui/Modal";
import NewTableConfig from "../../../components/TableComponents/TableConfig";

import {
  PulseWaveIcon,
  WarningTriangleIcon,
  StatusDownIcon,
  ClockIcon as SharedClockIcon,
} from "../../../components/ui/AppIcons";

// ── column definitions (same pattern as incidentsColumns in Incidents.jsx) ──
import { getDownApisColumns } from "./DownApisColumns";
import { getSlowApisColumns } from "./SlowApisColumns";
import { getLogsColumns } from "./LogsColumns";

import { useApiDashboard } from "../hooks/useApiDashboard";
import { Button } from "../../../components/ui/Button.jsx";

// ─── micro-components ─────────────────────────────────────────────────────────

const LiveDot = () => (
  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
);

const TrendChip = ({ trend, change }) => (
  <span
    className={`text-[11px] inline-flex items-center gap-0.5 px-1.5 py-px rounded font-medium
    ${trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
  >
    {trend === "up" ? "↑" : "↓"} {change}
  </span>
);

const LogLvl = ({ type }) => {
  const map = {
    error: "bg-red-50 text-red-600",
    warn: "bg-amber-50 text-amber-600",
    info: "bg-emerald-50 text-emerald-600",
    security: "bg-purple-50 text-purple-600",
  };
  return (
    <span
      className={`px-1.5 py-px rounded text-[10.5px] whitespace-nowrap  ${map[type] || "bg-gray-100 text-gray-600"}`}
    >
      {type.toUpperCase()}
    </span>
  );
};

const ApiBadge = ({ variant = "gray", children }) => {
  const map = {
    green: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    red: "bg-red-50 text-red-600 border border-red-200",
    amber: "bg-amber-50 text-amber-600 border border-amber-200",
    blue: "bg-blue-50 text-blue-600 border border-blue-200",
    purple: "bg-purple-50 text-purple-600 border border-purple-200",
    gray: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-px rounded-full text-[11.5px] whitespace-nowrap ${map[variant]}`}
    >
      {children}
    </span>
  );
};

const MiniBar = ({ pct, colorCls }) => (
  <div className="w-14 h-1 bg-[#f0f2f7] rounded overflow-hidden">
    <div
      className={`h-full rounded ${colorCls}`}
      style={{ width: `${pct}%` }}
    />
  </div>
);

const codeClass = (code) => {
  if (code === "200" || code === "201") return "text-emerald-600";
  if (parseInt(code) >= 500) return "text-red-600";
  if (parseInt(code) >= 400) return "text-amber-600";
  return "text-[#6b7280]";
};

const durClass = (dur) => {
  if (dur === "—") return "text-[#6b7280]";
  const n = parseInt(dur);
  if (n > 1000) return "text-red-600";
  if (n > 500) return "text-amber-600";
  return "text-emerald-600";
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGS SUB-COMPONENT — kept separate only because it needs own local state
// Uses NewTableConfig exactly like Incidents.jsx
// ─────────────────────────────────────────────────────────────────────────────
const LogsDebugCard = ({ logs, onShowToast }) => {
  // pagination state — same pattern as Incidents.jsx
  const [logPage, setLogPage] = useState(1);
  const [logLimit, setLogLimit] = useState(8);
  const [logSearch, setLogSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [logTab, setLogTab] = useState("api");
  const [selectedLog, setSelectedLog] = useState(null);
  const [sortField, setSortField] = useState("");
  const [sortType, setSortType] = useState("asc");

  const tabs = [
    { key: "api", label: "API Logs" },
    { key: "error", label: "Error Logs" },
    { key: "response", label: "Response Logs" },
  ];

  const tabMatch = (l) => {
    if (logTab === "api") return true;
    if (logTab === "error") return l.type === "error";
    if (logTab === "response") return l.code !== "—";
    if (logTab === "security") return l.type === "security";
    return true;
  };
  const typeMatch = (l) => typeFilter === "all" || l.type === typeFilter;

  // filter client-side — in production this would be server-side like Incidents
  const filtered = logs.filter(
    (l) =>
      tabMatch(l) &&
      typeMatch(l) &&
      (!logSearch ||
        l.api.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.msg.toLowerCase().includes(logSearch.toLowerCase()) ||
        l.code.toLowerCase().includes(logSearch.toLowerCase())),
  );

  // sort client-side
  const sorted = sortField
    ? [...filtered].sort((a, b) => {
        const aVal = a[sortField] ?? "";
        const bVal = b[sortField] ?? "";
        const cmp = String(aVal).localeCompare(String(bVal), undefined, {
          numeric: true,
        });
        return sortType === "asc" ? cmp : -cmp;
      })
    : filtered;

  const total = sorted.length;
  const totalPages = Math.ceil(total / logLimit) || 1;

  // slice for current page
  const pageData = sorted.slice((logPage - 1) * logLimit, logPage * logLimit);

  return (
    <>
      <div>
        {/* NewTableConfig — same props pattern as Incidents.jsx */}
        <NewTableConfig
          module="logs-debug"
          columns={getLogsColumns({
            onView: (row) => setSelectedLog(row),
          })}
          data={pageData}
          isLoading={false}
          onRowClick={(row) => setSelectedLog(row)}
          currentPage={logPage}
          setCurrentPage={setLogPage}
          pageLimit={logLimit}
          handlePageLimitChange={setLogLimit}
          totalResults={total}
          totalPages={totalPages}
          searchQuery={logSearch}
          onSearchChange={(val) => {
            setLogSearch(val);
            setLogPage(1);
          }}
          showRowNumbers={false}
          sortBy={sortField}
          sortOrder={sortType}
          handleServerSideSorting={({ sortBy, sortDirection }) => {
            setSortField(sortBy);
            setSortType(sortDirection);
            setLogPage(1);
          }}
        />
      </div>

      {/* Log detail modal */}
      <Modal
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Log Detail"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<Copy size={12} />}
              onClick={() => {
                onShowToast("Copied");
                setSelectedLog(null);
              }}
            >
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedLog(null)}
            >
              Close
            </Button>
          </>
        }
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { l: "Time", v: selectedLog.ts },
                { l: "API Name", v: selectedLog.api },
                { l: "Status Code", v: selectedLog.code },
                { l: "Duration", v: selectedLog.dur },
              ].map((x) => (
                <div key={x.l}>
                  <p className="text-[12px] text-[#6b7280] mb-1">{x.l}</p>
                  <p className=" text-[12.5px] text-[#1c1f2e]">{x.v}</p>
                </div>
              ))}
              <div>
                <p className="text-[12px] text-[#6b7280] mb-1">Type</p>
                <LogLvl type={selectedLog.type} />
              </div>
            </div>
            <div>
              <p className="text-[12px] text-[#6b7280] mb-1">Message</p>
              <div className=" text-[12px] text-[#1c1f2e] bg-[#f8f9fc] border border-[#e9ebf0] rounded-lg p-3 leading-relaxed">
                {selectedLog.msg}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ApiDashboard() {
  // ── all table data from hook ──────────────────────────────────────────────
  const {
    isLoading,
    kpis,
    systemStatus,
    downtimeSummary,
    alertsSummary,
    timeComparison,
    topDownApis,
    topSlowApis,
    activeIncidents,
    allIncidents,
    initialFeed,
    feedEventPool,
    logs,
  } = useApiDashboard();

  // ── Down APIs pagination state — same pattern as Incidents.jsx ────────────
  const [downPage, setDownPage] = useState(1);
  const [downLimit, setDownLimit] = useState(10);
  const [downSelected, setDownSelected] = useState(null);

  // ── Slow APIs pagination state ─────────────────────────────────────────────
  const [slowPage, setSlowPage] = useState(1);
  const [slowLimit, setSlowLimit] = useState(10);
  const [slowSelected, setSlowSelected] = useState(null);

  // ── global API search (header) ────────────────────────────────────────────
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDrop, setShowSearchDrop] = useState(false);
  const searchRef = useRef(null);
  const searchTimer = useRef(null);

  useEffect(() => {
    const trimmed = globalSearch.trim();
    if (!trimmed) {
      setSearchResults([]);
      setShowSearchDrop(false);
      return;
    }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await axios.get(`${CRM_BASE}/api/v1/apis`, {
          params: { search: trimmed, limit: 8, populate: "category" },
        });
        setSearchResults(data.data?.apis ?? data.data ?? []);
        setShowSearchDrop(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [globalSearch]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowSearchDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── modal state ───────────────────────────────────────────────────────────
  const [drillApi, setDrillApi] = useState(null);
  const [drillOpen, setDrillOpen] = useState(false);
  const [actionsApi, setActionsApi] = useState(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [incidentsOpen, setIncidentsOpen] = useState(false);

  // ── drill uptime bars — stable ref so bars don't regenerate on each render ─
  const drillBars = useRef(
    Array.from({ length: 30 }, () => {
      const r = Math.random();
      return r < 0.88 ? "up" : r < 0.94 ? "warn" : "down";
    }),
  ).current;

  // ── toast ─────────────────────────────────────────────────────────────────
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef();
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400);
  }, []);

  // ── real-time feed ────────────────────────────────────────────────────────
  const [feed, setFeed] = useState([]);
  useEffect(() => {
    if (initialFeed.length > 0) setFeed(initialFeed);
  }, [initialFeed]);
  const feedIdx = useRef(0);
  const addFeedItem = useCallback(() => {
    const ev = feedEventPool[feedIdx.current % feedEventPool.length];
    feedIdx.current++;
    const now = new Date();
    const ts = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setFeed((prev) => [{ ...ev, time: ts }, ...prev.slice(0, 9)]);
    showToast("Feed updated");
  }, [feedEventPool, showToast]);

  useEffect(() => {
    const t = setInterval(addFeedItem, 14000);
    return () => clearInterval(t);
  }, [addFeedItem]);

  const filteredDown = topDownApis;
  const filteredSlow = topSlowApis;

  // ── lookup maps ───────────────────────────────────────────────────────────
  const channelVariant = {
    Email: "blue",
    WhatsApp: "green",
    Slack: "purple",
    SMS: "gray",
  };

  const incCfg = {
    critical: {
      iconEl: <XCircle size={12} className="text-red-600" />,
      bg: "bg-red-50",
      badge: "red",
    },
    warning: {
      iconEl: <AlertTriangle size={12} className="text-amber-600" />,
      bg: "bg-amber-50",
      badge: "amber",
    },
    resolved: {
      iconEl: <CheckCircle size={12} className="text-emerald-600" />,
      bg: "bg-emerald-50",
      badge: "green",
    },
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="container-page pb-8">
        {/* ── 1. PAGE HEADER ── */}
        <PageHeader
          icon={<PulseWaveIcon width={20} height={20} />}
          iconGradient=""
          title="API Monitoring Dashboard"
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }]}
          actions={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap flex-shrink-0 w-full sm:w-auto">
              <div ref={searchRef} className="relative">
                <div className="flex items-center gap-2 border border-[#e9ebf0] rounded-lg px-3 py-1.5 bg-white w-full sm:min-w-[200px] max-w-full focus-within:border-blue-500 transition-colors">
                  <Search size={13} className="text-[#c2c8d4] flex-shrink-0" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    onFocus={() =>
                      searchResults.data.length > 0 && setShowSearchDrop(true)
                    }
                    placeholder="Search APIs…"
                    className="border-0 outline-none text-[13px] text-[#1c1f2e] bg-transparent w-full placeholder:text-[#c2c8d4]"
                  />
                  {searchLoading && (
                    <RefreshCw
                      size={12}
                      className="text-[#c2c8d4] animate-spin flex-shrink-0"
                    />
                  )}
                </div>

                {showSearchDrop && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e9ebf0] rounded-xl shadow-lg z-[9999] overflow-hidden min-w-[300px]">
                    {searchResults?.data.length === 0 ? (
                      <div className="px-4 py-3 text-[12.5px] text-[#6b7280]">
                        No APIs found
                      </div>
                    ) : (
                      searchResults.data.map((api) => {
                        const id = api.apiId;
                        const methodColors = {
                          GET: "text-emerald-600 bg-emerald-50",
                          POST: "text-blue-600 bg-blue-50",
                          PUT: "text-amber-600 bg-amber-50",
                          DELETE: "text-red-600 bg-red-50",
                          PATCH: "text-purple-600 bg-purple-50",
                        };
                        const method =
                          api.request?.method ?? api.method ?? "GET";
                        return (
                          <div
                            key={id}
                            onClick={() => {
                              navigate(`/dashboard/apis/${id}`);
                              setShowSearchDrop(false);
                              setGlobalSearch("");
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-[#f5f7ff] transition-colors border-b border-[#f3f5f9] last:border-b-0"
                          >
                            <span
                              className={`font-mono text-[10.5px] px-1.5 py-px rounded font-semibold ${methodColors[method] ?? "text-gray-600 bg-gray-100"}`}
                            >
                              {method}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-[#1c1f2e] font-medium truncate">
                                {api.name}
                              </p>
                              <p className="text-[11px] text-[#6b7280] truncate font-mono">
                                {api.request?.url ?? api.url ?? ""}
                              </p>
                            </div>
                            {api.isDisabled && (
                              <span className="text-[10.5px] text-red-500 bg-red-50 border border-red-200 rounded-full px-1.5 py-px flex-shrink-0">
                                Down
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="lg"
                icon={<Share2 />}
                onClick={() => showToast("Link copied")}
              >
                Share -CS-
              </Button>
              <Button
                variant="primary"
                size="lg"
                icon={<Download />}
                onClick={() => showToast("CSV downloaded")}
              >
                CSV -CS-
              </Button>
            </div>
          }
          extra={
            <div className="flex items-center gap-2 text-[11.5px] text-[#6b7280]">
              <LiveDot />
              Live · updated 12s ago
            </div>
          }
        />

        {/* ── 2. KPI STAT CARDS ── */}
        <Section>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              icon={<PulseWaveIcon width={20} height={20} stroke="#2563eb" />}
              count={kpis.totalApis}
              title="Total APIs"
              countColor="text-blue-600"
            />
            <StatCard
              icon={<Shield size={20} stroke="#10b981" />}
              count={kpis.activeApis}
              title="Active APIs"
              countColor="text-emerald-600"
            />
            <StatCard
              icon={<StatusDownIcon />}
              count={kpis.downNow}
              title="Down Now"
              countColor="text-red-600"
            />
            <StatCard
              icon={<SharedClockIcon stroke="#0891b2" />}
              count={kpis.avgUptime}
              title="Avg Uptime"
              countColor="text-cyan-600"
            />
            <StatCard
              icon={<WarningTriangleIcon stroke="#d97706" />}
              count={kpis.incidents}
              title="Incidents"
              countColor="text-amber-600"
            />
            <StatCard
              icon={<SharedClockIcon stroke="#7c3aed" />}
              count={kpis.avgResponse}
              title="Avg Response"
              countColor="text-purple-600"
            />
          </div>
        </Section>

        {/* ── 3. SYSTEM STATUS + DOWNTIME + ALERTS ── */}
        <Section>
          <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* System Status */}
            <InfoCard title="System Status" icon={<Shield size={18} />}>
              <div className="space-y-4">
                {[
                  {
                    label: "Healthy",
                    value: systemStatus.healthy,
                    valueCls: "text-emerald-600",
                    barCls: "bg-emerald-500",
                    pct: 81,
                  },
                  {
                    label: "Warning",
                    value: systemStatus.warning,
                    valueCls: "text-amber-600",
                    barCls: "bg-amber-500",
                    pct: 12,
                  },
                  {
                    label: "Critical",
                    value: systemStatus.critical,
                    valueCls: "text-red-600",
                    barCls: "bg-red-500",
                    pct: 7,
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[12px] text-[#6b7280]">
                      {r.label}
                    </span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-[Outfit,sans-serif] text-[15px] ${r.valueCls}`}
                      >
                        {r.value}
                      </span>
                      <MiniBar pct={r.pct} colorCls={r.barCls} />
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-[#e9ebf0] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-center">
                  {[
                    { v: systemStatus.uptime.today, l: "Today" },
                    { v: systemStatus.uptime.days7, l: "7 days" },
                    { v: systemStatus.uptime.days30, l: "30 days" },
                  ].map((x) => (
                    <div key={x.l}>
                      <div className=" text-[12px] text-[#1c1f2e]">{x.v}</div>
                      <div className="text-[11px] text-[#6b7280] mt-0.5">
                        {x.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </InfoCard>

            {/* Downtime Summary */}
            <InfoCard title="Downtime Summary" icon={<Clock size={18} />}>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <span className="text-[12.5px] text-red-600">
                    Total downtime (30d)
                  </span>
                  <span className="font-[Outfit,sans-serif] text-[17px] text-red-600">
                    {downtimeSummary.total30d}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    { period: "Today", value: downtimeSummary.today },
                    { period: "7 days", value: downtimeSummary.days7 },
                    { period: "30 days", value: downtimeSummary.days30 },
                  ].map((x) => (
                    <div
                      key={x.period}
                      className="border border-[#e9ebf0] rounded-lg bg-[#f8f9fc] p-2 text-center"
                    >
                      <div className=" text-[13px] text-[#1c1f2e]">
                        {x.value}
                      </div>
                      <div className="text-[11px] text-[#6b7280] mt-0.5">
                        {x.period}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[12px] text-[#6b7280]">
                  Most affected:{" "}
                  <span className="text-red-600 font-medium">
                    {downtimeSummary.mostAffected}
                  </span>
                </p>
              </div>
            </InfoCard>

            {/* Alerts Summary */}
            <InfoCard title="Alerts Summary" icon={<AlertCircle size={18} />}>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {[
                    {
                      v: alertsSummary.active,
                      l: "Active",
                      bg: "bg-red-50",
                      bd: "border-red-100",
                      val: "text-red-600",
                    },
                    {
                      v: alertsSummary.critical,
                      l: "Critical",
                      bg: "bg-amber-50",
                      bd: "border-amber-100",
                      val: "text-amber-600",
                    },
                    {
                      v: alertsSummary.resolved,
                      l: "Resolved",
                      bg: "bg-emerald-50",
                      bd: "border-emerald-100",
                      val: "text-emerald-600",
                    },
                  ].map((x) => (
                    <div
                      key={x.l}
                      className={`${x.bg} border ${x.bd} rounded-lg px-2.5 py-2`}
                    >
                      <div
                        className={`font-[Outfit,sans-serif] text-[19px] ${x.val}`}
                      >
                        {x.v}
                      </div>
                      <div className={`text-[11.5px] ${x.val}`}>{x.l}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-1 text-[12px] text-[#6b7280]">
                  Channels:
                  {alertsSummary.channels.map((ch) => (
                    <ApiBadge key={ch} variant={channelVariant[ch] || "gray"}>
                      {ch}
                    </ApiBadge>
                  ))}
                </div>
              </div>
            </InfoCard>
          </div>
        </Section>

        {/* ── 4. TIME COMPARISON ── */}
        <Section>
          <InfoCard
            title="Time Comparison"
            icon={<ArrowLeftRight size={14} className="text-[#6b7280]" />}
          >
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="border border-[#e9ebf0] rounded-[10px] bg-white p-[14px_16px]">
                    <div className="h-3 w-32 bg-[#f0f2f7] rounded animate-pulse mb-4" />
                    {[0, 1, 2, 3].map((j) => (
                      <div key={j} className="flex items-center justify-between py-[5px] border-b border-[#f3f5f9] last:border-b-0">
                        <div className="h-2.5 w-20 bg-[#f0f2f7] rounded animate-pulse" />
                        <div className="h-2.5 w-28 bg-[#f0f2f7] rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : timeComparison.length === 0 ? (
              <div className="py-6 text-center text-[12.5px] text-[#6b7280]">No comparison data available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {timeComparison.map((section) => (
                  <div
                    key={section.period}
                    className="border border-[#e9ebf0] rounded-[10px] bg-white p-[14px_16px]"
                  >
                    <div className="text-[10.5px] uppercase tracking-[.08em] text-[#6b7280] mb-3">
                      {section.period}
                    </div>
                    {(section.metrics ?? []).map((m, idx) => (
                      <div
                        key={m.label}
                        className={`flex items-center justify-between py-[5px] ${idx < section.metrics.length - 1 ? "border-b border-[#f3f5f9]" : ""}`}
                      >
                        <span className="text-[12px] text-[#6b7280]">
                          {m.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className=" text-[12.5px] text-[#1c1f2e]">
                            {m.current}
                          </span>
                          <span className=" text-[11px] text-[#6b7280]">
                            vs {m.prev}
                          </span>
                          <TrendChip trend={m.trend} change={m.change} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </InfoCard>
        </Section>

        {/* ── 5. TOP 10 DOWN APIs + TOP 10 SLOW APIs ── */}
        <Section>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Top 10 Down APIs — NewTableConfig same as Incidents.jsx */}
            <InfoCard
              title="Top 10 Down APIs"
              titleColor="text-red-600"
              icon={<StatusDownIcon />}
            >
              <div className="-mx-5 -mt-4 -mb-5">
                <NewTableConfig
                  module="down-apis"
                  columns={getDownApisColumns({
                    onActions: (name) => {
                      setActionsApi(name);
                      setActionsOpen(true);
                    },
                  })}
                  data={filteredDown}
                  isLoading={isLoading}
                  onRowClick={(row) => {
                    setDrillApi(row.name);
                    setDrillOpen(true);
                  }}
                  currentPage={downPage}
                  setCurrentPage={setDownPage}
                  pageLimit={downLimit}
                  handlePageLimitChange={setDownLimit}
                  totalResults={filteredDown.length}
                  totalPages={Math.ceil(filteredDown.length / downLimit)}
                  showRowNumbers={false}
                  plain={true}
                />
              </div>
            </InfoCard>

            {/* Top 10 Slow APIs — NewTableConfig same as Incidents.jsx */}
            <InfoCard
              title="Top 10 Slow APIs"
              titleColor="text-amber-600"
              icon={<SharedClockIcon stroke="#d97706" />}
            >
              <div className="-mx-5 -mt-4 -mb-5">
                <NewTableConfig
                  module="slow-apis"
                  columns={getSlowApisColumns({
                    onActions: (name) => {
                      setActionsApi(name);
                      setActionsOpen(true);
                    },
                  })}
                  data={filteredSlow}
                  isLoading={isLoading}
                  onRowClick={(row) => {
                    setDrillApi(row.name);
                    setDrillOpen(true);
                  }}
                  currentPage={slowPage}
                  setCurrentPage={setSlowPage}
                  pageLimit={slowLimit}
                  handlePageLimitChange={setSlowLimit}
                  totalResults={filteredSlow.length}
                  totalPages={Math.ceil(filteredSlow.length / slowLimit)}
                  showRowNumbers={false}
                  plain={true}
                />
              </div>
            </InfoCard>
          </div>
        </Section>

        {/* ── 6. ACTIVE INCIDENTS + REAL-TIME FEED ── */}
        <Section>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Active Incidents */}
            <InfoCard
              title="Active Incidents"
              titleColor="text-red-600"
              icon={<AlertCircle size={18} />}
              action={
                <Link
                  to={`/dashboard/incidents`}
                  className="text-[12px] text-blue-600 hover:opacity-75 transition-opacity"
                >
                  View all
                </Link>
              }
            >
              <div className="divide-y divide-[#f3f5f9]">
                {activeIncidents.slice(0, 5).map((inc) => {
                  const isCrit = inc.severity === "critical";
                  return (
                    <div
                      key={inc.name}
                      className="flex items-start gap-2.5 py-2.5"
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isCrit ? "bg-red-50" : "bg-amber-50"}`}
                      >
                        {isCrit ? (
                          <XCircle size={12} className="text-red-600" />
                        ) : (
                          <AlertTriangle size={12} className="text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] text-[#1c1f2e]">
                          {inc.name}
                        </p>
                        <p className="text-[11.5px] text-[#6b7280] mt-px">
                          {inc.issue}
                        </p>
                        <p className="text-[11px] text-[#c2c8d4] mt-px">
                          {inc.time}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] flex-shrink-0 ${isCrit ? "text-red-600" : "text-amber-600"}`}
                      >
                        {inc.dur}
                      </span>
                    </div>
                  );
                })}
              </div>
            </InfoCard>

            {/* Real-Time Feed */}
            <InfoCard
              title={
                <span className="flex items-center gap-2">
                  <LiveDot />
                  Real-Time Feed
                </span>
              }
            >
              <div className=" overflow-y-auto divide-y divide-[#f3f5f9]">
                {feed.map((item, i) => (
                  <div
                    key={`${item.label}-${item.time}-${i}`}
                    className="flex items-start gap-2.5 py-[7px]"
                  >
                    <span
                      className={`w-[7px] h-[7px] rounded-full flex-shrink-0 mt-[5px] ${item.colorCls}`}
                    />
                    <p className="text-[12.5px] text-[#1c1f2e] flex-1 leading-snug">
                      <span className={item.labelCls}>{item.label}</span>{" "}
                      {item.msg}
                    </p>
                    <span className="text-[11px] text-[#c2c8d4] flex-shrink-0">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>
        </Section>

        {/* ── 7. LOGS & DEBUG — data: logs from hook, each row has id: "log-N" ── */}
        <Section>
          <LogsDebugCard logs={logs} onShowToast={showToast} />
        </Section>
      </div>

      {/* ── DRILL-DOWN MODAL ── */}
      <Modal
        open={drillOpen}
        onClose={() => setDrillOpen(false)}
        title={drillApi || "API Details"}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<Bell size={12} />}
              onClick={() => {
                showToast("Alert sent");
                setDrillOpen(false);
              }}
            >
              Alert
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw size={12} />}
              onClick={() => {
                showToast("Restarted");
                setDrillOpen(false);
              }}
            >
              Restart
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActionsApi(drillApi);
                setActionsOpen(true);
                setDrillOpen(false);
              }}
            >
              Actions
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { l: "Uptime", v: "97.1%", cls: "text-amber-600" },
              { l: "Response", v: "187ms", cls: "text-[#1c1f2e]" },
              { l: "Incidents", v: "5", cls: "text-[#1c1f2e]" },
              { l: "Risk", v: "62", cls: "text-amber-600" },
            ].map((s) => (
              <div
                key={s.l}
                className="p-3 bg-[#f8f9fc] rounded-lg border border-[#e9ebf0] text-center"
              >
                <p className={`font-[Outfit,sans-serif] text-[18px] ${s.cls}`}>
                  {s.v}
                </p>
                <p className="text-[11px] text-[#6b7280] mt-1">{s.l}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[#6b7280] mb-2">
              Uptime Timeline (30 days)
            </p>
            <div className="flex gap-0.5 h-[18px]">
              {drillBars.map((b, i) => (
                <div
                  key={`bar-${i}`}
                  className={`flex-1 min-w-[5px] rounded-sm ${b === "up" ? "bg-emerald-500" : b === "down" ? "bg-red-500" : "bg-amber-500"}`}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[#6b7280] mb-2">
              Recent Incidents
            </p>
            {[
              "Today 14:02 · 503 Down · 22m duration",
              "-2d 10:15 · High latency · 12m duration",
            ].map((t) => (
              <p
                key={t}
                className=" text-[11.5px] text-[#6b7280] py-1 border-b border-[#f3f5f9] last:border-b-0"
              >
                {t}
              </p>
            ))}
          </div>
        </div>
      </Modal>

      {/* ── ACTIONS MODAL ── */}
      <Modal
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        title={`Actions — ${actionsApi || ""}`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setActionsOpen(false);
                showToast("Saved");
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: <RefreshCw size={17} className="text-emerald-600" />,
                label: "Restart Check",
                fn: "API restarted",
              },
              {
                icon: <XCircle size={17} className="text-amber-600" />,
                label: "Disable API",
                fn: "API disabled",
              },
              {
                icon: <Bell size={17} className="text-blue-600" />,
                label: "Send Alert",
                fn: "Alert sent",
              },
              {
                icon: <AlertCircle size={17} className="text-red-600" />,
                label: "Open Incident",
                fn: "Incident opened",
              },
              {
                icon: <Eye size={17} className="text-cyan-600" />,
                label: "View Details",
                fn: "View details",
              },
              {
                icon: <VolumeX size={17} className="text-[#6b7280]" />,
                label: "Mute Alert",
                fn: "Alert muted",
              },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => {
                  showToast(a.fn);
                  setActionsOpen(false);
                }}
                className="flex flex-col items-center gap-1.5 p-3 bg-white border border-[#e9ebf0] rounded-lg cursor-pointer text-[12.5px] text-[#1c1f2e] hover:bg-blue-50 hover:border-blue-300 transition-colors font-[inherit]"
              >
                {a.icon}
                <span>{a.label}</span>
              </button>
            ))}
          </div>
          <div>
            <p className="text-[12px] text-[#6b7280] mb-1">Assign Owner</p>
            <select className="w-full border border-[#e9ebf0] rounded-lg px-3 py-2 text-[13px] text-[#1c1f2e] bg-white outline-none">
              <option>Platform Team</option>
              <option>Payments Team</option>
              <option>Auth Team</option>
              <option>Data Team</option>
            </select>
          </div>
          <div>
            <p className="text-[12px] text-[#6b7280] mb-1">Notes</p>
            <textarea
              className="w-full border border-[#e9ebf0] rounded-lg px-3 py-2 text-[13px] text-[#1c1f2e] bg-white outline-none resize-y"
              rows={2}
              placeholder="Add notes…"
            />
          </div>
        </div>
      </Modal>

      {/* ── ALL INCIDENTS MODAL ── */}
      <Modal
        open={incidentsOpen}
        onClose={() => setIncidentsOpen(false)}
        title="All Incidents"
        footer={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIncidentsOpen(false)}
          >
            Close
          </Button>
        }
      >
        <div className="divide-y divide-[#f3f5f9]">
          {allIncidents.map((inc) => (
            <div key={inc.name} className="flex items-start gap-3 py-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${incCfg[inc.status]?.bg}`}
              >
                {incCfg[inc.status]?.iconEl}
              </div>
              <div className="flex-1">
                <p className="text-[12.5px] text-[#1c1f2e]">{inc.name}</p>
                <p className="text-[11.5px] text-[#6b7280]">{inc.issue}</p>
              </div>
              <ApiBadge variant={incCfg[inc.status]?.badge}>
                {inc.status.charAt(0).toUpperCase() + inc.status.slice(1)}
              </ApiBadge>
            </div>
          ))}
        </div>
      </Modal>

      {/* ── TOAST ── */}
      <div
        className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-[#1c1f2e] text-white text-[13px] px-[18px] py-2.5 rounded-lg pointer-events-none transition-opacity duration-300 max-w-[360px] ${toastVisible ? "opacity-100" : "opacity-0"}`}
      >
        <CheckCircle size={12} className="text-emerald-300" />
        {toastMsg}
      </div>
    </>
  );
}
