import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

// Job list + per-job ping history are fetched via cross-feature hooks that
// already hit the real backend (useCronJobsQuery / useCronJobPingsQuery from
// cronHeartbeat). This file only covers the brand-new stats endpoint that
// doesn't exist anywhere else yet.
export const CronJobHistoryService = {
  fetchPingStats: async (id, params) => {
    const { data } = await axios.get(`${BASE}/api/v1/cron-jobs/${id}/pings/summary`, { params });
    return data.data; // { successRate, failCount, avgDurationMs, maxDurationMs, p95DurationMs, totalRuns }
  },
};
