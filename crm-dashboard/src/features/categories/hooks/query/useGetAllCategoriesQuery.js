import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CategoriesService } from "../../services";

export const useGetAllCategoriesQuery = (params) => {
  return useQuery({
    queryKey: ["all-categories", params],
    queryFn: async () => {
      try {
        const response = await CategoriesService.fetchAllCategories(params);
        if (
          !response?.data ||
          (Array.isArray(response.data) && response.data.length === 0)
        ) {
          return {
            data: DUMMY_CATEGORIES,
            pagination: { total: DUMMY_CATEGORIES.length, totalPages: 1 },
          };
        }
        return response;
      } catch {
        return {
          data: DUMMY_CATEGORIES,
          pagination: { total: DUMMY_CATEGORIES.length, totalPages: 1 },
        };
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
