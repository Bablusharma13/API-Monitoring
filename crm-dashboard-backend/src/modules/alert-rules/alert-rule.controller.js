import {
  createAlertRule,
  getAllAlertRules,
  getAlertRuleById,
  updateAlertRule,
  deleteAlertRule,
} from "./alert-rule.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const createAlertRuleHandler = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user?.email };
    const rule = await createAlertRule(data);
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
    return successsResponse(res, rule, 200, "Alert rule updated successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteAlertRuleHandler = async (req, res) => {
  try {
    const result = await deleteAlertRule(req.params.id);
    return successsResponse(res, result, 200, "Alert rule deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};
