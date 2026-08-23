import { useQuery } from "@tanstack/react-query";
import { CategoriesService } from "../../services";

export const useGetCategoriesListQuery = () => {
  return useQuery({
    queryKey: ["categories-list"],
    queryFn: async () => {
      try {
        const list = await CategoriesService.fetchCategoriesList();
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
