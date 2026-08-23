import Incident from "./incident.model.js";
import Api from "../apis/api.model.js";

const toFilter = (val) => {
  const arr = val.split(",").map((v) => v.trim()).filter(Boolean);
  return arr.length === 1 ? arr[0] : { $in: arr };
};

export const getAllIncidents = async (query) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "startedAt",
    sortOrder = "desc",
    "filters[status]": status,
    "filters[severity]": severity,
    "filters[type]": type,
    "filters[triggeredBy]": triggeredBy,
    "filters[api]": api,
    "filters[dateFrom]": dateFrom,
    "filters[dateTo]": dateTo,
    // API-level filters (pre-queried since api is a ref)
    "filters[apiStatus]": apiStatus,
    "filters[apiCategory]": apiCategory,
    "filters[apiType]": apiType,
    "filters[apiMode]": apiMode,
  } = query;

  const skip = (page - 1) * limit;

  // Resolve API-level filters into a set of matching API _ids
  let apiIds = null;
  if (apiStatus || apiCategory || apiType || apiMode) {
    const apiFilter = {};
    if (apiStatus) apiFilter["status.current"] = toFilter(apiStatus);
    if (apiCategory) apiFilter.category = toFilter(apiCategory);
    if (apiType) apiFilter.type = toFilter(apiType);
    if (apiMode) apiFilter.mode = toFilter(apiMode);
    const matchedApis = await Api.find(apiFilter).select("_id").lean();
    apiIds = matchedApis.map((a) => a._id);
  }

  const filter = {};
  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    const matchingApis = await Api.find({
      $or: [{ name: searchRegex }, { apiId: searchRegex }],
    }).select("_id").lean();
    const matchingApiIds = matchingApis.map((a) => a._id);

    filter.$or = [
      { title: searchRegex },
      { incidentId: searchRegex },
      { type: searchRegex },
      { severity: searchRegex },
      { status: searchRegex },
      { triggeredBy: searchRegex },
      ...(matchingApiIds.length ? [{ api: { $in: matchingApiIds } }] : []),
    ];
  }
  if (status) filter.status = toFilter(status);
  if (severity) filter.severity = toFilter(severity);
  if (type) filter.type = toFilter(type);
  if (triggeredBy) filter.triggeredBy = toFilter(triggeredBy);
  if (api) filter.api = api;
  if (apiIds) filter.api = apiIds.length ? { $in: apiIds } : { $in: [] };
  if (dateFrom || dateTo) {
    filter.startedAt = {};
    if (dateFrom) filter.startedAt.$gte = new Date(dateFrom);
    if (dateTo) filter.startedAt.$lte = new Date(dateTo);
  }

  const total = await Incident.countDocuments(filter);
  const incidents = await Incident.find(filter)
    .populate("api", "name apiId status.current type mode category")
    .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
    .skip(skip)
    .limit(Number(limit));

  return {
    data: incidents,
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

export const deleteIncidentById = async (id) => {
  const incident = await Incident.findByIdAndDelete(id);
  if (!incident) throw { message: "Incident not found", statusCode: 404 };
  return { deleted: id };
};

export const bulkDeleteIncidents = async (ids) => {
  const incidents = await Incident.find({ _id: { $in: ids } }).select("_id").lean();
  const foundIds = incidents.map((i) => i._id.toString());
  await Incident.deleteMany({ _id: { $in: foundIds } });
  return {
    deleted: foundIds.length,
    notFound: ids.filter((id) => !foundIds.includes(id)),
  };
};

export const getIncidentsSummary = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalIncidents,
    activeIncidents,
    criticalIncidents,
    resolvedToday,
    incidentsLast30Days,
  ] = await Promise.all([
    Incident.countDocuments({}),
    Incident.countDocuments({ status: "ongoing" }),
    Incident.countDocuments({
      severity: "critical",
      status: { $ne: "resolved" },
    }),
    Incident.countDocuments({
      status: "resolved",
      resolvedAt: { $gte: today, $lt: tomorrow },
    }),
    Incident.aggregate([
      {
        $match: {
          duration: { $exists: true, $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$duration" },
        },
      },
    ]),
  ]);

  //NOTE: need to discuss sla breach logic

  // const allIncidents = await Incident.find({}).select("duration").lean();
  //
  // const slaBreaches = allIncidents.filter(
  //   (i) => i.duration && i.duration > 300,
  // ).length;

  const avgResolution =
    incidentsLast30Days.length > 0
      ? Math.round(incidentsLast30Days[0].avgDuration / 60)
      : null;

  return {
    totalIncidents,
    activeIncidents,
    criticalIncidents,
    resolvedToday,
    avgResolution: avgResolution || null,
    slaBreaches: 0,
  };
};
