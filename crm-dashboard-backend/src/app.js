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
app.use("/ping", pingRouter);
