import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardService } from "../../services";

export const useDeleteApiMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => DashboardService.deleteApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-apis"] });
      queryClient.invalidateQueries({ queryKey: ["all-apis-summary"] });
    },
  });
};
