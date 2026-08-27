import express from "express";
import {
  createAlertSilenceHandler,
  getAllAlertSilencesHandler,
  deleteAlertSilenceHandler,
} from "./alert-silence.controller.js";

export const silenceRouter = express.Router();

silenceRouter.get("/", getAllAlertSilencesHandler);
silenceRouter.post("/", createAlertSilenceHandler);
silenceRouter.delete("/:id", deleteAlertSilenceHandler);
