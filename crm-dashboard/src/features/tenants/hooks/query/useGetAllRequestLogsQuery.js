import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetAllRequestLogQuery = (
  page,
  limit,
  search,
  sortBy,
  sortOrder,
) => {
  return useQuery({
    queryKey: [
      "tenants",
      "request-log",
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      TenantService.fetchRequestLog(page, limit, search, sortBy, sortOrder),
    placeholderData: keepPreviousData,
  });
};
