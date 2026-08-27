import {
  getTrafficAnalytics,
  getErrorAnalytics,
  getSloAnalytics,
  getUserActivityAnalytics,
  getLatencyAnalytics,
} from "./analytics.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const getTrafficHandler = async (req, res) => {
  try {
    const data = await getTrafficAnalytics(req.query);
    return successsResponse(res, data, 200, "Traffic analytics retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getErrorsHandler = async (req, res) => {
  try {
    const data = await getErrorAnalytics(req.query);
    return successsResponse(res, data, 200, "Error analytics retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getSloHandler = async (req, res) => {
  try {
    const data = await getSloAnalytics(req.query);
    return successsResponse(res, data, 200, "SLO analytics retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getUserActivityHandler = async (req, res) => {
  try {
    const data = await getUserActivityAnalytics(req.query);
    return successsResponse(
      res,
      data,
      200,
      "User activity analytics retrieved successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getLatencyHandler = async (req, res) => {
  try {
    const data = await getLatencyAnalytics(req.query);
    return successsResponse(res, data, 200, "Latency analytics retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
