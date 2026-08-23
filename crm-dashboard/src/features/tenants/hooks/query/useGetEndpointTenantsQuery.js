import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetEndpointTenantsQuery = (endpoint, method, page, limit, search, sortBy, sortOrder) => {
  return useQuery({
    queryKey: ["endpoint-tenants", endpoint, method, page, limit, search, sortBy, sortOrder],
    queryFn: () => TenantService.fetchEndpointTenants(endpoint, method, page, limit, search, sortBy, sortOrder),
    enabled: !!endpoint && !!method,
  });
};
