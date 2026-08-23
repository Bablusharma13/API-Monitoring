import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { DashboardService } from "../../services";

export const useGetApisQuery = (params) => {
  return useQuery({
    queryKey: ["all-apis", params],
    queryFn: () => DashboardService.fetchAllApis(params),
    placeholderData: keepPreviousData,
  });
};
