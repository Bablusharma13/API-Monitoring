import NotificationChannel from "./notification-channel.model.js";
import { dispatchToChannel } from "../alerts/alert.service.js";

const toFilter = (val) => {
  const arr = val.split(",").map((v) => v.trim()).filter(Boolean);
  return arr.length === 1 ? arr[0] : { $in: arr };
};

export const createNotificationChannel = async (data) => {
  const channel = new NotificationChannel(data);
  return await channel.save();
};

export const getAllNotificationChannels = async (query) => {
  const {
    page = 1,
    limit = 20,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    "filters[type]": type,
    "filters[enabled]": enabled,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };
  if (type) filter.type = toFilter(type);
  if (enabled !== undefined) filter.enabled = enabled === "true";

  const [total, channels] = await Promise.all([
    NotificationChannel.countDocuments(filter),
    NotificationChannel.find(filter)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  return {
    data: channels,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
      hasPrevPage: Number(page) > 1,
    },
  };
};

export const getNotificationChannelById = async (id) => {
  const channel = await NotificationChannel.findById(id).lean();
  if (!channel) throw { message: "Notification channel not found", statusCode: 404 };
  return channel;
};

export const updateNotificationChannel = async (id, data) => {
  const channel = await NotificationChannel.findById(id);
  if (!channel) throw { message: "Notification channel not found", statusCode: 404 };

  const allowedFields = [
    "type",
    "name",
    "config",
    "severityFilter",
    "enabled",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      channel[field] = data[field];
    }
  });

  return await channel.save();
};

export const deleteNotificationChannel = async (id) => {
  const channel = await NotificationChannel.findByIdAndDelete(id);
  if (!channel) throw { message: "Notification channel not found", statusCode: 404 };
  return { deleted: id };
};

// Sends a synthetic test payload through the same dispatch logic used for
// real alerts, without ever creating an Alert document.
export const testChannel = async (id) => {
  const channel = await NotificationChannel.findById(id);
  if (!channel) throw { message: "Notification channel not found", statusCode: 404 };

  const testAlert = {
    title: "Test Alert",
    message: "This is a test notification from your alerting system.",
  };

  return await dispatchToChannel(channel, testAlert, { isTest: true });
};
