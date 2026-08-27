import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SilencesService } from "../../services";

export const useCreateSilenceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => SilencesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["silences"] });
    },
  });
};
