import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoriesService } from "../../services";

export const useBulkDeleteCategoriesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids) => CategoriesService.bulkDeleteCategories(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-categories"] });
      queryClient.invalidateQueries({ queryKey: ["all-categories-summary"] });
    },
  });
};