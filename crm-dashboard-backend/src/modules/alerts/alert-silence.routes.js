import express from "express";
import {
  createAlertSilenceHandler,
  getAllAlertSilencesHandler,
  deleteAlertSilenceHandler,
} from "./alert-silence.controller.js";
import { authorize } from "../../middlewares/authorize.js";

export const silenceRouter = express.Router();

silenceRouter.get("/", getAllAlertSilencesHandler);
silenceRouter.post("/", authorize("admin"), createAlertSilenceHandler);
silenceRouter.delete("/:id", authorize("admin"), deleteAlertSilenceHandler);
