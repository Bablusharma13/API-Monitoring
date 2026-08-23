import Api from "../apis/api.model.js";
import Check from "../check/check.model.js";
import Incident from "../incident/incident.model.js";

const formatMs = (ms) => (ms != null && ms > 0 ? `${Math.round(ms)}ms` : "—");
const formatPct = (pct) =>
  pct != null ? `${Math.round(pct * 10) / 10}%` : "—";

const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return "0m";
  const mins = Math.round(minutes);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const fmtTime = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const checkAgg = async (from, to) => {
  const result = await Check.aggregate([
    { $match: { checkedAt: { $gte: from, $lt: to } } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        ok: { $sum: { $cond: [{ $eq: ["$status", "ok"] }, 1, 0] } },
        avgResponse: { $avg: "$responseTime" },
      },
    },
  ]);
  if (!result.length) return { uptime: 0, avgResponse: 0, total: 0 };
  const r = result[0];
  return {
    uptime: r.total > 0 ? (r.ok / r.total) * 100 : 0,
    avgResponse: r.avgResponse || 0,
    total: r.total,
  };
};

const trendInfo = (current, previous, higherIsBetter = true) => {
  if (previous == null || previous === 0) return { trend: "up", change: "N/A" };
  const diff = current - previous;
  const pct = Math.abs((diff / previous) * 100).toFixed(1);
  const isImproving = higherIsBetter ? diff >= 0 : diff <= 0;
  return { trend: isImproving ? "up" : "down", change: `${pct}%` };
};

const checkToFeedItem = (check) => {
  const time = fmtTime(check.checkedAt);
  const apiName = check.api?.name || "Unknown";

  if (check.status === "error") {
    return {
      label: apiName,
      labelCls: "text-red-600 font-medium",
      msg: `is down — ${check.error || check.message || "connection error"}`,
      colorCls: "bg-red-500",
      time,
    };
  }
  if (check.responseTime > 4000) {
    return {
      label: apiName,
      labelCls: "text-amber-600 font-medium",
      msg: `responded slowly — ${check.responseTime}ms`,
      colorCls: "bg-amber-500",
      time,
    };
  }
  return {
    label: apiName,
    labelCls: "text-emerald-600 font-medium",
    msg: `responded OK — ${check.responseTime}ms`,
    colorCls: "bg-emerald-500",
    time,
  };
};

export const getDashboardData = async () => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const ago24h = new Date(now - 24 * 60 * 60 * 1000);
  const ago48h = new Date(now - 48 * 60 * 60 * 1000);
  const ago7d = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const ago14d = new Date(now - 14 * 24 * 60 * 60 * 1000);
  const ago30d = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const ago60d = new Date(now - 60 * 24 * 60 * 60 * 1000);

  const [allApis, allIncidents, recentChecks] = await Promise.all([
    Api.find({}).populate("category", "name").lean(),
    Incident.find({})
      .populate("api", "name apiId")
      .sort({ startedAt: -1 })
      .lean(),
    Check.find({})
      .populate("api", "name")
      .sort({ checkedAt: -1 })
      .limit(50)
      .lean(),
  ]);

  // ── KPIs ────────────────────────────────────────────────────────────────
  const totalApis = allApis.length;
  const activeApis = allApis.filter(
    (a) => a.status?.current === "active",
  ).length;
  const downNow = allApis.filter((a) => a.status?.current === "down").length;
  const warningApis = allApis.filter(
    (a) => a.status?.current === "warning",
  ).length;

  const avgUptimeVal =
    totalApis > 0
      ? allApis.reduce((s, a) => s + (a.stats?.uptime30d || 0), 0) / totalApis
      : 0;
  const avgResponseVal =
    totalApis > 0
      ? allApis.reduce((s, a) => s + (a.stats?.avgResponse30d || 0), 0) /
        totalApis
      : 0;
  const ongoingIncidents = allIncidents.filter(
    (i) => i.status === "ongoing",
  ).length;

  const kpis = {
    totalApis,
    activeApis,
    downNow,
    avgUptime: formatPct(avgUptimeVal),
    incidents: ongoingIncidents,
    avgResponse: formatMs(avgResponseVal),
  };

  // ── System Status ────────────────────────────────────────────────────────
  const avgUptime24h =
    totalApis > 0
      ? allApis.reduce((s, a) => s + (a.stats?.uptime24h || 0), 0) / totalApis
      : 0;
  const avgUptime7d =
    totalApis > 0
      ? allApis.reduce((s, a) => s + (a.stats?.uptime7d || 0), 0) / totalApis
      : 0;

  const systemStatus = {
    healthy: activeApis,
    warning: warningApis,
    critical: downNow,
    uptime: {
      today: formatPct(avgUptime24h),
      days7: formatPct(avgUptime7d),
      days30: formatPct(avgUptimeVal),
    },
  };

  // ── Downtime Summary ─────────────────────────────────────────────────────
  const resolvedWithDuration = allIncidents.filter(
    (i) => i.resolvedAt && i.duration,
  );

  const sumDuration = (list) =>
    list.reduce((s, i) => s + (i.duration || 0), 0);

  const downtimeToday = sumDuration(
    resolvedWithDuration.filter((i) => new Date(i.startedAt) >= today),
  );
  const downtime7d = sumDuration(
    resolvedWithDuration.filter((i) => new Date(i.startedAt) >= ago7d),
  );
  const downtime30d = sumDuration(
    resolvedWithDuration.filter((i) => new Date(i.startedAt) >= ago30d),
  );

  const durationByApi = {};
  resolvedWithDuration
    .filter((i) => new Date(i.startedAt) >= ago30d && i.api)
    .forEach((i) => {
      const name = i.api?.name || "Unknown";
      durationByApi[name] = (durationByApi[name] || 0) + (i.duration || 0);
    });
  const mostAffected =
    Object.entries(durationByApi).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "N/A";

  const downtimeSummary = {
    total30d: formatDuration(downtime30d),
    today: formatDuration(downtimeToday),
    days7: formatDuration(downtime7d),
    days30: formatDuration(downtime30d),
    mostAffected,
  };

  // ── Alerts Summary ───────────────────────────────────────────────────────
  const channelSet = new Set();
  allApis.forEach((a) =>
    (a.alertChannels || []).forEach((c) => channelSet.add(c)),
  );

  const alertsSummary = {
    active: ongoingIncidents,
    critical: allIncidents.filter(
      (i) => i.severity === "critical" && i.status === "ongoing",
    ).length,
    resolved: allIncidents.filter((i) => i.status === "resolved").length,
    channels: [...channelSet],
  };

  // ── Time Comparison ──────────────────────────────────────────────────────
  const [curr24h, prev24h, curr7d, prev7d, curr30d, prev30d] =
    await Promise.all([
      checkAgg(ago24h, now),
      checkAgg(ago48h, ago24h),
      checkAgg(ago7d, now),
      checkAgg(ago14d, ago7d),
      checkAgg(ago30d, now),
      checkAgg(ago60d, ago30d),
    ]);

  const incCount = (from, to) =>
    allIncidents.filter(
      (i) => new Date(i.startedAt) >= from && new Date(i.startedAt) < to,
    ).length;

  const buildPeriodMetrics = (curr, prev, incCurr, incPrev) => [
    {
      label: "Avg Response",
      current: formatMs(curr.avgResponse),
      prev: formatMs(prev.avgResponse),
      ...trendInfo(curr.avgResponse, prev.avgResponse, false),
    },
    {
      label: "Uptime",
      current: formatPct(curr.uptime),
      prev: formatPct(prev.uptime),
      ...trendInfo(curr.uptime, prev.uptime, true),
    },
    {
      label: "Incidents",
      current: String(incCurr),
      prev: String(incPrev),
      ...trendInfo(incCurr, incPrev, false),
    },
  ];

  const timeComparison = [
    {
      period: "Last 24h",
      metrics: buildPeriodMetrics(
        curr24h,
        prev24h,
        incCount(ago24h, now),
        incCount(ago48h, ago24h),
      ),
    },
    {
      period: "Last 7d",
      metrics: buildPeriodMetrics(
        curr7d,
        prev7d,
        incCount(ago7d, now),
        incCount(ago14d, ago7d),
      ),
    },
    {
      period: "Last 30d",
      metrics: buildPeriodMetrics(
        curr30d,
        prev30d,
        incCount(ago30d, now),
        incCount(ago60d, ago30d),
      ),
    },
  ];

  // ── Top 10 Down APIs ─────────────────────────────────────────────────────
  const topDownApis = allApis
    .filter((a) => a.status?.current === "down")
    .sort(
      (a, b) => (b.stats?.totalIncidents || 0) - (a.stats?.totalIncidents || 0),
    )
    .slice(0, 10)
    .map((a) => ({
      id: a.apiId,
      name: a.name,
      url: a.request?.url,
      method: a.request?.method,
      category: a.category?.name || "—",
      downSince: fmtTime(a.status?.currentDownSince),
      duration: formatDuration(a.status?.currentDownDuration),
      lastCode: a.status?.lastStatusCode || "—",
      incidents: a.stats?.totalIncidents || 0,
    }));

  // ── Top 10 Slow APIs ─────────────────────────────────────────────────────
  const topSlowApis = allApis
    .filter((a) => (a.stats?.avgResponse30d || 0) > 0)
    .sort(
      (a, b) => (b.stats?.avgResponse30d || 0) - (a.stats?.avgResponse30d || 0),
    )
    .slice(0, 10)
    .map((a) => ({
      id: a.apiId,
      name: a.name,
      url: a.request?.url,
      method: a.request?.method,
      category: a.category?.name || "—",
      avgResponse: formatMs(a.stats?.avgResponse30d),
      avgResponse24h: formatMs(a.stats?.avgResponse24h),
      peakResponse: formatMs(a.stats?.peakResponse30d),
      uptime: formatPct(a.stats?.uptime30d),
      riskScore: a.stats?.riskScore || 0,
    }));

  // ── Active Incidents ─────────────────────────────────────────────────────
  const activeIncidents = allIncidents
    .filter((i) => i.status === "ongoing")
    .slice(0, 10)
    .map((i) => ({
      name: i.api?.name || "Unknown API",
      issue: i.title || "—",
      time: fmtTime(i.startedAt),
      dur: formatDuration(i.duration),
      severity: i.severity || "warning",
    }));

  // ── All Incidents (recent 20) ────────────────────────────────────────────
  const allIncidentsMapped = allIncidents.slice(0, 20).map((i) => ({
    name: i.api?.name || "Unknown API",
    issue: i.title || "—",
    status:
      i.status === "ongoing"
        ? i.severity === "critical"
          ? "critical"
          : "warning"
        : "resolved",
  }));

  // ── Feed & Logs from recent checks ───────────────────────────────────────
  const initialFeed = recentChecks.slice(0, 10).map(checkToFeedItem);
  const feedEventPool = recentChecks.map(checkToFeedItem);

  const logs = recentChecks.map((check, i) => ({
    id: `log-${i}`,
    ts: new Date(check.checkedAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    api: check.api?.name || "Unknown",
    code: check.statusCode ? String(check.statusCode) : "—",
    dur: check.responseTime ? `${check.responseTime}ms` : "—",
    type:
      check.status === "error"
        ? "error"
        : check.responseTime > 4000
          ? "warn"
          : "info",
    msg: check.message || "—",
  }));

  return {
    kpis,
    systemStatus,
    downtimeSummary,
    alertsSummary,
    timeComparison,
    topDownApis,
    topSlowApis,
    activeIncidents,
    allIncidents: allIncidentsMapped,
    initialFeed,
    feedEventPool,
    logs,
  };
};
