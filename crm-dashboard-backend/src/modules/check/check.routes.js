import express from "express";
import {
  getAllChecksHandler,
  getChecksSummaryHandler,
} from "./check.controller.js";

export const checkRouter = express.Router();

checkRouter.get("/summary", getChecksSummaryHandler);
checkRouter.get("/", getAllChecksHandler);
