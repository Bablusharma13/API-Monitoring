import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const IncidentsService = {
  fetchAllIncidents: async (params) => {
    const { data } = await axios.get(`${BASE}/api/v1/incidents`, {
      params,
    });
    return data.data;
  },
  fetchIncidentsSummary: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/incidents/summary`);
    return data.data;
  },
  deleteIncident: async (id) => {
    const { data } = await axios.delete(`${BASE}/api/v1/incidents/${id}`);
    return data.data;
  },
  bulkDeleteIncidents: async (ids) => {
    const { data } = await axios.delete(`${BASE}/api/v1/incidents/bulk`, {
      data: { ids },
    });
    return data.data;
  },
};
