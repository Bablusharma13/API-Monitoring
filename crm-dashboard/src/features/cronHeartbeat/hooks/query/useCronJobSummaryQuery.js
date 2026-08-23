import { useQuery } from "@tanstack/react-query";
import { CronHeartbeatService } from "../../services";

export const useCronJobSummaryQuery = () => {
  return useQuery({
    queryKey: ["cron-jobs-summary"],
    queryFn: () => CronHeartbeatService.fetchCronJobSummary(),
    refetchInterval: 30000,
  });
};
