import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const AuditLogService = {
  fetchAll: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/audit-log`, { params });
    return data.data;
  },
};
