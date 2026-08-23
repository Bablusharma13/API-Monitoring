import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetFleetSummaryQuery = () => {
  return useQuery({
    queryKey: ["tenants-fleet-summary"],
    queryFn: () => TenantService.fetchFleetSummary(),
  });
};
