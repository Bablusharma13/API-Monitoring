import { useMemo, useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { ActionButton } from "../../../components/ui/ActionButton";
import { StatCard } from "../../../components/ui/StatCard3";
import { Badge } from "../../../components/ui/Badge";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { RefreshIcon } from "../../../components/ui/Icons";
import { useGetErrorAnalyticsQuery } from "../hooks/query/useGetErrorAnalyticsQuery";
// Sibling feature — real alerts feed, no bespoke errors-alerts endpoint.
// GET /api/v1/alerts -> { data: [...], pagination }; GET /api/v1/alerts/summary -> { total, firing, acknowledged, resolved, critical, warning, info }
import { useGetAlertsQuery } from "../../alerts/hooks/query/useGetAlertsQuery";
import { useGetAlertsSummaryQuery } from "../../alerts/hooks/query/useGetAlertsSummaryQuery";
import { getErrorTenantColumns } from "./columns";
import {
  ERRORS_WINDOW_OPTIONS,
  ERROR_TENANT_GROUP,
  ERROR_CODE_COLORS,
  ERROR_CODE_COLOR_FALLBACK,
  ALERT_SEVERITY_META,
  ALERT_SEVERITY_FALLBACK,
} from "../constants";
import { timeAgo, alertEventTime, alertTimelineIcon } from "../utils";

// ── shared bits ─────────────────────────────────────────────────────────────
function EmptyState({ label = "No data for this window yet" }) {
  return <div className="py-10 text-center text-[12.5px] text-gray-400">{label}</div>;
}

function RangeBtns({ options, active, onChange }) {
  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-[12px] border-r last:border-r-0 border-gray-200 transition-colors ${
            active === opt.value ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const severityMeta = (severity) => ALERT_SEVERITY_META[severity] || ALERT_SEVERITY_FALLBACK;
const SEVERITY_WEIGHT = { critical: 0, warning: 1, info: 2 };

const timelineIcons = {
  error: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  warning: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
    </svg>
  ),
  check: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ── Error breakdown donut (real breakdown[]) ────────────────────────────────
function ErrorDonut({ breakdown, overallErrorRatePct }) {
  if (!breakdown.length) return <EmptyState />;
  const total = breakdown.reduce((a, b) => a + (b.count || 0), 0) || 1;
  const cx = 65,
    cy = 65,
    r = 48,
    sw = 18;
  const circ = 2 * Math.PI * r;
  const dashes = breakdown.map((d) => ((d.count || 0) / total) * circ);
  const arcs = breakdown.map((d, i) => ({
    dash: dashes[i],
    offset: dashes.slice(0, i).reduce((a, v) => a + v, 0),
    color: ERROR_CODE_COLORS[d.code] || ERROR_CODE_COLOR_FALLBACK,
  }));

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: 130, height: 130 }}>
        <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f2f7" strokeWidth={sw} />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={a.color + "99"}
              strokeWidth={sw}
              strokeDasharray={`${a.dash} ${circ - a.dash}`}
              strokeDashoffset={-a.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[18px] text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {overallErrorRatePct ?? 0}%
          </div>
          <div className="text-[10px] text-gray-400">error rate</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2.5">
        {breakdown.map((d) => {
          const color = ERROR_CODE_COLORS[d.code] || ERROR_CODE_COLOR_FALLBACK;
          const pct = Math.round(((d.count || 0) / total) * 100);
          return (
            <div key={d.code} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-[2px] flex-shrink-0" style={{ background: color }} />
                <span className="text-[12.5px] text-gray-700">{d.code}</span>
              </div>
              <span className="font-mono text-[12px] text-gray-400">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function ErrorsPage() {
  const [window_, setWindow] = useState("24h");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: errData, isFetching, refetch: refetchErrors } = useGetErrorAnalyticsQuery({
    window: window_,
  });

  const overallErrorRatePct = errData?.overallErrorRatePct ?? 0;
  const serverErrorPct = errData?.serverErrorPct ?? 0;
  const clientErrorPct = errData?.clientErrorPct ?? 0;
  const breakdown = useMemo(() => errData?.breakdown ?? [], [errData]);
  const byTenant = useMemo(() => errData?.byTenant ?? [], [errData]);

  // Recent alerts, filtered/derived client-side into the two widgets below —
  // no bespoke errors-alerts endpoint.
  const { data: alertsResp, isLoading: alertsLoading, refetch: refetchAlerts } = useGetAlertsQuery({
    limit: 25,
    sortBy: "triggeredAt",
    sortOrder: "desc",
  });
  const alerts = useMemo(() => alertsResp?.data ?? [], [alertsResp]);

  // Accurate open-alert count straight from the summary endpoint rather than
  // the (possibly truncated) 25-row list above.
  const { data: alertsSummary, refetch: refetchSummary } = useGetAlertsSummaryQuery();
  const activeAlertsTotal =
    alertsSummary != null
      ? (alertsSummary.firing ?? 0) + (alertsSummary.acknowledged ?? 0)
      : alerts.filter((a) => a.status === "firing" || a.status === "acknowledged").length;

  const activeAlerts = useMemo(() => {
    return alerts
      .filter((a) => a.status === "firing" || a.status === "acknowledged")
      .sort((a, b) => {
        const w = (SEVERITY_WEIGHT[a.severity] ?? 3) - (SEVERITY_WEIGHT[b.severity] ?? 3);
        if (w !== 0) return w;
        return new Date(alertEventTime(b)) - new Date(alertEventTime(a));
      })
      .slice(0, 7);
  }, [alerts]);

  const timeline = useMemo(() => {
    return [...alerts]
      .sort((a, b) => new Date(alertEventTime(b)) - new Date(alertEventTime(a)))
      .slice(0, 6);
  }, [alerts]);

  const topErrorCode = useMemo(() => {
    if (!breakdown.length) return null;
    return breakdown.reduce((max, b) => ((b.count || 0) > (max?.count || 0) ? b : max), null);
  }, [breakdown]);

  const rowsWithColor = useMemo(
    () => byTenant.map((t, i) => ({ ...t, id: t.tenantId || t.tenantName || i, _colorIndex: i })),
    [byTenant],
  );
  const filteredTenants = useMemo(() => {
    if (!searchTerm) return rowsWithColor;
    const q = searchTerm.toLowerCase();
    return rowsWithColor.filter((t) => t.tenantName?.toLowerCase().includes(q));
  }, [rowsWithColor, searchTerm]);
  const paginatedTenants = filteredTenants.slice((pageIndex - 1) * pageLimit, pageIndex * pageLimit);

  const errorTenantColumns = useMemo(() => getErrorTenantColumns(), []);

  const handleRefresh = () => {
    refetchErrors();
    refetchAlerts();
    refetchSummary();
  };

  return (
    <div className="container-page">
      <PageHeader
        icon={<ErrorHeaderIcon />}
        iconGradient="bg-transparent"
        title="Errors"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Golden Signals" },
          { label: "Errors" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <RangeBtns options={ERRORS_WINDOW_OPTIONS} active={window_} onChange={setWindow} />
            <ActionButton action="refresh" label="Refresh" icon={RefreshIcon} onClick={handleRefresh} />
          </div>
        }
      />

      <Section>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            icon={<CircleAlertIcon stroke="#6b7280" />}
            count={`${overallErrorRatePct}%`}
            title="Overall Error Rate"
          />
          <StatCard
            icon={<TriangleAlertIcon stroke="#dc2626" />}
            count={`${serverErrorPct}%`}
            countColor="text-red-600"
            title="Server Error Rate"
          />
          <StatCard
            icon={<CircleAlertIcon stroke="#d97706" />}
            count={`${clientErrorPct}%`}
            countColor="text-amber-600"
            title="Client Error Rate"
          />
          <StatCard
            icon={<TriangleAlertIcon stroke="#7c3aed" />}
            count={topErrorCode?.code ?? "—"}
            countColor="text-purple-600"
            title="Top Error Code"
            badgeText={topErrorCode ? `${topErrorCode.count} in window` : undefined}
            badgeBg="bg-purple-50"
            badgeTextColor="text-purple-600"
          />
          <StatCard
            icon={<BellIcon stroke="#2563eb" />}
            count={activeAlertsTotal}
            countColor="text-blue-600"
            title="Active Alerts"
            badgeText={activeAlertsTotal > 0 ? "Firing" : "Clear"}
            badgeBg={activeAlertsTotal > 0 ? "bg-red-50" : "bg-green-50"}
            badgeTextColor={activeAlertsTotal > 0 ? "text-red-600" : "text-green-600"}
          />
        </div>
      </Section>

      <Section>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <div className="text-[14px] text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Active Alerts
            </div>
            <Badge value={`${activeAlertsTotal} open`} variant={activeAlertsTotal > 0 ? "down" : "active"} />
          </div>
          <div>
            {!alertsLoading && activeAlerts.length === 0 && <EmptyState label="No active alerts right now" />}
            {activeAlerts.map((a) => {
              const meta = severityMeta(a.severity);
              return (
                <div
                  key={a._id || a.id}
                  className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-blue-50/30 transition-colors"
                >
                  <div className="w-0.5 rounded-full self-stretch flex-shrink-0" style={{ background: meta.color }} />
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[13px] text-gray-800">{a.title || a.api?.name || "Alert"}</span>
                      <Badge value={meta.label} variant={meta.badgeVariant} />
                    </div>
                    <div className="text-[11.5px] text-gray-400 line-clamp-1">{a.message}</div>
                  </div>
                  <span className="font-mono text-[11px] text-gray-400 flex-shrink-0 ml-1">
                    {timeAgo(a.triggeredAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Error Breakdown
            </div>
            <div className="px-5 py-4">
              <ErrorDonut breakdown={breakdown} overallErrorRatePct={overallErrorRatePct} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Recent Alert Events
            </div>
            <div className="px-5 py-4 flex flex-col gap-0">
              {!alertsLoading && timeline.length === 0 && <EmptyState label="No recent alert activity" />}
              {timeline.map((a, i) => {
                const icon = alertTimelineIcon(a);
                const meta = severityMeta(a.severity);
                const isResolved = a.status === "resolved";
                return (
                  <div key={a._id || a.id} className="flex gap-3 pb-4 relative">
                    {i < timeline.length - 1 && (
                      <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-gray-100" />
                    )}
                    <div
                      className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                        isResolved ? "bg-green-50 text-green-600" : meta.bg
                      }`}
                      style={!isResolved ? { color: meta.color } : undefined}
                    >
                      {timelineIcons[icon]}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="text-[13px] text-gray-800">{a.title || a.api?.name || "Alert"}</div>
                      <div className="text-[11.5px] text-gray-400 line-clamp-1">{a.message}</div>
                      <div className="text-[11px] text-gray-300 mt-0.5">{timeAgo(alertEventTime(a))}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Error Rate by Tenant
          </div>
          <NewTableConfig
            module="errors-by-tenant"
            columns={errorTenantColumns}
            data={paginatedTenants}
            isLoading={isFetching}
            group={ERROR_TENANT_GROUP}
            currentPage={pageIndex}
            setCurrentPage={setPageIndex}
            pageLimit={pageLimit}
            handlePageLimitChange={setPageLimit}
            totalResults={filteredTenants.length}
            totalPages={Math.ceil(filteredTenants.length / pageLimit) || 1}
            searchQuery={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setPageIndex(1);
            }}
            showRowNumbers={false}
          />
        </div>
      </Section>
    </div>
  );
}

// ── small header/stat icons ──────────────────────────────────────────────────
function ErrorHeaderIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function CircleAlertIcon({ stroke }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
function TriangleAlertIcon({ stroke }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
    </svg>
  );
}
function BellIcon({ stroke }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

// Also available as a named export — the existing mock page this replaces
// (src/pages/ErrorsPage.jsx) is imported as a default export from App.jsx,
// but other feature pages in this app (Checks, Incidents…) use named exports.
export { ErrorsPage };
