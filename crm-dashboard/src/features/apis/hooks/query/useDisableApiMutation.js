import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardService } from "../../services";

export const useDisableApiMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isDisabled }) => DashboardService.disableApi(id, isDisabled),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["api-details", id] });
      queryClient.invalidateQueries({ queryKey: ["all-apis"] });
      queryClient.invalidateQueries({ queryKey: ["all-apis-summary"] });
    },
  });
};
