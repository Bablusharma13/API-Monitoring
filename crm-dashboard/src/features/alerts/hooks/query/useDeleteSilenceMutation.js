import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SilencesService } from "../../services";

export const useDeleteSilenceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => SilencesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["silences"] });
    },
  });
};
