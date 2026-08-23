import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetTenantDetailsQuery = (tenantId) => {
  return useQuery({
    queryKey: ["tenants", tenantId],
    queryFn: () => TenantService.fetchTenantDetails(tenantId),
  });
};
