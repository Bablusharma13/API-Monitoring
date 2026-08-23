import { useQuery } from "@tanstack/react-query";
import { CronHeartbeatService } from "../../services";

export const useCronJobsQuery = () => {
  return useQuery({
    queryKey: ["cron-jobs"],
    queryFn: () => CronHeartbeatService.fetchCronJobs(),
    refetchInterval: 30000,
  });
};
