import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetTenantRequestLogQuery = (
  tenantId,
  page,
  limit,
  search,
  sortBy,
  sortOrder,
) => {
  return useQuery({
    queryKey: ["tenants", "request-log", tenantId, page, limit, search, sortBy, sortOrder],
    queryFn: () =>
      TenantService.fetchTenantRequestLog(tenantId, page, limit, search, sortBy, sortOrder),
  });
};
