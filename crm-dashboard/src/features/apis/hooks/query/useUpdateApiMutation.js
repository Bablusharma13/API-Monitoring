import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardService } from "../../services";

export const useUpdateApiMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => DashboardService.updateApi(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["api-details", id] });
      queryClient.invalidateQueries({ queryKey: ["all-apis"] });
      queryClient.invalidateQueries({ queryKey: ["all-apis-summary"] });
    },
  });
};
