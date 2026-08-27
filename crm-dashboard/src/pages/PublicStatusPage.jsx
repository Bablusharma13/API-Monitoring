import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";
import { NewBadge } from "../components/ui/NewBadge";
import { useTheme } from "../theme/ThemeContext.jsx";
import { formatDateTime } from "../utils/helpers";

const BASE = import.meta.env.VITE_CRM_BACKEND;

// ── Overall status → label/icon/color, same green/amber/red convention the
// rest of the app already uses for health states (see columns.jsx, GlobalDashboard.jsx). ──
const OVERALL_STATUS_META = {
  operational: {
    label: "All Systems Operational",
    Icon: CheckCircle2,
    color: "#16a34a",
  },
  degraded: {
    label: "Degraded Performance",
    Icon: AlertTriangle,
    color: "#d97706",
  },
  outage: {
    label: "Service Outage",
    Icon: XCircle,
    color: "#dc2626",
  },
};

const BrandMark = ({ size = 36, dark = true }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
    <rect
      x="2"
      y="2"
      width="36"
      height="36"
      rx="10"
      fill={dark ? "#ffffff" : "#0c0a09"}
      opacity={dark ? 0.08 : 0.06}
    />
    <path
      d="M11 25 L17 13 L29 13"
      stroke={dark ? "#fafafa" : "#1c1917"}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="29" cy="13" r="2.6" fill="#fbbf24" />
    {dark && <circle cx="11" cy="25" r="2.2" fill="#ffffff" />}
  </svg>
);

// ── uptime% → color, same thresholds used in features/apis/components/columns.jsx ──
function uptimeColor(u) {
  if (u == null) return "#9ca3af";
  if (u >= 99) return "#16a34a";
  if (u >= 97) return "#d97706";
  return "#dc2626";
}

function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day === 1 ? "" : "s"} ago`;
}

function formatIncidentType(type) {
  if (!type) return "Unknown";
  return type
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const PublicStatusPage = () => {
  const { isDark } = useTheme();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const fetchStatus = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setRefreshing(true);
    try {
      const { data } = await axios.get(`${BASE}/api/v1/status`);
      setStatusData(data?.data ?? null);
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to reach the status service right now.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastFetchedAt(new Date());
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(() => fetchStatus({ silent: true }), 30000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  const apis = statusData?.apis ?? [];
  const activeIncidents = statusData?.activeIncidents ?? [];

  const groupedApis = useMemo(() => {
    const map = new Map();
    for (const api of statusData?.apis ?? []) {
      const key = api.category || "Uncategorized";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(api);
    }
    return Array.from(map.entries())
      .map(([category, items]) => ({
        category,
        items: [...items].sort((a, b) =>
          String(a.name).localeCompare(String(b.name)),
        ),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [statusData]);

  const meta =
    OVERALL_STATUS_META[statusData?.overallStatus] ||
    OVERALL_STATUS_META.operational;

  const mutedText = isDark ? "text-stone-400" : "text-gray-500";
  const cardClass = isDark
    ? "fa-surface"
    : "bg-white border border-gray-200 shadow-sm";
  const sectionTitleClass = `text-[13px] font-semibold uppercase tracking-wide ${
    isDark ? "text-stone-300" : "text-gray-600"
  }`;

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${
        isDark ? "bg-[#0a0a0a] text-stone-50" : "bg-[#f5f6fa] text-gray-900"
      }`}
    >
      {isDark && (
        <>
          <div className="fa-aurora pointer-events-none absolute inset-x-0 top-0" />
          <div className="fa-grid-bg fa-fade-radial pointer-events-none absolute inset-0 opacity-70" />
        </>
      )}

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ── Top bar ── */}
        <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandMark size={34} dark={isDark} />
            <div>
              <div className="text-[13.5px] font-semibold leading-tight">
                API Monitoring
              </div>
              <div className={`text-[11px] leading-tight ${mutedText}`}>
                System Status
              </div>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 pb-16 pt-8 flex-1 flex flex-col gap-8">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
              <Loader2
                size={26}
                className={`animate-spin ${mutedText}`}
                strokeWidth={2}
              />
              <p className={`text-sm ${mutedText}`}>Checking system status…</p>
            </div>
          ) : error && !statusData ? (
            <div
              className={`rounded-2xl p-8 flex flex-col items-center text-center gap-3 ${cardClass}`}
            >
              <AlertCircle size={28} className="text-red-500" strokeWidth={2} />
              <p className={`text-sm ${mutedText}`}>{error}</p>
              <button
                type="button"
                onClick={() => fetchStatus()}
                className={`mt-1 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  isDark
                    ? "bg-stone-50 text-stone-950 hover:bg-stone-100"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <RefreshCw size={13} />
                Try again
              </button>
            </div>
          ) : (
            <>
              {/* ── Overall status banner ── */}
              <div
                className={`rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5 ${cardClass}`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${meta.color}1f`, color: meta.color }}
                  >
                    <meta.Icon size={28} strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <h1
                      className={`text-xl sm:text-2xl leading-tight truncate ${
                        isDark ? "uppercase" : "font-semibold"
                      }`}
                      style={{
                        fontFamily: isDark
                          ? "Anton, sans-serif"
                          : "Manrope, sans-serif",
                      }}
                    >
                      {meta.label}
                    </h1>
                    <p className={`text-[12.5px] mt-1 ${mutedText}`}>
                      {apis.length} service{apis.length === 1 ? "" : "s"}{" "}
                      monitored · updated{" "}
                      {lastFetchedAt ? formatDateTime(lastFetchedAt) : "—"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fetchStatus()}
                  disabled={refreshing}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-medium flex-shrink-0 disabled:opacity-60 transition-colors ${
                    isDark
                      ? "border border-stone-700 text-stone-300 hover:border-amber-400/80 hover:text-amber-300"
                      : "border border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-600"
                  }`}
                >
                  <RefreshCw
                    size={13}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>

              {/* ── Active incidents ── */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <h2 className={sectionTitleClass}>Active Incidents</h2>
                  {activeIncidents.length > 0 && (
                    <span
                      className="inline-flex items-center justify-center rounded-full text-[11px] font-mono px-1.5 py-0.5 min-w-[18px]"
                      style={{ background: "#dc26261f", color: "#dc2626" }}
                    >
                      {activeIncidents.length}
                    </span>
                  )}
                </div>

                {activeIncidents.length === 0 ? (
                  <div
                    className={`rounded-xl px-5 py-4 flex items-center gap-2.5 text-[13px] ${mutedText} ${cardClass}`}
                  >
                    <CheckCircle2 size={16} className="text-green-500" />
                    No active incidents reported.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {activeIncidents.map((incident, idx) => (
                      <div
                        key={idx}
                        className={`rounded-xl px-5 py-3.5 flex items-start justify-between gap-3 flex-wrap ${cardClass}`}
                      >
                        <div className="min-w-0">
                          <div className="text-[13.5px] font-medium">
                            {incident.title}
                          </div>
                          <div
                            className={`flex items-center gap-1.5 mt-1.5 text-[11.5px] ${mutedText}`}
                          >
                            <Clock size={11} />
                            Started {timeAgo(incident.startedAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] font-mono ${
                              isDark
                                ? "bg-stone-800/70 text-stone-300"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {formatIncidentType(incident.type)}
                          </span>
                          <NewBadge type="status" status={incident.severity} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Services, grouped by category ── */}
              <section className="flex flex-col gap-3">
                <h2 className={sectionTitleClass}>Services</h2>

                {groupedApis.length === 0 ? (
                  <div
                    className={`rounded-xl px-5 py-4 text-[13px] ${mutedText} ${cardClass}`}
                  >
                    No services are being monitored yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {groupedApis.map((group) => (
                      <div
                        key={group.category}
                        className={`rounded-xl overflow-hidden ${cardClass}`}
                      >
                        <div
                          className={`px-4 py-2.5 text-[12px] font-semibold border-b ${
                            isDark
                              ? "border-stone-800 text-stone-300"
                              : "border-gray-100 text-gray-700 bg-gray-50/60"
                          }`}
                        >
                          {group.category}
                        </div>
                        <div>
                          {group.items.map((api, idx) => (
                            <div
                              key={idx}
                              className={`px-4 py-3 flex items-center justify-between gap-3 border-b last:border-b-0 ${
                                isDark ? "border-stone-800/70" : "border-gray-100"
                              }`}
                            >
                              <span className="text-[13px] truncate">
                                {api.name}
                              </span>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span
                                  className="text-[11.5px] font-mono w-[46px] text-right"
                                  style={{ color: uptimeColor(api.uptime30d) }}
                                >
                                  {api.uptime30d != null
                                    ? `${api.uptime30d}%`
                                    : "—"}
                                </span>
                                <NewBadge type="status" status={api.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>

        <footer
          className={`text-center text-[11px] font-mono pb-6 flex items-center justify-center gap-1.5 ${mutedText}`}
        >
          <Activity size={11} />
          Auto-refreshes every 30 seconds
        </footer>
      </div>
    </div>
  );
};

export default PublicStatusPage;
