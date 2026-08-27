import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SaturationService } from "../../services";

// Returns the full per-tenant quota-usage list — no server-side
// pagination/sort/search, so callers filter/sort/paginate client-side.
export const useGetQuotaUsageQuery = () => {
  return useQuery({
    queryKey: ["tenant-quota-usage"],
    queryFn: () => SaturationService.fetchQuotaUsage(),
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });
};
