import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { TrafficService } from "../../services";

// Polls every 30s — cheap aggregate endpoint, near-real-time is enough here.
export const useGetTrafficAnalyticsQuery = (params) => {
  return useQuery({
    queryKey: ["traffic-analytics", params],
    queryFn: () => TrafficService.fetchTrafficAnalytics(params),
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });
};
