import express from "express";
import {
  getTrafficHandler,
  getErrorsHandler,
  getSloHandler,
  getUserActivityHandler,
  getLatencyHandler,
} from "./analytics.controller.js";

export const analyticsRouter = express.Router();

analyticsRouter.get("/traffic", getTrafficHandler);
analyticsRouter.get("/errors", getErrorsHandler);
analyticsRouter.get("/slo", getSloHandler);
analyticsRouter.get("/user-activity", getUserActivityHandler);
analyticsRouter.get("/latency", getLatencyHandler);
