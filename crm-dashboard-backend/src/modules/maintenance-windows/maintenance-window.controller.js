import {
  createMaintenanceWindow,
  getAllMaintenanceWindows,
  updateMaintenanceWindow,
  deleteMaintenanceWindow,
} from "./maintenance-window.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const createHandler = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user?.email };
    const window = await createMaintenanceWindow(data);
    return successsResponse(res, window, 201, "Maintenance window created successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getAllHandler = async (req, res) => {
  try {
    const result = await getAllMaintenanceWindows(req.query);
    return successsResponse(res, result, 200, "Maintenance windows retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateHandler = async (req, res) => {
  try {
    const window = await updateMaintenanceWindow(req.params.id, req.body);
    return successsResponse(res, window, 200, "Maintenance window updated successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteHandler = async (req, res) => {
  try {
    const result = await deleteMaintenanceWindow(req.params.id);
    return successsResponse(res, result, 200, "Maintenance window deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
