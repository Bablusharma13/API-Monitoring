import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardService } from "../../services";

export const useCreateApiMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => DashboardService.createApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-apis"] });
      queryClient.invalidateQueries({ queryKey: ["all-apis-summary"] });
    },
  });
};
