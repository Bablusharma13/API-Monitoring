import { getDashboardData } from "./dashboard.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const getDashboardHandler = async (req, res) => {
  try {
    const data = await getDashboardData();
    return successsResponse(res, data, 200, "Dashboard data retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
