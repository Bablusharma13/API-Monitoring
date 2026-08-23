import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetTenantEmployeeMatricsQuery = (
  tenantId,
  eId,
  page,
  limit,
  search,
  sortBy,
  sortOrder,
) => {
  return useQuery({
    queryKey: ["tenants", "employee", "matrics", tenantId, eId, page, limit, search, sortBy, sortOrder],
    queryFn: () =>
      TenantService.fetchTenantEmployeeMatrics(tenantId, eId, page, limit, search, sortBy, sortOrder),
  });
};
