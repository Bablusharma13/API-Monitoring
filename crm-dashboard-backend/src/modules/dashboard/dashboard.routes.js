import express from "express";
import { getDashboardHandler } from "./dashboard.controller.js";

export const dashboardRouter = express.Router();

dashboardRouter.get("/", getDashboardHandler);
