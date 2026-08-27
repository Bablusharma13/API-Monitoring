import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SilencesService } from "../../services";

export const useGetSilencesQuery = (params, options = {}) => {
  return useQuery({
    queryKey: ["silences", params],
    queryFn: () => SilencesService.fetchAll(params),
    placeholderData: keepPreviousData,
    ...options,
  });
};
