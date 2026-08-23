import { getLeaderboard } from "./leaderboard.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const getLeaderboardHandler = async (req, res) => {
  try {
    const result = await getLeaderboard(req.query);
    return successsResponse(res, result, 200, "Leaderboard retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
