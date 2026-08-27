import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { StorageTiersService } from "../../services";

export const useStorageStatsQuery = (params) => {
  return useQuery({
    queryKey: ["storage-stats", params],
    queryFn: () => StorageTiersService.fetchStorageStats(params),
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });
};
