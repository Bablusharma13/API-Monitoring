import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DashboardService } from "../../services";

export const useGetApisSummaryQuery = () => {
  return useQuery({
    queryKey: ["all-apis-summary"],
    queryFn: () => DashboardService.fetchAllApisSummary(),
    placeholderData: keepPreviousData,
  });
};
