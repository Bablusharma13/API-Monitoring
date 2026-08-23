import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetTenantsSummaryQuery = () => {
  return useQuery({
    queryKey: ["tenants-summary"],
    queryFn: () => TenantService.fetchTenantsSummary(),
  });
};
