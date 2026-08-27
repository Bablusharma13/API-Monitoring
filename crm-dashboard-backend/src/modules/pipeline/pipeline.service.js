import mongoose from "mongoose";
import { monitorQueue, cronSchedulerQueue } from "../../shared/queue.js";

// Actual MongoDB collection names (mongoose default pluralization, confirmed
// against each model's mongoose.model(...) call):
//   check.model.js        -> mongoose.model("CRM_Check", ...)     -> "crm_checks"
//   cron-job.model.js     -> mongoose.model("CRM_CronJob", ...)   -> "crm_cronjobs"
//   ping.model.js         -> mongoose.model("CRM_CronPing", ..., "crm_cron_pings") (explicit)
//   tenant-metric.model.js-> mongoose.model("TenantMetric", ...)  -> "tenantmetrics"
//   endpoint-metric.model.js -> mongoose.model("EndpointMetric", ...) -> "endpointmetrics"
//   requset-log.model.js  -> mongoose.model("RequestLog", ...)    -> "requestlogs"
const MONITORED_COLLECTIONS = [
  "crm_checks",
  "crm_cronjobs",
  "crm_cron_pings",
  "tenantmetrics",
  "endpointmetrics",
  "requestlogs",
];

export const getPipelineStats = async () => {
  const [monitorCounts, cronCounts, monitorFailed, cronFailed] =
    await Promise.all([
      monitorQueue.getJobCounts(),
      cronSchedulerQueue.getJobCounts(),
      monitorQueue.getFailed(0, 20),
      cronSchedulerQueue.getFailed(0, 20),
    ]);

  return {
    queues: [
      { name: "api-monitor", ...monitorCounts },
      { name: "cron-scheduler", ...cronCounts },
    ],
    deadLetter: [
      ...monitorFailed.map((j) => ({
        id: j.id,
        name: j.name,
        queue: "api-monitor",
        failedReason: j.failedReason,
        attemptsMade: j.attemptsMade,
        timestamp: j.timestamp,
      })),
      ...cronFailed.map((j) => ({
        id: j.id,
        name: j.name,
        queue: "cron-scheduler",
        failedReason: j.failedReason,
        attemptsMade: j.attemptsMade,
        timestamp: j.timestamp,
      })),
    ],
    fetchedAt: new Date(),
  };
};

const getCollectionStats = async (db, name) => {
  const result = await db
    .collection(name)
    .aggregate([{ $collStats: { storageStats: {} } }])
    .toArray();

  const stats = result?.[0]?.storageStats || {};

  return {
    name,
    count: stats.count ?? 0,
    storageSize: stats.storageSize ?? 0,
    avgObjSize: stats.avgObjSize ?? 0,
    totalIndexSize: stats.totalIndexSize ?? 0,
  };
};

export const getStorageStats = async () => {
  const db = mongoose.connection.db;

  const dbStats = await db.stats();

  const collections = [];
  for (const name of MONITORED_COLLECTIONS) {
    try {
      collections.push(await getCollectionStats(db, name));
    } catch (error) {
      // Skip collections that don't exist / were renamed / errored out —
      // one bad collection should never break the whole endpoint.
      continue;
    }
  }

  return {
    db: {
      dataSize: dbStats.dataSize ?? 0,
      storageSize: dbStats.storageSize ?? 0,
      indexSize: dbStats.indexSize ?? 0,
      collectionsCount: dbStats.collections ?? 0,
    },
    collections,
  };
};
