import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationChannelsService } from "../../services";

export const useUpdateNotificationChannelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      NotificationChannelsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-channels"] });
    },
  });
};
