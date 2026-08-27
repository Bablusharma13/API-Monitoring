import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { categoryRouter } from "./modules/categories/category.routes.js";
import { apiRouter } from "./modules/apis/api.routes.js";
import { incidentRouter } from "./modules/incident/incident.routes.js";
import { teamMembersRouter } from "./modules/team-members/team-members.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { checkRouter } from "./modules/check/check.routes.js";
import { leaderboardRouter } from "./modules/leaderboard/leaderboard.routes.js";
import { tenantRouter } from "./modules/tenants/tenant.routes.js";
import { cronJobRouter, pingRouter } from "./modules/cron-job/cron-job.routes.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { notificationChannelRouter } from "./modules/notification-channels/notification-channel.routes.js";
import { alertRuleRouter } from "./modules/alert-rules/alert-rule.routes.js";
import { alertRouter } from "./modules/alerts/alert.routes.js";
import { silenceRouter } from "./modules/alerts/alert-silence.routes.js";
import { analyticsRouter } from "./modules/analytics/analytics.routes.js";
import { logsRouter } from "./modules/logs/logs.routes.js";
import { pipelineRouter } from "./modules/pipeline/pipeline.routes.js";
import { retentionRouter } from "./modules/retention/retention.routes.js";
import { maintenanceWindowRouter } from "./modules/maintenance-windows/maintenance-window.routes.js";
import { transactionRouter } from "./modules/transactions/transaction.routes.js";
import { auditLogRouter } from "./modules/audit-log/audit-log.routes.js";
import { statusRouter } from "./modules/status/status.routes.js";
import { authenticate } from "./middlewares/authenticate.js";

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CRM_DASHBOARD_URL,
    credentials: true,
  }),
);

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/categories", authenticate, categoryRouter);
app.use("/api/v1/apis", authenticate, apiRouter);
app.use("/api/v1/incidents", authenticate, incidentRouter);
app.use("/api/v1/team-members", authenticate, teamMembersRouter);
app.use("/api/v1/dashboard", authenticate, dashboardRouter);
app.use("/api/v1/checks", authenticate, checkRouter);
app.use("/api/v1/leaderboard", authenticate, leaderboardRouter);
app.use("/api/v1/tenants", authenticate, tenantRouter);
app.use("/api/v1/cron-jobs", authenticate, cronJobRouter);
app.use("/api/v1/alert-rules", authenticate, alertRuleRouter);
app.use("/api/v1/notification-channels", authenticate, notificationChannelRouter);
app.use("/api/v1/alerts", authenticate, alertRouter);
app.use("/api/v1/silences", authenticate, silenceRouter);
app.use("/api/v1/analytics", authenticate, analyticsRouter);
app.use("/api/v1/logs", authenticate, logsRouter);
app.use("/api/v1/pipeline", authenticate, pipelineRouter);
app.use("/api/v1/retention-settings", authenticate, retentionRouter);
app.use("/api/v1/maintenance-windows", authenticate, maintenanceWindowRouter);
app.use("/api/v1/transactions", authenticate, transactionRouter);
app.use("/api/v1/audit-log", authenticate, auditLogRouter);
app.use("/ping", pingRouter);
app.use("/api/v1/status", statusRouter);
