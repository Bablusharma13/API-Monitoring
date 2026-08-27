import express from "express";
import {
  getUnifiedLogsHandler,
  getLogByIdHandler,
} from "./logs.controller.js";

export const logsRouter = express.Router();

logsRouter.get("/", getUnifiedLogsHandler);
logsRouter.get("/:source/:id", getLogByIdHandler);
