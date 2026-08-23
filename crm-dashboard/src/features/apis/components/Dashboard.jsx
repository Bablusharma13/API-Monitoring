// Apis.jsx
import { useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { ALL_APIS_FILTERS, ALL_APIS_GROUP } from "../constants";
import { allAPIsColumns } from "./columns";
import { StatCardRow } from "./StatCardRow";
import { useGetApisQuery } from "../hooks/query/useApisQuery";
import { useGetApisSummaryQuery } from "../hooks/query/useGetApisSummaryQuery";
import { Section } from "../../../components/ui/Section";
import { PulseWaveIcon } from "../../../components/ui/AppIcons";
import { AllApisDrawer } from "./AllApisDrawer";
import { Button } from "../../../components/ui/Button";
import { Plus } from "lucide-react";
import { AddApiModal } from "./AddApiModal";
import { useNavigate } from "react-router-dom";
import { exportToCsv } from "../../../utils/exportCsv";
import { useBulkDeleteApisMutation } from "../hooks/query/useBulkDeleteApisMutation";
import { useDeleteApiMutation } from "../hooks/query/useDeleteApiMutation";
import { AlertDialog } from "../../../components/ui/AlertDialog";

export const Apis = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortType, setSortType] = useState("asc");
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectionToken, setSelectionToken] = useState(0);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [rowDeleteDialogOpen, setRowDeleteDialogOpen] = useState(false);

  const navigate = useNavigate();

  const { mutateAsync: bulkDelete } = useBulkDeleteApisMutation();
  const { mutateAsync: deleteApi, isPending: isRowDeleting } =
    useDeleteApiMutation();

  const { data: apiSummaryData } = useGetApisSummaryQuery();
  const { data: allApis, isFetching } = useGetApisQuery({
    page: pageIndex,
    limit: pageLimit,
    search: searchTerm,
    sortBy: sortField,
    sortOrder: sortType,
    filters: activeFilters,
  });

  return (
    <div className="container-page">
      <PageHeader
        icon={<PulseWaveIcon />}
        iconGradient=""
        title="All APIs"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "All APIs" },
        ]}
        actions={
          <Button icon={<Plus />} onClick={() => setAddModalOpen(true)}>
            Add API
          </Button>
        }
      />

      <Section>
        <StatCardRow
          total={apiSummaryData?.totalApis}
          active={apiSummaryData?.activeApis}
          down={apiSummaryData?.downApis}
          warning={apiSummaryData?.warningApis}
          avgResponse={(() => {
            const ms = apiSummaryData?.avgResponseTime;
            if (ms == null) return "—";
            return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
          })()}
          avgUptime={
            apiSummaryData?.avgUptime != null
              ? `${apiSummaryData.avgUptime}%`
              : "—"
          }
        />
      </Section>

      <Section>
        <NewTableConfig
          module="all-apis"
          columns={allAPIsColumns}
          data={allApis?.data || []}
          isLoading={isFetching}
          group={ALL_APIS_GROUP}
          currentPage={pageIndex}
          setCurrentPage={setPageIndex}
          pageLimit={pageLimit}
          handlePageLimitChange={setPageLimit}
          totalResults={allApis?.pagination?.total || 0}
          totalPages={allApis?.pagination?.totalPages || 0}
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortField}
          sortOrder={sortType}
          handleServerSideSorting={({ sortBy, sortDirection }) => {
            setSortField(sortBy);
            setSortType(sortDirection);
          }}
          availableAdditionalFilters={ALL_APIS_FILTERS}
          onFiltersChange={(f) => {
            setActiveFilters(f);
            setPageIndex(1);
          }}
          isAction={true}
          actions={{
            onView: (row) => navigate(`/dashboard/apis/${row.apiId}`),
            onEdit: (row) => navigate(`/dashboard/apis/form/${row.apiId}`),
            onDelete: (row) => {
              setRowToDelete(row);
              setRowDeleteDialogOpen(true);
            },
          }}
          updateSelectedRows={setSelectedRows}
          selectionToken={selectionToken}
          bulkActions={[
            {
              action: "export",
              onClick: () => {
                exportToCsv(selectedRows, "apis-export.csv");
                setSelectedRows([]);
                setSelectionToken((v) => v + 1);
              },
            },
            {
              action: "delete",
              onClick: () => {
                if (selectedRows.length) setDeleteDialogOpen(true);
              },
            },
          ]}
          onRowClick={setSelectedRow}
          showRowNumbers={false}
        />
      </Section>

      <AllApisDrawer
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
      />

      <AddApiModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />

      <AlertDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        type="danger"
        title={`Delete ${selectedRows.length} API${selectedRows.length !== 1 ? "s" : ""}?`}
        description="This action is permanent and cannot be undone. All selected APIs and their associated data will be removed."
        checkboxLabel="I understand this action is permanent and cannot be undone."
        itemName="Delete"
        isLoading={isDeleting}
        handleOnClick={async () => {
          const ids = selectedRows.map((r) => r._id ?? r.id).filter(Boolean);
          setIsDeleting(true);
          try {
            await bulkDelete(ids);
            setSelectedRows([]);
            setSelectionToken((v) => v + 1);
            setDeleteDialogOpen(false);
          } finally {
            setIsDeleting(false);
          }
        }}
      />

      <AlertDialog
        open={rowDeleteDialogOpen}
        setOpen={setRowDeleteDialogOpen}
        type="danger"
        title={`Delete "${rowToDelete?.name}"?`}
        description="This action is permanent and cannot be undone. The API and all its associated monitoring data will be removed."
        checkboxLabel="I understand this action is permanent and cannot be undone."
        itemName="Delete"
        isLoading={isRowDeleting}
        handleOnClick={async () => {
          const id = rowToDelete?.apiId;
          if (!id) return;
          await deleteApi(id);
          setRowDeleteDialogOpen(false);
          setRowToDelete(null);
        }}
      />
    </div>
  );
};
