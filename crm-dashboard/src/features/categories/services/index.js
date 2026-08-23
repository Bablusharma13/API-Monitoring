import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const CategoriesService = {
  fetchAllCategories: async ({ filters = {}, ...rest }) => {
    const { data } = await axios.get(`${BASE}/api/v1/categories`, {
      params: { ...rest, ...filters },
    });
    return data.data;
  },
  fetchCategoriesSummary: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/categories/summary`);
    return data.data;
  },
  fetchCategoriesList: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/categories`, {
      params: { limit: 100 },
    });
    return data.data?.data ?? data.data ?? [];
  },
  fetchTeamMembers: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/team-members`);
    return data.data.members ?? [];
  },
  createCategory: async (payload) => {
    const { data } = await axios.post(`${BASE}/api/v1/categories`, payload);
    return data.data;
  },
  deleteCategory: async (id) => {
    const { data } = await axios.delete(`${BASE}/api/v1/categories/${id}`);
    return data.data;
  },
  bulkDeleteCategories: async (ids) => {
    const { data } = await axios.delete(`${BASE}/api/v1/categories/bulk`, {
      data: { ids },
    });
    return data.data;
  },
};
