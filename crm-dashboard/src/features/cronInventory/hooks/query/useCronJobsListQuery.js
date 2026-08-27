import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CronInventoryService } from "../../services";

// Query key is prefixed with "cron-jobs" (not "cron-jobs-inventory") on purpose:
// cronHeartbeat's toggle/run/update/delete mutations invalidate the
// ["cron-jobs"] key, and TanStack Query invalidates by array-prefix match, so
// keeping this list under the same prefix means those real mutations also
// refresh this table automatically.
export const useCronJobsListQuery = (params) => {
  return useQuery({
    queryKey: ["cron-jobs", "list", params],
    queryFn: () => CronInventoryService.fetchCronJobs(params),
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });
};
