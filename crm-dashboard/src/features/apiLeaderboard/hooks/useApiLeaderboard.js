import { useQuery } from "@tanstack/react-query";
import { LeaderboardService } from "../services/index.js";

// ─── Badge key → display label ────────────────────────────────────────────────
const BADGE_LABEL = {
  mostStable: "Most Stable",
  fastest: "Fastest",
  critical: "Critical",
  rising: "Rising",
  streak: "Streak",
};

// ─── Insight type → icon type used by InsightItem ────────────────────────────
const INSIGHT_TYPE = {
  danger: "down",
  warning: "warning",
  info: "star",
};

// ─── Map a single ranking entry from the API to component shape ───────────────
function mapRanking(r) {
  return {
    id: r.api.id,
    name: r.api.name,
    status: r.api.status,
    type: r.api.type,
    tech: r.api.tech,
    cat: r.api.category?.name ?? "—",
    owner: r.api.owner?.name ?? "—",
    score: r.score,
    prevScore: r.prevScore,
    uptime: r.uptime,
    resp: r.avgResponse,
    inc: r.incidents,
    risk: r.riskScore,
    trend: r.trend,
    streak: r.streakDays,
    downtime: "—",
    badges: (r.badges ?? []).map((k) => BADGE_LABEL[k] ?? k),
    rank: r.rank,
  };
}

function mapSummary(s = {}) {
  return {
    rankedApis: s.totalApis ?? 0,
    bestUptime: s.bestUptime != null ? `${s.bestUptime}%` : "—",
    fastestResponse: s.fastestResponse != null ? `${s.fastestResponse}ms` : "—",
    mostIncidents: s.mostIncidents ?? 0,
    mostImproved: s.mostImproved ?? "—",
    topScore: s.topScore ?? 0,
  };
}

function mapInsights(raw = []) {
  return raw.map((ins) => ({
    type: INSIGHT_TYPE[ins.type] ?? "warning",
    title: ins.title,
    sub: ins.detail,
  }));
}

// ─── Client-side tab sorting over mapped rankings ─────────────────────────────
export function getTabData(tab = "best", catFilter = "all", apis = []) {
  let d =
    catFilter === "all"
      ? [...apis]
      : apis.filter((a) => a.cat === catFilter);

  switch (tab) {
    case "best":
      return [...d].sort((a, b) => b.score - a.score).slice(0, 10);
    case "worst":
      return [...d].sort((a, b) => a.score - b.score).slice(0, 10);
    case "slow":
      return [...d]
        .filter((a) => a.resp > 0)
        .sort((a, b) => b.resp - a.resp)
        .slice(0, 10);
    case "down":
      return [...d].sort((a, b) => b.inc - a.inc).slice(0, 10);
    case "risk":
      return [...d].sort((a, b) => b.risk - a.risk).slice(0, 10);
    case "improved":
      return [...d].sort((a, b) => b.trend - a.trend).slice(0, 10);
    default:
      return d.slice(0, 10);
  }
}

// ─── Badge helper (used by podium cards) ──────────────────────────────────────
export function getApiBadges(a) {
  const b = [];
  if (a.uptime >= 99.8 && a.inc === 0) b.push("Most Stable");
  if (a.resp <= 80 && a.resp > 0) b.push("Fastest");
  if (a.risk >= 70) b.push("Critical");
  if (a.trend > 3) b.push("Rising");
  if (a.streak >= 30) b.push("Streak");
  return b;
}

// ─── React hook ───────────────────────────────────────────────────────────────
export function useApiLeaderboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["api-leaderboard"],
    queryFn: LeaderboardService.fetchLeaderboard,
    staleTime: 60_000,
  });

  const apis = (data?.rankings ?? []).map(mapRanking);
  const stats = mapSummary(data?.summary);
  const insights = mapInsights(data?.insights);

  return { apis, stats, insights, isLoading, isError };
}
