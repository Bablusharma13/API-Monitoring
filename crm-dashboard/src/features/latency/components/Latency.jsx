import { useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { ActionButton } from "../../../components/ui/ActionButton";
import { ExportIcon, RefreshIcon } from "../../../components/ui/Icons";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { useGetTenantEndpointExplorerQuery } from "../../tenants/hooks/query/useGetEndpointExplorerQuery";
import { useGetTenantCardsQuery } from "../../tenants/hooks/query/useGetTenantCardsQuery";
import { latencyEndpointColumns } from "./columns";
import { LatencyStatsCardRow } from "./LatencyStatsCardRow";
import { SloComplianceByTenant } from "./SloComplianceByTenant";
import { LATENCY_ENDPOINT_GROUP, SLO_THRESHOLD_MS } from "../constants";

// Size of the (separate, unpaginated) sample used purely to compute the
// overview stat cards — independent of whatever page/sort the visible table
// is on. Sorted worst-first so with more endpoints than this than the
// average is a conservative (slowest-biased) read, never an optimistic one.
const STATS_SAMPLE_LIMIT = 100;
// How many tenants to pull for the SLO panel — the mock rendered a fixed,
// unpaginated list, so we fetch a generous single page rather than wiring
// up pagination for it.
const TENANT_SAMPLE_LIMIT = 100;

export const Latency = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [sortField, setSortField] = useState("p95");
  const [sortType, setSortType] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: endpointExplorerData,
    isFetching: isEndpointsFetching,
    refetch: refetchEndpoints,
  } = useGetTenantEndpointExplorerQuery(
    pageIndex,
    pageLimit,
    searchTerm || undefined,
    sortField,
    sortType,
  );
  const endpoints = endpointExplorerData?.data ?? [];
  const endpointsPagination = endpointExplorerData?.pagination;

  // Dedicated sample for the stat cards — same real endpoint-explorer data,
  // just a larger, unpaginated slice so the averages aren't skewed by
  // whatever 10-row page the table happens to be showing.
  const { data: statsExplorerData, refetch: refetchStats } =
    useGetTenantEndpointExplorerQuery(
      1,
      STATS_SAMPLE_LIMIT,
      undefined,
      "p95",
      "desc",
    );
  const statsEndpoints = statsExplorerData?.data ?? [];

  const {
    data: tenantCardsData,
    isLoading: isTenantCardsLoading,
    refetch: refetchTenantCards,
  } = useGetTenantCardsQuery({ limit: TENANT_SAMPLE_LIMIT, sort: "latency" });
  const tenantCards = tenantCardsData?.tenants ?? [];

  const avgOf = (arr, key) =>
    arr.length
      ? Math.round(arr.reduce((sum, e) => sum + (e[key] ?? 0), 0) / arr.length)
      : 0;

  const avgP50 = avgOf(statsEndpoints, "p50");
  const avgP95 = avgOf(statsEndpoints, "p95");
  const avgP99 = avgOf(statsEndpoints, "p99");

  const sloMet = tenantCards.filter(
    (t) => (t.metrics?.p95ms ?? 0) <= SLO_THRESHOLD_MS,
  ).length;
  const sloBreached = tenantCards.length - sloMet;

  const handleRefresh = () => {
    refetchEndpoints();
    refetchStats();
    refetchTenantCards();
  };

  return (
    <div className="container-page">
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
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="Latency"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Latency" },
          ]}
        />
        <div className="flex items-center gap-2">
          <ActionButton
            action="refresh"
            label="Refresh"
            icon={RefreshIcon}
            onClick={handleRefresh}
          />
          <ActionButton action="export" label="Export" icon={ExportIcon} />
        </div>
      </div>

      <Section>
        <LatencyStatsCardRow
          avgP50={avgP50}
          avgP95={avgP95}
          avgP99={avgP99}
          sloMet={sloMet}
          sloBreached={sloBreached}
        />
      </Section>

      <Section>
        <NewTableConfig
          module="latency-endpoints"
          columns={latencyEndpointColumns}
          data={endpoints}
          isLoading={isEndpointsFetching}
          group={LATENCY_ENDPOINT_GROUP}
          currentPage={pageIndex}
          setCurrentPage={setPageIndex}
          pageLimit={pageLimit}
          handlePageLimitChange={setPageLimit}
          totalResults={endpointsPagination?.total ?? endpoints.length}
          totalPages={endpointsPagination?.pages ?? 1}
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortField}
          sortOrder={sortType}
          handleServerSideSorting={({ sortBy, sortDirection }) => {
            setSortField(sortBy);
            setSortType(sortDirection);
          }}
          showRowNumbers={false}
        />
      </Section>

      <Section>
        <SloComplianceByTenant
          tenants={tenantCards}
          isLoading={isTenantCardsLoading}
        />
      </Section>
    </div>
  );
};

export default Latency;
