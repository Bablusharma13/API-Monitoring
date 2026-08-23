import { useQuery } from "@tanstack/react-query";
import { CronHeartbeatService } from "../../services";

export const useGetCronJobByIdQuery = (id) => {
  return useQuery({
    queryKey: ["cron-jobs"],
    queryFn: () => CronHeartbeatService.getCronDetails(id),
    refetchInterval: 30000,
  });
};
