import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertRulesService } from "../../services";

export const useDeleteAlertRuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => AlertRulesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
    },
  });
};
