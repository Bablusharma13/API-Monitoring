import mongoose from "mongoose";
import RetentionSetting, { RETENTION_KEYS } from "./retention-setting.model.js";
import Check from "../check/check.model.js";
import Ping from "../cron-job/ping.model.js";
import { TenantMetric } from "../tenants/models/tenant-metric.model.js";

// Hardcoded fallbacks used whenever no RetentionSetting doc exists yet for a
// key (lazy defaults — we never write a doc just because it was read).
const DEFAULT_RETENTION_DAYS = {
  check_retention_days: 90,
  ping_retention_days: 90,
  tenant_metric_retention_days: 90,
};

// Depended on by monitor.worker.js / cron-job.service.js (and possibly other
// modules) to resolve the effective retention window for a given key. Must
// never throw — any DB failure silently falls back to the hardcoded default
// so callers are never broken by this lookup.
export const getRetentionDays = async (key) => {
  try {
    const setting = await RetentionSetting.findOne({ key }).lean();
    if (setting) return setting.valueDays;
    return DEFAULT_RETENTION_DAYS[key];
  } catch (error) {
    return DEFAULT_RETENTION_DAYS[key];
  }
};

export const getAllRetentionSettings = async () => {
  const settings = await RetentionSetting.find({
    key: { $in: RETENTION_KEYS },
  }).lean();

  const byKey = new Map(settings.map((setting) => [setting.key, setting]));

  return RETENTION_KEYS.map((key) => {
    const existing = byKey.get(key);
    return {
      key,
      valueDays: existing ? existing.valueDays : DEFAULT_RETENTION_DAYS[key],
      updatedBy: existing ? existing.updatedBy ?? null : null,
      updatedAt: existing ? existing.updatedAt ?? null : null,
    };
  });
};

// Live-applies a new TTL to the real tenantmetrics TTL index via collMod.
// Failure here must not fail the settings save, so it's swallowed + logged.
const applyTenantMetricTtl = async (valueDays) => {
  try {
    await mongoose.connection.db.command({
      collMod: TenantMetric.collection.name,
      index: {
        keyPattern: { recordedAt: 1 },
        expireAfterSeconds: valueDays * 86400,
      },
    });
    return true;
  } catch (error) {
    console.error(
      "[retention] failed to apply live TTL for tenant_metric_retention_days:",
      error?.message || error,
    );
    return false;
  }
};

// Retroactively rewrites expiresAt on existing Check/Ping docs so the new
// retention window applies to historical data, not just future writes.
const applyRetroactiveRetention = async (key, valueDays) => {
  const offsetMs = valueDays * 86400000;
  try {
    if (key === "check_retention_days") {
      await Check.updateMany({}, [
        { $set: { expiresAt: { $add: ["$checkedAt", offsetMs] } } },
      ]);
    } else if (key === "ping_retention_days") {
      await Ping.updateMany({}, [
        { $set: { expiresAt: { $add: ["$startedAt", offsetMs] } } },
      ]);
    }
    return true;
  } catch (error) {
    console.error(
      `[retention] failed to retroactively apply ${key}:`,
      error?.message || error,
    );
    return false;
  }
};

export const updateRetentionSetting = async (
  key,
  valueDays,
  updatedBy,
  applyRetroactively = false,
) => {
  if (!RETENTION_KEYS.includes(key)) {
    throw { message: `Invalid retention key: ${key}`, statusCode: 400 };
  }

  let setting = await RetentionSetting.findOne({ key });
  if (!setting) {
    setting = new RetentionSetting({ key });
  }
  setting.valueDays = valueDays;
  setting.updatedBy = updatedBy;
  await setting.save();

  let liveTtlApplied = false;
  let retroactiveApplied = false;

  if (key === "tenant_metric_retention_days") {
    liveTtlApplied = await applyTenantMetricTtl(valueDays);
  } else if (
    (key === "check_retention_days" || key === "ping_retention_days") &&
    applyRetroactively
  ) {
    retroactiveApplied = await applyRetroactiveRetention(key, valueDays);
  }

  return {
    ...setting.toObject(),
    liveTtlApplied,
    retroactiveApplied,
  };
};
