import { Worker } from "bullmq";
import axios from "axios";
import dayjs from "dayjs";
import { redis } from "../../shared/redis.js";
import apiModel from "../apis/api.model.js";
import checkModel from "../check/check.model.js";
import { handleStatusChange } from "./monitor.service.js";
import { syncCategoryStats } from "../categories/category.service.js";
import { evaluateMetricAlerts } from "../alerts/alert.service.js";
import { getRetentionDays } from "../retention/retention.service.js";

export const startMonitorWorker = () => {
  const worker = new Worker(
    "api-monitor",
    async (job) => {
      const { apiId } = job.data;
      const api = await apiModel.findById(apiId).populate("owner");

      if (!api || !api.monitoring.enabled) {
        console.log(`job for api ${apiId} not found or skipped`);
        return { skipped: true };
      }

      console.log(`Checking ${api.name}...`);

      // ── ping the API ────────────────────
      const start = Date.now();
      let result;

      try {
        const headers = api.request.headers
          ? Object.fromEntries(api.request.headers)
          : {};

        if (api.auth?.method === "Bearer" && api.auth?.token) {
          headers["Authorization"] = `Bearer ${api.auth.token}`;
        }

        const response = await axios({
          method: api.request.method,
          url: api.request.url,
          headers,
          data: api.request.body
            ? typeof api.request.body === "string"
              ? JSON.parse(api.request.body)
              : api.request.body
            : undefined,
          timeout: api.monitoring.timeout || 30000,
        });

        result = {
          success: true,
          statusCode: response.status,
          responseTime: Date.now() - start,
          message: `${api.request.method} ${new URL(api.request.url).pathname} — ${response.status} OK`,
        };
      } catch (err) {
        result = {
          success: false,
          statusCode: err.response?.status || null,
          responseTime: Date.now() - start,
          message: err.message,
          error: err.message,
          errorCode: err.code || null,
        };
      }

      // ── compute new status ───────────────
      const newStatus = computeStatus(result, api);
      const previousStatus = api.status.current;

      const [, statsResult] = await Promise.all([
        writeCheck(api, result, newStatus),
        //NOTE: need to add this
        // writeLog(api, result),
        updateApiStats(api, result, newStatus),
      ]);

      if (api.category) {
        await syncCategoryStats(api.category);
      }

      // ── metric-based alert rules (latency / error-rate) ──
      try {
        const stats24h = statsResult?.stats24h;
        await evaluateMetricAlerts(api, {
          responseTimeMs: result.responseTime,
          errorRatePct: 100 - (stats24h?.uptime ?? 100),
        });
      } catch (e) {
        console.error(`evaluateMetricAlerts failed for ${api.name}:`, e.message);
      }

      // ── handle status change ─────────────
      if (previousStatus !== newStatus) {
        await handleStatusChange(api, previousStatus, newStatus, result);
      }

      console.log(`${api.name} — ${newStatus} — ${result.responseTime}ms`);
      return { status: newStatus, responseTime: result.responseTime };
    },
    {
      connection: redis,
      concurrency: 5,
    },
  );

  // ── worker events ────────────────────────
  worker.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed:`, result);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("Worker error:", err);
  });

  console.log("Monitor worker started");
  return worker;
};

const computeStatus = (result, api) => {
  if (!result.success) return "down";
  if (result.statusCode !== (api.monitoring.expectedStatus || 200))
    return "warning";
  if (result.responseTime > api.monitoring.timeout) return "warning";
  return "active";
};

const getCheckStatus = (newStatus, result) => {
  if (newStatus === "active") return "ok";
  if (newStatus === "warning") return "warn";
  const errorCode = result?.errorCode;
  if (errorCode === "ECONNABORTED" || errorCode === "ETIMEDOUT") return "timeout";
  return "error";
};

const writeCheck = async (api, result, newStatus) => {
  try {
    let retentionDays = 90;
    try {
      const days = await getRetentionDays("check_retention_days");
      if (typeof days === "number" && days > 0) retentionDays = days;
    } catch (e) {
      console.error(
        "getRetentionDays failed, falling back to 90 days:",
        e.message,
      );
    }

    await checkModel.create({
      api: api._id,
      apiName: api.name,
      checkedAt: new Date(),
      status: getCheckStatus(newStatus, result),
      statusCode: result.statusCode,
      responseTime: result.responseTime,
      message: result.message,
      error: result.error || null,
      expiresAt: dayjs().add(retentionDays, "days").toDate(),
    });
  } catch (e) {
    console.log("error", e.stack);
  }
};

const updateApiStats = async (api, result, newStatus) => {
  try {
    const now = new Date();

    const windows = {
      "24h": new Date(now - 24 * 60 * 60 * 1000),
      "7d": new Date(now - 7 * 24 * 60 * 60 * 1000),
      "30d": new Date(now - 30 * 24 * 60 * 60 * 1000),
    };

    // ✅ Fetch only last 30 days (max needed)
    const checks = await checkModel
      .find({
        api: api._id,
        checkedAt: { $gte: windows["30d"] },
      })
      .lean();

    // 🧠 helper to calculate stats
    const calc = (data) => {
      if (!data.length) return { uptime: 0, avgResponse: 0 };

      const success = data.filter((c) => c.status === "ok").length;
      const uptime = (success / data.length) * 100;

      const times = data.filter((c) => c.responseTime);
      const avgResponse = times.length
        ? times.reduce((s, c) => s + c.responseTime, 0) / times.length
        : 0;

      return {
        uptime: Math.round(uptime * 10) / 10,
        avgResponse: Math.round(avgResponse),
      };
    };

    // ✅ Calculate per window
    const stats24h = calc(checks.filter((c) => c.checkedAt >= windows["24h"]));

    const stats7d = calc(checks.filter((c) => c.checkedAt >= windows["7d"]));

    const stats30d = calc(checks);

    // ✅ Update API
    await apiModel.findByIdAndUpdate(api._id, {
      "status.current": newStatus,
      "status.lastStatusCode": result.statusCode,
      "status.lastResponseTime": result.responseTime,
      "status.lastCheckedAt": now,
      "monitoring.lastCheckedAt": now,

      "stats.uptime24h": stats24h.uptime,
      "stats.avgResponse24h": stats24h.avgResponse,

      "stats.uptime7d": stats7d.uptime,
      "stats.avgResponse7d": stats7d.avgResponse,

      "stats.uptime30d": stats30d.uptime,
      "stats.avgResponse30d": stats30d.avgResponse,
    });

    return { stats24h };
  } catch (e) {
    console.log("error", e.stack);
  }
};
