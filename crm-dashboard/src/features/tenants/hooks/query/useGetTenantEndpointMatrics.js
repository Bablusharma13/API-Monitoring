import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetTenantEndpointMatricsQuery = (
  tenantId,
  page,
  limit,
  search,
  sortBy,
  sortOrder,
) => {
  return useQuery({
    queryKey: ["tenants", "endpont-matrics", tenantId, page, limit, search, sortBy, sortOrder],
    queryFn: () =>
      TenantService.fetchTenantEndpointMatrics(tenantId, page, limit, search, sortBy, sortOrder),
  });
};
