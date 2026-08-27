// pages/CronMonitor/CronInventory.jsx
// Table-first companion to the Cron Heartbeat card grid — sources the SAME
// already-real /api/v1/cron-jobs endpoint via the useCronInventory()
// composition hook (see ../hooks/usecronInventory.js).

import { useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { List, Plus, CheckCircle } from "lucide-react";

// ─── Shared UI ────────────────────────────────────────────────────────────────
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { InfoCard } from "../../../components/ui/InfoCard";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { Button } from "../../../components/ui/Button.jsx";

// ─── Columns + hook + constants ────────────────────────────────────────────────
import { getCronInventoryColumns } from "./cronInventoryColumns.jsx";
import { useCronInventory, STATUS_OPTIONS } from "../hooks/usecronInventory.js";
import { CRON_INVENTORY_GROUP, CRON_INVENTORY_FILTERS } from "../constants.jsx";
import { CronInventoryStatsCardRow } from "./CronInventoryStatsCardRow.jsx";
import { exportCronJobsToCsv } from "../../../utils/exportCsv.js";

const LiveDot = () => (
  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
);

export default function CronInventory() {
  const navigate = useNavigate();
  const {
    jobs,
    pagination,
    isLoading,
    summary,
    page,
    setPage,
    limit,
    setPageLimit,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    setAdditionalFilters,
    sortField,
    sortType,
    handleServerSideSorting,
    toggleJob,
    runNow,
    saveCron,
  } = useCronInventory();

  const [selectedRows, setSelectedRows] = useState([]);

  // ── Toast ───────────────────────────────────────────────────────────────────
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef();
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400);
  }, []);

  const columns = useMemo(
    () =>
      getCronInventoryColumns({
        onRunNow: (id) => {
          runNow(id);
          showToast(`▶ Running task ${id}`);
        },
        onToggle: (id, enabled) => {
          toggleJob(id);
          showToast(`${jobs.find((j) => j.id === id)?.name ?? id} ${enabled ? "enabled" : "paused"}`);
        },
        onSaveCron: (id, val) => {
          saveCron(id, val);
          showToast(`Schedule updated: ${val}`);
        },
      }),
    [jobs, runNow, toggleJob, saveCron, showToast],
  );

  return (
    <>
      <div className="flex flex-col" style={{ height: "100vh", overflow: "hidden" }}>
        <PageHeader
          icon={<List size={20} />}
          title="Cron Inventory"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Cron Monitor", href: "/dashboard/cron-monitor" },
            { label: "Cron Inventory" },
          ]}
          actions={
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <div className="flex items-center gap-2 text-[12px] text-[#6b7280] bg-white border border-[#e9ebf0] rounded-lg px-3 py-[5px]">
                <LiveDot />
                Auto-refreshing every 30s
              </div>
              {/* Creation lives on the Cron Heartbeat page (real
                  useCreateCronJobMutation flow) — this just routes there
                  instead of re-implementing a second create form. */}
              <Button
                variant="primary"
                size="lg"
                icon={<Plus size={13} />}
                onClick={() => navigate("/dashboard/cron-monitor")}
              >
                New Cron Job
              </Button>
            </div>
          }
          extra={
            <div className="flex items-center gap-3 text-[11.5px]">
              <span className="text-[#6b7280]">{summary?.total ?? jobs.length} jobs tracked</span>
            </div>
          }
        />

        <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: "thin" }}>
          <div className="container-page pb-8">
            <Section>
              <CronInventoryStatsCardRow
                onTime={summary?.onTime}
                late={summary?.late}
                missing={summary?.missing}
                paused={summary?.paused}
                pending={summary?.pending}
                pingsToday={summary?.pingsToday}
                reliability30d={summary?.reliability30d}
              />
            </Section>

            <Section>
              <div className="text-[11px] uppercase tracking-[.1em] text-[#6b7280] mb-3 flex items-center gap-2">
                All Registered Jobs
                <div className="flex-1 h-px bg-[#e9ebf0]" />
                <span className="text-[11px] text-[#6b7280]">{pagination?.total ?? jobs.length} jobs</span>
              </div>

              <InfoCard
                action={
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {STATUS_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value || "all"}
                        onClick={() => setStatusFilter(value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] border transition-all ${
                          statusFilter === value
                            ? "border-[#2563eb] bg-[#eff4ff] text-[#2563eb]"
                            : "border-[#e9ebf0] bg-white text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                }
              >
                <div className="-mx-5 -mt-4 -mb-5">
                  <NewTableConfig
                    module="cron-inventory"
                    columns={columns}
                    data={jobs}
                    isLoading={isLoading}
                    group={CRON_INVENTORY_GROUP}
                    onRowClick={(row) => navigate(`/dashboard/cron-monitor/${row.id}`)}
                    currentPage={page}
                    setCurrentPage={setPage}
                    pageLimit={limit}
                    handlePageLimitChange={setPageLimit}
                    totalResults={pagination?.total ?? jobs.length}
                    totalPages={pagination?.totalPages ?? 1}
                    searchQuery={search}
                    onSearchChange={setSearch}
                    sortBy={sortField}
                    sortOrder={sortType}
                    handleServerSideSorting={handleServerSideSorting}
                    availableAdditionalFilters={CRON_INVENTORY_FILTERS}
                    onFiltersChange={setAdditionalFilters}
                    updateSelectedRows={setSelectedRows}
                    bulkActions={[
                      {
                        action: "export",
                        onClick: () =>
                          exportCronJobsToCsv(
                            selectedRows,
                            `cron-inventory-${new Date().toISOString().slice(0, 10)}.csv`,
                          ),
                      },
                    ]}
                    showRowNumbers={false}
                  />
                </div>
              </InfoCard>
            </Section>
          </div>
        </div>
      </div>

      <div
        className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-[#1c1f2e] text-white text-[13px] px-[18px] py-2.5 rounded-lg pointer-events-none transition-opacity duration-300 max-w-[360px] ${toastVisible ? "opacity-100" : "opacity-0"}`}
      >
        <CheckCircle size={12} className="text-emerald-300" />
        {toastMsg}
      </div>
    </>
  );
}
