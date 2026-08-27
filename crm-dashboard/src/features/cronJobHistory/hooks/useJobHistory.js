// hooks/useJobHistory.js
//
// Thin composition hook — NOT a static seed data hook anymore. Sources the
// job selector, run history, and charts from the already-real cron-job
// backend, reusing cronHeartbeat's exported hooks wherever they already do
// the job (cross-feature import):
//   - useCronJobsQuery       → job list for the sidebar selector
//   - useCronJobPingsQuery   → real Ping records (run history)
//   - useRunCronJobMutation  → "Run Now" action
// The one genuinely new piece is the /pings/summary?days= endpoint (this
// feature's own services/index.js + hooks/query/useCronJobPingStatsQuery.js),
// which replaces the old client-side calcStats() over fabricated runs.
//
// IMPORTANT UNIT NOTE: Ping.duration and the /pings/summary duration fields
// are all in MILLISECONDS — every duration in this hook stays in ms and is
// only formatted to a human string at render time via
// utils/helpers.formatDuration(ms).

import { useState, useMemo, useCallback, useEffect } from "react";
import { useCronJobsQuery } from "../../cronHeartbeat/hooks/query/useCronJobsQuery.js";
import { useCronJobPingsQuery } from "../../cronHeartbeat/hooks/query/useCronJobPingsQuery.js";
import { useRunCronJobMutation } from "../../cronHeartbeat/hooks/query/useRunCronJobMutation.js";
import { useCronJobPingStatsQuery } from "./query/useCronJobPingStatsQuery.js";

// The ping-history endpoint (GET /cron-jobs/:id/pings) only supports
// page/limit/sort/search — no date-range filter — so there's no real "give
// me the last N days" call for the trend/donut/heatmap widgets. Instead we
// pull a bounded batch of the most recent real pings (mirrors the old
// genRuns()'s 200-row cap) and, where a day range matters (the heatmap),
// filter that real batch client-side by its real `startedAt` timestamps.
const CHART_SAMPLE_SIZE = 300;

function toRunRow(ping) {
  return {
    id: ping._id,
    runId: ping.runId || (ping._id ? String(ping._id).slice(-8) : "—"),
    started: ping.startedAt ? new Date(ping.startedAt) : null,
    ended: ping.endedAt ? new Date(ping.endedAt) : null,
    outcome: ping.status || "running",
    durationMs: ping.duration || 0,
    trigger: ping.type || "scheduled",
    retries: ping.retries || 0,
    error: ping.error || null,
  };
}

export function useJobHistory() {
  const [activeJobId, setActiveJobId] = useState(null);
  const [rangeDays, setRangeDays] = useState(30);
  const [jobSearch, setJobSearch] = useState("");
  const [runPage, setRunPage] = useState(1);
  const [runLimit, setRunLimitState] = useState(20);
  const [sortField, setSortField] = useState("startedAt");
  const [sortType, setSortType] = useState("desc");

  const { data: jobsRaw, isLoading: jobsLoading } = useCronJobsQuery();
  const jobs = useMemo(() => jobsRaw || [], [jobsRaw]);

  // Default to the first job once the list has loaded.
  const effectiveJobId = activeJobId || jobs[0]?._id || null;

  const activeJob = useMemo(
    () => jobs.find((j) => j._id === effectiveJobId) || null,
    [jobs, effectiveJobId],
  );

  const filteredJobs = useMemo(
    () => jobs.filter((j) => j.name?.toLowerCase().includes(jobSearch.toLowerCase())),
    [jobs, jobSearch],
  );

  // ── Stats — real, from /pings/summary?days= ────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useCronJobPingStatsQuery(effectiveJobId, {
    days: rangeDays,
  });

  // ── Chart-feeding sample (Duration trend / Donut / Heatmap) ────────────────
  const { data: chartData, isLoading: chartLoading } = useCronJobPingsQuery(effectiveJobId, {
    limit: CHART_SAMPLE_SIZE,
    sortBy: "startedAt",
    sortOrder: "desc",
  });
  // Date.now() is impure, so it's captured in an effect (keyed off rangeDays)
  // rather than called directly during render/useMemo.
  const [since, setSince] = useState(() => Date.now() - rangeDays * 86400000);
  useEffect(() => {
    setSince(Date.now() - rangeDays * 86400000);
  }, [rangeDays]);
  const chartRuns = useMemo(() => {
    const rows = (chartData?.data || []).map(toRunRow);
    return rows.filter((r) => !r.started || r.started.getTime() >= since);
  }, [chartData, since]);

  // ── Individual Runs table — real server-side pagination ────────────────────
  const tableParams = useMemo(
    () => ({ page: runPage, limit: runLimit, sortBy: sortField, sortOrder: sortType }),
    [runPage, runLimit, sortField, sortType],
  );
  const { data: tableData, isLoading: tableLoading } = useCronJobPingsQuery(effectiveJobId, tableParams);
  const runs = useMemo(() => (tableData?.data || []).map(toRunRow), [tableData]);
  const runPagination = tableData?.pagination;

  const runCronJob = useRunCronJobMutation();

  const selectJob = useCallback((id) => {
    setActiveJobId(id);
    setRunPage(1);
  }, []);
  const changeRange = useCallback((days) => setRangeDays(Number(days)), []);
  const setRunLimit = useCallback((l) => {
    setRunLimitState(l);
    setRunPage(1);
  }, []);
  const handleServerSideSorting = useCallback(({ sortBy, sortDirection }) => {
    setSortField(sortBy);
    setSortType(sortDirection);
    setRunPage(1);
  }, []);
  const runNow = useCallback(() => {
    if (effectiveJobId) runCronJob.mutate(effectiveJobId);
  }, [effectiveJobId, runCronJob]);

  return {
    activeJobId: effectiveJobId,
    activeJob,
    jobsLoading,
    filteredJobs,
    jobSearch,
    setJobSearch,
    selectJob,

    rangeDays,
    changeRange,

    stats,
    statsLoading,

    chartRuns,
    chartLoading,

    runs,
    runPagination,
    tableLoading,
    runPage,
    setRunPage,
    runLimit,
    setRunLimit,
    sortField,
    sortType,
    handleServerSideSorting,

    runNow,
  };
}
