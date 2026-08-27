import { useQuery } from "@tanstack/react-query";
import { NotificationChannelsOptionsService } from "../../services";

// Locally-duplicated read of the notification-channels list, scoped to this
// feature's "Notify via" multi-select — see services/index.js for why this
// isn't imported from src/features/alerts.
export const useGetNotificationChannelsOptionsQuery = (options = {}) => {
  return useQuery({
    queryKey: ["transactions-notification-channel-options"],
    queryFn: () => NotificationChannelsOptionsService.fetchAll({ limit: 200 }),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
