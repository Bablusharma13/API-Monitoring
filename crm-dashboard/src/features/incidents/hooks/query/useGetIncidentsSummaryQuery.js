import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { IncidentsService } from "../../services";

const DUMMY_SUMMARY = {
  totalIncidents: 0,
  activeIncidents: 0,
  criticalIncidents: 0,
  resolvedToday: 0,
  avgResolution: "0m",
  slaBreaches: "0%",
};

export const useGetIncidentsSummaryQuery = () => {
  return useQuery({
    queryKey: ["incidents-summary"],
    queryFn: async () => {
      try {
        const response = await IncidentsService.fetchIncidentsSummary();
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
