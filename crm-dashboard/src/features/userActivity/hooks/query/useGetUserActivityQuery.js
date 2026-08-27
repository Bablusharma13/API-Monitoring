import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { UserActivityService } from "../../services";

// The backend returns the full (already top-200, sorted-by-volume) users list
// for the given window — no server-side pagination/sort/search, so callers
// filter/sort/paginate the returned `users` list client-side.
export const useGetUserActivityQuery = (params = {}) => {
  return useQuery({
    queryKey: ["user-activity", params],
    queryFn: () => UserActivityService.fetchUserActivity(params),
    placeholderData: keepPreviousData,
    refetchInterval: 30000,
  });
};
