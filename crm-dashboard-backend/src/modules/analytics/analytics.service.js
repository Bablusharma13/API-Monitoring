import { Types } from "mongoose";
import Api from "../apis/api.model.js";
import { Tenant } from "../tenants/models/tenant.model.js";
import { TenantMetric } from "../tenants/models/tenant-metric.model.js";
import { EndpointMetric } from "../tenants/models/endpoint-metric.model.js";
import { RequestLog } from "../tenants/models/requset-log.model.js";
import { TeamMember } from "../team-members/team-members.model.js";
import { SLO_TARGETS } from "../../config/sla.js";

// ── window / bucket helpers ─────────────────────────────────────────────
const WINDOW_MS = { "24h": 24 * 60 * 60 * 1000, "7d": 7 * 24 * 60 * 60 * 1000 };
const BUCKET_MINUTES = { "24h": 5, "7d": 60 };

const resolveWindow = (window, defaultKey = "24h") => {
  const key = WINDOW_MS[window] ? window : defaultKey;
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_MS[key]);
  return {
    key,
    now,
    since,
    windowSeconds: WINDOW_MS[key] / 1000,
    bucketMinutes: BUCKET_MINUTES[key],
  };
};

const toObjectId = (id) => {
  try {
    return new Types.ObjectId(id);
  } catch {
    return null;
  }
};

const tenantNameMap = async (tenantIds) => {
  if (!tenantIds.length) return {};
  const tenants = await Tenant.find(
    { _id: { $in: tenantIds } },
    "company name",
  ).lean();
  return Object.fromEntries(
    tenants.map((t) => [t._id.toString(), t.company || t.name]),
  );
};

// ── GET /traffic ────────────────────────────────────────────────────────
export const getTrafficAnalytics = async (query = {}) => {
  const { window, tenantId } = query;
  const { now, since, windowSeconds, bucketMinutes } = resolveWindow(window);

  const baseMatch = { recordedAt: { $gte: since, $lte: now } };
  const tenantObjectId = tenantId ? toObjectId(tenantId) : null;
  if (tenantObjectId) baseMatch.tenantId = tenantObjectId;

  const [rpm, methods, byTenantAgg, topEndpoints, heatmap] = await Promise.all([
    RequestLog.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: {
            $dateTrunc: { date: "$recordedAt", unit: "minute", binSize: bucketMinutes },
          },
          count: { $sum: 1 },
          ok: { $sum: { $cond: [{ $lt: ["$statusCode", 400] }, 1, 0] } },
          fail: { $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, bucket: "$_id", count: 1, ok: 1, fail: 1 } },
    ]),

    RequestLog.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$method", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, method: "$_id", count: 1 } },
    ]),

    RequestLog.aggregate([
      { $match: baseMatch },
      { $group: { _id: "$tenantId", count: { $sum: 1 } } },
    ]),

    // topEndpoints — from EndpointMetric (per-interval endpoint aggregates)
    EndpointMetric.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: { endpoint: "$endpoint", method: "$method" },
          totalHits: { $sum: "$count" },
          avgLatency: { $avg: "$avgLatency" },
        },
      },
      { $sort: { totalHits: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          endpoint: "$_id.endpoint",
          method: "$_id.method",
          totalHits: 1,
          avgLatency: { $round: ["$avgLatency", 0] },
          rps: { $round: [{ $divide: ["$totalHits", windowSeconds] }, 3] },
        },
      },
    ]),

    // heatmap — day-of-week (1=Sunday..7=Saturday, per Mongo $dayOfWeek) x hour-of-day
    RequestLog.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: { day: { $dayOfWeek: "$recordedAt" }, hour: { $hour: "$recordedAt" } },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, day: "$_id.day", hour: "$_id.hour", count: 1 } },
      { $sort: { day: 1, hour: 1 } },
    ]),
  ]);

  const tenantIds = byTenantAgg.map((t) => t._id).filter(Boolean);
  const nameMap = await tenantNameMap(tenantIds);

  const byTenant = byTenantAgg.map((t) => ({
    tenantId: t._id?.toString() || null,
    tenantName: nameMap[t._id?.toString()] || "Unknown",
    rps: Math.round((t.count / windowSeconds) * 1000) / 1000,
  }));

  return { rpm, methods, byTenant, topEndpoints, heatmap };
};

// ── GET /errors ─────────────────────────────────────────────────────────
export const getErrorAnalytics = async (query = {}) => {
  const { window } = query;
  const { now, since } = resolveWindow(window);

  const baseMatch = { recordedAt: { $gte: since, $lte: now } };

  const [totalsAgg, breakdown, tenantMetricAgg] = await Promise.all([
    RequestLog.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          clientErrors: {
            $sum: {
              $cond: [
                { $and: [{ $gte: ["$statusCode", 400] }, { $lt: ["$statusCode", 500] }] },
                1,
                0,
              ],
            },
          },
          serverErrors: { $sum: { $cond: [{ $gte: ["$statusCode", 500] }, 1, 0] } },
        },
      },
    ]),

    RequestLog.aggregate([
      { $match: { ...baseMatch, statusCode: { $gte: 400 } } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                {
                  case: { $in: ["$statusCode", [404, 429, 500, 502, 503, 504]] },
                  then: { $toString: "$statusCode" },
                },
                {
                  case: {
                    $and: [{ $gte: ["$statusCode", 400] }, { $lt: ["$statusCode", 500] }],
                  },
                  then: "4xx",
                },
                { case: { $gte: ["$statusCode", 500] }, then: "5xx" },
              ],
              default: "other",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $project: { _id: 0, code: "$_id", count: 1 } },
    ]),

    TenantMetric.aggregate([
      { $match: { recordedAt: { $gte: since, $lte: now } } },
      { $group: { _id: "$tenantId", avgErrorRate: { $avg: "$errorRate" } } },
    ]),
  ]);

  const t = totalsAgg[0] || { total: 0, clientErrors: 0, serverErrors: 0 };
  const pct = (n) => (t.total > 0 ? Math.round((n / t.total) * 1000) / 10 : 0);

  const tenantIds = tenantMetricAgg.map((m) => m._id).filter(Boolean);
  const nameMap = await tenantNameMap(tenantIds);

  const byTenant = tenantMetricAgg
    .map((m) => ({
      tenantId: m._id?.toString() || null,
      tenantName: nameMap[m._id?.toString()] || "Unknown",
      errorRatePct: Math.round((m.avgErrorRate || 0) * 1000) / 10,
    }))
    .sort((a, b) => b.errorRatePct - a.errorRatePct);

  return {
    overallErrorRatePct: pct(t.clientErrors + t.serverErrors),
    serverErrorPct: pct(t.serverErrors),
    clientErrorPct: pct(t.clientErrors),
    breakdown,
    byTenant,
  };
};

// ── GET /slo ────────────────────────────────────────────────────────────
const withinRiskBand = (value, target, direction) =>
  direction === "min" ? value >= target * 0.8 : value <= target * 1.2;

export const getSloAnalytics = async (query = {}) => {
  const { apiId } = query;
  const targets = SLO_TARGETS;

  const filter = {};
  if (apiId) filter.apiId = apiId;

  const rawApis = await Api.find(filter, "apiId name stats").lean();

  const apis = rawApis.map((a) => {
    const uptimePct = a.stats?.uptime30d || 0;
    const avgLatencyMs = a.stats?.avgResponse30d || 0;
    // no dedicated error-rate field on Api.stats — approximate from uptime
    const errorRatePct = Math.round((100 - uptimePct) * 100) / 100;

    const met =
      uptimePct >= targets.uptimePct &&
      avgLatencyMs <= targets.latencyMs &&
      errorRatePct <= targets.errorRatePct;

    const risk =
      !met &&
      withinRiskBand(uptimePct, targets.uptimePct, "min") &&
      withinRiskBand(avgLatencyMs, targets.latencyMs, "max") &&
      withinRiskBand(errorRatePct, targets.errorRatePct, "max");

    const status = met ? "met" : risk ? "risk" : "breached";

    return { apiId: a.apiId, apiName: a.name, uptimePct, avgLatencyMs, errorRatePct, status };
  });

  return { targets, apis };
};

// ── GET /user-activity ──────────────────────────────────────────────────
export const getUserActivityAnalytics = async (query = {}) => {
  const { window } = query;
  const { now, since } = resolveWindow(window, "7d");

  const grouped = await RequestLog.aggregate([
    { $match: { recordedAt: { $gte: since, $lte: now } } },
    {
      $group: {
        _id: "$employeeId",
        tenantId: { $first: "$tenantId" },
        requestCount: { $sum: 1 },
        errorCount: { $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] } },
        avgLatency: { $avg: "$latency" },
        lastSeenAt: { $max: "$recordedAt" },
      },
    },
    { $sort: { requestCount: -1 } },
    { $limit: 200 },
  ]);

  const employeeIds = grouped.map((g) => g._id).filter(Boolean);
  const tenantIds = grouped.map((g) => g.tenantId).filter(Boolean);

  const [members, tenants] = await Promise.all([
    TeamMember.find({ _id: { $in: employeeIds } }, "name").lean(),
    Tenant.find({ _id: { $in: tenantIds } }, "company name").lean(),
  ]);

  const memberMap = Object.fromEntries(members.map((m) => [m._id.toString(), m.name]));
  const tenantMap = Object.fromEntries(
    tenants.map((t) => [t._id.toString(), t.company || t.name]),
  );

  const users = grouped.map((g) => ({
    employeeId: g._id?.toString() || null,
    name: memberMap[g._id?.toString()] || "Unknown",
    tenantId: g.tenantId?.toString() || null,
    tenantName: tenantMap[g.tenantId?.toString()] || "Unknown",
    requestCount: g.requestCount,
    errorCount: g.errorCount,
    avgLatency: Math.round((g.avgLatency || 0) * 100) / 100,
    lastSeenAt: g.lastSeenAt,
  }));

  return { users };
};

// ── GET /latency ────────────────────────────────────────────────────────
export const getLatencyAnalytics = async (query = {}) => {
  const {
    endpoint,
    method,
    tenantId,
    page = 1,
    limit = 20,
    sortBy = "recordedAt",
    sortOrder = "desc",
  } = query;

  const filter = {};
  if (endpoint) filter.endpoint = { $regex: endpoint, $options: "i" };
  if (method) filter.method = method;
  if (tenantId) {
    const tid = toObjectId(tenantId);
    if (tid) filter.tenantId = tid;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [total, records] = await Promise.all([
    EndpointMetric.countDocuments(filter),
    EndpointMetric.find(filter)
      .select("endpoint method tenantId p50 p95 p99 avgLatency recordedAt")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  const endpoints = records.map((r) => ({
    endpoint: r.endpoint,
    method: r.method,
    tenantId: r.tenantId?.toString() || null,
    p50: r.p50 ?? null,
    p95: r.p95 ?? null,
    p99: r.p99 ?? null,
    avgLatency: r.avgLatency ?? null,
  }));

  return {
    endpoints,
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
