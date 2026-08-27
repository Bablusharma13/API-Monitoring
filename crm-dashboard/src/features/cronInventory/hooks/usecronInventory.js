// hooks/usecronInventory.js
//
// Thin composition hook — NOT a static seed data hook anymore.
// Wires the Cron Inventory table to the already-real cron-job backend that
// powers the Cron Heartbeat feature (src/features/cronHeartbeat), reusing its
// exported query/mutation hooks wherever possible instead of re-implementing
// data fetching:
//   - useCronJobSummaryQuery  → KPI counts (cross-feature, unmodified)
//   - useToggleCronJobMutation → enable/disable a job
//   - useRunCronJobMutation    → "Run Now" row action
//   - useUpdateCronJobMutation → inline cron-expression edits
// The one thing cronHeartbeat's own useCronJobsQuery() can't do is return a
// paginated/sortable/filterable listing (it always fetches page 1 and drops
// the `pagination` block), so the paginated list itself is fetched through
// this feature's own useCronJobsListQuery (same /api/v1/cron-jobs endpoint,
// see services/index.js).
//
// toInventoryRow() below plays the same role as the unexported toJobCard()
// helper in cronHeartbeat/components/cronHeartBeat.jsx (raw CronJob →
// display-ready fields) — it isn't imported from there because toJobCard is a
// page-local, unexported function shaped for the job-card grid, not the table.

import { useState, useMemo, useCallback } from "react";
import { useCronJobsListQuery } from "./query/useCronJobsListQuery.js";
import { useCronJobSummaryQuery } from "../../cronHeartbeat/hooks/query/useCronJobSummaryQuery.js";
import { useToggleCronJobMutation } from "../../cronHeartbeat/hooks/query/useToggleCronJobMutation.js";
import { useRunCronJobMutation } from "../../cronHeartbeat/hooks/query/useRunCronJobMutation.js";
import { useUpdateCronJobMutation } from "../../cronHeartbeat/hooks/query/useUpdateCronJobMutation.js";

// CronJob.env / CronJob.category are freeform strings (no backend enum), so
// these are just a curated set of common values for the filter dropdowns —
// any real value still displays correctly in the column even if it isn't
// in this list.
export const ENV_OPTIONS = ["Production", "Staging", "Development", "CI/CD"];
export const CATEGORY_OPTIONS = [
  "Pipeline",
  "Storage",
  "Monitoring",
  "Security",
  "Data",
  "Billing",
  "Notifications",
  "Infra",
  "Cleanup",
];

export const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "on_time", label: "On Time" },
  { value: "late", label: "Late" },
  { value: "missing", label: "Missing" },
  { value: "paused", label: "Paused" },
  { value: "pending", label: "Pending" },
];

// Real CronJob.status enum → the short keys the table's status badge uses.
const STATUS_KEY = {
  on_time: "ok",
  late: "late",
  missing: "missing",
  paused: "paused",
  pending: "pending",
};

function toInventoryRow(job) {
  const nextRunLabel =
    job.status === "missing"
      ? job.missingSinceHuman
        ? `Missing ${job.missingSinceHuman}`
        : "—"
      : job.overdueByHuman
        ? `Overdue ${job.overdueByHuman}`
        : job.nextPingInHuman || job.nextCycleInHuman || "—";

  return {
    id: job._id,
    name: job.name,
    cron: job.cronExpression,
    cronHuman: job.frequencyLabel || job.cronExpression,
    status: STATUS_KEY[job.status] || "paused",
    env: job.env || "",
    category: job.category || "",
    owner: job.owner?.name || "",
    ownerImage: job.owner?.image_url || "",
    lastRunLabel: job.lastPingAgoHuman || "—",
    nextRunLabel,
    // lastDuration is stored in MILLISECONDS on CronJob — kept in ms here,
    // converted to a human string at render time via utils/helpers.formatDuration.
    lastDurationMs: job.lastDuration ?? null,
    uptime30: job.stats?.uptime30d ?? 100,
    runs30: job.stats?.totalRuns30d ?? 0,
    enabled: !job.isPaused,
    pingUrl: job.pingUrl || "",
    grace: job.grace ?? 60,
  };
}

export function useCronInventory() {
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(25);
  const [search, setSearchState] = useState("");
  const [statusFilter, setStatusFilterState] = useState("");
  const [additionalFilters, setAdditionalFiltersState] = useState({}); // { env, category }
  const [sortField, setSortField] = useState("createdAt");
  const [sortType, setSortType] = useState("desc");

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      ...(search ? { search } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(sortField ? { sortBy: sortField, sortOrder: sortType } : {}),
      filters: additionalFilters,
    }),
    [page, limit, search, statusFilter, sortField, sortType, additionalFilters],
  );

  const {
    data: listData,
    isLoading: listLoading,
    isFetching: listFetching,
  } = useCronJobsListQuery(queryParams);

  const { data: summary, isLoading: summaryLoading } = useCronJobSummaryQuery();

  const toggleCronJob = useToggleCronJobMutation();
  const runCronJob = useRunCronJobMutation();
  const updateCronJob = useUpdateCronJobMutation();

  const jobs = useMemo(() => (listData?.data || []).map(toInventoryRow), [listData]);
  const pagination = listData?.pagination;

  const setPageLimit = useCallback((l) => {
    setLimitState(l);
    setPage(1);
  }, []);
  const setSearch = useCallback((v) => {
    setSearchState(v);
    setPage(1);
  }, []);
  const setStatusFilter = useCallback((v) => {
    setStatusFilterState(v);
    setPage(1);
  }, []);
  const setAdditionalFilters = useCallback((f) => {
    setAdditionalFiltersState(f);
    setPage(1);
  }, []);
  const handleServerSideSorting = useCallback(({ sortBy, sortDirection }) => {
    setSortField(sortBy);
    setSortType(sortDirection);
    setPage(1);
  }, []);

  const toggleJob = useCallback(
    (id) => toggleCronJob.mutate(id),
    [toggleCronJob],
  );
  const runNow = useCallback((id) => runCronJob.mutate(id), [runCronJob]);
  const saveCron = useCallback(
    (id, cronExpression) => updateCronJob.mutate({ id, cronExpression }),
    [updateCronJob],
  );

  return {
    jobs,
    pagination,
    isLoading: listLoading,
    isFetching: listFetching,
    summary,
    summaryLoading,

    page,
    setPage,
    limit,
    setPageLimit,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    additionalFilters,
    setAdditionalFilters,
    sortField,
    sortType,
    handleServerSideSorting,

    toggleJob,
    runNow,
    saveCron,
  };
}
