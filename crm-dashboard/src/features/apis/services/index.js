import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const DashboardService = {
  fetchAllApis: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/apis`, {
      params: { ...params, populate: "category" },
    });
    return data.data;
  },
  fetchAllApisSummary: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/apis/summary`);
    return data.data;
  },
  createApi: async (payload) => {
    const { data } = await axios.post(`${BASE}/api/v1/apis`, payload);
    return data.data;
  },
  fetchApiById: async (id) => {
    const { data } = await axios.get(`${BASE}/api/v1/apis/${id}`, {
      params: { populate: "category" },
    });
    return data.data;
  },
  updateApi: async (id, payload) => {
    const { data } = await axios.put(`${BASE}/api/v1/apis/${id}`, payload);
    return data.data;
  },
  disableApi: async (id, isDisabled) => {
    const { data } = await axios.patch(`${BASE}/api/v1/apis/${id}`, {
      isDisabled,
    });
    return data.data;
  },
  deleteApi: async (id) => {
    const { data } = await axios.delete(`${BASE}/api/v1/apis/${id}`);
    return data.data;
  },
  bulkDeleteApis: async (ids) => {
    const { data } = await axios.delete(`${BASE}/api/v1/apis/bulk`, {
      data: { ids },
    });
    return data.data;
  },
};
