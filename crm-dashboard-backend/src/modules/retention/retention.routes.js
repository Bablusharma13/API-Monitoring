import express from "express";
import {
  getAllRetentionSettingsHandler,
  updateRetentionSettingHandler,
} from "./retention.controller.js";

export const retentionRouter = express.Router();

retentionRouter.get("/", getAllRetentionSettingsHandler);
retentionRouter.put("/:key", updateRetentionSettingHandler);
