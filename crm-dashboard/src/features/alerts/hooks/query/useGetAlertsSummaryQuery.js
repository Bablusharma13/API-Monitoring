import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { AlertsService } from "../../services";

export const useGetAlertsSummaryQuery = (options = {}) => {
  return useQuery({
    queryKey: ["alerts-summary"],
    queryFn: () => AlertsService.fetchSummary(),
    placeholderData: keepPreviousData,
    ...options,
  });
};
