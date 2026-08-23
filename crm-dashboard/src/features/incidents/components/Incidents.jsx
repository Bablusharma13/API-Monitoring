// Incidents.jsx
import { useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { IncidentsStatsCardRow } from "./IncidentsStatsCardRow";
import { FeedBox } from "../../../components/ui/FeedBox";
import NewTableConfig from "../../../components/TableComponents/TableConfig"; // ← Added
import { INCIDENTS_GROUP, INCIDENTS_FILTERS } from "../constants";
import { incidentsColumns } from "./columns";
import { useGetIncidentsSummaryQuery } from "../hooks/query/useGetIncidentsSummaryQuery";
import { useGetAllIncidentsQuery } from "../hooks/query/useGetAllIncidentsQuery";
import { IncidentInfoIcon } from "../../../components/ui/AppIcons";
import { IncidentsDrawer } from "./IncidentsDrawer";
import { exportIncidentsToCsv } from "../../../utils/exportCsv";
import { useDeleteIncidentMutation } from "../hooks/query/useDeleteIncidentMutation";
import { useBulkDeleteIncidentsMutation } from "../hooks/query/useBulkDeleteIncidentsMutation";
import { AlertDialog } from "../../../components/ui/AlertDialog";

const FEED_ITEMS = [
  {
    id: 1,
    dot: "red",
    api: "payment-api",
    msg: "HTTP 503 — Service down",
    time: "now",
  },
  {
    id: 2,
    dot: "amber",
    api: "auth-service",
    msg: "High latency 2419ms",
    time: "2m ago",
  },
  {
    id: 3,
    dot: "red",
    api: "email-gateway",
    msg: "SSL certificate expired",
    time: "5m ago",
  },
  {
    id: 4,
    dot: "amber",
    api: "cdn-api",
    msg: "Cache miss rate 42%",
    time: "8m ago",
  },
  {
    id: 5,
    dot: "green",
    api: "ml-api",
    msg: "Recovered — back to normal",
    time: "3h ago",
  },
  {
    id: 6,
    dot: "amber",
    api: "erp-api",
    msg: "Memory usage 87% — warning",
    time: "12m ago",
  },
  {
    id: 7,
    dot: "red",
    api: "legacy-v1-api",
    msg: "Host unreachable — 504",
    time: "4h ago",
  },
  {
    id: 8,
    dot: "green",
    api: "billing-api",
    msg: "Incident INC-0019 resolved",
    time: "5h ago",
  },
];

const LIVE_EVENTS = [
  { dot: "red", api: "payment-api", msg: "Still down — team investigating" },
  { dot: "green", api: "search-api", msg: "Recovered — latency normal" },
  { dot: "amber", api: "crm-api", msg: "DB pool at 92% — warning" },
  { dot: "red", api: "email-gateway", msg: "SSL still expired — cert pending" },
  { dot: "blue", api: "report-api", msg: "Rate limit applied — stabilizing" },
];

export const Incidents = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortType, setSortType] = useState("asc");
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [rowDeleteDialogOpen, setRowDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const { mutateAsync: deleteIncident, isPending: isRowDeleting } =
    useDeleteIncidentMutation();
  const { mutateAsync: bulkDelete } = useBulkDeleteIncidentsMutation();

  const { data: summaryData, isLoading: summaryLoading } =
    useGetIncidentsSummaryQuery();

  const {
    data: incidentsResponse,
    isLoading,
    isFetching,
  } = useGetAllIncidentsQuery({
    page: pageIndex,
    limit: pageLimit,
    search: searchTerm,
    sortBy: sortField,
    sortOrder: sortType,
    filters: activeFilters,
  });

  const tableData = incidentsResponse?.data || [];

  return (
    <div className="container-page">
      <PageHeader
        icon={<IncidentInfoIcon />}
        iconGradient=""
        title="Incidents"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Incidents" },
        ]}
      />

      <Section>
        <IncidentsStatsCardRow
          isLoading={summaryLoading}
          total={summaryData?.totalIncidents || 0}
          active={summaryData?.activeIncidents || 0}
          down={summaryData?.criticalIncidents || 0}
          critical={summaryData?.criticalIncidents || 0}
          warning={summaryData?.resolvedToday || 0}
          avgResponse={summaryData?.avgResolution || "—"}
          avgUptime={summaryData?.slaBreaches || "—"}
        />
      </Section>

      <Section>
        <NewTableConfig
          module="incidents"
          columns={incidentsColumns}
          data={tableData}
          isLoading={isFetching}
          group={INCIDENTS_GROUP}
          currentPage={pageIndex}
          setCurrentPage={setPageIndex}
          pageLimit={pageLimit}
          handlePageLimitChange={setPageLimit}
          totalResults={
            incidentsResponse?.pagination?.total || tableData.length
          }
          totalPages={incidentsResponse?.pagination?.totalPages || 1}
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortField}
          sortOrder={sortType}
          handleServerSideSorting={({ sortBy, sortDirection }) => {
            setSortField(sortBy);
            setSortType(sortDirection);
          }}
          availableAdditionalFilters={INCIDENTS_FILTERS}
          onFiltersChange={(f) => {
            setActiveFilters(f);
            setPageIndex(1);
          }}
          isAction={true}
          actions={{
            // onView: (row) => setSelectedRow(row),
            // onEdit: (row) => console.log("edit", row),
            onDelete: (row) => {
              setRowToDelete(row);
              setRowDeleteDialogOpen(true);
            },
          }}
          updateSelectedRows={setSelectedRows}
          bulkActions={[
            {
              action: "export",
              onClick: () =>
                exportIncidentsToCsv(
                  selectedRows,
                  `incidents-${new Date().toISOString().slice(0, 10)}.csv`,
                ),
            },
            {
              action: "delete",
              onClick: () => {
                if (selectedRows.length) setBulkDeleteDialogOpen(true);
              },
            },
          ]}
          onRowClick={setSelectedRow}
          showRowNumbers={false}
        />
        {/* <div className="shrink-0 border-l border-gray-100 flex flex-col overflow-hidden self-stretch"> */}
        {/*   <FeedBox */}
        {/*     title="Live Incident Feed" */}
        {/*     items={FEED_ITEMS} */}
        {/*     liveEvents={LIVE_EVENTS} */}
        {/*     autoInterval={18000} */}
        {/*     maxItems={15} */}
        {/*     showSimulate={true} */}
        {/*   /> */}
        {/* </div> */}
      </Section>

      {/* <IncidentsDrawer */}
      {/*   selectedRow={selectedRow} */}
      {/*   setSelectedRow={setSelectedRow} */}
      {/* /> */}

      <AlertDialog
        open={rowDeleteDialogOpen}
        setOpen={setRowDeleteDialogOpen}
        type="danger"
        title={`Delete "${rowToDelete?.title}"?`}
        description="This action is permanent and cannot be undone. The incident and all its associated data will be removed."
        itemName="Delete"
        isLoading={isRowDeleting}
        handleOnClick={async () => {
          const id = rowToDelete?._id ?? rowToDelete?.id;
          if (!id) return;
          await deleteIncident(id);
          setRowDeleteDialogOpen(false);
          setRowToDelete(null);
        }}
      />

      <AlertDialog
        open={bulkDeleteDialogOpen}
        setOpen={setBulkDeleteDialogOpen}
        type="danger"
        title={`Delete ${selectedRows.length} Incident${selectedRows.length !== 1 ? "s" : ""}?`}
        description="This action is permanent and cannot be undone. All selected incidents and their associated data will be removed."
        itemName="Delete"
        isLoading={isBulkDeleting}
        handleOnClick={async () => {
          const ids = selectedRows.map((r) => r._id ?? r.id).filter(Boolean);
          setIsBulkDeleting(true);
          try {
            await bulkDelete(ids);
            setSelectedRows([]);
            setBulkDeleteDialogOpen(false);
          } finally {
            setIsBulkDeleting(false);
          }
        }}
      />
    </div>
  );
};
