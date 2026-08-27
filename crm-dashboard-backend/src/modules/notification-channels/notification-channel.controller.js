import {
  createNotificationChannel,
  getAllNotificationChannels,
  getNotificationChannelById,
  updateNotificationChannel,
  deleteNotificationChannel,
  testChannel,
} from "./notification-channel.service.js";
import { successsResponse, errorResponse } from "../../utils/responses.js";

export const createNotificationChannelHandler = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user?.email };
    const channel = await createNotificationChannel(data);
    return successsResponse(res, channel, 201, "Notification channel created successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getAllNotificationChannelsHandler = async (req, res) => {
  try {
    const result = await getAllNotificationChannels(req.query);
    return successsResponse(res, result, 200, "Notification channels retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const getNotificationChannelByIdHandler = async (req, res) => {
  try {
    const channel = await getNotificationChannelById(req.params.id);
    return successsResponse(res, channel, 200, "Notification channel retrieved successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const updateNotificationChannelHandler = async (req, res) => {
  try {
    const channel = await updateNotificationChannel(req.params.id, req.body);
    return successsResponse(res, channel, 200, "Notification channel updated successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const deleteNotificationChannelHandler = async (req, res) => {
  try {
    const result = await deleteNotificationChannel(req.params.id);
    return successsResponse(res, result, 200, "Notification channel deleted successfully");
  } catch (error) {
    return errorResponse(res, error);
  }
};

export const testNotificationChannelHandler = async (req, res) => {
  try {
    const result = await testChannel(req.params.id);
    return successsResponse(res, result, 200, "Test notification dispatched");
  } catch (error) {
    return errorResponse(res, error);
  }
};
