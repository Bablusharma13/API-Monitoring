import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const ApiDashboardService = {
  fetchDashboard: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/dashboard`);
    return data.data;
  },
};
