import AuditLog from "./audit-log.model.js";

/**
 * recordAudit — reusable side-effect helper other modules call after a
 * mutation succeeds. MUST NEVER throw or reject in a way that breaks the
 * caller's response flow — any failure is swallowed and logged.
 *
 * @param {Object} params
 * @param {import("express").Request} params.req - the express request (used for actor + method)
 * @param {string} params.action - e.g. "category.update"
 * @param {string} params.entityType - e.g. "Category"
 * @param {string|Object} params.entityId - the affected entity's id (stringified if not already a string)
 * @param {string} params.summary - short human-readable description
 */
export const recordAudit = async ({
  req,
  action,
  entityType,
  entityId,
  summary,
} = {}) => {
  try {
    const actorId = req?.user?.sub ?? null;
    const actorEmail = req?.user?.email ?? null;
    const method = req?.method ?? null;
    const normalizedEntityId =
      entityId !== undefined && entityId !== null
        ? typeof entityId === "string"
          ? entityId
          : String(entityId)
        : null;

    await AuditLog.create({
      actorId,
      actorEmail,
      action,
      entityType,
      entityId: normalizedEntityId,
      method,
      summary,
    });
  } catch (error) {
    console.error("recordAudit failed:", error?.message || error);
    return;
  }
};

const toFilter = (val) => {
  const arr = val
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return arr.length === 1 ? arr[0] : { $in: arr };
};

export const getAuditLogs = async (query) => {
  const {
    page = 1,
    limit = 20,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    "filters[actorEmail]": actorEmail,
    "filters[entityType]": entityType,
    "filters[action]": action,
    "filters[dateFrom]": dateFrom,
    "filters[dateTo]": dateTo,
  } = query;

  const skip = (page - 1) * limit;

  const filter = {};
  if (search) {
    filter.$or = [
      { summary: { $regex: search, $options: "i" } },
      { action: { $regex: search, $options: "i" } },
      { actorEmail: { $regex: search, $options: "i" } },
    ];
  }
  if (actorEmail) filter.actorEmail = { $regex: actorEmail, $options: "i" };
  if (entityType) filter.entityType = toFilter(entityType);
  if (action) filter.action = toFilter(action);
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const [total, logs] = await Promise.all([
    AuditLog.countDocuments(filter),
    AuditLog.find(filter)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  return {
    data: logs,
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
