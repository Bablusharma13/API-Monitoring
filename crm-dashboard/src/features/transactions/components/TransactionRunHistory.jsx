// TransactionRunHistory.jsx
// Run-history page for ONE synthetic transaction (id from the route param).
// Mirrors src/features/cronJobHistory/components/JobHistory.jsx's pattern —
// PageHeader → hero card → NewTableConfig run table, with a Modal (not a
// Drawer) showing one run's full step-by-step breakdown on row click. Unlike
// JobHistory there's no multi-job sidebar selector here (this page is always
// scoped to a single transaction) and no duration/outcome charts — the
// TransactionRun model doesn't carry the sample volume or fields
// (p95/avg duration, retries, ...) that those charts were built for on Ping.

import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { History, Play } from "lucide-react";

import PageHeader from "../../../components/ui/PageHeader";
import { InfoCard } from "../../../components/ui/InfoCard";
import Modal from "../../../components/ui/Modal";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { Button } from "../../../components/ui/Button.jsx";
import { Section } from "../../../components/ui/Section";

import { getRunHistoryColumns, RunOutcomeBadge } from "./runHistoryColumns.jsx";
import { useGetTransactionByIdQuery } from "../hooks/query/useGetTransactionByIdQuery";
import { useGetTransactionRunsQuery } from "../hooks/query/useGetTransactionRunsQuery";
import { useRunTransactionMutation } from "../hooks/query/useRunTransactionMutation";
import { formatDateTime } from "../../../utils/helpers.js";

// ── One run's full step-by-step breakdown — real TransactionRun.steps[] ────
// fields only: { name, statusCode, responseTimeMs, passed, error }.
function RunDetailPanel({ run }) {
  const steps = run?.steps || [];
  return (
    <div>
      <div className="flex items-center justify-between text-[12.5px] text-gray-500 mb-4">
        <span>
          Started {run.startedAt ? formatDateTime(run.startedAt) : "—"}
          {run.completedAt ? ` · Completed ${formatDateTime(run.completedAt)}` : ""}
        </span>
        <RunOutcomeBadge status={run.status} />
      </div>

      {!steps.length ? (
        <div className="text-[12.5px] text-gray-400 text-center py-8">
          No step data recorded for this run.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`border rounded-lg px-3 py-2.5 ${
                step.passed
                  ? "border-emerald-100 bg-emerald-50/50"
                  : "border-red-100 bg-red-50/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-white border border-gray-200 text-[10.5px] font-medium text-gray-600 flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[12.5px] text-gray-800 truncate">
                    {step.name || `Step ${i + 1}`}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-medium flex-shrink-0 ${
                    step.passed ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {step.passed ? "Passed" : "Failed"}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-500">
                {step.statusCode != null && (
                  <span className="font-mono">Status {step.statusCode}</span>
                )}
                {step.responseTimeMs != null && (
                  <span className="font-mono">{step.responseTimeMs} ms</span>
                )}
              </div>
              {step.error && (
                <div
                  className="mt-2 rounded-md font-mono text-[11px] px-2.5 py-2 leading-relaxed"
                  style={{ background: "#1c1f2e", color: "#f87171" }}
                >
                  {step.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TransactionRunHistory() {
  const { id } = useParams();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortField, setSortField] = useState("startedAt");
  const [sortType, setSortType] = useState("desc");

  const [detailRun, setDetailRun] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: transaction, isLoading: transactionLoading } =
    useGetTransactionByIdQuery(id);

  const runParams = useMemo(
    () => ({ page, limit, sortBy: sortField, sortOrder: sortType }),
    [page, limit, sortField, sortType],
  );
  const { data: runsResponse, isFetching: runsLoading } =
    useGetTransactionRunsQuery(id, runParams);

  const runs = runsResponse?.data || [];
  const runPagination = runsResponse?.pagination;

  const { mutate: runNow, isPending: running } = useRunTransactionMutation();

  const openRunDetail = useCallback((row) => {
    setDetailRun(row);
    setDetailOpen(true);
  }, []);

  const columns = useMemo(
    () => getRunHistoryColumns({ onView: openRunDetail }),
    [openRunDetail],
  );

  const handleRunNow = () => {
    if (!id) return;
    runNow(id, {
      onSuccess: () => toast.success("Run triggered"),
      onError: (error) =>
        toast.error(
          error?.response?.data?.message || "Failed to trigger run",
        ),
    });
  };

  return (
    <div className="container-page">
      <PageHeader
        icon={<History size={20} />}
        title="Run History"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Transactions", href: "/transactions" },
          { label: transaction?.name ?? "—" },
        ]}
        actions={
          <Button
            variant="primary"
            size="lg"
            icon={<Play size={13} />}
            loading={running}
            disabled={!id}
            onClick={handleRunNow}
          >
            Run Now
          </Button>
        }
      />

      {!transactionLoading && transaction && (
        <Section>
          <InfoCard showPadding={false}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[15px] text-gray-800 font-medium">
                    {transaction.name}
                  </h2>
                  <RunOutcomeBadge status={transaction.stats?.lastRunStatus} />
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[12px] text-gray-500 mt-1">
                  <span className="font-mono">{transaction.frequency}</span>
                  <span>·</span>
                  <span>{transaction.steps?.length ?? 0} steps</span>
                  <span>·</span>
                  <span>
                    {(transaction.stats?.uptime30d ?? 0).toFixed
                      ? transaction.stats.uptime30d.toFixed(1)
                      : (transaction.stats?.uptime30d ?? 0)}
                    % uptime (30d)
                  </span>
                  <span>·</span>
                  <span>
                    Last run:{" "}
                    {transaction.stats?.lastRunAt
                      ? formatDateTime(transaction.stats.lastRunAt)
                      : "Never"}
                  </span>
                  {!transaction.enabled && (
                    <>
                      <span>·</span>
                      <span className="text-amber-600">Disabled</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </InfoCard>
        </Section>
      )}

      <Section>
        <InfoCard title="Run Log" showPadding={false}>
          <div className="-mx-5 -mt-4 -mb-5">
            <NewTableConfig
              module="transaction-runs"
              columns={columns}
              data={runs}
              isLoading={runsLoading}
              onRowClick={openRunDetail}
              currentPage={page}
              setCurrentPage={setPage}
              pageLimit={limit}
              handlePageLimitChange={setLimit}
              totalResults={runPagination?.total ?? runs.length}
              totalPages={runPagination?.totalPages ?? 1}
              showRowNumbers={false}
              plain={true}
              sortBy={sortField}
              sortOrder={sortType}
              handleServerSideSorting={({ sortBy, sortDirection }) => {
                setSortField(sortBy);
                setSortType(sortDirection);
              }}
            />
          </div>
        </InfoCard>
      </Section>

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailRun ? `Run ${String(detailRun._id ?? "").slice(-8)}` : ""}
        footer={
          <Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>
            Close
          </Button>
        }
      >
        {detailRun && <RunDetailPanel run={detailRun} />}
      </Modal>
    </div>
  );
}
