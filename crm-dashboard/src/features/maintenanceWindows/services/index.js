import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

// ── Maintenance Windows ─────────────────────────────────────────────────
export const MaintenanceWindowsService = {
  fetchAll: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/maintenance-windows`, {
      params,
    });
    return data.data;
  },
  create: async (payload) => {
    const { data } = await axios.post(
      `${BASE}/api/v1/maintenance-windows`,
      payload,
    );
    return data.data;
  },
  update: async (id, payload) => {
    const { data } = await axios.put(
      `${BASE}/api/v1/maintenance-windows/${id}`,
      payload,
    );
    return data.data;
  },
  remove: async (id) => {
    const { data } = await axios.delete(
      `${BASE}/api/v1/maintenance-windows/${id}`,
    );
    return data.data;
  },
};

// ── Reference data (read-only, for the scope picker) ───────────────────
export const ReferenceDataService = {
  fetchCategories: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/categories`, {
      params: { limit: 200 },
    });
    return data.data?.data ?? data.data ?? [];
  },
  fetchApis: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/apis`, {
      params: { limit: 200 },
    });
    return data.data?.data ?? data.data ?? [];
  },
};
