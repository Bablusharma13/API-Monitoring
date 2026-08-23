import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CronHeartbeatService } from "../../services";

export const useCreateCronJobMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => CronHeartbeatService.createCronJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cron-jobs"] });
    },
  });
};
