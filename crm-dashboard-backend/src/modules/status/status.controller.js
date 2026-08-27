import { getStatusSummary } from "./status.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const getStatusSummaryHandler = async (req, res) => {
  try {
    const result = await getStatusSummary();
    return successsResponse(
      res,
      result,
      200,
      "Status summary retrieved successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
