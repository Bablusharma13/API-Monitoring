import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { QuotaLimitsService } from "../../services";

// The quota-usage endpoint returns every tenant in one shot (no
// pagination/search/sort support server-side), so it's polled on a normal
// cadence and filtered/sorted/paginated client-side by the page.
export const useGetQuotaUsageQuery = () => {
  return useQuery({
    queryKey: ["tenants-quota-usage"],
    queryFn: async () => {
      const list = await QuotaLimitsService.fetchQuotaUsage();
      return Array.isArray(list) ? list : [];
    },
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });
};
