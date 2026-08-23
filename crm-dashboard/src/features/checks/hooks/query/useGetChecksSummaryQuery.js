import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ChecksService } from "../../services";

export const useGetChecksSummaryQuery = (params) => {
  return useQuery({
    queryKey: ["checks-summary", params],
    queryFn: () => ChecksService.fetchChecksSummary(params),
    placeholderData: keepPreviousData,
  });
};
