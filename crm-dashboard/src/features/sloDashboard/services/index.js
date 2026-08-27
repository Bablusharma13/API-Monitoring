import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const SloDashboardService = {
  // GET /api/v1/analytics/slo?apiId=  -> { targets, apis: [...] }
  fetchSlo: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/analytics/slo`, {
      params,
    });
    return data.data;
  },
};
