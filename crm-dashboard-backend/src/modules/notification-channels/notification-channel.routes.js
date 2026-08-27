import express from "express";
import {
  createNotificationChannelHandler,
  getAllNotificationChannelsHandler,
  getNotificationChannelByIdHandler,
  updateNotificationChannelHandler,
  deleteNotificationChannelHandler,
  testNotificationChannelHandler,
} from "./notification-channel.controller.js";

export const notificationChannelRouter = express.Router();

notificationChannelRouter.get("/", getAllNotificationChannelsHandler);
notificationChannelRouter.post("/", createNotificationChannelHandler);
notificationChannelRouter.post("/:id/test", testNotificationChannelHandler);
notificationChannelRouter.get("/:id", getNotificationChannelByIdHandler);
notificationChannelRouter.put("/:id", updateNotificationChannelHandler);
notificationChannelRouter.delete("/:id", deleteNotificationChannelHandler);
