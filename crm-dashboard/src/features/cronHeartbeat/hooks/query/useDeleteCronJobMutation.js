import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CronHeartbeatService } from "../../services";

export const useDeleteCronJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => CronHeartbeatService.deleteCronJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cron-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["cron-jobs-summary"] });
    },
  });
};
