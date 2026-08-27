import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationChannelsService } from "../../services";

export const useTestNotificationChannelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => NotificationChannelsService.test(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-channels"] });
    },
  });
};
