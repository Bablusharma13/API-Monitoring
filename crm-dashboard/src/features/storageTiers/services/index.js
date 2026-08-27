import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const StorageTiersService = {
  fetchStorageStats: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/pipeline/storage`, {
      params,
    });
    return data.data;
  },
};
