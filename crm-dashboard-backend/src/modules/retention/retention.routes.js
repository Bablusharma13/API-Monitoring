import express from "express";
import {
  getAllRetentionSettingsHandler,
  updateRetentionSettingHandler,
} from "./retention.controller.js";
import { authorize } from "../../middlewares/authorize.js";

export const retentionRouter = express.Router();

retentionRouter.get("/", getAllRetentionSettingsHandler);
retentionRouter.put("/:key", authorize("admin"), updateRetentionSettingHandler);
