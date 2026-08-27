import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { TransactionsService } from "../../services";

export const useGetTransactionsQuery = (params, options = {}) => {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => TransactionsService.fetchAll(params),
    placeholderData: keepPreviousData,
    ...options,
  });
};
