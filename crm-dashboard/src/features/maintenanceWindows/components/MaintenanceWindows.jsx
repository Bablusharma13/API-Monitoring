import { useState } from "react";
import { toast } from "sonner";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { Button } from "../../../components/ui/Button";
import { Plus } from "lucide-react";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { AlertDialog } from "../../../components/ui/AlertDialog";
import { maintenanceWindowsColumns } from "./columns";
import { MaintenanceWindowFormModal } from "./MaintenanceWindowFormModal";
import { useGetMaintenanceWindowsQuery } from "../hooks/query/useGetMaintenanceWindowsQuery";
import { useDeleteMaintenanceWindowMutation } from "../hooks/query/useDeleteMaintenanceWindowMutation";
import { useBulkDeleteMaintenanceWindowsMutation } from "../hooks/query/useBulkDeleteMaintenanceWindowsMutation";
import {
  MAINTENANCE_WINDOWS_GROUP,
  MAINTENANCE_WINDOWS_FILTERS,
} from "../constants";
import useCurrentUser from "../../../hooks/useCurrentUser";

const WrenchIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="1.8"
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const MaintenanceWindows = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("startsAt");
  const [sortType, setSortType] = useState("desc");
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [activeWindow, setActiveWindow] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [rowDeleteDialogOpen, setRowDeleteDialogOpen] = useState(false);

  const { isAdmin } = useCurrentUser();

  const { mutateAsync: bulkDelete } = useBulkDeleteMaintenanceWindowsMutation();
  const { mutateAsync: deleteWindow, isPending: isRowDeleting } =
    useDeleteMaintenanceWindowMutation();

  const {
    data: windowsResponse,
    isLoading,
    isFetching,
  } = useGetMaintenanceWindowsQuery({
    page: pageIndex,
    limit: pageLimit,
    search: searchTerm,
    sortBy: sortField,
    sortOrder: sortType,
    filters: activeFilters,
  });

  const tableData = windowsResponse?.data || [];

  const openNew = () => {
    setActiveWindow(null);
    setFormOpen(true);
  };
  const openEdit = (row) => {
    setActiveWindow(row);
    setFormOpen(true);
  };

  return (
    <div className="container-page">
      <PageHeader
        icon={<WrenchIcon />}
        iconGradient=""
        title="Maintenance Windows"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Maintenance Windows" },
        ]}
        actions={
          <Button icon={<Plus />} onClick={openNew}>
            New Maintenance Window
          </Button>
        }
      />

      <Section className="pt-0">
        <NewTableConfig
          module="maintenance-windows"
          columns={maintenanceWindowsColumns}
          data={tableData}
          isLoading={isLoading || isFetching}
          group={MAINTENANCE_WINDOWS_GROUP}
          currentPage={pageIndex}
          setCurrentPage={setPageIndex}
          pageLimit={pageLimit}
          handlePageLimitChange={setPageLimit}
          totalResults={windowsResponse?.pagination?.total || tableData.length}
          totalPages={windowsResponse?.pagination?.totalPages || 1}
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortField}
          sortOrder={sortType}
          handleServerSideSorting={({ sortBy, sortDirection }) => {
            setSortField(sortBy);
            setSortType(sortDirection);
          }}
          availableAdditionalFilters={MAINTENANCE_WINDOWS_FILTERS}
          onFiltersChange={(f) => {
            setActiveFilters(f);
            setPageIndex(1);
          }}
          isAction
          actions={{
            onEdit: openEdit,
            ...(isAdmin && {
              onDelete: (row) => {
                setRowToDelete(row);
                setRowDeleteDialogOpen(true);
              },
            }),
          }}
          updateSelectedRows={setSelectedRows}
          bulkActions={[
            ...(isAdmin
              ? [
                  {
                    action: "delete",
                    onClick: () => {
                      if (selectedRows.length) setDeleteDialogOpen(true);
                    },
                  },
                ]
              : []),
          ]}
          showRowNumbers={false}
        />
      </Section>

      <MaintenanceWindowFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        maintenanceWindow={activeWindow}
      />

      <AlertDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        type="danger"
        title={`Delete ${selectedRows.length} Maintenance Window${selectedRows.length !== 1 ? "s" : ""}?`}
        description="This action is permanent and cannot be undone. Alerts will no longer be suppressed for the affected APIs during these windows."
        itemName="Delete"
        isLoading={isBulkDeleting}
        handleOnClick={async () => {
          const ids = selectedRows.map((r) => r._id ?? r.id).filter(Boolean);
          setIsBulkDeleting(true);
          try {
            await bulkDelete(ids);
            setSelectedRows([]);
            setDeleteDialogOpen(false);
          } catch (error) {
            toast.error(
              error?.response?.data?.message ||
                "Failed to delete maintenance windows",
            );
          } finally {
            setIsBulkDeleting(false);
          }
        }}
      />

      <AlertDialog
        open={rowDeleteDialogOpen}
        setOpen={setRowDeleteDialogOpen}
        type="danger"
        title={`Delete "${rowToDelete?.reason || "this maintenance window"}"?`}
        description="This action is permanent and cannot be undone. Alerts will no longer be suppressed for the affected APIs during this window."
        itemName="Delete"
        isLoading={isRowDeleting}
        handleOnClick={async () => {
          const id = rowToDelete?._id ?? rowToDelete?.id;
          if (!id) return;
          try {
            await deleteWindow(id);
            setRowDeleteDialogOpen(false);
            setRowToDelete(null);
          } catch (error) {
            toast.error(
              error?.response?.data?.message ||
                "Failed to delete maintenance window",
            );
          }
        }}
      />
    </div>
  );
};

export default MaintenanceWindows;
