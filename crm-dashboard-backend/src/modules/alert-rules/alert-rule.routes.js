import express from "express";
import {
  createAlertRuleHandler,
  getAllAlertRulesHandler,
  getAlertRuleByIdHandler,
  updateAlertRuleHandler,
  deleteAlertRuleHandler,
} from "./alert-rule.controller.js";

export const alertRuleRouter = express.Router();

alertRuleRouter.get("/", getAllAlertRulesHandler);
alertRuleRouter.post("/", createAlertRuleHandler);
alertRuleRouter.get("/:id", getAlertRuleByIdHandler);
alertRuleRouter.put("/:id", updateAlertRuleHandler);
alertRuleRouter.delete("/:id", deleteAlertRuleHandler);
