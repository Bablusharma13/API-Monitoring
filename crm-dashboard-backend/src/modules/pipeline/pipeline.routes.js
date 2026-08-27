import express from "express";
import {
  getPipelineStatsHandler,
  getStorageStatsHandler,
} from "./pipeline.controller.js";

export const pipelineRouter = express.Router();

pipelineRouter.get("/stats", getPipelineStatsHandler);
pipelineRouter.get("/storage", getStorageStatsHandler);
