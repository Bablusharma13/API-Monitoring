import {
  createAlertRule,
  getAllAlertRules,
  getAlertRuleById,
  updateAlertRule,
  deleteAlertRule,
} from "./alert-rule.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";
import { recordAudit } from "../audit-log/audit-log.service.js";

export const createAlertRuleHandler = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user?.email };
    const rule = await createAlertRule(data);
    await recordAudit({
      req,
      action: "alertRule.create",
      entityType: "AlertRule",
      entityId: rule._id,
      summary: `Created alert rule "${rule.name}"`,
    });
    return successsResponse(res, rule, 201, "Alert rule created successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getAllAlertRulesHandler = async (req, res) => {
  try {
    const result = await getAllAlertRules(req.query);
    return successsResponse(res, result, 200, "Alert rules retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getAlertRuleByIdHandler = async (req, res) => {
  try {
    const rule = await getAlertRuleById(req.params.id);
    return successsResponse(res, rule, 200, "Alert rule retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateAlertRuleHandler = async (req, res) => {
  try {
    const rule = await updateAlertRule(req.params.id, req.body);
    await recordAudit({
      req,
      action: "alertRule.update",
      entityType: "AlertRule",
      entityId: rule._id,
      summary: `Updated alert rule "${rule.name}"`,
    });
    return successsResponse(res, rule, 200, "Alert rule updated successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteAlertRuleHandler = async (req, res) => {
  try {
    const result = await deleteAlertRule(req.params.id);
    await recordAudit({
      req,
      action: "alertRule.delete",
      entityType: "AlertRule",
      entityId: req.params.id,
      summary: `Deleted alert rule ${req.params.id}`,
    });
    return successsResponse(res, result, 200, "Alert rule deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
