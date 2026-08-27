import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { LogsService } from "../../services";

// Logs are the one screen where near-live polling is warranted — refetch
// every 15s in the background without blowing away the current page/scroll
// position (keepPreviousData keeps the old rows visible while refetching).
export const useGetLogsQuery = (params, options = {}) => {
  return useQuery({
    queryKey: ["all-logs", params],
    queryFn: () => LogsService.fetchAllLogs(params),
    placeholderData: keepPreviousData,
    refetchInterval: 15000,
    ...options,
  });
};
