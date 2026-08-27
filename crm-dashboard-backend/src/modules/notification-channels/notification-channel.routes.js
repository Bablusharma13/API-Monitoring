import express from "express";
import {
  createNotificationChannelHandler,
  getAllNotificationChannelsHandler,
  getNotificationChannelByIdHandler,
  updateNotificationChannelHandler,
  deleteNotificationChannelHandler,
  testNotificationChannelHandler,
} from "./notification-channel.controller.js";
import { authorize } from "../../middlewares/authorize.js";

export const notificationChannelRouter = express.Router();

notificationChannelRouter.get("/", getAllNotificationChannelsHandler);
notificationChannelRouter.post("/", authorize("admin"), createNotificationChannelHandler);
notificationChannelRouter.post("/:id/test", testNotificationChannelHandler);
notificationChannelRouter.get("/:id", getNotificationChannelByIdHandler);
notificationChannelRouter.put("/:id", authorize("admin"), updateNotificationChannelHandler);
notificationChannelRouter.delete("/:id", authorize("admin"), deleteNotificationChannelHandler);
