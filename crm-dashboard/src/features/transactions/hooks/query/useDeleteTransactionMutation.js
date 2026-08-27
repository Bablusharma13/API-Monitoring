import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionsService } from "../../services";

export const useDeleteTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => TransactionsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
