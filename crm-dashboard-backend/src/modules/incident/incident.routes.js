import express from "express";
import {
  getAllIncidentsHandler,
  getIncidentsSummaryHandler,
  deleteIncidentHandler,
  bulkDeleteIncidentsHandler,
} from "./incident.controller.js";

export const incidentRouter = express.Router();

incidentRouter.delete("/bulk", bulkDeleteIncidentsHandler);
incidentRouter.delete("/:id", deleteIncidentHandler);
incidentRouter.get("/summary", getIncidentsSummaryHandler);
incidentRouter.get("/", getAllIncidentsHandler);
