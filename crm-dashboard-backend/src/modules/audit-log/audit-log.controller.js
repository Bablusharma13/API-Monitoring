import { getAuditLogs } from "./audit-log.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const getAuditLogsHandler = async (req, res) => {
  try {
    const result = await getAuditLogs(req.query);
    return successsResponse(
      res,
      result,
      200,
      "Audit logs retrieved successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
