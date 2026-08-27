import {
  createAlertSilence,
  getAllAlertSilences,
  deleteAlertSilence,
} from "./alert-silence.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const createAlertSilenceHandler = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user?.email };
    const silence = await createAlertSilence(data);
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
    return successsResponse(res, result, 200, "Alert silence deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
