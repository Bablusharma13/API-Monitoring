import express from "express";
import { getAuditLogsHandler } from "./audit-log.controller.js";

export const auditLogRouter = express.Router();

auditLogRouter.get("/", getAuditLogsHandler);
