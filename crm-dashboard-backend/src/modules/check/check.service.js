import Check from "./check.model.js";

const toFilter = (val) => {
  const arr = val.split(",").map((v) => v.trim()).filter(Boolean);
  return arr.length === 1 ? arr[0] : { $in: arr };
};

const buildCheckFilter = (query) => {
  const {
    search = "",
    "filters[api]": api,
    "filters[status]": status,
    "filters[statusCode]": statusCode,
    "filters[dateFrom]": dateFrom,
    "filters[dateTo]": dateTo,
  } = query;

  const filter = {};
  if (search) filter.apiName = { $regex: search, $options: "i" };
  if (api) filter.api = api;
  if (status) filter.status = toFilter(status);
  if (statusCode) filter.statusCode = toFilter(statusCode);
  if (dateFrom || dateTo) {
    filter.checkedAt = {};
    if (dateFrom) filter.checkedAt.$gte = new Date(dateFrom);
    if (dateTo) filter.checkedAt.$lte = new Date(dateTo);
  }
  return filter;
};

export const getAllChecks = async (query) => {
  const {
    page = 1,
    limit = 20,
    sortBy = "checkedAt",
    sortOrder = "desc",
  } = query;

  const filter = buildCheckFilter(query);
  const skip = (Number(page) - 1) * Number(limit);

  const [total, checks] = await Promise.all([
    Check.countDocuments(filter),
    Check.find(filter)
      .populate("api", "name apiId")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  return {
    data: checks,
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

export const getChecksSummary = async (query) => {
  const match = buildCheckFilter(query);

  const result = await Check.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: { $sum: { $cond: [{ $eq: ["$status", "ok"] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ["$status", "error"] }, 1, 0] } },
        slow: { $sum: { $cond: [{ $eq: ["$status", "warn"] }, 1, 0] } },
        timeouts: { $sum: { $cond: [{ $eq: ["$status", "timeout"] }, 1, 0] } },
      },
    },
  ]);

  if (!result.length) {
    return { total: 0, successful: 0, failed: 0, slow: 0, timeouts: 0 };
  }

  const { total, successful, failed, slow, timeouts } = result[0];
  return { total, successful, failed, slow, timeouts };
};
