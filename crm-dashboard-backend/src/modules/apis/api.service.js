import {
  registerMonitorJob,
  reregisterMonitorJob,
  unregisterMonitorJob,
} from "../monitor/monitor.service.js";
import { registerSslJob, unregisterSslJob } from "../ssl/ssl.service.js";
import Api from "./api.model.js";
import Check from "../check/check.model.js";
import crypto from "crypto";
import { sendEmailNotification } from "../../shared/mailer.js";

const generateApiId = () => `api_${crypto.randomBytes(4).toString("hex")}`;

const flattenObject = (obj, prefix = "") => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      Object.assign(result, flattenObject(value, path));
    } else {
      result[path] = value;
    }
  }
  return result;
};

export const createApi = async (data) => {
  const api = new Api({
    ...data,
    apiId: generateApiId(),
  });
  const savedApi = await api.save();

  const populatedApi = await Api.findById(savedApi._id).populate("owner");

  //NOTE: register BullMQ repeatable job immediately
  await registerMonitorJob(api);

  if (api.ssl?.enabled) {
    await registerSslJob(api);
  }

  await sendEmailNotification({
    uniqueName: "create-api",
    project: "API",
    to: [populatedApi.owner.email],
    isDisclaimer: true,
    priority: 1,
    isNote: false,
    subject: `API Created`,
    audience_label: "Employee",
    apiName: api.name,
    version: api.version,
    apiId: api.apiId,
    owner: populatedApi.owner.name,
    api: populatedApi.request.url,
  });

  return populatedApi;
};

export const getAllApis = async (query) => {
  const {
    page = 1, // ✅ default to 1
    limit = 10,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    "filters[status]": status,
    "filters[method]": method,
    "filters[type]": type,
    "filters[mode]": mode,
    "filters[tech]": tech,
  } = query;

  const skip = (page - 1) * limit; // ✅ page 1 → skip 0, page 2 → skip 10

  const toFilter = (val) => {
    const arr = val
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    return arr.length === 1 ? arr[0] : { $in: arr };
  };

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { apiId: { $regex: search, $options: "i" } },
    ];
  }
  if (status) filter["status.current"] = toFilter(status);
  if (method) filter["request.method"] = toFilter(method);
  if (type) filter["type"] = toFilter(type);
  if (mode) filter["mode"] = toFilter(mode);
  if (tech) filter["tech"] = toFilter(tech);

  const total = await Api.countDocuments(filter);
  const apis = await Api.find(filter)
    .populate("category", "name")
    .populate("owner", "name image_url")
    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    data: apis,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: Number(page) < Math.ceil(total / limit), // ✅ correct check
      hasPrevPage: Number(page) > 1, // ✅ page 1 has no prev
    },
  };
};

export const getApiById = async (id) => {
  return await Api.findOne({ apiId: id })
    .populate("category", "name")
    .populate("owner", "name image_url");
};

export const getApiByApiId = async (apiId) => {
  return await Api.findOne({ apiId });
};

export const updateApi = async (id, data) => {
  const existing = await Api.findOne({ apiId: id });
  const setData = flattenObject(data);
  const updated = await Api.findOneAndUpdate(
    { apiId: id },
    { $set: setData },
    { new: true, runValidators: true },
  ).populate("category", "name");

  const oldFrequency = existing?.monitoring?.frequency;
  const newFrequency = updated?.monitoring?.frequency;
  if (newFrequency && oldFrequency !== newFrequency) {
    await reregisterMonitorJob(updated, oldFrequency);
  }

  // ── keep the SSL check job in sync with ssl.enabled / ssl.checkFrequency ──
  const oldSslEnabled = existing?.ssl?.enabled;
  const newSslEnabled = updated?.ssl?.enabled;
  const oldSslFrequency = existing?.ssl?.checkFrequency;
  const newSslFrequency = updated?.ssl?.checkFrequency;

  if (!oldSslEnabled && newSslEnabled) {
    await registerSslJob(updated);
  } else if (oldSslEnabled && !newSslEnabled) {
    await unregisterSslJob(updated);
  } else if (
    oldSslEnabled &&
    newSslEnabled &&
    oldSslFrequency !== newSslFrequency
  ) {
    await unregisterSslJob(updated);
    await registerSslJob(updated);
  }

  return updated;
};

export const toggleApi = async (id, isDisabled) => {
  const api = await Api.findOne({ apiId: id });
  if (!api) return null;

  console.log("isDisabled", isDisabled);

  if (isDisabled) {
    await unregisterMonitorJob(api);
    if (api.ssl?.enabled) {
      await unregisterSslJob(api);
    }
  } else {
    await registerMonitorJob(api);
    if (api.ssl?.enabled) {
      await registerSslJob(api);
    }
  }

  return await Api.findByIdAndUpdate(
    api._id,
    {
      isDisabled,
      "status.current": isDisabled ? "paused" : "unknown",
    },
    { new: true },
  ).populate("category", "name");
};

export const deleteApi = async (id) => {
  const api = await Api.findOne({ apiId: id });
  if (!api) return null;
  await unregisterMonitorJob(api);
  await unregisterSslJob(api);
  return await Api.findByIdAndDelete(api._id);
};

export const removeCronJob = async (id) => {
  const api = await Api.findOne({ apiId: id });
  if (!api) return null;
  await unregisterMonitorJob(api);
  return await Api.findByIdAndUpdate(
    api._id,
    {
      "monitoring.enabled": false,
      "status.current": "paused",
    },
    { new: true },
  ).populate("category", "name");
};

export const bulkDeleteApis = async (ids) => {
  const apis = await Api.find({ _id: { $in: ids } });
  await Promise.all(
    apis.map(async (api) => {
      await unregisterMonitorJob(api);
      await unregisterSslJob(api);
    }),
  );
  const foundIds = apis.map((api) => api.apiId);
  await Api.deleteMany({ apiId: { $in: foundIds } });
  return {
    deleted: foundIds.length,
    notFound: ids.filter((id) => !foundIds.includes(id)),
  };
};

export const getApiSummary = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const filter = {};

  const [totalApis, activeApis, downApis, warningApis, checksLast30Days] =
    await Promise.all([
      Api.countDocuments(filter),
      Api.countDocuments({ ...filter, "status.current": "active" }),
      Api.countDocuments({ ...filter, "status.current": "down" }),
      Api.countDocuments({ ...filter, "status.current": "warning" }),
      Check.aggregate([
        {
          $match: {
            checkedAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: "$responseTime" },
          },
        },
      ]),
    ]);

  const apisWithUptime = await Api.find(filter)
    .select("stats.uptime30d stats.avgResponse30d")
    .lean();

  const avgUptime =
    apisWithUptime.length > 0
      ? apisWithUptime.reduce(
          (sum, api) => sum + (api.stats?.uptime30d || 0),
          0,
        ) / apisWithUptime.length
      : 0;

  const avgResponseTime =
    checksLast30Days.length > 0
      ? Math.round(checksLast30Days[0].avgResponseTime)
      : null;

  return {
    totalApis,
    activeApis,
    downApis,
    warningApis,
    avgResponseTime: avgResponseTime || null,
    avgUptime: Math.round(avgUptime * 10) / 10,
  };
};
