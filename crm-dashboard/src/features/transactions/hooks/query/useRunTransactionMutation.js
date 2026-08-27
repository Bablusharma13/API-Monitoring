import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionsService } from "../../services";

export const useRunTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => TransactionsService.runNow(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-runs", id] });
    },
  });
};
