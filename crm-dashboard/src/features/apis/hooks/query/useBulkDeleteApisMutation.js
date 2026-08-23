import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardService } from "../../services";

export const useBulkDeleteApisMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids) => DashboardService.bulkDeleteApis(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-apis"] });
      queryClient.invalidateQueries({ queryKey: ["all-apis-summary"] });
    },
  });
};
