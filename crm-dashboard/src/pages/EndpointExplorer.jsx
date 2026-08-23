import { useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Table } from "../components/TableComponents/Table";
import { ExportIcon, RefreshIcon } from "../components/ui/Icons";
import { useGetTenantEndpointExplorerQuery } from "../features/tenants/hooks/query/useGetEndpointExplorerQuery";
import { Link } from "react-router-dom";

// ── METHOD STYLES ─────────────────────────────────────────────────────────────
const METHOD_STYLE = {
  GET: { bg: "bg-blue-50", text: "text-blue-700" },
  POST: { bg: "bg-green-50", text: "text-green-700" },
  PUT: { bg: "bg-amber-50", text: "text-amber-700" },
  DELETE: { bg: "bg-red-50", text: "text-red-700" },
  PATCH: { bg: "bg-purple-50", text: "text-purple-700" },
};

const ENDPOINT_GROUPS = {
  Endpoint: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Latency: { hex: "#d97706", bg: "bg-amber-50", text: "text-amber-600" },
  Traffic: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Status: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function EndpointExplorer() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(10);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const { data: endpointExplorerData, isLoading: isEndpointExplorerLoading } =
    useGetTenantEndpointExplorerQuery(
      pageIndex + 1,
      pageLimit,
      searchInput || undefined,
      sortField,
      sortType,
    );

  console.log("endpoint explorer", endpointExplorerData);

  const endpoints = endpointExplorerData?.data ?? [];
  const pagination = endpointExplorerData?.pagination;

  const [activeFilters, setActiveFilters] = useState({});

  const columns = [
    {
      id: "method",
      name: "Method",
      width: 80,
      group: "Endpoint",
      disableSortBy: true,
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
      name: "Endpoint Path",
      width: 280,
      group: "Endpoint",
      disableSortBy: true,
      cell: (row) => (
        <Link
          to={`/dashboard/endpoint-explorer/endpoint-detail?endpoint=${row.endpoint}&method=${row.method}`}
          className="font-mono text-[12px] text-blue-500 "
        >
          {row.endpoint}
        </Link>
      ),
    },
    {
      id: "totalHits",
      name: "Total Calls",
      width: 100,
      group: "Traffic",
      cell: (row) => (
        <span className="font-mono text-[12px]">
          {row.totalHits?.toLocaleString()}
        </span>
      ),
    },
    {
      id: "avgLatency",
      name: "Avg Latency",
      width: 100,
      group: "Latency",
      cell: (row) => {
        const c = row.avgLatency > 200 ? "text-amber-600" : "text-gray-700";
        return (
          <span className={`font-mono text-[12px] ${c}`}>
            {row.avgLatency}ms
          </span>
        );
      },
    },
    {
      id: "p50",
      name: "p50",
      width: 70,
      group: "Latency",
      cell: (row) => (
        <span className="font-mono text-[12px] text-gray-500">{row.p50}ms</span>
      ),
    },
    {
      id: "p95",
      name: "p95",
      width: 70,
      group: "Latency",
      cell: (row) => {
        const c = !row.p95
          ? "text-gray-400"
          : row.p95 > 400
            ? "text-red-600"
            : row.p95 > 250
              ? "text-amber-600"
              : "text-gray-700";
        return (
          <span className={`font-mono text-[12px] ${c}`}>{row.p95}ms</span>
        );
      },
    },
    {
      id: "p99",
      name: "p99",
      width: 70,
      group: "Latency",
      cell: (row) => (
        <span className="font-mono text-[12px] text-gray-400">{row.p99}ms</span>
      ),
    },
    {
      id: "errorRate",
      name: "Err %",
      width: 70,
      group: "Traffic",
      cell: (row) => {
        const v = row.errorRate ?? row.err ?? 0;
        const c =
          v > 2 ? "text-red-600" : v > 1 ? "text-amber-600" : "text-gray-400";
        return <span className={`font-mono text-[12px] ${c}`}>{v}%</span>;
      },
    },
  ];

  const totalEndpoints = pagination?.total ?? endpoints.length;
  const avgLatencyAll = endpoints.length
    ? (
        endpoints.reduce((s, e) => s + (e.avgLatency ?? 0), 0) /
        endpoints.length
      ).toFixed(0)
    : 0;

  const stats = [
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
      iconColor: "text-blue-600",
      count: totalEndpoints.toString(),
      countColor: "text-blue-600",
      title: "Total Endpoints",
      badgeBg: "bg-blue-50",
      badgeTextColor: "text-blue-600",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      iconColor: "text-green-600",
      count: 0,
      countColor: "text-green-600",
      title: "Healthy Endpoints",
      badgeBg: "bg-green-50",
      badgeTextColor: "text-green-600",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
        </svg>
      ),
      iconColor: "text-red-500",
      count: 0,
      countColor: "text-red-600",
      title: "Degraded Endpoints",
      badgeBg: "bg-red-50",
      badgeTextColor: "text-red-600",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      iconColor: "text-amber-500",
      // count: `${avgLatencyAll}ms`,
      count: `-CS-`,
      countColor: "text-amber-600",
      title: "Avg Latency",
      badgeBg: "bg-amber-50",
      badgeTextColor: "text-amber-600",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      iconColor: "text-gray-400",
      count: endpoints
        .reduce((s, e) => s + (e.totalHits ?? 0), 0)
        .toLocaleString(),
      title: "Total API Calls",
      badgeBg: "bg-gray-100",
      badgeTextColor: "text-gray-500",
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
              <path d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="Endpoint Explorer"
          breadcrumbs={[
            { label: "Home", href: "/dashboard/tenant" },
            { label: "Endpoint Explorer" },
          ]}
        />
        <div className="flex items-center gap-2">
          <ActionButton action="refresh" label="Refresh" icon={RefreshIcon} />
          <ActionButton action="export" label="Export CSV" icon={ExportIcon} />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((s, i) => (
            <StatCard
              key={i}
              icon={s.icon}
              iconColor={s.iconColor}
              count={s.count}
              countColor={s.countColor}
              title={s.title}
              badgeText={s.badgeText}
              badgeBg={s.badgeBg}
              badgeTextColor={s.badgeTextColor}
            />
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden">
          <Table
            columns={columns}
            group={ENDPOINT_GROUPS}
            tableName="endpoint-explorer"
            data={endpoints}
            loading={isEndpointExplorerLoading}
            enableSearch={true}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            pageIndex={pageIndex}
            setPageIndex={setPageIndex}
            pageLimit={pageLimit}
            setPageLimit={setPageLimit}
            paginationData={{
              totalCount: pagination?.total ?? endpoints.length,
              totalPages: pagination?.pages ?? 1,
            }}
            showRowNumbers={false}
            sortField={sortField}
            setSortField={setSortField}
            sortType={sortType}
            setSortType={setSortType}
            activeFilters={activeFilters}
            setActiveFilters={(newFilters) => {
              setActiveFilters(newFilters);
              setPageIndex(0);
            }}
          />
        </div>
      </div>
    </div>
  );
}
