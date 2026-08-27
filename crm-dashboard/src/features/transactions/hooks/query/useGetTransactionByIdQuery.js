import { useQuery } from "@tanstack/react-query";
import { TransactionsService } from "../../services";

export const useGetTransactionByIdQuery = (id, options = {}) => {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: () => TransactionsService.fetchById(id),
    enabled: !!id,
    ...options,
  });
};
