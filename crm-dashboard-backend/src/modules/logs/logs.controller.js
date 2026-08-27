import { getUnifiedLogs, getLogById } from "./logs.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const getUnifiedLogsHandler = async (req, res) => {
  try {
    const result = await getUnifiedLogs(req.query);
    return successsResponse(res, result, 200, "Logs retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getLogByIdHandler = async (req, res) => {
  try {
    const { source, id } = req.params;
    const result = await getLogById(source, id);
    return successsResponse(res, result, 200, "Log retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
