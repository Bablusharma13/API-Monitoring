import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertsService } from "../../services";

export const useAckAlertMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => AlertsService.ack(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-summary"] });
    },
  });
};
