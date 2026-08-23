import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IncidentsService } from "../../services";

export const useBulkDeleteIncidentsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids) => IncidentsService.bulkDeleteIncidents(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["all-incidents-summary"] });
    },
  });
};
