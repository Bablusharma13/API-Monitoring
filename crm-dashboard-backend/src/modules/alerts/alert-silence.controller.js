import {
  createAlertSilence,
  getAllAlertSilences,
  deleteAlertSilence,
} from "./alert-silence.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";
import { recordAudit } from "../audit-log/audit-log.service.js";

export const createAlertSilenceHandler = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user?.email };
    const silence = await createAlertSilence(data);
    await recordAudit({
      req,
      action: "alertSilence.create",
      entityType: "AlertSilence",
      entityId: silence._id,
      summary: `Created alert silence${req.body?.reason ? ` for "${req.body.reason}"` : ""}`,
    });
    return successsResponse(res, silence, 201, "Alert silence created successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getAllAlertSilencesHandler = async (req, res) => {
  try {
    const result = await getAllAlertSilences(req.query);
    return successsResponse(res, result, 200, "Alert silences retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteAlertSilenceHandler = async (req, res) => {
  try {
    const result = await deleteAlertSilence(req.params.id);
    await recordAudit({
      req,
      action: "alertSilence.delete",
      entityType: "AlertSilence",
      entityId: req.params.id,
      summary: `Deleted alert silence ${req.params.id}`,
    });
    return successsResponse(res, result, 200, "Alert silence deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
