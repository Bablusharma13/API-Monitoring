import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetTenantEmployeesQuery = (
  tenantId,
  page,
  limit,
  search,
  sortBy,
  sortOrder,
) => {
  return useQuery({
    queryKey: ["tenants", "employees", tenantId, page, limit, search, sortBy, sortOrder],
    queryFn: () =>
      TenantService.fetchTenantEmployees(tenantId, page, limit, search, sortBy, sortOrder),
  });
};
