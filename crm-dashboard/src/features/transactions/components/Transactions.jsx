// Transactions.jsx — Synthetic Transactions list page.
// Full CRUD list, mirroring the AlertRulesPanel pattern (PageHeader + Section
// + NewTableConfig with isAction/actions, a FormModal for create/edit, and
// an AlertDialog for delete confirmation) — the closest existing precedent
// for "parent entity list with create/edit/delete" in this codebase.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Workflow } from "lucide-react";

import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { Button } from "../../../components/ui/Button.jsx";
import { AlertDialog } from "../../../components/ui/AlertDialog";

import { transactionsColumns } from "./columns.jsx";
import { TransactionFormModal } from "./TransactionFormModal";
import { useGetTransactionsQuery } from "../hooks/query/useGetTransactionsQuery";
import { useDeleteTransactionMutation } from "../hooks/query/useDeleteTransactionMutation";
import { TRANSACTIONS_GROUP, TRANSACTIONS_FILTERS } from "../constants.jsx";
import useCurrentUser from "../../../hooks/useCurrentUser";

export default function Transactions() {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortType, setSortType] = useState("desc");
  const [activeFilters, setActiveFilters] = useState({});

  const [formOpen, setFormOpen] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const { data: transactionsResponse, isFetching } = useGetTransactionsQuery({
    page,
    limit,
    search,
    sortBy: sortField,
    sortOrder: sortType,
    filters: activeFilters,
  });
  const { mutate: deleteTransaction, isPending: isDeleting } =
    useDeleteTransactionMutation();

  const tableData = transactionsResponse?.data || [];

  const openNew = () => {
    setActiveTransaction(null);
    setFormOpen(true);
  };
  const openEdit = (row) => {
    setActiveTransaction(row);
    setFormOpen(true);
  };

  return (
    <div className="container-page">
      <PageHeader
        icon={<Workflow size={20} />}
        title="Synthetic Transactions"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Transactions" },
        ]}
        actions={
          <Button
            variant="primary"
            size="lg"
            icon={<Plus size={13} />}
            onClick={openNew}
          >
            New Transaction
          </Button>
        }
      />

      <Section>
        <NewTableConfig
          module="transactions"
          columns={transactionsColumns}
          data={tableData}
          isLoading={isFetching}
          group={TRANSACTIONS_GROUP}
          currentPage={page}
          setCurrentPage={setPage}
          pageLimit={limit}
          handlePageLimitChange={setLimit}
          totalResults={
            transactionsResponse?.pagination?.total ?? tableData.length
          }
          totalPages={transactionsResponse?.pagination?.totalPages ?? 1}
          searchQuery={search}
          onSearchChange={setSearch}
          sortBy={sortField}
          sortOrder={sortType}
          handleServerSideSorting={({ sortBy, sortDirection }) => {
            setSortField(sortBy);
            setSortType(sortDirection);
          }}
          availableAdditionalFilters={TRANSACTIONS_FILTERS}
          onFiltersChange={(f) => {
            setActiveFilters(f);
            setPage(1);
          }}
          isAction
          actions={{
            // The shared RowActions dropdown (TableConfig.jsx) renders this
            // as "View" with an eye icon — used here to route to this
            // transaction's run history rather than an in-page detail view.
            onView: (row) => navigate(`/transactions/${row._id}/runs`),
            onEdit: openEdit,
            // Delete is admin-gated server-side (403 on non-admins); the
            // onDelete key is only included for admins so the action is
            // hidden from the dropdown entirely for everyone else.
            ...(isAdmin && {
              onDelete: (row) => {
                setTransactionToDelete(row);
                setDeleteOpen(true);
              },
            }),
          }}
          showRowNumbers={false}
        />
      </Section>

      <TransactionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        transaction={activeTransaction}
      />

      <AlertDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        type="danger"
        title={`Delete "${transactionToDelete?.name}"?`}
        description="This will permanently remove this synthetic transaction, its steps, and its run history. This action cannot be undone."
        checkboxLabel="I understand this action is permanent and cannot be undone."
        itemName="Delete"
        isLoading={isDeleting}
        handleOnClick={() => {
          if (!transactionToDelete?._id) return;
          deleteTransaction(transactionToDelete._id, {
            onSuccess: () => {
              toast.success("Transaction deleted");
              setDeleteOpen(false);
              setTransactionToDelete(null);
            },
            onError: (error) => {
              toast.error(
                error?.response?.data?.message ||
                  "Failed to delete transaction",
              );
            },
          });
        }}
      />
    </div>
  );
}
