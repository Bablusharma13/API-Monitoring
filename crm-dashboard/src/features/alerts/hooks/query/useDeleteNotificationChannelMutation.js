import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationChannelsService } from "../../services";

export const useDeleteNotificationChannelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => NotificationChannelsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-channels"] });
    },
  });
};
