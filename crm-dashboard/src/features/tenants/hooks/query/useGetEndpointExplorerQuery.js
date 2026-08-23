import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetTenantEndpointExplorerQuery = (page, limit, search, sortBy, sortOrder) => {
  return useQuery({
    queryKey: ["tenants", "endpont-explorer", page, limit, search, sortBy, sortOrder],
    queryFn: () => TenantService.fetchEndpointExplorer(page, limit, search, sortBy, sortOrder),
  });
};
