import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertsService } from "../../services";

export const useResolveAlertMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => AlertsService.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["alerts-summary"] });
    },
  });
};
