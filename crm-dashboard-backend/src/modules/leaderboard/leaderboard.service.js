import Api from "../apis/api.model.js";
import Incident from "../incident/incident.model.js";
import Check from "../check/check.model.js";

const PERIODS = {
  "24h": { uptimeKey: "uptime24h", responseKey: "avgResponse24h", ms: 24 * 60 * 60 * 1000 },
  "7d":  { uptimeKey: "uptime7d",  responseKey: "avgResponse7d",  ms: 7  * 24 * 60 * 60 * 1000 },
  "30d": { uptimeKey: "uptime30d", responseKey: "avgResponse30d", ms: 30 * 24 * 60 * 60 * 1000 },
};

const computeScore = ({ uptime, avgResponse, incidentCount, riskScore }) => {
  const uptimeScore    = Math.min(100, uptime);
  const responseScore  = Math.max(0, 100 - avgResponse / 50);  // 0ms=100, 5000ms=0
  const incidentScore  = Math.max(0, 100 - incidentCount * 10); // 10+ incidents=0
  const riskPartScore  = Math.max(0, 100 - Math.min(100, riskScore));
  return Math.round(
    uptimeScore   * 0.4 +
    responseScore * 0.3 +
    incidentScore * 0.2 +
    riskPartScore * 0.1
  );
};

const getBadges = (uptime, avgResponse, streakDays) => {
  const badges = [];
  if (uptime >= 99.5) badges.push("mostStable");
  if (avgResponse > 0 && avgResponse <= 100) badges.push("fastest");
  if (streakDays >= 7) badges.push("streak");
  return badges;
};

export const getLeaderboard = async (query) => {
  const { period = "7d", category, tab = "top", limit = 10 } = query;

  const p   = PERIODS[period] || PERIODS["7d"];
  const now = new Date();
  const periodStart     = new Date(now - p.ms);
  const prevPeriodStart = new Date(now - 2 * p.ms);

  const apiFilter = { isDisabled: false };
  if (category) apiFilter.category = category;

  const apis = await Api.find(apiFilter)
    .populate("category", "name")
    .populate("owner", "name image_url")
    .lean();

  if (!apis.length) {
    return {
      summary: { totalApis: 0, bestUptime: 0, fastestResponse: 0, mostIncidents: 0, topScore: 0, mostImproved: null },
      rankings: [],
      insights: [],
    };
  }

  const apiIds = apis.map((a) => a._id);

  const [incidentAgg, prevIncidentAgg, lastIncidentAgg, prevCheckStats] = await Promise.all([
    Incident.aggregate([
      { $match: { api: { $in: apiIds }, startedAt: { $gte: periodStart } } },
      { $group: { _id: "$api", count: { $sum: 1 } } },
    ]),
    Incident.aggregate([
      { $match: { api: { $in: apiIds }, startedAt: { $gte: prevPeriodStart, $lt: periodStart } } },
      { $group: { _id: "$api", count: { $sum: 1 } } },
    ]),
    Incident.aggregate([
      { $match: { api: { $in: apiIds } } },
      { $sort: { startedAt: -1 } },
      { $group: { _id: "$api", lastIncidentAt: { $first: "$startedAt" } } },
    ]),
    Check.aggregate([
      { $match: { api: { $in: apiIds }, checkedAt: { $gte: prevPeriodStart, $lt: periodStart } } },
      {
        $group: {
          _id: "$api",
          total: { $sum: 1 },
          ok: { $sum: { $cond: [{ $eq: ["$status", "ok"] }, 1, 0] } },
          avgResponse: { $avg: "$responseTime" },
        },
      },
      {
        $project: {
          uptime: { $round: [{ $multiply: [{ $divide: ["$ok", "$total"] }, 100] }, 1] },
          avgResponse: { $round: ["$avgResponse", 0] },
        },
      },
    ]),
  ]);

  const incidentMap     = Object.fromEntries(incidentAgg.map((i)     => [i._id.toString(), i.count]));
  const prevIncidentMap = Object.fromEntries(prevIncidentAgg.map((i)  => [i._id.toString(), i.count]));
  const lastIncidentMap = Object.fromEntries(lastIncidentAgg.map((i)  => [i._id.toString(), i.lastIncidentAt]));
  const prevCheckMap    = Object.fromEntries(prevCheckStats.map((i)   => [i._id.toString(), i]));

  const scored = apis.map((api) => {
    const key = api._id.toString();

    const uptime        = api.stats?.[p.uptimeKey]   || 0;
    const avgResponse   = api.stats?.[p.responseKey] || 0;
    const incidentCount = incidentMap[key]            || 0;
    const riskScore     = api.stats?.riskScore        || 0;

    const score = computeScore({ uptime, avgResponse, incidentCount, riskScore });

    const prev = prevCheckMap[key];
    const prevScore = prev
      ? computeScore({
          uptime:        prev.uptime       || 0,
          avgResponse:   prev.avgResponse  || 0,
          incidentCount: prevIncidentMap[key] || 0,
          riskScore,
        })
      : score;

    const trend = Math.round((score - prevScore) * 10) / 10;

    const lastIncidentAt = lastIncidentMap[key];
    const streakStart    = lastIncidentAt ? new Date(lastIncidentAt) : new Date(api.createdAt);
    const streakDays     = Math.max(0, Math.floor((now - streakStart) / (24 * 60 * 60 * 1000)));

    return {
      api: {
        id:       api.apiId,
        name:     api.name,
        category: api.category,
        owner:    api.owner,
        status:   api.status?.current,
        type:     api.type,
        tech:     api.tech,
      },
      score,
      prevScore,
      trend,
      uptime,
      avgResponse,
      incidents: incidentCount,
      riskScore,
      streakDays,
      badges: getBadges(uptime, avgResponse, streakDays),
    };
  });

  const allUptimes   = scored.map((s) => s.uptime);
  const allResponses = scored.filter((s) => s.avgResponse > 0).map((s) => s.avgResponse);
  const allIncidents = scored.map((s) => s.incidents);
  const allScores    = scored.map((s) => s.score);

  const mostImprovedApi = scored.length
    ? scored.reduce((best, cur) => (cur.trend > best.trend ? cur : best))
    : null;

  const summary = {
    totalApis:       scored.length,
    bestUptime:      allUptimes.length   ? Math.max(...allUptimes)   : 0,
    fastestResponse: allResponses.length ? Math.min(...allResponses) : 0,
    mostIncidents:   allIncidents.length ? Math.max(...allIncidents) : 0,
    mostImproved:    mostImprovedApi?.trend > 0 ? mostImprovedApi.api.name : null,
    topScore:        allScores.length    ? Math.max(...allScores)    : 0,
  };

  const sortFns = {
    top:          (a, b) => b.score       - a.score,
    worst:        (a, b) => a.score       - b.score,
    slowest:      (a, b) => b.avgResponse - a.avgResponse,
    mostDown:     (a, b) => b.incidents   - a.incidents,
    highRisk:     (a, b) => b.riskScore   - a.riskScore,
    mostImproved: (a, b) => b.trend       - a.trend,
  };

  const sorted   = [...scored].sort(sortFns[tab] || sortFns.top);
  const rankings = sorted.slice(0, Number(limit)).map((item, idx) => ({ rank: idx + 1, ...item }));

  return { summary, rankings, insights: generateInsights(scored, period) };
};

const generateInsights = (scored, period) => {
  if (!scored.length) return [];
  const insights = [];

  const biggestDrop = [...scored]
    .filter((s) => s.trend < -1)
    .sort((a, b) => a.trend - b.trend)[0];
  if (biggestDrop) {
    insights.push({
      type:   "warning",
      title:  `${biggestDrop.api.name} dropped ${Math.abs(biggestDrop.trend)} points this ${period}`,
      detail: `Uptime ${biggestDrop.uptime.toFixed(1)}% · ${biggestDrop.incidents} incidents recorded`,
    });
  }

  const mostImproved = [...scored]
    .filter((s) => s.trend > 1)
    .sort((a, b) => b.trend - a.trend)[0];
  if (mostImproved) {
    insights.push({
      type:   "success",
      title:  `${mostImproved.api.name} improved score the most this ${period} (+${mostImproved.trend})`,
      detail: `Avg response ${mostImproved.avgResponse}ms`,
    });
  }

  const mostIncidents = [...scored].sort((a, b) => b.incidents - a.incidents)[0];
  if (mostIncidents?.incidents > 0) {
    insights.push({
      type:   "danger",
      title:  `${mostIncidents.api.name} has the highest incident count this ${period}`,
      detail: `${mostIncidents.incidents} incidents logged`,
    });
  }

  const highRisk = [...scored].sort((a, b) => b.riskScore - a.riskScore)[0];
  if (highRisk?.riskScore >= 30) {
    insights.push({
      type:   "warning",
      title:  `${highRisk.api.name} on watch — risk score at ${highRisk.riskScore}`,
      detail: `Uptime ${highRisk.uptime.toFixed(1)}% · ${highRisk.incidents} incidents this period`,
    });
  }

  const fastest = [...scored]
    .filter((s) => s.avgResponse > 0)
    .sort((a, b) => a.avgResponse - b.avgResponse)[0];
  if (fastest) {
    insights.push({
      type:   "info",
      title:  `${fastest.api.name} leads with ${fastest.avgResponse}ms avg response — fastest this ${period}`,
      detail: `${fastest.streakDays}d clean streak`,
    });
  }

  const mostStable = [...scored].sort((a, b) => b.uptime - a.uptime)[0];
  if (mostStable?.uptime > 0) {
    insights.push({
      type:   "info",
      title:  `${mostStable.api.name} leads with ${mostStable.uptime.toFixed(1)}% uptime this ${period}`,
      detail: `${mostStable.streakDays}d clean streak · ${mostStable.incidents} incidents`,
    });
  }

  return insights.slice(0, 6);
};
