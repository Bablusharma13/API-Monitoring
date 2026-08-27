import { useState } from "react";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { alertsColumns } from "./columns";
import { AlertDetailsDrawer } from "./AlertDetailsDrawer";
import { useGetAlertsQuery } from "../hooks/query/useGetAlertsQuery";
import { ALERTS_GROUP, SEVERITY_OPTIONS } from "../constants";

// There is no dedicated history endpoint — this reuses the same alerts list
// hook as ActiveAlertsPanel, pinned to status=resolved.
const HISTORY_FILTERS = [
  {
    id: "severity",
    name: "Severity",
    filterName: "severity",
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
    ),
    options: SEVERITY_OPTIONS,
  },
];

export const AlertHistoryPanel = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("resolvedAt");
  const [sortType, setSortType] = useState("desc");
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedAlert, setSelectedAlert] = useState(null);

  const { data: alertsResponse, isFetching } = useGetAlertsQuery({
    page: pageIndex,
    limit: pageLimit,
    search: searchTerm,
    sortBy: sortField,
    sortOrder: sortType,
    filters: { ...activeFilters, status: "resolved" },
  });

  const tableData = alertsResponse?.data || [];

  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-[14px] text-gray-800 font-medium">Alert History</h3>

      <NewTableConfig
        module="alert-history"
        columns={alertsColumns}
        data={tableData}
        isLoading={isFetching}
        group={ALERTS_GROUP}
        currentPage={pageIndex}
        setCurrentPage={setPageIndex}
        pageLimit={pageLimit}
        handlePageLimitChange={setPageLimit}
        totalResults={alertsResponse?.pagination?.total || tableData.length}
        totalPages={alertsResponse?.pagination?.totalPages || 1}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortField}
        sortOrder={sortType}
        handleServerSideSorting={({ sortBy, sortDirection }) => {
          setSortField(sortBy);
          setSortType(sortDirection);
        }}
        availableAdditionalFilters={HISTORY_FILTERS}
        onFiltersChange={(f) => {
          setActiveFilters(f);
          setPageIndex(1);
        }}
        onRowClick={setSelectedAlert}
        showRowNumbers={false}
      />

      <AlertDetailsDrawer
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />
    </div>
  );
};
