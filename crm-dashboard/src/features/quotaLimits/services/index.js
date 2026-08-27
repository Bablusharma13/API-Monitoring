import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const QuotaLimitsService = {
  fetchQuotaUsage: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/tenants/quota-usage`);
    return data.data;
  },
};
