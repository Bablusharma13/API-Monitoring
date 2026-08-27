import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ErrorsAnalyticsService } from "../../services";

// Polls every 30s — cheap aggregate endpoint, near-real-time is enough here.
export const useGetErrorAnalyticsQuery = (params) => {
  return useQuery({
    queryKey: ["error-analytics", params],
    queryFn: () => ErrorsAnalyticsService.fetchErrorAnalytics(params),
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });
};
