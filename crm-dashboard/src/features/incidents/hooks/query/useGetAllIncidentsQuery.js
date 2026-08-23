import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { IncidentsService } from "../../services";

export const useGetAllIncidentsQuery = (params) => {
  return useQuery({
    queryKey: ["all-incidents", params],
    queryFn: () => IncidentsService.fetchAllIncidents(params),
    placeholderData: keepPreviousData,
  });
};
