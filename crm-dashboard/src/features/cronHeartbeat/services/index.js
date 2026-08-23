import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const CronHeartbeatService = {
  createCronJob: async (payload) => {
    const { data } = await axios.post(`${BASE}/api/v1/cron-jobs`, payload);
    return data.data;
  },
  fetchCronJobSummary: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/cron-jobs/summary`);
    return data.data;
  },
  fetchCronJobs: async (params) => {
    const res = await axios.get(`${BASE}/api/v1/cron-jobs`, { params });
    return res.data.data.data;
  },
  toggleCronJob: async (id) => {
    const { data } = await axios.patch(`${BASE}/api/v1/cron-jobs/${id}/toggle`);
    return data.data;
  },
  getCronDetails: async (id) => {
    const { data } = await axios.get(`${BASE}/api/v1/cron-jobs/${id}`);
    return data.data;
  },
  runCronJob: async (id) => {
    const { data } = await axios.post(`${BASE}/api/v1/cron-jobs/${id}/run`, { type: "manual" });
    return data.data;
  },
  fetchCronJobPings: async (id, params) => {
    const res = await axios.get(`${BASE}/api/v1/cron-jobs/${id}/pings`, { params });
    return res.data.data;
  },
  updateCronJob: async ({ id, ...payload }) => {
    const { data } = await axios.put(`${BASE}/api/v1/cron-jobs/${id}`, payload);
    return data.data;
  },
  deleteCronJob: async (id) => {
    const { data } = await axios.delete(`${BASE}/api/v1/cron-jobs/${id}`);
    return data.data;
  },
};
