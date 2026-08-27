import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SloDashboardService } from "../../services";

// The backend returns the full { targets, apis[] } payload for the given
// (optional) apiId — there is no server-side pagination/sort/search for this
// endpoint, so callers filter/sort/paginate the returned `apis` list client-side.
export const useGetSloQuery = (params = {}) => {
  return useQuery({
    queryKey: ["slo-dashboard", params],
    queryFn: () => SloDashboardService.fetchSlo(params),
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });
};
