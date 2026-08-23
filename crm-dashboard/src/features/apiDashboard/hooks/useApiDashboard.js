import { useQuery } from "@tanstack/react-query";
import { ApiDashboardService } from "../services/index.js";

function mapDownApis(raw = []) {
  return raw.map((r) => ({
    id: r.id,
    name: r.name,
    lastChecked: r.downSince ?? "—",
    downtime: r.duration ?? "—",
    incidents: r.incidents ?? 0,
    owner: r.owner ?? "—",
  }));
}

function mapSlowApis(raw = []) {
  return raw.map((r) => ({
    id: r.id,
    name: r.name,
    avgResp: r.avgResponse ?? r.avgResponse24h ?? "—",
    peakResp: r.peakResponse ?? "—",
    lastChecked: r.lastChecked ?? "—",
    owner: r.owner ?? "—",
  }));
}

export function useApiDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["api-dashboard"],
    queryFn: ApiDashboardService.fetchDashboard,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  return {
    isLoading,
    kpis: data?.kpis ?? {
      totalApis: 0,
      activeApis: 0,
      downNow: 0,
      avgUptime: "—",
      incidents: 0,
      avgResponse: "—",
    },
    systemStatus: data?.systemStatus ?? {
      healthy: 0,
      warning: 0,
      critical: 0,
      uptime: { today: "—", days7: "—", days30: "—" },
    },
    downtimeSummary: data?.downtimeSummary ?? {
      total30d: "—",
      today: "—",
      days7: "—",
      days30: "—",
      mostAffected: "—",
    },
    alertsSummary: data?.alertsSummary ?? {
      active: 0,
      critical: 0,
      resolved: 0,
      channels: [],
    },
    timeComparison: (Array.isArray(data?.timeComparison) &&
      data.timeComparison.length > 0 &&
      data.timeComparison.every((s) => Array.isArray(s?.metrics) && s.metrics.length > 0))
      ? data.timeComparison
      : [],
    topDownApis: mapDownApis(data?.topDownApis),
    topSlowApis: mapSlowApis(data?.topSlowApis),
    activeIncidents: data?.activeIncidents ?? [],
    allIncidents: data?.allIncidents ?? [],
    initialFeed: data?.initialFeed ?? [],
    feedEventPool: data?.feedEventPool ?? [],
    logs: data?.logs ?? [],
  };
}
