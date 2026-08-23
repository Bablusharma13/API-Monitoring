import { errorResponse, successsResponse } from "../../utils/responses.js";
import {
  getAllIncidents,
  getIncidentsSummary,
  deleteIncidentById,
  bulkDeleteIncidents,
} from "./incident.service.js";

export const getAllIncidentsHandler = async (req, res) => {
  try {
    const result = await getAllIncidents(req.query);
    return successsResponse(res, result, 200, "Incidents retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteIncidentHandler = async (req, res) => {
  try {
    const result = await deleteIncidentById(req.params.id);
    return successsResponse(res, result, 200, "Incident deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const bulkDeleteIncidentsHandler = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(res, { message: "ids must be a non-empty array" }, 400);
    }
    const result = await bulkDeleteIncidents(ids);
    return successsResponse(res, result, 200, "Incidents deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getIncidentsSummaryHandler = async (req, res) => {
  try {
    const summary = await getIncidentsSummary();
    return successsResponse(
      res,
      summary,
      200,
      "Incidents summary retrieved successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
