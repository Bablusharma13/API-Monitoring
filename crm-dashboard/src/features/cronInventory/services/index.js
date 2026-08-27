import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

// Cron Inventory reuses the SAME /api/v1/cron-jobs endpoint the (already-real)
// Cron Heartbeat feature calls, but — unlike CronHeartbeatService.fetchCronJobs
// (which unwraps straight to the job array for the card-grid page) — this keeps
// the `pagination` block so the inventory table can be server-paginated.
export const CronInventoryService = {
  fetchCronJobs: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/cron-jobs`, { params });
    return data.data; // { data: CronJob[], pagination: {...} }
  },
};
