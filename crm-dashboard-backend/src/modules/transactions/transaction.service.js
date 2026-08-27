import axios from "axios";
import { syntheticTransactionQueue } from "../../shared/queue.js";
import { evaluateAssertions, getByPath } from "../../shared/assertions.js";
import { dispatchToChannel } from "../alerts/alert.service.js";
import Transaction from "./transaction.model.js";
import TransactionRun from "./transaction-run.model.js";
import Incident, { generateIncidentId } from "../incident/incident.model.js";

const toFilter = (val) => {
  const arr = val.split(",").map((v) => v.trim()).filter(Boolean);
  return arr.length === 1 ? arr[0] : { $in: arr };
};

// ── {{varName}} substitution ────────────────────────────────
const TOKEN_RE = /\{\{\s*([\w.]+)\s*\}\}/g;

const substituteVars = (input, vars) => {
  if (typeof input !== "string") return input;
  return input.replace(TOKEN_RE, (match, varName) => {
    if (!Object.prototype.hasOwnProperty.call(vars, varName)) return match;
    const value = vars[varName];
    return value === undefined || value === null ? "" : String(value);
  });
};

const buildHeaders = (stepHeaders, vars) => {
  const headers = {};
  if (!stepHeaders) return headers;
  const entries =
    stepHeaders instanceof Map ? stepHeaders.entries() : Object.entries(stepHeaders);
  for (const [key, value] of entries) {
    headers[key] = substituteVars(value, vars);
  }
  return headers;
};

const buildBody = (stepBody, vars) => {
  if (stepBody === null || stepBody === undefined) return undefined;
  const json = substituteVars(JSON.stringify(stepBody), vars);
  return JSON.parse(json);
};

// ── BullMQ job registration ─────────────────────────────────
// Identical pattern to registerMonitorJob/unregisterMonitorJob/syncMonitorJobs
// in ../monitor/monitor.service.js, applied to syntheticTransactionQueue.
export const registerTransactionJob = async (txn) => {
  await syntheticTransactionQueue.add(
    `txn-${txn._id}`,
    { transactionId: txn._id.toString() },
    {
      repeat: { pattern: txn.frequency },
      jobId: `txn-${txn._id}`,
      removeOnComplete: 50,
      removeOnFail: 100,
    },
  );

  console.log(`Registered transaction job for ${txn.name} — ${txn.frequency}`);
};

export const unregisterTransactionJob = async (txn) => {
  const repeatableJobs = await syntheticTransactionQueue.getRepeatableJobs();
  const job = repeatableJobs.find((j) => j.name === `txn-${txn._id}`);

  if (job) {
    await syntheticTransactionQueue.removeRepeatableByKey(job.key);
    console.log(`Unregistered transaction job for ${txn.name}`);
  } else {
    console.warn(`No repeatable job found for ${txn.name}`);
  }
};

export const syncTransactionJobs = async () => {
  const registeredJobs = await syntheticTransactionQueue.getRepeatableJobs();
  const registeredIds = new Set(registeredJobs.map((j) => j.name));

  const transactions = await Transaction.find({ enabled: true });

  let synced = 0;
  for (const txn of transactions) {
    const jobName = `txn-${txn._id}`;
    if (!registeredIds.has(jobName)) {
      await registerTransactionJob(txn);
      synced++;
    }
  }

  if (synced > 0) console.log(`Synced ${synced} missing transaction job(s) from DB`);
  else console.log("Transaction jobs in sync — nothing to reseed");
};

// ── evaluateTransactionAlert ────────────────────────────────
// Fires a channel notification directly (no AlertRule involved) whenever a
// transaction run fails. Never throws — logs and swallows so a notification
// failure can never break the run pipeline.
export const evaluateTransactionAlert = async (txn, run) => {
  try {
    if (!txn.populated || !txn.populated("channels")) {
      await txn.populate("channels");
    }

    const channels = (txn.channels || []).filter(
      (channel) => channel && channel.enabled !== false,
    );
    if (!channels.length) return;

    const failedStep = run.steps.find((s) => !s.passed);

    const alertLike = {
      title: `${txn.name} — transaction failed`,
      message: failedStep
        ? `Step "${failedStep.name}" failed: ${failedStep.error || "assertion failed"}`
        : `Transaction "${txn.name}" failed`,
      severity: "critical",
    };

    for (const channel of channels) {
      await dispatchToChannel(channel, alertLike);
    }
  } catch (error) {
    console.error(`evaluateTransactionAlert failed for ${txn.name}:`, error.message);
  }
};

// ── runTransaction ───────────────────────────────────────────
// Core step-runner. Called by the worker (and directly for manual "run now").
export const runTransaction = async (transactionId) => {
  const txn = await Transaction.findById(transactionId);
  if (!txn) throw { message: "Transaction not found", statusCode: 404 };

  const vars = {};
  const stepResults = [];
  const runStartedAt = new Date();
  let failedStep = null;

  for (const step of txn.steps) {
    const stepStart = Date.now();
    const stepResult = {
      name: step.name,
      statusCode: null,
      responseTimeMs: null,
      passed: false,
      error: null,
    };

    try {
      const url = substituteVars(step.url, vars);
      const headers = buildHeaders(step.headers, vars);
      const data = buildBody(step.body, vars);

      const response = await axios({
        method: step.method,
        url,
        headers,
        data,
        timeout: txn.timeout || 15000,
      });

      stepResult.statusCode = response.status;
      stepResult.responseTimeMs = Date.now() - stepStart;

      const { passed, failures } = evaluateAssertions(step.assertions, response.data);
      stepResult.passed = passed;
      if (!passed) stepResult.error = failures.join("; ");

      if (Array.isArray(step.extractVars)) {
        for (const extract of step.extractVars) {
          if (!extract?.name) continue;
          vars[extract.name] = getByPath(response.data, extract.fromPath);
        }
      }

      stepResults.push(stepResult);

      if (!passed) {
        failedStep = step;
        break;
      }
    } catch (err) {
      stepResult.statusCode = err.response?.status || null;
      stepResult.responseTimeMs = Date.now() - stepStart;
      stepResult.passed = false;
      stepResult.error = err.message;
      stepResults.push(stepResult);
      failedStep = step;
      break;
    }
  }

  const status = failedStep ? "failed" : "success";

  const run = await TransactionRun.create({
    transaction: txn._id,
    startedAt: runStartedAt,
    completedAt: new Date(),
    status,
    steps: stepResults,
  });

  if (status === "failed") {
    try {
      const incidentId = await generateIncidentId();
      await Incident.create({
        incidentId,
        title: `${txn.name} — transaction failed at step "${failedStep.name}"`,
        type: "transaction_failed",
        severity: "critical",
        status: "ongoing",
        startedAt: new Date(),
        triggeredBy: "monitor",
        timeline: [
          {
            at: new Date(),
            event: `Transaction "${txn.name}" failed at step "${failedStep.name}"`,
            by: "monitor",
          },
        ],
      });
    } catch (e) {
      console.error(`Failed to create incident for transaction ${txn.name}:`, e.message);
    }

    try {
      await evaluateTransactionAlert(txn, run);
    } catch (e) {
      console.error(`evaluateTransactionAlert failed for ${txn.name}:`, e.message);
    }
  }

  await Transaction.findByIdAndUpdate(txn._id, {
    "stats.lastRunAt": new Date(),
    "stats.lastRunStatus": status,
  });

  return run;
};

// ── CRUD ──────────────────────────────────────────────────────
export const getAllTransactions = async (query) => {
  const {
    page = 1,
    limit = 20,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    "filters[enabled]": enabled,
    "filters[owner]": owner,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };
  if (enabled !== undefined) filter.enabled = enabled === "true";
  if (owner) filter.owner = toFilter(owner);

  const [total, transactions] = await Promise.all([
    Transaction.countDocuments(filter),
    Transaction.find(filter)
      .populate("owner", "name image_url")
      .populate("channels", "type name enabled")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  return {
    data: transactions,
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

export const getTransactionById = async (id) => {
  const txn = await Transaction.findById(id)
    .populate("owner", "name image_url")
    .populate("channels", "type name enabled")
    .lean();
  if (!txn) throw { message: "Transaction not found", statusCode: 404 };
  return txn;
};

export const createTransaction = async (data) => {
  const txn = new Transaction(data);
  const saved = await txn.save();

  if (saved.enabled) {
    await registerTransactionJob(saved);
  }

  return saved;
};

export const updateTransaction = async (id, data) => {
  const txn = await Transaction.findById(id);
  if (!txn) throw { message: "Transaction not found", statusCode: 404 };

  const oldFrequency = txn.frequency;
  const oldEnabled = txn.enabled;

  const allowedFields = ["name", "owner", "steps", "frequency", "timeout", "enabled", "channels"];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      txn[field] = data[field];
    }
  });

  const saved = await txn.save();

  const frequencyChanged = data.frequency !== undefined && data.frequency !== oldFrequency;
  const enabledChanged = data.enabled !== undefined && data.enabled !== oldEnabled;

  if (frequencyChanged || enabledChanged) {
    await unregisterTransactionJob(saved);
    if (saved.enabled) {
      await registerTransactionJob(saved);
    }
  }

  return saved;
};

export const deleteTransaction = async (id) => {
  const txn = await Transaction.findById(id);
  if (!txn) throw { message: "Transaction not found", statusCode: 404 };

  await unregisterTransactionJob(txn);
  await Transaction.findByIdAndDelete(id);

  return { deleted: id };
};

export const getTransactionRuns = async (transactionId, query) => {
  const { page = 1, limit = 20 } = query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { transaction: transactionId };

  const [total, runs] = await Promise.all([
    TransactionRun.countDocuments(filter),
    TransactionRun.find(filter)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  return {
    data: runs,
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
