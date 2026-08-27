import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CronJobHistoryService } from "../../services";

export const useCronJobPingStatsQuery = (id, params) => {
  return useQuery({
    queryKey: ["cron-jobs", id, "pings", "summary", params],
    queryFn: () => CronJobHistoryService.fetchPingStats(id, params),
    enabled: !!id,
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });
};
