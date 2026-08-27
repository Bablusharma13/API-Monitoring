import AlertRule from "./alert-rule.model.js";

const toFilter = (val) => {
  const arr = val.split(",").map((v) => v.trim()).filter(Boolean);
  return arr.length === 1 ? arr[0] : { $in: arr };
};

export const createAlertRule = async (data) => {
  const rule = new AlertRule(data);
  return await rule.save();
};

export const getAllAlertRules = async (query) => {
  const {
    page = 1,
    limit = 20,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    "filters[signal]": signal,
    "filters[severity]": severity,
    "filters[enabled]": enabled,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };
  if (signal) filter.signal = toFilter(signal);
  if (severity) filter.severity = toFilter(severity);
  if (enabled !== undefined) filter.enabled = enabled === "true";

  const [total, rules] = await Promise.all([
    AlertRule.countDocuments(filter),
    AlertRule.find(filter)
      .populate("channels", "type name enabled")
      .populate("scope.categoryIds", "name")
      .populate("scope.apiIds", "name")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  return {
    data: rules,
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

export const getAlertRuleById = async (id) => {
  const rule = await AlertRule.findById(id)
    .populate("channels", "type name enabled")
    .populate("scope.categoryIds", "name")
    .populate("scope.apiIds", "name")
    .lean();
  if (!rule) throw { message: "Alert rule not found", statusCode: 404 };
  return rule;
};

export const updateAlertRule = async (id, data) => {
  const rule = await AlertRule.findById(id);
  if (!rule) throw { message: "Alert rule not found", statusCode: 404 };

  const allowedFields = [
    "name",
    "signal",
    "condition",
    "scope",
    "channels",
    "severity",
    "cooldownMinutes",
    "autoResolve",
    "enabled",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      rule[field] = data[field];
    }
  });

  return await rule.save();
};

export const deleteAlertRule = async (id) => {
  const rule = await AlertRule.findByIdAndDelete(id);
  if (!rule) throw { message: "Alert rule not found", statusCode: 404 };
  return { deleted: id };
};
