import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../../apis/services";

export function useApiDetailsQuery(id) {
  return useQuery({
    queryKey: ["api-details", id],
    queryFn: () => DashboardService.fetchApiById(id),
    enabled: !!id,
  });
}
