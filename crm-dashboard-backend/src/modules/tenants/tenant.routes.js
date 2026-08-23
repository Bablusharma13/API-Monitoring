import express from "express";
import {
  getTenantsSummaryHandler,
  getFleetSummaryHandler,
  getTenantCardsHandler,
  getTenantDetails,
  getTenantEmployees,
  getTenantEndpointMatrics,
  getTenantRequestLog,
  getAllRequestLogsHandler,
  getTenantEmployeeDetails,
  getTenantEmployeeMatrics,
  getEndpointExplorer,
  getTenantDashboardData,
  updateTenantOriginHandler,
  getEndpointSummary,
  getEndpointTenantMetrics,
} from "./tenant.controller.js";

export const tenantRouter = express.Router();

tenantRouter.get("/summary", getTenantsSummaryHandler);
tenantRouter.get("/fleet-summary", getFleetSummaryHandler);
tenantRouter.get("/cards", getTenantCardsHandler);

tenantRouter.get("/endpoint-explorer", getEndpointExplorer);
tenantRouter.get("/dashboard", getTenantDashboardData);
tenantRouter.get("/request-log", getAllRequestLogsHandler);

tenantRouter.get(
  "/endpoint-explorer/:endpoint/:method/summary",
  getEndpointSummary,
);
tenantRouter.get(
  "/endpoint-explorer/:endpoint/:method",
  getEndpointTenantMetrics,
);

tenantRouter.get("/:id", getTenantDetails);
tenantRouter.patch("/:id/origin", updateTenantOriginHandler);
tenantRouter.get("/:id/employees", getTenantEmployees);
tenantRouter.get("/:id/endpoint-matrics", getTenantEndpointMatrics);
tenantRouter.get("/:id/request-log", getTenantRequestLog);

tenantRouter.get("/:id/employee/:eId", getTenantEmployeeDetails);
tenantRouter.get("/:id/employee-matrics/:eId", getTenantEmployeeMatrics);
