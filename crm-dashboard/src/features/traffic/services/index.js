import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const TrafficService = {
  // GET /api/v1/analytics/traffic?window=&tenantId=
  // -> { rpm, methods, byTenant, topEndpoints, heatmap }
  fetchTrafficAnalytics: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/analytics/traffic`, {
      params,
    });
    return data.data;
  },
};
