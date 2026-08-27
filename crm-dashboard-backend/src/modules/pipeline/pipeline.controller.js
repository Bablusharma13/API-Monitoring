import { getPipelineStats, getStorageStats } from "./pipeline.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const getPipelineStatsHandler = async (req, res) => {
  try {
    const result = await getPipelineStats();
    return successsResponse(
      res,
      result,
      200,
      "Pipeline stats retrieved successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getStorageStatsHandler = async (req, res) => {
  try {
    const result = await getStorageStats();
    return successsResponse(
      res,
      result,
      200,
      "Storage stats retrieved successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
