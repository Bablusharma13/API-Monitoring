import { useQuery } from "@tanstack/react-query";
import { CronHeartbeatService } from "../../services";

export const useCronJobPingsQuery = (id, params) => {
  return useQuery({
    queryKey: ["cron-jobs", id, "pings", params],
    queryFn: () => CronHeartbeatService.fetchCronJobPings(id, params),
    refetchInterval: 30000,
  });
};
