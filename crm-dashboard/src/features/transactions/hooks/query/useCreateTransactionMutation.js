import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionsService } from "../../services";

export const useCreateTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => TransactionsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};
