import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { CategoriesService } from "../../services";

const DUMMY_SUMMARY = {
  totalCategories: 0,
  totalApis: 0,
  activeApis: 0,
  downApis: 0,
  critical: 0,
  avgApisPerCategory: "0",
};

export const useGetCategoriesSummaryQuery = () => {
  return useQuery({
    queryKey: ["categories-summary"],
    queryFn: async () => {
      try {
        const response = await CategoriesService.fetchCategoriesSummary();
        return response || DUMMY_SUMMARY;
      } catch {
        return DUMMY_SUMMARY;
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
