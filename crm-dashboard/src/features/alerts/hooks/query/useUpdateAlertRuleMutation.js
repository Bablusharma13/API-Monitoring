import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertRulesService } from "../../services";

export const useUpdateAlertRuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => AlertRulesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
    },
  });
};
