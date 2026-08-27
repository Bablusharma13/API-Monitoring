import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const LogsService = {
  fetchAllLogs: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/logs`, { params });
    return data.data;
  },
  fetchLogById: async (source, id) => {
    const { data } = await axios.get(
      `${BASE}/api/v1/logs/${encodeURIComponent(source)}/${encodeURIComponent(id)}`,
    );
    return data.data;
  },
};
