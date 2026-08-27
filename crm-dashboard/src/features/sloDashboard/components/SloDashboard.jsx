import { useMemo, useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { NewBadge } from "../../../components/ui/NewBadge";
import { useGetSloQuery } from "../hooks/query/useGetSloQuery";
import { useGetAllIncidentsQuery } from "../../incidents/hooks/query/useGetAllIncidentsQuery";
import { buildSloColumns } from "./columns";
import { SloDashboardStatsCardRow } from "./SloDashboardStatsCardRow";
import { DEFAULT_SLO_TARGETS, SLO_GROUP, SLO_STATUS_FILTER } from "../constants";

const STATUS_COLOR = { met: "#16a34a", risk: "#d97706", breached: "#dc2626" };

// ── Compliance donut, derived from the real per-API status counts ─────────
function ComplianceDonut({ met, risk, breached }) {
  const total = met + risk + breached;
  const data = [
    { val: met, color: STATUS_COLOR.met },
    { val: risk, color: STATUS_COLOR.risk },
    { val: breached, color: STATUS_COLOR.breached },
  ];
  const cx = 75,
    cy = 75,
    r = 56,
    sw = 20;
  const circ = 2 * Math.PI * r;
  const arcs = total
    ? data.reduce((acc, d) => {
        const dash = (d.val / total) * circ;
        const prevOffset = acc.length
          ? acc[acc.length - 1].offset + acc[acc.length - 1].dash
          : 0;
        acc.push({ dash, offset: prevOffset, color: d.color });
        return acc;
      }, [])
    : [];
  const pct = total ? Math.round((met / total) * 100) : 0;

  return (
    <div className="flex items-center gap-7 flex-wrap">
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
            {pct}%
          </div>
          <div className="text-[11px] text-gray-400">compliant</div>
        </div>
      </div>
      <div className="flex flex-col gap-0">
        {[
          { label: "Met", color: STATUS_COLOR.met, count: met },
          { label: "At risk", color: STATUS_COLOR.risk, count: risk },
          { label: "Breached", color: STATUS_COLOR.breached, count: breached },
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
              {item.count} / {total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const INCIDENT_ICONS = {
  breach: (
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
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  resolved: (
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
};

export const SloDashboard = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("apiName");
  const [sortType, setSortType] = useState("asc");
  const [activeFilters, setActiveFilters] = useState({});

  const { data: sloData, isLoading, isFetching } = useGetSloQuery();

  const apis = useMemo(() => sloData?.apis || [], [sloData]);
  const targets = sloData?.targets || DEFAULT_SLO_TARGETS;

  const counts = useMemo(() => {
    const c = { met: 0, risk: 0, breached: 0 };
    apis.forEach((a) => {
      if (c[a.status] != null) c[a.status] += 1;
    });
    return c;
  }, [apis]);

  const avgUptime = useMemo(() => {
    if (!apis.length) return null;
    const sum = apis.reduce((acc, a) => acc + (a.uptimePct || 0), 0);
    return Math.round((sum / apis.length) * 100) / 100;
  }, [apis]);

  const apiFilterOptions = useMemo(
    () =>
      apis.map((a) => ({ value: a.apiId, label: a.apiName })),
    [apis],
  );

  const filteredApis = useMemo(() => {
    let list = apis;
    if (activeFilters.status) {
      list = list.filter((a) => a.status === activeFilters.status);
    }
    if (activeFilters.apiId) {
      list = list.filter((a) => a.apiId === activeFilters.apiId);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((a) => a.apiName?.toLowerCase().includes(q));
    }
    return list;
  }, [apis, activeFilters, searchTerm]);

  const sortedApis = useMemo(() => {
    if (!sortField) return filteredApis;
    const dir = sortType === "desc" ? -1 : 1;
    return [...filteredApis].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
  }, [filteredApis, sortField, sortType]);

  const totalResults = sortedApis.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageLimit));
  const paginated = sortedApis.slice(
    (pageIndex - 1) * pageLimit,
    pageIndex * pageLimit,
  );

  const selectedApi = activeFilters.apiId
    ? apis.find((a) => a.apiId === activeFilters.apiId)
    : null;

  const { data: incidentsResponse, isLoading: incidentsLoading } =
    useGetAllIncidentsQuery({
      page: 1,
      limit: 5,
      sortBy: "startedAt",
      sortOrder: "desc",
      search: selectedApi?.apiName || "",
    });
  const recentIncidents = incidentsResponse?.data || [];

  const columns = useMemo(() => buildSloColumns(targets), [targets]);

  const filters = useMemo(
    () => [
      SLO_STATUS_FILTER,
      {
        id: "apiId",
        name: "API",
        filterName: "apiId",
        icon: (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        ),
        options: apiFilterOptions,
      },
    ],
    [apiFilterOptions],
  );

  return (
    <div className="container-page">
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
        iconGradient=""
        title="SLO Dashboard"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "SLO Dashboard" },
        ]}
      />

      <Section>
        <SloDashboardStatsCardRow
          isLoading={isLoading}
          total={apis.length}
          met={counts.met}
          risk={counts.risk}
          breached={counts.breached}
          avgUptime={avgUptime}
        />
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Overall Compliance
            </div>
            <div className="px-5 py-4">
              <ComplianceDonut
                met={counts.met}
                risk={counts.risk}
                breached={counts.breached}
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              SLO Targets
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Uptime", val: `≥ ${targets.uptimePct}%` },
                { label: "Avg Latency", val: `≤ ${targets.latencyMs}ms` },
                { label: "Error Rate", val: `≤ ${targets.errorRatePct}%` },
              ].map((t) => (
                <div key={t.label} className="bg-gray-50 rounded-lg px-3.5 py-3">
                  <div className="text-[11px] text-gray-400 mb-1">
                    {t.label}
                  </div>
                  <div
                    className="text-[17px] text-gray-800 font-light leading-none"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {t.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <NewTableConfig
          module="slo-dashboard"
          columns={columns}
          data={paginated}
          isLoading={isFetching}
          group={SLO_GROUP}
          currentPage={pageIndex}
          setCurrentPage={setPageIndex}
          pageLimit={pageLimit}
          handlePageLimitChange={setPageLimit}
          totalResults={totalResults}
          totalPages={totalPages}
          searchQuery={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v);
            setPageIndex(1);
          }}
          sortBy={sortField}
          sortOrder={sortType}
          handleServerSideSorting={({ sortBy, sortDirection }) => {
            setSortField(sortBy);
            setSortType(sortDirection);
          }}
          availableAdditionalFilters={filters}
          onFiltersChange={(f) => {
            setActiveFilters(f);
            setPageIndex(1);
          }}
          showRowNumbers={false}
        />
      </Section>

      {/* Incident History — reuses the real incidents feature, filtered to the
          selected API (via the API filter above) when one is chosen. */}
      <Section>
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
              Incident History
              {selectedApi && (
                <span className="text-[12px] text-gray-400 font-normal">
                  / {selectedApi.apiName}
                </span>
              )}
            </div>
          </div>
          <div className="px-5 py-4 flex flex-col gap-0">
            {incidentsLoading && (
              <div className="py-6 text-center text-gray-400 text-[13px]">
                Loading incidents…
              </div>
            )}
            {!incidentsLoading && recentIncidents.length === 0 && (
              <div className="py-6 text-center text-gray-400 text-[13px]">
                No recent incidents{selectedApi ? ` for ${selectedApi.apiName}` : ""}.
              </div>
            )}
            {recentIncidents.map((inc, i) => {
              const resolved =
                inc.status === "resolved" || inc.status === "closed";
              return (
                <div key={inc._id || i} className="flex gap-3 pb-3.5 relative">
                  {i < recentIncidents.length - 1 && (
                    <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-gray-100" />
                  )}
                  <div
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                      resolved
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {INCIDENT_ICONS[resolved ? "resolved" : "breach"]}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="text-[13px] text-gray-800">
                      {inc.title}
                    </div>
                    <div className="text-[11.5px] text-gray-400">
                      {inc.api?.name || selectedApi?.apiName || "—"} ·{" "}
                      {inc.severity}
                    </div>
                    <div className="text-[11px] text-gray-300 mt-0.5">
                      {inc.startedAt
                        ? new Date(inc.startedAt).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <NewBadge type="status" status={inc.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );
};
