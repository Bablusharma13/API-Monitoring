import Category from "./category.model.js";
import Api from "../apis/api.model.js";
import Incident from "../incident/incident.model.js";
import categoryModel from "./category.model.js";

export const createCategory = async (data) => {
  const category = new Category(data);
  return await category.save();
};

export const getAllCategories = async (query) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (page - 1) * limit;

  const STATS_FIELDS = new Set([
    "totalApis",
    "activeApis",
    "downApis",
    "warningApis",
    "avgUptime",
    "avgResponse",
    "totalIncidents",
    "healthScore",
    "lastIncidentAt",
    "lastCheckedAt",
  ]);
  const sortField = STATS_FIELDS.has(sortBy) ? `stats.${sortBy}` : sortBy;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const total = await Category.countDocuments(filter);
  const categories = await Category.find(filter)
    .populate("owner", "name image_url")
    .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  // Attach live api counts per category
  const categoryIds = categories.map((c) => c._id);
  const apiStats = await Api.aggregate([
    { $match: { category: { $in: categoryIds }, isDisabled: false } },
    {
      $group: {
        _id: "$category",
        totalApis: { $sum: 1 },
        activeApis: {
          $sum: { $cond: [{ $eq: ["$status.current", "active"] }, 1, 0] },
        },
        downApis: {
          $sum: { $cond: [{ $eq: ["$status.current", "down"] }, 1, 0] },
        },
        warningApis: {
          $sum: { $cond: [{ $eq: ["$status.current", "warning"] }, 1, 0] },
        },
      },
    },
  ]);

  const statsMap = Object.fromEntries(
    apiStats.map((s) => [s._id.toString(), s]),
  );

  const data = categories.map((cat) => {
    const live = statsMap[cat._id.toString()] || {
      totalApis: 0,
      activeApis: 0,
      downApis: 0,
      warningApis: 0,
    };
    return {
      ...cat,
      liveStats: {
        totalApis: live.totalApis,
        activeApis: live.activeApis,
        downApis: live.downApis,
        warningApis: live.warningApis,
      },
    };
  });

  return {
    data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: Number(page) < Math.ceil(total / limit),
      hasPrevPage: Number(page) > 1,
    },
  };
};

export const getCategoryById = async (id) => {
  return await Category.findById(id);
};

export const syncCategoryStats = async (categoryId) => {
  try {
    if (!categoryId) return;

    const apis = await Api.find({ category: categoryId, isDisabled: false })
      .select("status stats monitoring")
      .lean();

    if (!apis.length) return;

    const totalApis = apis.length;
    const activeApis = apis.filter(
      (a) => a.status?.current === "active",
    ).length;
    const downApis = apis.filter((a) => a.status?.current === "down").length;
    const warningApis = apis.filter(
      (a) => a.status?.current === "warning",
    ).length;

    const avgUptime =
      Math.round(
        (apis.reduce((s, a) => s + (a.stats?.uptime30d || 0), 0) / totalApis) *
          10,
      ) / 10;

    const avgResponse = Math.round(
      apis.reduce((s, a) => s + (a.stats?.avgResponse30d || 0), 0) / totalApis,
    );

    const totalIncidents = apis.reduce(
      (s, a) => s + (a.stats?.totalIncidents || 0),
      0,
    );

    const lastCheckedAt =
      apis
        .map((a) => a.monitoring?.lastCheckedAt)
        .filter(Boolean)
        .sort((a, b) => b - a)[0] || null;

    const lastIncident = await Incident.findOne({
      api: { $in: apis.map((a) => a._id) },
    })
      .sort({ startedAt: -1 })
      .select("startedAt")
      .lean();

    const healthScore = Math.max(
      0,
      Math.round(avgUptime * 0.7 + ((totalApis - downApis) / totalApis) * 30),
    );

    await categoryModel.findByIdAndUpdate(categoryId, {
      "stats.totalApis": totalApis,
      "stats.activeApis": activeApis,
      "stats.downApis": downApis,
      "stats.warningApis": warningApis,
      "stats.avgUptime": avgUptime,
      "stats.avgResponse": avgResponse,
      "stats.totalIncidents": totalIncidents,
      "stats.lastCheckedAt": lastCheckedAt,
      "stats.lastIncidentAt": lastIncident?.startedAt || null,
      "stats.healthScore": healthScore,
    });
  } catch (e) {
    console.log("error", e);
  }
};

export const updateCategory = async (id, data) => {
  const category = await Category.findById(id);
  if (!category) throw { message: "Category not found", statusCode: 404 };

  const allowedFields = [
    "name",
    "description",
    "color",
    "owner",
    "compliance",
    "defaultAlertChannel",
    "tags",
    "isActive",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      category[field] = data[field];
    }
  });

  return await category.save();
};

export const deleteCategoryById = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw { message: "Category not found", statusCode: 404 };
  return { deleted: id };
};

export const bulkDeleteCategories = async (ids) => {
  const categories = await Category.find({ _id: { $in: ids } });
  const foundIds = categories.map((c) => c._id.toString());
  await Category.deleteMany({ _id: { $in: foundIds } });
  return {
    deleted: foundIds.length,
    notFound: ids.filter((id) => !foundIds.includes(id)),
  };
};

export const getCategorySummary = async () => {
  const [
    totalCategories,
    totalApis,
    activeApis,
    downApis,
    warningApis,
    criticalApis,
  ] = await Promise.all([
    Category.countDocuments({ isActive: true }),
    Api.countDocuments({ isDisabled: false }),
    Api.countDocuments({ isDisabled: false, "status.current": "active" }),
    Api.countDocuments({ isDisabled: false, "status.current": "down" }),
    Api.countDocuments({ isDisabled: false, "status.current": "warning" }),
    Api.countDocuments({ isDisabled: false, "stats.riskScore": { $gte: 80 } }),
  ]);

  const apisPerCategory =
    totalCategories > 0
      ? Math.round((totalApis / totalCategories) * 10) / 10
      : 0;

  return {
    totalCategories,
    totalApis,
    activeApis,
    downApis,
    warningApis,
    criticalApis,
    apisPerCategory,
  };
};
