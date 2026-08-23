import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoriesService } from "../../services";

export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => CategoriesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-categories"] });
      queryClient.invalidateQueries({ queryKey: ["all-categories-summary"] });
    },
  });
};
