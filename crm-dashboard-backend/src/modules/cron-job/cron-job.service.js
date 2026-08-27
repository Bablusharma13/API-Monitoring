import { CronExpressionParser } from "cron-parser";
import dayjs from "dayjs";
import crypto from "crypto";
import CronJob from "./cron-job.model.js";
import Ping from "./ping.model.js";
import { cronSchedulerQueue } from "../../shared/queue.js";

const PING_BASE_URL =
  process.env.PING_BASE_URL || `http://localhost:${process.env.PORT || 8081}`;

const generateSlug = () => crypto.randomBytes(4).toString("hex");
const generateRunId = () => `run_${crypto.randomBytes(3).toString("hex")}`;

const parseCron = (expression, from = new Date()) => {
  try {
    return CronExpressionParser.parse(expression, {
      currentDate: from,
      tz: "UTC",
    });
  } catch {
    return null;
  }
};

const getNextCronTime = (expression, from = new Date()) => {
  const parsed = parseCron(expression, from);
  if (parsed) {
    try {
      return parsed.next().toDate();
    } catch {}
  }
  return dayjs(from).add(1, "minute").toDate();
};

const toFilter = (val) => {
  const arr = val
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return arr.length === 1 ? arr[0] : { $in: arr };
};

const buildFilter = (query) => {
  const {
    search = "",
    status,
    isPaused,
    "filters[env]": env,
    "filters[category]": category,
  } = query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };
  if (status) filter.status = status;
  if (isPaused !== undefined) filter.isPaused = isPaused === "true";
  if (env) filter.env = toFilter(env);
  if (category) filter.category = toFilter(category);
  return filter;
};

const computeWindows = () => {
  const now = new Date();
  return {
    "24h": new Date(now - 24 * 60 * 60 * 1000),
    "7d": new Date(now - 7 * 24 * 60 * 60 * 1000),
    "30d": new Date(now - 30 * 24 * 60 * 60 * 1000),
  };
};

const recalcStats = async (cronJob) => {
  try {
    const now = new Date();
    const windows = computeWindows();

    const countExpectedRuns = (expression, start, end) => {
      try {
        const parsed = CronExpressionParser.parse(expression, {
          currentDate: start,
          tz: "UTC",
        });
        let count = 0;
        let next = parsed.next();
        while (next.toDate() <= end) {
          count++;
          next = parsed.next();
        }
        return count;
      } catch {
        return 0;
      }
    };

    const pings = await Ping.find({
      cronJob: cronJob._id,
      startedAt: { $gte: windows["30d"] },
    }).lean();

    const calc = ({ data, expectedRuns }) => {
      if (!expectedRuns)
        return { uptime: 100, successRate: 100, avgDuration: 0, missedRuns: 0 };
      const total = data.length;
      const success = data.filter((p) => p.status === "success").length;
      const late = data.filter((p) => p.status === "late").length;
      const timeout = data.filter((p) => p.status === "timeout").length;
      const failed = data.filter((p) => p.status === "failed").length;
      const arrived = success + late;
      const totalWithMissed = Math.max(expectedRuns, total);
      const uptime = (success / totalWithMissed) * 100;
      const successRate = (arrived / totalWithMissed) * 100;
      const missedRuns = Math.max(0, expectedRuns - total);
      const durations = data.filter((p) => p.duration > 0);
      const avg = durations.length
        ? durations.reduce((s, p) => s + p.duration, 0) / durations.length
        : 0;
      return {
        uptime: Math.round(uptime * 10) / 10,
        successRate: Math.round(successRate * 10) / 10,
        avgDuration: Math.round(avg),
        missedRuns,
      };
    };

    const jobCreated = cronJob.createdAt || now;
    const clamp = (d) => (d < jobCreated ? jobCreated : d);
    const filterByWindow = (data, since) =>
      data.filter((p) => p.startedAt >= clamp(since));
    const expected24h = countExpectedRuns(
      cronJob.cronExpression,
      clamp(windows["24h"]),
      now,
    );
    const expected7d = countExpectedRuns(
      cronJob.cronExpression,
      clamp(windows["7d"]),
      now,
    );
    const expected30d = countExpectedRuns(
      cronJob.cronExpression,
      clamp(windows["30d"]),
      now,
    );

    const totalPings = await Ping.countDocuments({ cronJob: cronJob._id });
    const s24h = calc({
      data: filterByWindow(pings, windows["24h"]),
      expectedRuns: expected24h,
    });
    const s7d = calc({
      data: filterByWindow(pings, windows["7d"]),
      expectedRuns: expected7d,
    });
    const s30d = calc({ data: pings, expectedRuns: expected30d });

    return {
      "stats.uptime24h": s24h.uptime,
      "stats.successRate24h": s24h.successRate,
      "stats.missedRuns24h": s24h.missedRuns,
      "stats.avgDuration24h": s24h.avgDuration,
      "stats.uptime7d": s7d.uptime,
      "stats.successRate7d": s7d.successRate,
      "stats.missedRuns7d": s7d.missedRuns,
      "stats.avgDuration7d": s7d.avgDuration,
      "stats.uptime30d": s30d.uptime,
      "stats.successRate30d": s30d.successRate,
      "stats.missedRuns30d": s30d.missedRuns,
      "stats.avgDuration30d": s30d.avgDuration,
      "stats.totalRuns30d": pings.length,
      totalPings,
    };
  } catch {
    return {};
  }
};

const updatePingsToday = (cronJob) => {
  const today = dayjs().format("YYYY-MM-DD");
  const countDate = cronJob.pingsTodayDate
    ? dayjs(cronJob.pingsTodayDate).format("YYYY-MM-DD")
    : null;
  if (countDate !== today) {
    cronJob.pingsToday = 0;
    cronJob.pingsTodayDate = new Date();
  }
  cronJob.pingsToday += 1;
};

// ── Retention (delegates to the retention module; falls back to 90d) ────
const getPingExpiresAt = async () => {
  try {
    const { getRetentionDays } = await import(
      "../retention/retention.service.js"
    );
    const days = await getRetentionDays("ping_retention_days");
    return dayjs()
      .add(Number(days) || 90, "days")
      .toDate();
  } catch {
    return dayjs().add(90, "days").toDate();
  }
};

const pushToLast30 = (cronJob, pingData) => {
  cronJob.last30Pings.push(pingData);
  if (cronJob.last30Pings.length > 30) {
    cronJob.last30Pings = cronJob.last30Pings.slice(-30);
  }
};

// ── BullMQ schedule management ──────────────────────────

const registerCronSchedule = async (cronJob) => {
  const jobName = `cron-schedule-${cronJob._id}`;

  cronJob.nextExpectedAt = getNextCronTime(cronJob.cronExpression);
  await cronJob.save();

  const repeatableJobs = await cronSchedulerQueue.getRepeatableJobs();
  if (repeatableJobs.some((j) => j.name === jobName)) return;

  await cronSchedulerQueue.add(
    jobName,
    { cronJobId: cronJob._id.toString(), targetUrl: cronJob.targetUrl },
    {
      repeat: { pattern: cronJob.cronExpression },
      jobId: jobName,
    },
  );
};

const unregisterCronSchedule = async (cronJobId) => {
  const repeatableJobs = await cronSchedulerQueue.getRepeatableJobs();
  const job = repeatableJobs.find(
    (j) => j.name === `cron-schedule-${cronJobId}`,
  );
  if (job) {
    await cronSchedulerQueue.removeRepeatableByKey(job.key);
  }
};

export const syncCronSchedules = async () => {
  const registeredJobs = await cronSchedulerQueue.getRepeatableJobs();
  const registeredIds = new Set(
    registeredJobs.map((j) => j.name.replace("cron-schedule-", "")),
  );

  const cronJobs = await CronJob.find({ isPaused: false });
  let synced = 0;
  for (const cj of cronJobs) {
    const id = cj._id.toString();
    if (!registeredIds.has(id)) {
      await registerCronSchedule(cj);
      synced++;
    }
  }
  if (synced > 0)
    console.log(`Synced ${synced} missing cron schedule(s) from DB`);
};

// ── This is called by the BullMQ scheduler worker ────────
// It fires at every cron occurrence and calls the user's URL
export const executeCronSchedule = async (cronJobId, targetUrl) => {
  const cronJob = await CronJob.findById(cronJobId);
  if (!cronJob || cronJob.isPaused) return { skipped: true };

  const now = new Date();

  // If still waiting for a previous run's ping, skip
  if (cronJob.status === "pending") {
    return { skipped: true };
  }

  // Auto-recover from "missing" — retry on next scheduled fire
  if (cronJob.status === "missing") {
    cronJob.status = "on_time";
    cronJob.alertFired = false;
  }

  // If there's a previous run still in "running" state (e.g. retry), fail it
  if (cronJob.currentRunId) {
    await Ping.updateOne(
      { runId: cronJob.currentRunId, status: "running" },
      {
        $set: { status: "failed", error: "Retried by scheduler", endedAt: now },
      },
    );
  }

  const runId = generateRunId();

  // Create a run record immediately (status: running)
  await Ping.create({
    cronJob: cronJob._id,
    runId,
    startedAt: now,
    status: "running",
    type: "scheduled",
    expiresAt: await getPingExpiresAt(),
  });

  cronJob.currentRunId = runId;
  await cronJob.save();

  console.log("calling target url");
  // Call the user's URL to trigger their job, send pingUrl so they know where to callback
  const response = await fetch(
    `${targetUrl}?pingUrl=${cronJob.pingUrl}&slug=${cronJob.slug}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!response.ok) {
    throw new Error(`targetUrl returned ${response.status}`);
  }

  // Mark that we called them and are now waiting for a ping back
  cronJob.lastCalledAt = now;
  cronJob.expectedAt = now;
  cronJob.nextExpectedAt = getNextCronTime(cronJob.cronExpression, now);
  cronJob.overdueAt = dayjs(now).add(cronJob.grace, "second").toDate();
  cronJob.status = "pending";

  await cronJob.save();
  return { calledAt: now, targetUrl };
};

export const runNow = async (id) => {
  const cronJob = await CronJob.findById(id);
  if (!cronJob) return null;
  if (cronJob.isPaused) throw new Error("Cron job is paused");
  if (cronJob.status === "pending")
    throw new Error("A run is already in progress");

  await executeCronSchedule(cronJob._id, cronJob.targetUrl);

  const updated = await CronJob.findById(id).lean();
  return enrichJob(updated);
};

export const markAsMissing = async (cronJobId, errorMsg) => {
  const cronJob = await CronJob.findById(cronJobId);
  if (!cronJob) return;

  // Update the Ping record to failed
  if (cronJob.currentRunId) {
    await Ping.updateOne(
      { runId: cronJob.currentRunId },
      {
        $set: {
          status: "failed",
          error: errorMsg || "Target URL fetch failed",
          endedAt: new Date(),
        },
      },
    );
  }

  cronJob.status = "missing";
  cronJob.alertFired = true;
  cronJob.currentRunId = null;
  await cronJob.save();
};

// ── CRUD ─────────────────────────────────────────────────

export const createCronJob = async (data) => {
  const slug = generateSlug();
  const pingUrl = `${PING_BASE_URL}/ping/${slug}`;

  const cronJob = new CronJob({
    ...data,
    slug,
    pingUrl,
    isPaused: true,
    status: "paused",
  });

  await cronJob.save();

  console.log("cron job", cronJob);
  // await registerCronSchedule(cronJob);

  return enrichJob(cronJob.toObject());
};

export const getAllCronJobs = async (query) => {
  const {
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;
  const filter = buildFilter(query);
  const skip = (Number(page) - 1) * Number(limit);

  const [total, jobs] = await Promise.all([
    CronJob.countDocuments(filter),
    CronJob.find(filter)
      .populate("owner", "name image_url")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  return {
    data: jobs.map((j) => enrichJob(j)),
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

export const getCronJobById = async (id, query) => {
  const [job, runHistory] = await Promise.all([
    CronJob.findById(id).populate("owner", "name email _id image_url").lean(),
    getPingHistory(id, query),
  ]);
  if (!job) return null;
  return { ...enrichJob(job), runHistory };
};

export const updateCronJob = async (id, data) => {
  const cronJob = await CronJob.findById(id);
  if (!cronJob) return null;

  const changedExpression =
    data.cronExpression && data.cronExpression !== cronJob.cronExpression;

  Object.assign(cronJob, data);

  if (changedExpression) {
    await unregisterCronSchedule(id);
    await registerCronSchedule(cronJob);
  }

  await cronJob.save();
  return cronJob.toObject();
};

export const deleteCronJob = async (id) => {
  await unregisterCronSchedule(id);
  const job = await CronJob.findByIdAndDelete(id);
  if (job) await Ping.deleteMany({ cronJob: id });
  return job;
};

export const toggleCronJob = async (id) => {
  const cronJob = await CronJob.findById(id);
  if (!cronJob) return null;

  cronJob.isPaused = !cronJob.isPaused;
  if (cronJob.isPaused) {
    cronJob.status = "paused";
  } else {
    await registerCronSchedule(cronJob);
    cronJob.status = "on_time";
    cronJob.alertFired = false;
  }

  await cronJob.save();
  return cronJob.toObject();
};

// ── Ping endpoint (user calls this when their job completes) ──

export const recordPing = async (slug) => {
  const cronJob = await CronJob.findOne({ slug, isPaused: false });
  if (!cronJob) return null;

  console.log("this is running");

  const now = new Date();

  // expectedAt = when WE called the user's URL
  const expectedAt = cronJob.expectedAt || cronJob.lastCalledAt;

  if (!expectedAt) {
    return null;
  }

  console.log("expectedAt", expectedAt);

  const delay = now - expectedAt;
  const graceMs = cronJob.grace * 1000;
  const isOnTime = delay <= graceMs;
  const status = isOnTime ? "on_time" : "late";

  // Update the Ping record for this run
  let pingRecord = null;
  if (cronJob.currentRunId) {
    pingRecord = await Ping.findOneAndUpdate(
      { runId: cronJob.currentRunId },
      {
        $set: {
          status: isOnTime ? "success" : "late",
          endedAt: now,
          pingedAt: now,
          duration: delay,
          delay,
          expectedAt,
        },
      },
      { new: true },
    );
  }

  // Fallback: update the most recent matching Ping by expectedAt
  if (!pingRecord) {
    pingRecord = await Ping.findOneAndUpdate(
      {
        cronJob: cronJob._id,
        expectedAt,
        status: { $in: ["timeout", "running", "late", "success"] },
      },
      {
        $set: {
          status: isOnTime ? "success" : "late",
          endedAt: now,
          pingedAt: now,
          duration: delay,
          delay,
        },
      },
      { new: true, sort: { startedAt: -1 } },
    );
  }

  // Last resort: create a brand new Ping if nothing to update
  if (!pingRecord) {
    pingRecord = await Ping.create({
      cronJob: cronJob._id,
      pingedAt: now,
      startedAt: expectedAt,
      endedAt: now,
      duration: delay,
      status: isOnTime ? "success" : "late",
      type: "scheduled",
      delay,
      expectedAt,
      expiresAt: await getPingExpiresAt(),
    });
  }

  cronJob.status = status;
  cronJob.lastPingAt = now;
  cronJob.lastDuration = delay;
  cronJob.alertFired = false;
  cronJob.currentRunId = null;

  updatePingsToday(cronJob);

  pushToLast30(cronJob, {
    pingedAt: now,
    duration: delay,
    status: isOnTime ? "ok" : "late",
  });

  await cronJob.save();

  const statsUpdate = await recalcStats(cronJob);
  await CronJob.findByIdAndUpdate(cronJob._id, statsUpdate);

  return {
    cronJob: enrichJob({ ...cronJob.toObject(), ...statsUpdate }),
    ping: pingRecord.toObject(),
  };
};

// ── Summary ──────────────────────────────────────────────

export const getCronJobSummary = async () => {
  const [jobs, pingsTodayAgg] = await Promise.all([
    CronJob.find({}).lean(),
    Ping.aggregate([
      {
        $match: {
          pingedAt: { $gte: dayjs().startOf("day").toDate() },
        },
      },
      { $count: "count" },
    ]),
  ]);

  const pingsToday = pingsTodayAgg.length ? pingsTodayAgg[0].count : 0;

  const counts = { on_time: 0, late: 0, missing: 0, paused: 0, pending: 0 };
  let totalUptime30d = 0;
  let uptimeCount = 0;

  for (const j of jobs) {
    if (j.isPaused) counts.paused++;
    else if (counts[j.status] !== undefined) counts[j.status]++;
    if (!j.isPaused) {
      totalUptime30d += j.stats?.uptime30d || 0;
      uptimeCount++;
    }
  }

  return {
    onTime: counts.on_time,
    late: counts.late,
    missing: counts.missing,
    paused: counts.paused,
    pending: counts.pending,
    pingsToday,
    reliability30d:
      uptimeCount > 0
        ? Math.round((totalUptime30d / uptimeCount) * 10) / 10
        : 100,
    total: jobs.length,
  };
};

export const getPingHistory = async (cronJobId, query) => {
  const { page = 1, limit = 50, search, sortBy, sortOrder } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { cronJob: cronJobId };

  if (search) {
    filter.$or = [
      { runId: { $regex: search, $options: "i" } },
      { status: { $regex: search, $options: "i" } },
      { type: { $regex: search, $options: "i" } },
      { error: { $regex: search, $options: "i" } },
    ];
  }

  const SORT_FIELD_MAP = {
    end: "endedAt",
    dur: "duration",
    start: "startedAt",
    status: "status",
    type: "type",
    error: "error",
    pingedAt: "pingedAt",
    startedAt: "startedAt",
    endedAt: "endedAt",
    duration: "duration",
    delay: "delay",
    retries: "retries",
  };
  const sort = {};
  if (sortBy) {
    const field = SORT_FIELD_MAP[sortBy] || sortBy;
    sort[field] = sortOrder === "asc" ? 1 : -1;
  } else {
    sort.startedAt = -1;
  }

  const [total, pings] = await Promise.all([
    Ping.countDocuments(filter),
    Ping.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
  ]);

  return {
    data: pings,
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

export const getPingStats = async (cronJobId, days = 30) => {
  const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

  const pings = await Ping.find({
    cronJob: cronJobId,
    startedAt: { $gte: since },
  }).lean();

  const totalRuns = pings.length;
  const failCount = pings.filter((p) =>
    ["failed", "timeout"].includes(p.status),
  ).length;
  const arrived = pings.filter((p) =>
    ["success", "late"].includes(p.status),
  ).length;
  const successRate = totalRuns
    ? Math.round((arrived / totalRuns) * 1000) / 10
    : 100;

  const durations = pings
    .filter((p) => p.duration > 0)
    .map((p) => p.duration)
    .sort((a, b) => a - b);

  const avgDurationMs = durations.length
    ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length)
    : 0;
  const maxDurationMs = durations.length
    ? durations[durations.length - 1]
    : 0;
  const p95DurationMs = durations.length
    ? durations[
        Math.min(durations.length - 1, Math.ceil(durations.length * 0.95) - 1)
      ]
    : 0;

  return {
    successRate,
    failCount,
    avgDurationMs,
    maxDurationMs,
    p95DurationMs,
    totalRuns,
  };
};

// ── Overdue checker (runs every 15s via worker) ─────────

export const checkOverdueJobs = async () => {
  const now = new Date();

  const pending = await CronJob.find({
    isPaused: false,
    status: "pending",
    nextExpectedAt: { $lt: now },
  });

  let changed = 0;
  for (const job of pending) {
    // Mark the Ping run as timeout
    if (job.currentRunId) {
      await Ping.updateOne(
        { runId: job.currentRunId, status: "running" },
        { $set: { status: "timeout", endedAt: now } },
      );
    }

    job.status = "missing";
    job.alertFired = true;
    job.currentRunId = null;
    await job.save();
    changed++;
  }

  return changed;
};

// ── Enrichment ──────────────────────────────────────────

const enrichJob = (job) => {
  const now = new Date();
  const enrichment = {};

  if (job.isPaused) {
    enrichment.status = "paused";
  }

  if (job.status === "pending" && job.nextExpectedAt) {
    const diffMs = job.nextExpectedAt - now;
    if (diffMs > 0) {
      enrichment.nextCycleIn = diffMs;
      enrichment.nextCycleInHuman = formatDuration(diffMs);
    } else {
      enrichment.overdueBy = Math.abs(diffMs);
      enrichment.overdueByHuman = formatDuration(Math.abs(diffMs));
    }
  } else if (job.nextExpectedAt) {
    const diffMs = job.nextExpectedAt - now;
    if (diffMs > 0) {
      enrichment.nextPingIn = diffMs;
      enrichment.nextPingInHuman = formatDuration(diffMs);
    } else {
      enrichment.overdueBy = Math.abs(diffMs);
      enrichment.overdueByHuman = formatDuration(Math.abs(diffMs));
    }
  }

  if (job.lastPingAt) {
    enrichment.lastPingAgo = now - job.lastPingAt;
    enrichment.lastPingAgoHuman = formatDuration(now - job.lastPingAt);
  }

  if (job.lastCalledAt) {
    enrichment.lastCalledAgo = now - job.lastCalledAt;
    enrichment.lastCalledAgoHuman = formatDuration(now - job.lastCalledAt);
  }

  if (job.status === "missing" && job.lastCalledAt) {
    enrichment.missingSince = now - job.lastCalledAt;
    enrichment.missingSinceHuman = formatDuration(now - job.lastCalledAt);
  } else if (job.status === "missing" && job.lastPingAt) {
    enrichment.missingSince = now - job.lastPingAt;
    enrichment.missingSinceHuman = formatDuration(now - job.lastPingAt);
  }

  enrichment.graceLabel = `${job.grace}s`;

  return { ...job, ...enrichment };
};

const formatDuration = (ms) => {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
};
