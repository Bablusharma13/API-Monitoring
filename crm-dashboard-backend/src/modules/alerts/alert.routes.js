import express from "express";
import {
  getAllAlertsHandler,
  getAlertsSummaryHandler,
  ackAlertHandler,
  resolveAlertHandler,
} from "./alert.controller.js";

export const alertRouter = express.Router();

alertRouter.get("/summary", getAlertsSummaryHandler);
alertRouter.get("/", getAllAlertsHandler);
alertRouter.patch("/:id/ack", ackAlertHandler);
alertRouter.patch("/:id/resolve", resolveAlertHandler);
