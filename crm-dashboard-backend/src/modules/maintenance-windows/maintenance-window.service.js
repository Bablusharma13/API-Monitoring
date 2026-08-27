import MaintenanceWindow from "./maintenance-window.model.js";

export const createMaintenanceWindow = async (data) => {
  const window = new MaintenanceWindow(data);
  return await window.save();
};

export const getAllMaintenanceWindows = async (query) => {
  const {
    page = 1,
    limit = 20,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    "filters[scope.type]": scopeType,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const filter = {};

  if (search) {
    filter.reason = { $regex: search, $options: "i" };
  }
  if (scopeType) filter["scope.type"] = scopeType;

  const [total, windows] = await Promise.all([
    MaintenanceWindow.countDocuments(filter),
    MaintenanceWindow.find(filter)
      .populate("scope.categoryIds", "name")
      .populate("scope.apiIds", "name")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  return {
    data: windows,
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

export const updateMaintenanceWindow = async (id, data) => {
  const window = await MaintenanceWindow.findById(id);
  if (!window) throw { message: "Maintenance window not found", statusCode: 404 };

  const allowedFields = ["scope", "reason", "startsAt", "endsAt"];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      window[field] = data[field];
    }
  });

  return await window.save();
};

export const deleteMaintenanceWindow = async (id) => {
  const window = await MaintenanceWindow.findByIdAndDelete(id);
  if (!window) throw { message: "Maintenance window not found", statusCode: 404 };
  return { deleted: id };
};

// Returns true if `api` currently falls inside any active maintenance window.
// `api` should be an Api document (or plain object) exposing `_id` and
// `category` (an ObjectId, or a populated doc/subdoc with `_id`).
export const isApiInMaintenance = async (api) => {
  const now = new Date();

  const activeWindows = await MaintenanceWindow.find({
    startsAt: { $lte: now },
    endsAt: { $gte: now },
  }).lean();

  if (activeWindows.length === 0) return false;

  const apiId = String(api?._id ?? api?.id ?? "");
  const categoryId = String(api?.category?._id ?? api?.category ?? "");

  return activeWindows.some((window) => {
    if (window.scope?.type === "all") return true;

    if (window.scope?.type === "category") {
      return (window.scope.categoryIds || []).some(
        (id) => String(id) === categoryId,
      );
    }

    if (window.scope?.type === "api") {
      return (window.scope.apiIds || []).some((id) => String(id) === apiId);
    }

    return false;
  });
};
