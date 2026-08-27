// Categories.jsx
import { useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { CategoriesStatsCardRow } from "./CategoriesStatsCardRow";
import { FeedBox } from "../../../components/ui/FeedBox";
import NewTableConfig from "../../../components/TableComponents/TableConfig"; // ← Added
import { categoriesColumns } from "./columns";
import { useGetAllCategoriesQuery } from "../hooks/query/useGetAllCategoriesQuery";
import { useGetCategoriesSummaryQuery } from "../hooks/query/useGetCategoriesSummary";
import { MenuLinesIcon } from "../../../components/ui/AppIcons";
import { CategoryDrawer } from "./CategoriesDrawer";
import { Button } from "../../../components/ui/Button";
import { Plus } from "lucide-react";
import { AddCategoryModal } from "./AddCategoryModal";
import { exportCategoriesToCsv } from "../../../utils/exportCsv";
import { useBulkDeleteCategoriesMutation } from "../hooks/query/useBulkDeleteCategoriesMutation";
import { useDeleteCategoryMutation } from "../hooks/query/useDeleteCategoryMutation";
import { AlertDialog } from "../../../components/ui/AlertDialog";
import { Categories_GROUP } from "../constants";
import useCurrentUser from "../../../hooks/useCurrentUser";

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

export const Categories = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortType, setSortType] = useState("asc");
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [rowDeleteDialogOpen, setRowDeleteDialogOpen] = useState(false);

  const { isAdmin } = useCurrentUser();

  const { mutateAsync: bulkDelete } = useBulkDeleteCategoriesMutation();
  const { mutateAsync: deleteCategory, isPending: isRowDeleting } =
    useDeleteCategoryMutation();

  const {
    data: response,
    isLoading,
    isFetching,
  } = useGetAllCategoriesQuery({
    page: pageIndex,
    limit: pageLimit,
    search: searchTerm,
    sortBy: sortField,
    sortOrder: sortType,
  });

  const { data: summaryData = {} } = useGetCategoriesSummaryQuery();

  const tableData = response?.data || [];

  return (
    <div className="container-page">
      <PageHeader
        icon={<MenuLinesIcon />}
        iconGradient=""
        title="Categories"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Categories" },
        ]}
        actions={
          <Button icon={<Plus />} onClick={() => setAddModalOpen(true)}>
            Add Category
          </Button>
        }
      />

      <Section>
        <CategoriesStatsCardRow
          isLoading={isLoading}
          totalCategories={summaryData.totalCategories || 0}
          totalApis={summaryData.totalApis || 0}
          activeApis={summaryData.activeApis || 0}
          downApis={summaryData.downApis || 0}
          critical={summaryData.critical || 0}
          avgApisPerCategory={summaryData.apisPerCategory || "—"}
        />
      </Section>

      <Section className="pt-0">
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0">
            <NewTableConfig
              module="categories"
              columns={categoriesColumns}
              data={tableData}
              isLoading={isFetching}
              group={Categories_GROUP}
              currentPage={pageIndex}
              setCurrentPage={setPageIndex}
              pageLimit={pageLimit}
              handlePageLimitChange={setPageLimit}
              totalResults={response?.pagination?.total || tableData.length}
              totalPages={response?.pagination?.totalPages || 1}
              searchQuery={searchTerm}
              onSearchChange={setSearchTerm}
              sortBy={sortField}
              sortOrder={sortType}
              handleServerSideSorting={({ sortBy, sortDirection }) => {
                setSortField(sortBy);
                setSortType(sortDirection);
              }}
              isAction={true}
              actions={{
                ...(isAdmin && {
                  onDelete: (row) => {
                    setRowToDelete(row);
                    setRowDeleteDialogOpen(true);
                  },
                }),
              }}
              updateSelectedRows={setSelectedRows}
              bulkActions={[
                {
                  action: "export",
                  onClick: () =>
                    exportCategoriesToCsv(
                      selectedRows,
                      `categories-${new Date().toISOString().slice(0, 10)}.csv`,
                    ),
                },
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
              onRowClick={setSelectedRow}
              showRowNumbers={false}
            />
          </div>

          {/* ── Live Incident Feed Sidebar ── */}
          {/* <div className="w-[270px] shrink-0 border-l border-gray-100 flex flex-col overflow-hidden self-stretch"> */}
          {/*   <FeedBox */}
          {/*     title="Category Alerts" */}
          {/*     items={FEED_ITEMS} */}
          {/*     liveEvents={LIVE_EVENTS} */}
          {/*     autoInterval={18000} */}
          {/*     maxItems={15} */}
          {/*     showSimulate={true} */}
          {/*   /> */}
          {/* </div> */}
        </div>
      </Section>

      {/* <CategoryDrawer */}
      {/*   selectedRow={selectedRow} */}
      {/*   setSelectedRow={setSelectedRow} */}
      {/* /> */}

      <AddCategoryModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      <AlertDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        type="danger"
        title={`Delete ${selectedRows.length} Category${selectedRows.length !== 1 ? "s" : ""}?`}
        description="This action is permanent and cannot be undone. All selected categories and their associated data will be removed."
        itemName="Delete"
        isLoading={isDeleting}
        handleOnClick={async () => {
          const ids = selectedRows.map((r) => r._id ?? r.id).filter(Boolean);
          setIsDeleting(true);
          try {
            await bulkDelete(ids);
            setSelectedRows([]);
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
        description="This action is permanent and cannot be undone. The category and all its associated data will be removed."
        itemName="Delete"
        isLoading={isRowDeleting}
        handleOnClick={async () => {
          const id = rowToDelete?._id ?? rowToDelete?.id;
          if (!id) return;
          await deleteCategory(id);
          setRowDeleteDialogOpen(false);
          setRowToDelete(null);
        }}
      />
    </div>
  );
};
