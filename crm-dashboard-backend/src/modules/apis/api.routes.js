import express from "express";
import {
  createApiHandler,
  getAllApisHandler,
  getApiByIdHandler,
  updateApiHandler,
  toggleApiHandler,
  deleteApiHandler,
  bulkDeleteApisHandler,
  getApiSummaryHandler,
  removeCronJobHandler,
} from "./api.controller.js";

export const apiRouter = express.Router();

apiRouter.post("/", createApiHandler);
apiRouter.get("/", getAllApisHandler);
apiRouter.get("/summary", getApiSummaryHandler);
apiRouter.get("/:id", getApiByIdHandler);
apiRouter.put("/:id", updateApiHandler);
apiRouter.patch("/:id", toggleApiHandler);
apiRouter.delete("/bulk", bulkDeleteApisHandler);
apiRouter.delete("/:id/cron", removeCronJobHandler);
apiRouter.delete("/:id", deleteApiHandler);
