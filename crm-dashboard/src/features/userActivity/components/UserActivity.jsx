import { useMemo, useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { useGetUserActivityQuery } from "../hooks/query/useGetUserActivityQuery";
import { buildUserActivityColumns } from "./columns";
import { UserActivityStatsCardRow } from "./UserActivityStatsCardRow";
import {
  USER_ACTIVITY_GROUP,
  USER_ACTIVITY_WINDOWS,
  TENANT_FILTER_ICON,
} from "../constants";

const TENANT_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#16a34a",
  "#d97706",
  "#db2777",
  "#059669",
  "#ea580c",
];

export const UserActivity = () => {
  const [timeWindow, setTimeWindow] = useState("24h");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("requestCount");
  const [sortType, setSortType] = useState("desc");
  const [activeFilters, setActiveFilters] = useState({});

  const { data, isLoading, isFetching } = useGetUserActivityQuery({
    window: timeWindow,
  });
  const users = useMemo(() => data?.users || [], [data]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalRequests = users.reduce((a, u) => a + (u.requestCount || 0), 0);
    const totalErrors = users.reduce((a, u) => a + (u.errorCount || 0), 0);
    const avgLatency = totalUsers
      ? Math.round(
          (users.reduce((a, u) => a + (u.avgLatency || 0), 0) / totalUsers) *
            100,
        ) / 100
      : null;
    const errorRatePct = totalRequests
      ? Math.round((totalErrors / totalRequests) * 1000) / 10
      : 0;
    return { totalUsers, totalRequests, totalErrors, avgLatency, errorRatePct };
  }, [users]);

  const maxRequestCount = useMemo(
    () => Math.max(1, ...users.map((u) => u.requestCount || 0)),
    [users],
  );

  const tenantBreakdown = useMemo(() => {
    const map = new Map();
    users.forEach((u) => {
      const key = u.tenantName || "Unknown";
      map.set(key, (map.get(key) || 0) + 1);
    });
    const list = Array.from(map.entries()).map(([name, count], i) => ({
      name,
      users: count,
      color: TENANT_COLORS[i % TENANT_COLORS.length],
    }));
    list.sort((a, b) => b.users - a.users);
    return list;
  }, [users]);
  const maxTenantUsers = Math.max(1, ...tenantBreakdown.map((t) => t.users));

  const tenantFilterOptions = useMemo(
    () =>
      Array.from(new Set(users.map((u) => u.tenantName).filter(Boolean))).map(
        (name) => ({ value: name, label: name }),
      ),
    [users],
  );

  const filteredUsers = useMemo(() => {
    let list = users;
    if (activeFilters.tenantName) {
      list = list.filter((u) => u.tenantName === activeFilters.tenantName);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((u) => u.name?.toLowerCase().includes(q));
    }
    return list;
  }, [users, activeFilters, searchTerm]);

  const sortedUsers = useMemo(() => {
    if (!sortField) return filteredUsers;
    const dir = sortType === "desc" ? -1 : 1;
    return [...filteredUsers].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
  }, [filteredUsers, sortField, sortType]);

  const totalResults = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageLimit));
  const paginated = sortedUsers.slice(
    (pageIndex - 1) * pageLimit,
    pageIndex * pageLimit,
  );

  const columns = useMemo(
    () => buildUserActivityColumns(maxRequestCount),
    [maxRequestCount],
  );

  const filters = useMemo(
    () => [
      {
        id: "tenantName",
        name: "Tenant",
        filterName: "tenantName",
        icon: TENANT_FILTER_ICON,
        options: tenantFilterOptions,
      },
    ],
    [tenantFilterOptions],
  );

  return (
    <div className="container-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <PageHeader
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="1.8"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
          iconGradient=""
          title="User Activity"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "User Activity" },
          ]}
        />
        <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
          {USER_ACTIVITY_WINDOWS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeWindow(opt.value)}
              className={`px-3 py-1 text-[12px] border-r last:border-r-0 border-gray-200 transition-colors ${
                timeWindow === opt.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Section>
        <UserActivityStatsCardRow isLoading={isLoading} {...stats} />
      </Section>

      <Section>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
          <div className="overflow-hidden">
            <NewTableConfig
              module="user-activity"
              columns={columns}
              data={paginated}
              isLoading={isFetching}
              group={USER_ACTIVITY_GROUP}
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
          </div>

          {/* Users by Tenant — client-side grouping of the same real response */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden self-start">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Users by Tenant
            </div>
            <div className="px-5 py-4 flex flex-col gap-2.5">
              {tenantBreakdown.length === 0 && (
                <div className="text-[12.5px] text-gray-400 py-2">
                  No activity in this window.
                </div>
              )}
              {tenantBreakdown.map((t) => (
                <div key={t.name} className="flex items-center gap-2.5">
                  <div
                    className="w-5 h-5 rounded-[5px] flex-shrink-0"
                    style={{ background: t.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-[12.5px] text-gray-700 truncate">
                        {t.name}
                      </span>
                      <span className="font-mono text-[11.5px] text-gray-400">
                        {t.users} users
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full opacity-80"
                        style={{
                          width: `${Math.round((t.users / maxTenantUsers) * 100)}%`,
                          background: t.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};
