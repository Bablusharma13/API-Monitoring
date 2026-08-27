import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { NotificationChannelsService } from "../../services";

export const useGetNotificationChannelsQuery = (params, options = {}) => {
  return useQuery({
    queryKey: ["notification-channels", params],
    queryFn: () => NotificationChannelsService.fetchAll(params),
    placeholderData: keepPreviousData,
    ...options,
  });
};
