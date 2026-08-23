import { Router } from "express";
import {
  createHandler,
  getAllHandler,
  getByIdHandler,
  updateHandler,
  deleteHandler,
  toggleHandler,
  getSummaryHandler,
  getPingHistoryHandler,
  recordPingHandler,
  runNowHandler,
} from "./cron-job.controller.js";

export const cronJobRouter = Router();
export const pingRouter = Router();

cronJobRouter.get("/summary", getSummaryHandler);
cronJobRouter.get("/", getAllHandler);
cronJobRouter.get("/:id", getByIdHandler);
cronJobRouter.post("/", createHandler);
cronJobRouter.put("/:id", updateHandler);
cronJobRouter.delete("/:id", deleteHandler);
cronJobRouter.patch("/:id/toggle", toggleHandler);
cronJobRouter.get("/:id/pings", getPingHistoryHandler);
cronJobRouter.post("/:id/run", runNowHandler);

pingRouter.get("/:slug", recordPingHandler);
