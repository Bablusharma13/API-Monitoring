import Api from "../apis/api.model.js";
import Incident from "../incident/incident.model.js";

export const getStatusSummary = async () => {
  const apiDocs = await Api.find({
    isDisabled: false,
    type: { $ne: "Internal" },
  })
    .select("name category status.current stats.uptime30d")
    .populate("category", "name")
    .lean();

  let overallStatus = "operational";
  if (apiDocs.some((api) => api.status?.current === "down")) {
    overallStatus = "outage";
  } else if (apiDocs.some((api) => api.status?.current === "warning")) {
    overallStatus = "degraded";
  }

  const apis = apiDocs.map((api) => ({
    name: api.name,
    category: api.category?.name || null,
    status: api.status?.current,
    uptime30d: api.stats?.uptime30d,
  }));

  const incidentDocs = await Incident.find({ status: "ongoing" })
    .populate({
      path: "api",
      select: "_id",
      match: { type: { $ne: "Internal" } },
    })
    .select("title type severity startedAt api")
    .lean();

  const activeIncidents = incidentDocs
    .filter((incident) => incident.api)
    .map((incident) => ({
      title: incident.title,
      type: incident.type,
      severity: incident.severity,
      startedAt: incident.startedAt,
    }));

  return { overallStatus, apis, activeIncidents };
};
