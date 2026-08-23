import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetTenantEmployeeDetailsQuery = (tenantId, eId) => {
  return useQuery({
    queryKey: ["tenants", "employee", tenantId, eId],
    queryFn: () => TenantService.fetchTenantEmployeeDetails(tenantId, eId),
  });
};
