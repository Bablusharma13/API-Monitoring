import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationChannelsService } from "../../services";

export const useCreateNotificationChannelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => NotificationChannelsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-channels"] });
    },
  });
};
