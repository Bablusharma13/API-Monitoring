import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const UserActivityService = {
  // GET /api/v1/analytics/user-activity?window=  -> { users: [...] }
  fetchUserActivity: async (params) => {
    const { data } = await axios.get(
      `${BASE}/api/v1/analytics/user-activity`,
      { params },
    );
    return data.data;
  },
};
