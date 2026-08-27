import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { AlertsService } from "../../services";

export const useGetAlertsQuery = (params, options = {}) => {
  return useQuery({
    queryKey: ["alerts", params],
    queryFn: () => AlertsService.fetchAll(params),
    placeholderData: keepPreviousData,
    ...options,
  });
};
