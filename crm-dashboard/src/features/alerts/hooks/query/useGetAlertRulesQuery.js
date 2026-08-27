import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { AlertRulesService } from "../../services";

export const useGetAlertRulesQuery = (params, options = {}) => {
  return useQuery({
    queryKey: ["alert-rules", params],
    queryFn: () => AlertRulesService.fetchAll(params),
    placeholderData: keepPreviousData,
    ...options,
  });
};
