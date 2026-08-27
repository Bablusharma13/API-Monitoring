import Check from "../check/check.model.js";
import { RequestLog } from "../tenants/models/requset-log.model.js";

const toFilter = (val) => {
  const arr = val
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return arr.length === 1 ? arr[0] : { $in: arr };
};

const buildLogsFilter = (query) => {
  const {
    search = "",
    "filters[status]": status,
    "filters[source]": source,
    "filters[dateFrom]": dateFrom,
    "filters[dateTo]": dateTo,
  } = query;

  const filter = {};
  if (search) filter.target = { $regex: search, $options: "i" };
  if (status) filter.status = toFilter(status);
  if (source) filter.source = toFilter(source);
  if (dateFrom || dateTo) {
    filter.timestamp = {};
    if (dateFrom) filter.timestamp.$gte = new Date(dateFrom);
    if (dateTo) filter.timestamp.$lte = new Date(dateTo);
  }
  return filter;
};

export const getUnifiedLogs = async (query) => {
  const { page = 1, limit = 20, sortBy = "timestamp", sortOrder = "desc" } =
    query;

  const matchFilter = buildLogsFilter(query);
  const skip = (Number(page) - 1) * Number(limit);

  const pipeline = [
    {
      $project: {
        _id: 0,
        id: { $toString: "$_id" },
        source: { $literal: "check" },
        timestamp: "$checkedAt",
        target: "$apiName",
        method: { $literal: null },
        statusCode: "$statusCode",
        latencyMs: "$responseTime",
        status: "$status",
        message: { $ifNull: ["$message", "$error"] },
      },
    },
    {
      $unionWith: {
        coll: RequestLog.collection.name,
        pipeline: [
          {
            $project: {
              _id: 0,
              id: { $toString: "$_id" },
              source: { $literal: "request" },
              timestamp: "$recordedAt",
              target: "$endpoint",
              method: "$method",
              statusCode: "$statusCode",
              latencyMs: "$latency",
              status: {
                $cond: [{ $lt: ["$statusCode", 400] }, "ok", "error"],
              },
              message: { $literal: null },
            },
          },
        ],
      },
    },
    { $match: matchFilter },
    { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: Number(limit) }],
        metadata: [{ $count: "total" }],
      },
    },
  ];

  const [result] = await Check.aggregate(pipeline);
  const total = result?.metadata?.[0]?.total || 0;

  return {
    data: result?.data || [],
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

export const getLogById = async (source, id) => {
  if (source === "check") {
    const doc = await Check.findById(id).populate("api", "name apiId").lean();
    if (!doc) throw { message: "Log not found", statusCode: 404 };

    return {
      id: String(doc._id),
      source: "check",
      timestamp: doc.checkedAt,
      target: doc.apiName,
      method: null,
      statusCode: doc.statusCode,
      latencyMs: doc.responseTime,
      status: doc.status,
      message: doc.message || doc.error || null,
      raw: doc,
    };
  }

  if (source === "request") {
    const doc = await RequestLog.findById(id)
      .populate("tenantId employeeId")
      .lean();
    if (!doc) throw { message: "Log not found", statusCode: 404 };

    return {
      id: String(doc._id),
      source: "request",
      timestamp: doc.recordedAt,
      target: doc.endpoint,
      method: doc.method,
      statusCode: doc.statusCode,
      latencyMs: doc.latency,
      status: doc.statusCode < 400 ? "ok" : "error",
      message: null,
      raw: doc,
    };
  }

  throw {
    message: "source must be either 'check' or 'request'",
    statusCode: 400,
  };
};
