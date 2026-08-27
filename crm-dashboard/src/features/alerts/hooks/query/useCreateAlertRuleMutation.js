import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertRulesService } from "../../services";

export const useCreateAlertRuleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => AlertRulesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alert-rules"] });
    },
  });
};
