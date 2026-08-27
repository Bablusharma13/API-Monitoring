import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RetentionService } from "../../services";

export const useUpdateRetentionSettingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, payload }) =>
      RetentionService.updateRetentionSetting(key, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["retention-settings"] });
    },
  });
};
