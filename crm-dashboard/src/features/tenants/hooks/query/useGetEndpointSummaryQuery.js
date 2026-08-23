import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetEndpointSummaryQuery = (endpoint, method) => {
  return useQuery({
    queryKey: ["endpoint-summary", endpoint, method],
    queryFn: () => TenantService.fetchEndpointSummary(endpoint, method),
    enabled: !!endpoint && !!method,
  });
};
