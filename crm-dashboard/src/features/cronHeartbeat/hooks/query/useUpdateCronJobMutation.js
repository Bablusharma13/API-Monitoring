import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CronHeartbeatService } from "../../services";

export const useUpdateCronJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => CronHeartbeatService.updateCronJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cron-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["cron-jobs-summary"] });
    },
  });
};
