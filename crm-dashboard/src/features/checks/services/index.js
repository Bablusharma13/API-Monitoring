import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const ChecksService = {
  fetchAllChecks: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/checks`, { params });
    return data.data;
  },
  fetchChecksSummary: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/checks/summary`, {
      params,
    });
    return data.data;
  },
};
