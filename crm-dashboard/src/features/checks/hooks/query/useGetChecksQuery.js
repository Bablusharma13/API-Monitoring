import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ChecksService } from "../../services";

export const useGetChecksQuery = (params) => {
  return useQuery({
    queryKey: ["all-checks", params],
    queryFn: () => ChecksService.fetchAllChecks(params),
    placeholderData: keepPreviousData,
  });
};
