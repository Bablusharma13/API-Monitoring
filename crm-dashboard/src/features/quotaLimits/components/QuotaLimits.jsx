import { useMemo, useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { quotaLimitsColumns } from "./columns";
import { QuotaLimitsStatsCardRow } from "./QuotaLimitsStatsCardRow";
import { useGetQuotaUsageQuery } from "../hooks/query/useGetQuotaUsageQuery";
import { QUOTA_GROUP, quotaStatus } from "../constants";

const GaugeIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="12" y1="8" x2="12" y2="16" />
  </svg>
);

const STATUS_FILTER = {
  id: "status",
  name: "Status",
  filterName: "status",
  icon: (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  options: [
    { value: "ok", label: "OK" },
    { value: "warn", label: "Near limit" },
    { value: "over", label: "Over" },
  ],
};

export const QuotaLimits = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("usedPct");
  const [sortType, setSortType] = useState("desc");
  const [activeFilters, setActiveFilters] = useState({});

  const { data: rawTenants = [], isFetching } = useGetQuotaUsageQuery();

  // Everything below is client-side: /tenants/quota-usage returns the full
  // tenant list in one response with no search/sort/pagination support.
  const rows = useMemo(
    () => rawTenants.map((t) => ({ ...t, status: quotaStatus(t.usedPct) })),
    [rawTenants],
  );

  const planFilter = useMemo(() => {
    const plans = Array.from(new Set(rows.map((r) => r.plan).filter(Boolean)));
    return {
      id: "plan",
      name: "Plan",
      filterName: "plan",
      icon: (
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      ),
      options: plans.map((p) => ({ value: p, label: p })),
    };
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows.filter((r) => {
      if (activeFilters.status && r.status !== activeFilters.status)
        return false;
      if (activeFilters.plan && r.plan !== activeFilters.plan) return false;
      if (
        searchTerm &&
        !r.tenantName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string")
        return sortType === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      return sortType === "asc" ? av - bv : bv - av;
    });

    return list;
  }, [rows, activeFilters, searchTerm, sortField, sortType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageLimit));
  const paginated = filtered.slice(
    (pageIndex - 1) * pageLimit,
    pageIndex * pageLimit,
  );

  const stats = useMemo(
    () => ({
      totalCallsThisMonth: rows.reduce(
        (sum, r) => sum + (r.usedThisMonth || 0),
        0,
      ),
      nearLimitCount: rows.filter((r) => r.status === "warn").length,
      overLimitCount: rows.filter((r) => r.status === "over").length,
      withinQuotaCount: rows.filter((r) => r.status === "ok").length,
    }),
    [rows],
  );

  return (
    <div className="container-page">
      <PageHeader
        icon={<GaugeIcon />}
        iconGradient=""
        title="Quota & Rate Limits"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings" },
          { label: "Quota & Rate Limits" },
        ]}
      />

      <Section>
        <QuotaLimitsStatsCardRow
          isLoading={isFetching && !rows.length}
          {...stats}
        />
      </Section>

      <Section>
        <NewTableConfig
          module="quota-limits"
          columns={quotaLimitsColumns}
          data={paginated}
          isLoading={isFetching && !rows.length}
          group={QUOTA_GROUP}
          currentPage={pageIndex}
          setCurrentPage={setPageIndex}
          pageLimit={pageLimit}
          handlePageLimitChange={(limit) => {
            setPageLimit(limit);
            setPageIndex(1);
          }}
          totalResults={filtered.length}
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
          availableAdditionalFilters={[STATUS_FILTER, planFilter]}
          onFiltersChange={(f) => {
            setActiveFilters(f);
            setPageIndex(1);
          }}
          showRowNumbers={false}
        />
      </Section>
    </div>
  );
};

export default QuotaLimits;
