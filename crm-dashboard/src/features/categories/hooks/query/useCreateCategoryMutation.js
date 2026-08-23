import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoriesService } from "../../services";

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => CategoriesService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-summary"] });
    },
  });
};
