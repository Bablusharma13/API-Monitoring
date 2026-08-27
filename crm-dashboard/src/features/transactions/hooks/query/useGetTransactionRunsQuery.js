import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { TransactionsService } from "../../services";

export const useGetTransactionRunsQuery = (id, params, options = {}) => {
  return useQuery({
    queryKey: ["transaction-runs", id, params],
    queryFn: () => TransactionsService.fetchRuns(id, params),
    enabled: !!id,
    placeholderData: keepPreviousData,
    ...options,
  });
};
