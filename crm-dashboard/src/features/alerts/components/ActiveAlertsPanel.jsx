import { useState } from "react";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { ActionButton } from "../../../components/ui/ActionButton";
import { SilenceIcon } from "../../../components/ui/Icons";
import { alertsColumns } from "./columns";
import { ActiveAlertsStatsCardRow } from "./ActiveAlertsStatsCardRow";
import { AlertDetailsDrawer } from "./AlertDetailsDrawer";
import { SilenceFormModal } from "./SilenceFormModal";
import { useGetAlertsQuery } from "../hooks/query/useGetAlertsQuery";
import { useGetAlertsSummaryQuery } from "../hooks/query/useGetAlertsSummaryQuery";
import { ALERTS_GROUP, ALERTS_FILTERS } from "../constants";

export const ActiveAlertsPanel = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("triggeredAt");
  const [sortType, setSortType] = useState("desc");
  const [activeFilters, setActiveFilters] = useState({ status: "firing" });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [silenceOpen, setSilenceOpen] = useState(false);

  const { data: summary, isLoading: summaryLoading } =
    useGetAlertsSummaryQuery({ refetchInterval: 20000 });

  const { data: alertsResponse, isFetching } = useGetAlertsQuery(
    {
      page: pageIndex,
      limit: pageLimit,
      search: searchTerm,
      sortBy: sortField,
      sortOrder: sortType,
      filters: activeFilters,
    },
    { refetchInterval: 20000 },
  );

  const tableData = alertsResponse?.data || [];

  return (
    <div className="flex flex-col gap-5">
      <ActiveAlertsStatsCardRow
        isLoading={summaryLoading}
        total={summary?.total ?? 0}
        firing={summary?.firing ?? 0}
        acknowledged={summary?.acknowledged ?? 0}
        resolved={summary?.resolved ?? 0}
        critical={summary?.critical ?? 0}
      />

      <div className="flex items-center justify-between">
        <h3 className="text-[14px] text-gray-800 font-medium">
          Active Alerts
        </h3>
        <ActionButton
          action="save"
          label="Add Silence"
          icon={SilenceIcon}
          onClick={() => setSilenceOpen(true)}
        />
      </div>

      <NewTableConfig
        module="active-alerts"
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
        availableAdditionalFilters={ALERTS_FILTERS}
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
      <SilenceFormModal open={silenceOpen} onClose={() => setSilenceOpen(false)} />
    </div>
  );
};
