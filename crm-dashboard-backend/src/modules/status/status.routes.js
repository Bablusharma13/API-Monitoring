import express from "express";
import { getStatusSummaryHandler } from "./status.controller.js";

export const statusRouter = express.Router();

statusRouter.get("/", getStatusSummaryHandler);
