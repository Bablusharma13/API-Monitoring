import { useQuery } from "@tanstack/react-query";
import { ReferenceDataService } from "../../services";

export const useGetCategoriesOptionsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ["maintenance-windows-categories-options"],
    queryFn: async () => {
      try {
        const list = await ReferenceDataService.fetchCategories();
        return Array.isArray(list) ? list : [];
      } catch {
        return [];
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
