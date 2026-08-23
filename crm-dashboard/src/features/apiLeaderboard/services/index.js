import axios from "axios";

const BASE = import.meta.env.VITE_CRM_BACKEND;

export const LeaderboardService = {
  fetchLeaderboard: async () => {
    const { data } = await axios.get(`${BASE}/api/v1/leaderboard`);
    return data.data;
  },
};
