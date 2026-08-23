import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetTenantDashboardQuery = (page, limit, search, sortBy, sortOrder) => {
  return useQuery({
    queryKey: ["tenant", "dashboard", page, limit, search, sortBy, sortOrder],
    queryFn: () => TenantService.fetchTenantDashboardSummary(page, limit, search, sortBy, sortOrder),
  });
};
