import express from "express";
import {
  createAlertRuleHandler,
  getAllAlertRulesHandler,
  getAlertRuleByIdHandler,
  updateAlertRuleHandler,
  deleteAlertRuleHandler,
} from "./alert-rule.controller.js";
import { authorize } from "../../middlewares/authorize.js";

export const alertRuleRouter = express.Router();

alertRuleRouter.get("/", getAllAlertRulesHandler);
alertRuleRouter.post("/", authorize("admin"), createAlertRuleHandler);
alertRuleRouter.get("/:id", getAlertRuleByIdHandler);
alertRuleRouter.put("/:id", authorize("admin"), updateAlertRuleHandler);
alertRuleRouter.delete("/:id", authorize("admin"), deleteAlertRuleHandler);
