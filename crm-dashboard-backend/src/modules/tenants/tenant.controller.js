import {
  getTenantsSummary,
  getFleetSummary,
  getTenantCards,
  getTenantDetailsById,
  getTenantEmployeesById,
  getTenantRequestLogs,
  getAllRequestLogs,
  getTenantEmployeeDetailsById,
  getTenantEmployeeMetricsById,
  getTenantEndpointMatricsById,
  getAllEndpointsExplorer,
  getTenantDashboardSummary,
  updateTenantOrigin,
  getEndpointSummaryByMethod,
  getEndpointTenantMetricsByMethod,
  getQuotaUsage,
} from "./tenant.service.js";

import { successsResponse, errorResponse } from "../../utils/responses.js";
import { recordAudit } from "../audit-log/audit-log.service.js";

export const getTenantDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await getTenantDetailsById(id);
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getTenantEmployees = async (req, res) => {
  const { id } = req.params;
  const { page, limit, search, sortBy, sortOrder } = req.query;

  try {
    const data = await getTenantEmployeesById(
      id,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    );
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getTenantEndpointMatrics = async (req, res) => {
  const { id } = req.params;
  const { page, limit, search, sortBy, sortOrder } = req.query;

  try {
    const data = await getTenantEndpointMatricsById(
      id,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    );
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getTenantRequestLog = async (req, res) => {
  const { id } = req.params;
  const { page, limit, search, sortBy, sortOrder } = req.query;

  try {
    const data = await getTenantRequestLogs(
      id,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    );
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getAllRequestLogsHandler = async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query;

  try {
    const data = await getAllRequestLogs(
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    );
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getTenantEmployeeDetails = async (req, res) => {
  const { id, eId } = req.params;
  try {
    const data = await getTenantEmployeeDetailsById(id, eId);
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getTenantEmployeeMatrics = async (req, res) => {
  const { id, eId } = req.params;
  const { page, limit, search, sortBy, sortOrder } = req.query;
  try {
    const data = await getTenantEmployeeMetricsById(
      id,
      eId,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    );
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getEndpointExplorer = async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query;
  try {
    const data = await getAllEndpointsExplorer(
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    );
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getEndpointSummary = async (req, res) => {
  const { endpoint, method } = req.params;
  try {
    const data = await getEndpointSummaryByMethod(endpoint, method);
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getEndpointTenantMetrics = async (req, res) => {
  const { endpoint, method } = req.params;
  const { page, limit, sortBy, sortOrder, search } = req.query;
  try {
    const data = await getEndpointTenantMetricsByMethod(endpoint, method, {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
    });
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getTenantDashboardData = async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query;
  try {
    const data = await getTenantDashboardSummary(
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    );
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getTenantsSummaryHandler = async (req, res) => {
  try {
    const data = await getTenantsSummary();
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getFleetSummaryHandler = async (req, res) => {
  try {
    const data = await getFleetSummary();
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateTenantOriginHandler = async (req, res) => {
  const { id } = req.params;
  const { origin } = req.body;
  try {
    const data = await updateTenantOrigin(id, origin);
    await recordAudit({
      req,
      action: "tenant.updateOrigin",
      entityType: "Tenant",
      entityId: id,
      summary: `Updated allowed origin(s) for tenant "${data?.company || id}" to [${Array.isArray(origin) ? origin.join(", ") : origin}]`,
    });
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getQuotaUsageHandler = async (req, res) => {
  try {
    const data = await getQuotaUsage();
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getTenantCardsHandler = async (req, res) => {
  try {
    const { page, limit, status, plan, search, sort } = req.query;
    const data = await getTenantCards({
      page,
      limit,
      status,
      plan,
      search,
      sort,
    });
    return successsResponse(res, data);
  } catch (error) {
    return errorResponse(res, error);
  }
};
