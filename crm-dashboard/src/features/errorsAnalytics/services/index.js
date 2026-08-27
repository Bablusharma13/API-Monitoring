import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const ErrorsAnalyticsService = {
  // GET /api/v1/analytics/errors?window=
  // -> { overallErrorRatePct, serverErrorPct, clientErrorPct, breakdown, byTenant }
  fetchErrorAnalytics: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/analytics/errors`, {
      params,
    });
    return data.data;
  },
};
