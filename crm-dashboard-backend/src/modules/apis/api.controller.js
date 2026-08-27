import {
  createApi,
  getAllApis,
  getApiById,
  updateApi,
  toggleApi,
  deleteApi,
  bulkDeleteApis,
  getApiSummary,
  removeCronJob,
} from "./api.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";
import { recordAudit } from "../audit-log/audit-log.service.js";

export const createApiHandler = async (req, res) => {
  try {
    const api = await createApi(req.body);
    await recordAudit({
      req,
      action: "api.create",
      entityType: "Api",
      entityId: api?._id,
      summary: `API "${api?.name ?? api?._id}" created`,
    });
    return successsResponse(res, api, 201, "API created successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getAllApisHandler = async (req, res) => {
  try {
    const result = await getAllApis(req.query);
    return successsResponse(res, result, 200, "APIs retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getApiByIdHandler = async (req, res) => {
  try {
    const api = await getApiById(req.params.id);
    if (!api) {
      return errorResponse(res, { message: "API not found" }, 404);
    }
    return successsResponse(res, api, 200, "API retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateApiHandler = async (req, res) => {
  try {
    const api = await updateApi(req.params.id, req.body);
    if (!api) {
      return errorResponse(res, { message: "API not found" }, 404);
    }
    await recordAudit({
      req,
      action: "api.update",
      entityType: "Api",
      entityId: api._id,
      summary: `API "${api.name ?? api._id}" updated`,
    });
    return successsResponse(res, api, 200, "API updated successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const toggleApiHandler = async (req, res) => {
  try {
    const { isDisabled } = req.body;
    const api = await toggleApi(req.params.id, isDisabled);
    if (!api) {
      return errorResponse(res, { message: "API not found" }, 404);
    }
    await recordAudit({
      req,
      action: "api.toggle",
      entityType: "Api",
      entityId: api._id,
      summary: `API "${api.name ?? api._id}" ${isDisabled ? "disabled" : "enabled"}`,
    });
    return successsResponse(
      res,
      api,
      200,
      `API ${isDisabled ? "enabled" : "disabled"} successfully`,
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteApiHandler = async (req, res) => {
  try {
    const api = await deleteApi(req.params.id);
    if (!api) {
      return errorResponse(res, { message: "API not found" }, 404);
    }
    await recordAudit({
      req,
      action: "api.delete",
      entityType: "Api",
      entityId: api._id,
      summary: `API "${api.name ?? api._id}" deleted`,
    });
    return successsResponse(res, api);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const bulkDeleteApisHandler = async (req, res) => {
  try {
    const { ids } = req.body;
    console.log("ids", ids);
    if (!Array.isArray(ids) || ids.length === 0) {
      return errorResponse(
        res,
        { message: "ids must be a non-empty array" },
        400,
      );
    }
    const result = await bulkDeleteApis(ids);
    await recordAudit({
      req,
      action: "api.bulkDelete",
      entityType: "Api",
      entityId: String(ids.length),
      summary: `${ids.length} API(s) deleted`,
    });
    return successsResponse(res, result, 200, "APIs deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const removeCronJobHandler = async (req, res) => {
  try {
    const api = await removeCronJob(req.params.id);
    if (!api) {
      return errorResponse(res, { message: "API not found" }, 404);
    }
    await recordAudit({
      req,
      action: "api.removeCronJob",
      entityType: "Api",
      entityId: api._id,
      summary: `Cron job removed from API "${api.name ?? api._id}"`,
    });
    return successsResponse(res, api, 200, "Cron job removed successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getApiSummaryHandler = async (req, res) => {
  try {
    const summary = await getApiSummary();
    return successsResponse(
      res,
      summary,
      200,
      "API summary retrieved successfully",
    );
  } catch (error) {
    return errorResponse(res, error);
  }
};
