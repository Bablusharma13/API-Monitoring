import { getAllChecks, getChecksSummary } from "./check.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const getAllChecksHandler = async (req, res) => {
  try {
    const result = await getAllChecks(req.query);
    return successsResponse(res, result, 200, "Checks retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getChecksSummaryHandler = async (req, res) => {
  try {
    const summary = await getChecksSummary(req.query);
    return successsResponse(
      res,
      summary,
      200,
      "Checks summary retrieved successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
