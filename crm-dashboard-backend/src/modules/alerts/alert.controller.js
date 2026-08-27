import {
  getAllAlerts,
  getAlertsSummary,
  ackAlert,
  resolveAlert,
} from "./alert.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const getAllAlertsHandler = async (req, res) => {
  try {
    const result = await getAllAlerts(req.query);
    return successsResponse(res, result, 200, "Alerts retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getAlertsSummaryHandler = async (req, res) => {
  try {
    const summary = await getAlertsSummary();
    return successsResponse(res, summary, 200, "Alerts summary retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const ackAlertHandler = async (req, res) => {
  try {
    const alert = await ackAlert(req.params.id, req.user?.email);
    return successsResponse(res, alert, 200, "Alert acknowledged successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const resolveAlertHandler = async (req, res) => {
  try {
    const alert = await resolveAlert(req.params.id);
    return successsResponse(res, alert, 200, "Alert resolved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
