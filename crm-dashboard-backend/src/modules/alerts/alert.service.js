import axios from "axios";
import Alert from "./alert.model.js";
import AlertRule from "../alert-rules/alert-rule.model.js";
import NotificationChannel from "../notification-channels/notification-channel.model.js";
import { sendAlertEmail } from "../../shared/mailer.js";

const toFilter = (val) => {
  const arr = val.split(",").map((v) => v.trim()).filter(Boolean);
  return arr.length === 1 ? arr[0] : { $in: arr };
};

// ── scope matching ──────────────────────────────────────────
const idsInclude = (idList = [], value) => {
  if (!value) return false;
  const target = (value._id || value).toString();
  return idList.some((id) => (id?._id || id)?.toString() === target);
};

const ruleMatchesApi = (rule, api) => {
  const scopeType = rule.scope?.type || "all";
  if (scopeType === "all") return true;
  if (scopeType === "category") return idsInclude(rule.scope.categoryIds, api.category);
  if (scopeType === "api") return idsInclude(rule.scope.apiIds, api._id);
  return false;
};

// ── cooldown ─────────────────────────────────────────────────
const withinCooldown = (rule, existingAlert) => {
  if (!existingAlert) return false;
  const cooldownMs = (rule.cooldownMinutes || 0) * 60 * 1000;
  const elapsed = Date.now() - new Date(existingAlert.triggeredAt).getTime();
  return elapsed < cooldownMs;
};

// ── message builders ────────────────────────────────────────
const buildStatusAlertMessage = (api, newStatus, result) => {
  const parts = [`${api.name} is now ${newStatus}`];
  if (result?.statusCode) parts.push(`(HTTP ${result.statusCode})`);
  if (result?.message) parts.push(`— ${result.message}`);
  return parts.join(" ");
};

const buildMetricAlertTitle = (api, rule) =>
  rule.signal === "latency" ? `${api.name} — high latency` : `${api.name} — high error rate`;

const buildMetricAlertMessage = (api, rule, value, threshold) =>
  rule.signal === "latency"
    ? `${api.name} response time is ${value}ms, exceeding the ${threshold}ms threshold.`
    : `${api.name} error rate is ${value}%, exceeding the ${threshold}% threshold.`;

// ── dispatch fan-out for a rule's channels ──────────────────
const dispatchToRuleChannels = async (rule, alert) => {
  await rule.populate("channels");
  const channels = (rule.channels || []).filter(
    (channel) =>
      channel &&
      channel.enabled !== false &&
      (!channel.severityFilter?.length || channel.severityFilter.includes(alert.severity)),
  );

  for (const channel of channels) {
    await dispatchToChannel(channel, alert);
  }
};

// ── evaluateStatusAlerts ─────────────────────────────────────
// Called by the monitor pipeline whenever an API's status transitions
// (previousStatus -> newStatus). Never throws — logs and swallows errors so
// alert evaluation can never break the monitoring flow.
export const evaluateStatusAlerts = async (api, previousStatus, newStatus, result, incident) => {
  try {
    const rules = await AlertRule.find({ enabled: true, signal: "status" });
    if (!rules.length) return;

    for (const rule of rules) {
      if (!ruleMatchesApi(rule, api)) continue;

      const existing = await Alert.findOne({
        rule: rule._id,
        api: api._id,
        status: "firing",
      });

      // auto-resolve: status recovered and this rule wants auto-resolution
      if (newStatus === "active" && rule.autoResolve && existing) {
        existing.status = "resolved";
        existing.resolvedAt = new Date();
        await existing.save();
        continue;
      }

      // this rule only fires for the statuses configured on it
      if (!rule.condition?.statuses?.includes(newStatus)) continue;

      // cooldown: an alert is already firing and was triggered recently
      if (withinCooldown(rule, existing)) continue;

      const alert = await Alert.create({
        rule: rule._id,
        api: api._id,
        incident: incident?._id ?? null,
        severity: rule.severity,
        title: `${api.name} is ${newStatus}`,
        message: buildStatusAlertMessage(api, newStatus, result),
        status: "firing",
        triggeredAt: new Date(),
      });

      await dispatchToRuleChannels(rule, alert);
    }
  } catch (error) {
    console.error("evaluateStatusAlerts error:", error);
  }
};

// ── evaluateMetricAlerts ─────────────────────────────────────
// Called by the monitor pipeline after every check with the latest latency /
// error-rate readings. Never throws.
export const evaluateMetricAlerts = async (api, { responseTimeMs, errorRatePct } = {}) => {
  try {
    const rules = await AlertRule.find({
      enabled: true,
      signal: { $in: ["latency", "errorRate"] },
    });
    if (!rules.length) return;

    for (const rule of rules) {
      if (!ruleMatchesApi(rule, api)) continue;

      let value;
      let threshold;

      if (rule.signal === "latency") {
        if (responseTimeMs == null || rule.condition?.thresholdMs == null) continue;
        if (!(responseTimeMs > rule.condition.thresholdMs)) continue;
        value = responseTimeMs;
        threshold = rule.condition.thresholdMs;
      } else if (rule.signal === "errorRate") {
        if (errorRatePct == null || rule.condition?.thresholdPct == null) continue;
        if (!(errorRatePct > rule.condition.thresholdPct)) continue;
        value = errorRatePct;
        threshold = rule.condition.thresholdPct;
      } else {
        continue;
      }

      const existing = await Alert.findOne({
        rule: rule._id,
        api: api._id,
        status: "firing",
      });

      if (withinCooldown(rule, existing)) continue;

      const alert = await Alert.create({
        rule: rule._id,
        api: api._id,
        incident: null,
        severity: rule.severity,
        title: buildMetricAlertTitle(api, rule),
        message: buildMetricAlertMessage(api, rule, value, threshold),
        status: "firing",
        triggeredAt: new Date(),
        value,
        threshold,
      });

      await dispatchToRuleChannels(rule, alert);
    }
  } catch (error) {
    console.error("evaluateMetricAlerts error:", error);
  }
};

// ── dispatchToChannel ────────────────────────────────────────
// Sends `alert` ({title, message, severity, ...}) through one notification
// channel. Used both for real fired alerts (a persisted Alert doc) and for
// the notification-channel "test" flow (a plain {title, message} object —
// detected via `alert?.save` not being a function, so we skip mutating it).
export const dispatchToChannel = async (channel, alert) => {
  const isPersistedAlert = typeof alert?.save === "function";

  try {
    switch (channel.type) {
      case "email":
        await sendAlertEmail({
          to: channel.config?.to,
          subject: alert.title,
          text: alert.message,
        });
        break;

      case "discord":
        await axios.post(channel.config?.webhookUrl, { content: alert.message });
        break;

      case "slack":
      case "pagerduty":
        await axios.post(channel.config?.webhookUrl, { text: alert.message });
        break;

      case "webhook":
        await axios.post(
          channel.config?.url,
          { event: "alert.fired", alert },
          { headers: Object.fromEntries(channel.config?.headers || []) },
        );
        break;

      default:
        throw new Error(`Unsupported notification channel type: ${channel.type}`);
    }

    await NotificationChannel.findByIdAndUpdate(channel._id, {
      $inc: { "stats.sent": 1 },
      "stats.lastUsed": new Date(),
    });

    if (isPersistedAlert) {
      alert.notifiedChannels.push({ channel: channel._id, status: "sent", at: new Date() });
      await alert.save();
    }

    return { success: true };
  } catch (error) {
    console.error(`dispatchToChannel (${channel?.type}) failed:`, error?.message);

    try {
      await NotificationChannel.findByIdAndUpdate(channel._id, {
        $inc: { "stats.failed": 1 },
      });
    } catch (e) {
      console.error("dispatchToChannel: failed to record failure stats:", e?.message);
    }

    if (isPersistedAlert) {
      try {
        alert.notifiedChannels.push({ channel: channel._id, status: "failed", at: new Date() });
        await alert.save();
      } catch (e) {
        console.error("dispatchToChannel: failed to record notifiedChannels entry:", e?.message);
      }
    }

    return { success: false, error: error?.message };
  }
};

// ── read / lifecycle ────────────────────────────────────────
export const getAllAlerts = async (query) => {
  const {
    page = 1,
    limit = 20,
    search = "",
    sortBy = "triggeredAt",
    sortOrder = "desc",
    "filters[status]": status,
    "filters[severity]": severity,
    "filters[api]": api,
    "filters[dateFrom]": dateFrom,
    "filters[dateTo]": dateTo,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const filter = {};
  if (search) filter.title = { $regex: search, $options: "i" };
  if (status) filter.status = toFilter(status);
  if (severity) filter.severity = toFilter(severity);
  if (api) filter.api = toFilter(api);
  if (dateFrom || dateTo) {
    filter.triggeredAt = {};
    if (dateFrom) filter.triggeredAt.$gte = new Date(dateFrom);
    if (dateTo) filter.triggeredAt.$lte = new Date(dateTo);
  }

  const [total, alerts] = await Promise.all([
    Alert.countDocuments(filter),
    Alert.find(filter)
      .populate("api", "name apiId")
      .populate("rule", "name signal severity")
      .populate("notifiedChannels.channel", "type name")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
  ]);

  return {
    data: alerts,
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

export const getAlertsSummary = async () => {
  const [statusCounts, severityCounts, total] = await Promise.all([
    Alert.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Alert.aggregate([{ $group: { _id: "$severity", count: { $sum: 1 } } }]),
    Alert.countDocuments({}),
  ]);

  const byStatus = { firing: 0, acknowledged: 0, resolved: 0 };
  statusCounts.forEach((s) => {
    if (s._id && s._id in byStatus) byStatus[s._id] = s.count;
  });

  const bySeverity = { critical: 0, warning: 0, info: 0 };
  severityCounts.forEach((s) => {
    if (s._id && s._id in bySeverity) bySeverity[s._id] = s.count;
  });

  return {
    total,
    firing: byStatus.firing,
    acknowledged: byStatus.acknowledged,
    resolved: byStatus.resolved,
    critical: bySeverity.critical,
    warning: bySeverity.warning,
    info: bySeverity.info,
  };
};

export const ackAlert = async (id, by) => {
  const alert = await Alert.findById(id);
  if (!alert) throw { message: "Alert not found", statusCode: 404 };

  alert.status = "acknowledged";
  alert.acknowledgedAt = new Date();
  alert.acknowledgedBy = by;

  return await alert.save();
};

export const resolveAlert = async (id) => {
  const alert = await Alert.findById(id);
  if (!alert) throw { message: "Alert not found", statusCode: 404 };

  alert.status = "resolved";
  alert.resolvedAt = new Date();

  return await alert.save();
};
