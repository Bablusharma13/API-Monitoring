import { useQuery } from "@tanstack/react-query";
import { ReferenceDataService } from "../../services";

export const useGetApisOptionsQuery = (enabled = true) => {
  return useQuery({
    queryKey: ["alerts-apis-options"],
    queryFn: async () => {
      try {
        const list = await ReferenceDataService.fetchApis();
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
