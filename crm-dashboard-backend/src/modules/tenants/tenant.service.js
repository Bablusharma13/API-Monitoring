import mongoose, { Types } from "mongoose";
import Incident from "../incident/incident.model.js";
import { TenantMetric } from "./models/tenant-metric.model.js";
import { Tenant } from "./models/tenant.model.js";
import { EndpointMetric } from "./models/endpoint-metric.model.js";
import { RequestLog } from "./models/requset-log.model.js";

const deriveInitials = (company) => {
  const words = company.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words[0][0].toUpperCase();
};

const deriveStatus = (uptime30d, errorRate24h) => {
  if (uptime30d < 99 || errorRate24h > 5) return "critical";
  if (uptime30d < 99.9 || errorRate24h > 1) return "warning";
  return "healthy";
};

export const getTenantDetailsById = async (id) => {
  const [data, tenantMetric] = await Promise.all([
    await Tenant.findById(id),
    await TenantMetric.aggregate([
      {
        $match: {
          tenantId: new Types.ObjectId(id),
        },
      },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: "$totalRequests" },
          totalErrors: { $sum: "$totalErrors" },
          avgP95: { $avg: "$p95" },
          avgRequestsPerMinute: { $avg: "$totalRequests" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRequests: 1,
          totalErrors: 1,
          avgRequestsPerMinute: { $round: ["$avgRequestsPerMinute", 0] },
          avgP95: { $round: ["$avgP95", 0] },

          errorRate: {
            $cond: [
              { $eq: ["$totalRequests", 0] },
              0,
              {
                $multiply: [
                  { $divide: ["$totalErrors", "$totalRequests"] },
                  100,
                ],
              },
            ],
          },
        },
      },
    ]),
  ]);

  let teammembers = 0;

  if (data?.db_conn) {
    const conn = await mongoose.createConnection(data.db_conn).asPromise();

    try {
      teammembers = await conn.db.collection("teammembers").countDocuments();
    } finally {
      await conn.close();
    }
  }

  return { data, tenantMetric, teammembers };
};

export const getTenantEmployeesById = async (
  id,
  page = 1,
  limit = 10,
  search,
  sortBy,
  sortOrder,
) => {
  const tenant = await Tenant.findById(id);

  if (!tenant?.db_conn) {
    return {
      data: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }

  page = Math.max(1, Number(page) || 1);
  limit = Math.max(1, Number(limit) || 10);

  const conn = await mongoose.createConnection(tenant.db_conn).asPromise();

  try {
    const skip = (page - 1) * limit;

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { role: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
    }

    const [total, employees] = await Promise.all([
      conn.db.collection("teammembers").countDocuments(filter),
      conn.db
        .collection("teammembers")
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
    ]);

    return {
      data: employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } finally {
    await conn.close();
  }
};

export const getTenantEndpointMatricsById = async (
  id,
  page = 1,
  limit = 10,
  search,
  sortBy,
  sortOrder,
) => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.max(1, Number(limit) || 10);

  const skip = (page - 1) * limit;

  const match = { tenantId: new Types.ObjectId(id) };
  if (search) {
    match.$or = [
      { endpoint: { $regex: search, $options: "i" } },
      { method: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort.totalRequests = -1;
  }

  const [result] = await EndpointMetric.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          endpoint: "$endpoint",
          method: "$method",
        },
        totalRequests: { $sum: "$count" },
        totalErrors: { $sum: "$totalErrors" },
        avgCountPerMinute: { $avg: "$count" },
        p50: { $avg: "$p50" },
        p95: { $avg: "$p95" },
        p99: { $avg: "$p99" },
      },
    },
    {
      $project: {
        endpoint: "$_id.endpoint",
        method: "$_id.method",
        totalRequests: 1,
        totalErrors: 1,
        p50: { $round: ["$p50", 0] },
        p95: { $round: ["$p95", 0] },
        p99: { $round: ["$p99", 0] },
        avgRps: {
          $round: [{ $divide: ["$avgCountPerMinute", 60] }, 2],
        },
        errorRate: {
          $round: [
            {
              $cond: [
                { $eq: ["$totalRequests", 0] },
                0,
                {
                  $multiply: [
                    { $divide: ["$totalErrors", "$totalRequests"] },
                    100,
                  ],
                },
              ],
            },
            2,
          ],
        },
        status: {
          $cond: [{ $gt: ["$p95", 3000] }, "slow", "normal"],
        },
      },
    },
    { $sort: sort },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        metadata: [{ $count: "total" }],
      },
    },
  ]);

  const total = result?.metadata?.[0]?.total || 0;

  return {
    data: result?.data || [],
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

export const getAllRequestLogs = async (
  page = 1,
  limit = 10,
  search,
  sortBy,
  sortOrder,
) => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.max(1, Number(limit) || 10);

  const skip = (page - 1) * limit;

  const filter = {};

  if (search) {
    filter.$or = [
      { endpoint: { $regex: search, $options: "i" } },
      { method: { $regex: search, $options: "i" } },
      { ip: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const [data, total, summary, totalAllTime] = await Promise.all([
    RequestLog.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("tenantId", "company name")
      .populate("employeeId", "name")
      .lean(),
    RequestLog.countDocuments(filter),
    RequestLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgLatency: { $avg: "$latency" },
          errorRequests: {
            $sum: { $cond: [{ $gte: ["$statusCode", 400] }, 1, 0] },
          },
          totalFiltered: { $sum: 1 },
        },
      },
    ]),
    RequestLog.countDocuments({}),
  ]);

  const stats = {
    totalRequestsAllTime: totalAllTime,
    avgLatency: summary[0]?.avgLatency ?? null,
    errorRate:
      summary[0]?.totalFiltered
        ? ((summary[0].errorRequests / summary[0].totalFiltered) * 100).toFixed(2)
        : null,
    errorRequests: summary[0]?.errorRequests ?? 0,
  };

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
    stats,
  };
};

export const getTenantRequestLogs = async (
  id,
  page = 1,
  limit = 10,
  search,
  sortBy,
  sortOrder,
) => {
  page = Math.max(1, Number(page) || 1);
  limit = Math.max(1, Number(limit) || 10);

  const skip = (page - 1) * limit;

  const filter = { tenantId: id };

  if (search) {
    filter.$or = [
      { endpoint: { $regex: search, $options: "i" } },
      { method: { $regex: search, $options: "i" } },
      { ip: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }

  const [data, total] = await Promise.all([
    RequestLog.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    RequestLog.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
};

export const getTenantEmployeeDetailsById = async (id, eid) => {
  const tenant = await Tenant.findById(id);

  let employee;
  if (tenant?.db_conn) {
    const conn = await mongoose.createConnection(tenant.db_conn).asPromise();

    try {
      employee = await conn.db.collection("teammembers").findOne({
        _id: new Types.ObjectId(eid),
      });
    } finally {
      await conn.close();
    }
  }

  return { employee, tenant };
};

const COMPUTED_SORT_FIELDS = ["totalRequests", "errorRate", "uptime", "status"];

const enrichTenant = (tenant, map24h, map30d) => {
  const key = tenant._id.toString();
  const m24 = map24h[key] || {};
  const m30 = map30d[key] || { totalRequests: 0, totalErrors: 0 };

  const totalRequests = m30.totalRequests || m24.totalRequests || 0;

  const uptime30d =
    m30.totalRequests > 0
      ? Number(
          (
            ((m30.totalRequests - m30.totalErrors) / m30.totalRequests) *
            100
          ).toFixed(2),
        )
      : 100;

  const errorRate24h = Number(((m24.errorRate ?? 0) * 100).toFixed(1));

  return {
    _id: key,
    initials: deriveInitials(tenant.company),
    company: tenant.company,
    totalRequests,
    errorRate: errorRate24h,
    uptime: uptime30d,
    status: deriveStatus(uptime30d, errorRate24h),
  };
};

export const getTenantDashboardSummary = async (
  page = 1,
  limit = 10,
  search,
  sortBy,
  sortOrder,
) => {
  const now = new Date();
  const since24h = new Date(now - 24 * 60 * 60 * 1000);
  const since30d = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const skip = page * limit;

  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
          { business_email: { $regex: search, $options: "i" } },
          { tenant_unique_name: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const [summary, metrics24h, metrics30d] = await Promise.all([
    RequestLog.aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          avgLatency: { $avg: "$latency" },
          firstRequest: { $min: "$recordedAt" },
          lastRequest: { $max: "$recordedAt" },
        },
      },
      {
        $project: {
          _id: 0,
          totalRequests: 1,
          avgLatency: 1,
          durationMinutes: {
            $divide: [
              { $subtract: ["$lastRequest", "$firstRequest"] },
              1000 * 60,
            ],
          },
        },
      },
      {
        $project: {
          totalRequests: 1,
          avgLatency: 1,
          rpm: {
            $cond: [
              { $gt: ["$durationMinutes", 0] },
              { $divide: ["$totalRequests", "$durationMinutes"] },
              "$totalRequests",
            ],
          },
        },
      },
    ]),

    TenantMetric.aggregate([
      {
        $match: { recordedAt: { $gte: since24h } },
      },
      {
        $group: {
          _id: "$tenantId",
          totalRequests: { $sum: "$totalRequests" },
          errorRate: { $avg: "$errorRate" },
          p95: { $avg: "$p95" },
        },
      },
    ]),

    TenantMetric.aggregate([
      {
        $match: { recordedAt: { $gte: since30d } },
      },
      {
        $group: {
          _id: "$tenantId",
          totalRequests: { $sum: "$totalRequests" },
          totalErrors: { $sum: "$totalErrors" },
        },
      },
    ]),
  ]);

  const map24h = Object.fromEntries(
    metrics24h.map((m) => [m._id.toString(), m]),
  );

  const map30d = Object.fromEntries(
    metrics30d.map((m) => [m._id.toString(), m]),
  );

  const isComputedSort = sortBy && COMPUTED_SORT_FIELDS.includes(sortBy);
  const dir = sortOrder === "desc" ? -1 : 1;

  let tenantsData;
  let totalTenants;

  if (isComputedSort) {
    const allTenants = await Tenant.find(filter, "name company").lean();
    totalTenants = allTenants.length;

    const enriched = allTenants.map((t) => enrichTenant(t, map24h, map30d));

    enriched.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return -1 * dir;
      if (a[sortBy] > b[sortBy]) return 1 * dir;
      return 0;
    });

    tenantsData = enriched.slice(skip, skip + limit);
  } else {
    const sort = {};
    if (sortBy) {
      sort[sortBy] = dir;
    }

    const [tenants, total] = await Promise.all([
      Tenant.find(filter, "name company")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Tenant.countDocuments(filter),
    ]);

    totalTenants = total;
    tenantsData = tenants.map((t) => enrichTenant(t, map24h, map30d));
  }

  return {
    summary: summary[0] || {
      totalRequests: 0,
      avgLatency: 0,
      rpm: 0,
    },
    tenants: tenantsData,
    pagination: {
      page,
      limit,
      total: totalTenants,
      totalPages: Math.ceil(totalTenants / limit),
      hasNext: page * limit < totalTenants,
      hasPrev: page > 1,
    },
  };
};

export const getAllEndpointsExplorer = async (
  page = 1,
  limit = 20,
  search,
  sortBy,
  sortOrder,
) => {
  const skip = (page - 1) * limit;

  const match = search
    ? {
        $or: [
          { endpoint: { $regex: search, $options: "i" } },
          { method: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const SORT_FIELD_MAP = {
    lat: "avgLatency",
    rps: "totalHits",
  };

  const sortField = SORT_FIELD_MAP[sortBy] || sortBy || "totalHits";
  const sort = {};
  sort[sortField] = sortOrder === "desc" ? -1 : 1;

  const pipeline = [];

  if (Object.keys(match).length) {
    pipeline.push({ $match: match });
  }

  pipeline.push(
    {
      $group: {
        _id: {
          endpoint: "$endpoint",
          method: "$method",
        },
        avgLatency: { $avg: "$avgLatency" },
        p50: { $avg: "$p50" },
        p95: { $avg: "$p95" },
        p99: { $avg: "$p99" },
        errorRate: { $avg: "$errorRate" },
        totalHits: { $sum: "$count" },
      },
    },
    {
      $project: {
        _id: 0,
        endpoint: "$_id.endpoint",
        method: "$_id.method",
        avgLatency: { $round: ["$avgLatency", 2] },
        p50: { $round: ["$p50", 2] },
        p95: { $round: ["$p95", 2] },
        p99: { $round: ["$p99", 2] },
        errorRate: { $round: ["$errorRate", 2] },
        totalHits: 1,
      },
    },
    {
      $facet: {
        data: [
          { $sort: sort },
          { $skip: Number(skip) },
          { $limit: Number(limit) },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  );

  const [result] = await EndpointMetric.aggregate(pipeline);

  const total = result.totalCount[0]?.count || 0;

  return {
    data: result.data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getEndpointSummaryByMethod = async (endpoint, method) => {
  const summary = await EndpointMetric.aggregate([
    {
      $match: {
        endpoint,
        method,
      },
    },
    {
      $group: {
        _id: null,

        avgP95: { $avg: "$p95" },

        totalRequests: { $sum: "$count" },

        totalErrors: { $sum: "$totalErrors" },

        avgRequestsPerMinute: { $avg: "$count" },

        totalMinutes: { $sum: 1 },
        lastCalled: { $max: "$recordedAt" },
      },
    },
    {
      $project: {
        _id: 0,

        latency: {
          $round: ["$avgP95", 0],
        },

        totalRequests: 1,

        totalErrors: 1,

        requestPerMinute: {
          $round: ["$avgRequestsPerMinute", 0],
        },
        lastCalled: 1,

        errorRate: {
          $round: [
            {
              $cond: [
                { $eq: ["$totalRequests", 0] },
                0,
                {
                  $multiply: [
                    {
                      $divide: ["$totalErrors", "$totalRequests"],
                    },
                    100,
                  ],
                },
              ],
            },
            2,
          ],
        },
      },
    },
  ]);

  return summary;
};

export const getEndpointTenantMetricsByMethod = async (
  endpoint,
  method,
  query = {},
) => {
  const {
    page = 1,
    limit = 20,
    sortBy = "rps",
    sortOrder = "desc",
    search = "",
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const pipeline = [
    { $match: { endpoint, method } },
    {
      $group: {
        _id: "$tenantId",
        avgCount: { $avg: "$count" },
        p95: { $avg: "$p95" },
        p99: { $avg: "$p99" },
        totalErrors: { $sum: "$totalErrors" },
        totalRequests: { $sum: "$count" },
      },
    },
    {
      $lookup: {
        from: "tenants",
        localField: "_id",
        foreignField: "_id",
        as: "tenant",
      },
    },
    { $unwind: "$tenant" },
  ];

  if (search) {
    pipeline.push({
      $match: { "tenant.company": { $regex: search, $options: "i" } },
    });
  }

  pipeline.push(
    {
      $project: {
        tenantName: "$tenant.company",
        rps: { $round: [{ $divide: ["$avgCount", 60] }, 2] },
        p95: { $round: ["$p95", 0] },
        p99: { $round: ["$p99", 0] },
        errorRate: {
          $round: [
            {
              $cond: [
                { $eq: ["$totalRequests", 0] },
                0,
                {
                  $multiply: [
                    { $divide: ["$totalErrors", "$totalRequests"] },
                    100,
                  ],
                },
              ],
            },
            2,
          ],
        },
      },
    },
    {
      $sort: {
        [["tenantName", "rps", "p95", "p99", "errorRate"].includes(sortBy)
          ? sortBy
          : "rps"]: sortOrder === "asc" ? 1 : -1,
      },
    },
    {
      $facet: {
        data: [{ $skip: Number(skip) }, { $limit: Number(limit) }],
        total: [{ $count: "count" }],
      },
    },
  );

  const [result] = await EndpointMetric.aggregate(pipeline);
  const total = result.total[0]?.count || 0;

  return {
    data: result.data,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      hasNextPage: Number(page) * Number(limit) < total,
      hasPrevPage: Number(page) > 1,
    },
  };
};

export const getTenantEmployeeMetricsById = async (
  id,
  eid,
  page = 0,
  limit = 20,
  search,
  sortBy,
  sortOrder,
) => {
  const skip = page * limit;

  const match = {
    tenantId: new Types.ObjectId(id),
    employeeId: new Types.ObjectId(eid),
  };

  if (search) {
    match.$or = [
      { endpoint: { $regex: search, $options: "i" } },
      { method: { $regex: search, $options: "i" } },
    ];
  }

  const logsSort = {};
  if (sortBy) {
    logsSort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    logsSort.recordedAt = -1;
  }

  const [result] = await RequestLog.aggregate([
    { $match: match },
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalApiCalls: { $sum: 1 },
              avgLatency: { $avg: "$latency" },
              errorCount: {
                $sum: {
                  $cond: [{ $gte: ["$statusCode", 400] }, 1, 0],
                },
              },
              successCount: {
                $sum: {
                  $cond: [{ $lt: ["$statusCode", 400] }, 1, 0],
                },
              },
            },
          },
          {
            $project: {
              _id: 0,
              totalApiCalls: 1,
              avgLatency: { $round: ["$avgLatency", 2] },
              errorCount: 1,
              successCount: 1,
              errorRate: {
                $cond: [
                  { $eq: ["$totalApiCalls", 0] },
                  0,
                  {
                    $round: [
                      {
                        $multiply: [
                          {
                            $divide: ["$errorCount", "$totalApiCalls"],
                          },
                          100,
                        ],
                      },
                      2,
                    ],
                  },
                ],
              },
            },
          },
        ],

        logs: [
          { $sort: logsSort },
          { $skip: Number(skip) },
          { $limit: Number(limit) },
        ],

        totalCount: [{ $count: "count" }],
      },
    },
  ]);

  return {
    summary: result.summary[0] || {
      totalApiCalls: 0,
      avgLatency: 0,
      errorCount: 0,
      successCount: 0,
      errorRate: 0,
    },
    logs: result.logs,
    pagination: {
      page,
      limit,
      total: result.totalCount[0]?.count || 0,
      pages: Math.ceil((result.totalCount[0]?.count || 0) / limit),
    },
  };
};

export const getTenantsSummary = async () => {
  const now = new Date();
  const since24h = new Date(now - 24 * 60 * 60 * 1000);
  const since30d = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const tenants = await Tenant.find({}, "_id").lean();
  const total = tenants.length;

  const counts = { total, healthy: 0, warning: 0, critical: 0, noData: 0 };

  if (total === 0) return counts;

  const tenantIds = tenants.map((t) => t._id);

  const [metrics24h, metrics30d] = await Promise.all([
    TenantMetric.aggregate([
      {
        $match: {
          tenantId: { $in: tenantIds },
          recordedAt: { $gte: since24h },
        },
      },
      {
        $group: {
          _id: "$tenantId",
          errorRate: { $avg: "$errorRate" },
        },
      },
    ]),

    TenantMetric.aggregate([
      {
        $match: {
          tenantId: { $in: tenantIds },
          recordedAt: { $gte: since30d },
        },
      },
      {
        $group: {
          _id: "$tenantId",
          totalRequests: { $sum: "$totalRequests" },
          totalErrors: { $sum: "$totalErrors" },
        },
      },
    ]),
  ]);

  const map24h = Object.fromEntries(
    metrics24h.map((m) => [m._id.toString(), m]),
  );
  const map30d = Object.fromEntries(
    metrics30d.map((m) => [m._id.toString(), m]),
  );

  for (const tenant of tenants) {
    const key = tenant._id.toString();
    const m30 = map30d[key];

    // No TenantMetric records in the last 30 days — can't classify status.
    if (!m30 || !m30.totalRequests) {
      counts.noData += 1;
      continue;
    }

    const m24 = map24h[key] || {};

    const uptime30d = Number(
      (((m30.totalRequests - m30.totalErrors) / m30.totalRequests) * 100).toFixed(2),
    );
    const errorRate24h = Number(((m24.errorRate ?? 0) * 100).toFixed(1));

    const status = deriveStatus(uptime30d, errorRate24h);
    counts[status] += 1;
  }

  return counts;
};

const PLAN_QUOTAS = {
  starter: 100000,
  business: 1000000,
  enterprise: 10000000,
};

export const getQuotaUsage = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const tenants = await Tenant.find({}, "name company plan quota").lean();
  if (!tenants.length) return [];

  const tenantIds = tenants.map((t) => t._id);

  const usage = await TenantMetric.aggregate([
    {
      $match: {
        tenantId: { $in: tenantIds },
        recordedAt: { $gte: startOfMonth, $lt: startOfNextMonth },
      },
    },
    {
      $group: {
        _id: "$tenantId",
        usedThisMonth: { $sum: "$totalRequests" },
      },
    },
  ]);

  const usageMap = Object.fromEntries(
    usage.map((u) => [u._id.toString(), u.usedThisMonth]),
  );

  return tenants.map((tenant) => {
    const key = tenant._id.toString();
    const usedThisMonth = usageMap[key] || 0;
    const monthCap = tenant.quota?.requestsPerMonth ?? PLAN_QUOTAS[tenant.plan];

    return {
      tenantId: tenant._id,
      tenantName: tenant.company || tenant.name,
      plan: tenant.plan,
      monthCap,
      usedThisMonth,
      usedPct: monthCap
        ? Number(((usedThisMonth / monthCap) * 100).toFixed(2))
        : null,
      rateLimitPerMinute: tenant.quota?.rateLimitPerMinute ?? null,
    };
  });
};

export const getFleetSummary = async () => {
  const now = new Date();
  const since24h = new Date(now - 24 * 60 * 60 * 1000);
  const since30d = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [fleet24h, fleet30h, perTenant24h, perTenant30d, openAlerts] =
    await Promise.all([
      TenantMetric.aggregate([
        { $match: { recordedAt: { $gte: since24h } } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: "$totalRequests" },
            totalErrors: { $sum: "$totalErrors" },
            avgP95: { $avg: "$p95" },
          },
        },
      ]),

      TenantMetric.aggregate([
        { $match: { recordedAt: { $gte: since30d } } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: "$totalRequests" },
            totalErrors: { $sum: "$totalErrors" },
          },
        },
      ]),

      TenantMetric.aggregate([
        { $match: { recordedAt: { $gte: since24h } } },
        {
          $group: {
            _id: "$tenantId",
            avgRps: { $avg: "$rps" },
            avgP95: { $avg: "$p95" },
            avgErrorRate: { $avg: "$errorRate" },
          },
        },
      ]),

      TenantMetric.aggregate([
        { $match: { recordedAt: { $gte: since30d } } },
        {
          $group: {
            _id: "$tenantId",
            totalRequests: { $sum: "$totalRequests" },
            totalErrors: { $sum: "$totalErrors" },
          },
        },
        {
          $project: {
            uptime: {
              $cond: [
                { $gt: ["$totalRequests", 0] },
                {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: ["$totalRequests", "$totalErrors"] },
                        "$totalRequests",
                      ],
                    },
                    100,
                  ],
                },
                100,
              ],
            },
          },
        },
        { $sort: { uptime: -1 } },
        { $limit: 1 },
      ]),

      Incident.countDocuments({ status: "ongoing" }),
    ]);

  const s24 = fleet24h[0] || { totalRequests: 0, totalErrors: 0, avgP95: 0 };
  const s30 = fleet30h[0] || { totalRequests: 0, totalErrors: 0 };

  const avgUptime30d =
    s30.totalRequests > 0
      ? parseFloat(
          (
            ((s30.totalRequests - s30.totalErrors) / s30.totalRequests) *
            100
          ).toFixed(2),
        )
      : 100;

  const tenantIds = perTenant24h.map((t) => t._id);
  if (perTenant30d[0]) tenantIds.push(perTenant30d[0]._id);

  const tenants = await Tenant.find(
    { _id: { $in: tenantIds } },
    "name company",
  ).lean();
  const tenantMap = Object.fromEntries(
    tenants.map((t) => [t._id.toString(), t.company || t.name]),
  );

  const highestTraffic = [...perTenant24h].sort(
    (a, b) => b.avgRps - a.avgRps,
  )[0];
  const worstLatency = [...perTenant24h].sort(
    (a, b) => (b.avgP95 ?? 0) - (a.avgP95 ?? 0),
  )[0];
  const highestErrorRate = [...perTenant24h].sort(
    (a, b) => b.avgErrorRate - a.avgErrorRate,
  )[0];
  const bestUptime = perTenant30d[0];

  const trafficByTenant = [...perTenant24h]
    .sort((a, b) => b.avgRps - a.avgRps)
    .map((t) => ({
      name: tenantMap[t._id?.toString()] ?? "Unknown",
      rps: Math.round(t.avgRps),
      errorPct: parseFloat((t.avgErrorRate * 100).toFixed(1)),
    }));

  return {
    summary: {
      window: "24h",
      totalRequests: s24.totalRequests,
      totalErrors: s24.totalErrors,
      avgP95Latency: Math.round(s24.avgP95 ?? 0),
      avgUptime30d,
    },
    quickStats: {
      highestTraffic: highestTraffic
        ? {
            name: tenantMap[highestTraffic._id?.toString()] ?? "Unknown",
            rps: Math.round(highestTraffic.avgRps),
          }
        : null,
      worstLatency: worstLatency
        ? {
            name: tenantMap[worstLatency._id?.toString()] ?? "Unknown",
            p95ms: Math.round(worstLatency.avgP95 ?? 0),
          }
        : null,
      highestErrorRate: highestErrorRate
        ? {
            name: tenantMap[highestErrorRate._id?.toString()] ?? "Unknown",
            errorRate: parseFloat(
              (highestErrorRate.avgErrorRate * 100).toFixed(1),
            ),
          }
        : null,
      bestUptime: bestUptime
        ? {
            name: tenantMap[bestUptime._id?.toString()] ?? "Unknown",
            uptime: parseFloat(bestUptime.uptime.toFixed(2)),
          }
        : null,
      openAlerts,
    },
    trafficByTenant,
  };
};

export const updateTenantOrigin = async (id, origin) => {
  if (!Array.isArray(origin) || origin.length === 0) {
    throw new Error("origin must be a non-empty array");
  }
  return Tenant.findByIdAndUpdate(id, { origin }, { new: true }).lean();
};

export const getTenantCards = async ({
  page = 1,
  limit = 20,
  status,
  plan,
  search,
  sort = "company",
} = {}) => {
  const now = new Date();
  const since24h = new Date(now - 24 * 60 * 60 * 1000);
  const since30d = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const tenantFilter = {};
  if (plan) tenantFilter.plan = plan;
  if (search)
    tenantFilter.$or = [
      { company: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
    ];

  const tenants = await Tenant.find(
    tenantFilter,
    "name company plan userCount",
  ).lean();
  if (!tenants.length)
    return { tenants: [], total: 0, page: Number(page), limit: Number(limit) };

  const tenantIds = tenants.map((t) => t._id);

  const [metrics24h, metrics30d] = await Promise.all([
    TenantMetric.aggregate([
      {
        $match: {
          tenantId: { $in: tenantIds },
          recordedAt: { $gte: since24h },
        },
      },
      {
        $group: {
          _id: "$tenantId",
          rps: { $avg: "$rps" },
          p95: { $avg: "$p95" },
          errorRate: { $avg: "$errorRate" },
          cpuPct: { $avg: "$cpuPct" },
        },
      },
    ]),

    TenantMetric.aggregate([
      {
        $match: {
          tenantId: { $in: tenantIds },
          recordedAt: { $gte: since30d },
        },
      },
      {
        $group: {
          _id: "$tenantId",
          totalRequests: { $sum: "$totalRequests" },
          totalErrors: { $sum: "$totalErrors" },
        },
      },
    ]),
  ]);

  const map24h = Object.fromEntries(
    metrics24h.map((m) => [m._id.toString(), m]),
  );
  const map30d = Object.fromEntries(
    metrics30d.map((m) => [m._id.toString(), m]),
  );

  let cards = tenants.map((tenant) => {
    const key = tenant._id.toString();
    const m24 = map24h[key] || {};
    const m30 = map30d[key] || { totalRequests: 0, totalErrors: 0 };

    const uptime30d =
      m30.totalRequests > 0
        ? parseFloat(
            (
              ((m30.totalRequests - m30.totalErrors) / m30.totalRequests) *
              100
            ).toFixed(2),
          )
        : 100;

    const errorRate24h = parseFloat(((m24.errorRate ?? 0) * 100).toFixed(1));

    return {
      id: tenant._id,
      initials: deriveInitials(tenant.company),
      company: tenant.company,
      name: tenant.name,
      plan: tenant.plan,
      userCount: tenant.userCount ?? 0,
      status: deriveStatus(uptime30d, errorRate24h),
      metrics: {
        rps: Math.round(m24.rps ?? 0),
        p95ms: Math.round(m24.p95 ?? 0),
        errorRate: errorRate24h,
        cpuPct: parseFloat((m24.cpuPct ?? 0).toFixed(1)),
        uptime30d,
      },
    };
  });

  if (status) cards = cards.filter((c) => c.status === status);

  const sortFns = {
    company: (a, b) => a.company.localeCompare(b.company),
    uptime: (a, b) => b.metrics.uptime30d - a.metrics.uptime30d,
    rps: (a, b) => b.metrics.rps - a.metrics.rps,
    errorRate: (a, b) => b.metrics.errorRate - a.metrics.errorRate,
    latency: (a, b) => b.metrics.p95ms - a.metrics.p95ms,
    cpu: (a, b) => b.metrics.cpuPct - a.metrics.cpuPct,
  };
  cards.sort(sortFns[sort] ?? sortFns.company);

  const total = cards.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginated = cards.slice(skip, skip + Number(limit));

  return {
    tenants: paginated,
    total,
    page: Number(page),
    limit: Number(limit),
  };
};
