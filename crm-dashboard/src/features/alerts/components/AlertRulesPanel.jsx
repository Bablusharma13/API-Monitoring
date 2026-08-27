import { useMemo, useState } from "react";
import { toast } from "sonner";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { ActionButton } from "../../../components/ui/ActionButton";
import { AddIcon } from "../../../components/ui/Icons";
import { AlertDialog } from "../../../components/ui/AlertDialog";
import { alertRulesColumns } from "./columns";
import { AlertRulesStatsCardRow } from "./AlertRulesStatsCardRow";
import { AlertRuleFormModal } from "./AlertRuleFormModal";
import { useGetAlertRulesQuery } from "../hooks/query/useGetAlertRulesQuery";
import { useDeleteAlertRuleMutation } from "../hooks/query/useDeleteAlertRuleMutation";
import { ALERT_RULES_GROUP, ALERT_RULES_FILTERS } from "../constants";

export const AlertRulesPanel = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortType, setSortType] = useState("desc");
  const [activeFilters, setActiveFilters] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [activeRule, setActiveRule] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);

  const { mutate: deleteRule, isPending: isDeleting } =
    useDeleteAlertRuleMutation();

  // Bounded snapshot of the full rule set, used only to compute the stat
  // cards (there is no dedicated alert-rules summary endpoint).
  const { data: statsResponse, isLoading: statsLoading } =
    useGetAlertRulesQuery({ limit: 200 });

  const stats = useMemo(() => {
    const rules = statsResponse?.data || [];
    return {
      total: statsResponse?.pagination?.total ?? rules.length,
      enabled: rules.filter((r) => r.enabled).length,
      disabled: rules.filter((r) => !r.enabled).length,
      critical: rules.filter((r) => r.severity === "critical").length,
    };
  }, [statsResponse]);

  const { data: rulesResponse, isFetching } = useGetAlertRulesQuery({
    page: pageIndex,
    limit: pageLimit,
    search: searchTerm,
    sortBy: sortField,
    sortOrder: sortType,
    filters: activeFilters,
  });

  const tableData = rulesResponse?.data || [];

  const openNew = () => {
    setActiveRule(null);
    setFormOpen(true);
  };
  const openEdit = (row) => {
    setActiveRule(row);
    setFormOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <AlertRulesStatsCardRow isLoading={statsLoading} {...stats} />

      <div className="flex items-center justify-between">
        <h3 className="text-[14px] text-gray-800 font-medium">Alert Rules</h3>
        <ActionButton
          action="search"
          label="New Rule"
          icon={AddIcon}
          onClick={openNew}
        />
      </div>

      <NewTableConfig
        module="alert-rules"
        columns={alertRulesColumns}
        data={tableData}
        isLoading={isFetching}
        group={ALERT_RULES_GROUP}
        currentPage={pageIndex}
        setCurrentPage={setPageIndex}
        pageLimit={pageLimit}
        handlePageLimitChange={setPageLimit}
        totalResults={rulesResponse?.pagination?.total || tableData.length}
        totalPages={rulesResponse?.pagination?.totalPages || 1}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortField}
        sortOrder={sortType}
        handleServerSideSorting={({ sortBy, sortDirection }) => {
          setSortField(sortBy);
          setSortType(sortDirection);
        }}
        availableAdditionalFilters={ALERT_RULES_FILTERS}
        onFiltersChange={(f) => {
          setActiveFilters(f);
          setPageIndex(1);
        }}
        isAction
        actions={{
          onEdit: openEdit,
          onDelete: (row) => {
            setRuleToDelete(row);
            setDeleteOpen(true);
          },
        }}
        showRowNumbers={false}
      />

      <AlertRuleFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        rule={activeRule}
      />

      <AlertDialog
        open={deleteOpen}
        setOpen={setDeleteOpen}
        type="danger"
        title={`Delete "${ruleToDelete?.name}"?`}
        description="This alert rule will stop firing immediately. This action cannot be undone."
        itemName="Delete"
        isLoading={isDeleting}
        handleOnClick={() => {
          if (!ruleToDelete?._id) return;
          deleteRule(ruleToDelete._id, {
            onSuccess: () => {
              toast.success("Alert rule deleted");
              setDeleteOpen(false);
              setRuleToDelete(null);
            },
            onError: (error) =>
              toast.error(
                error?.response?.data?.message || "Failed to delete rule",
              ),
          });
        }}
      />
    </div>
  );
};
