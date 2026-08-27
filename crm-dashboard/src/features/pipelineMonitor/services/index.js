import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const PipelineMonitorService = {
  fetchPipelineStats: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/pipeline/stats`, {
      params,
    });
    return data.data;
  },
};
