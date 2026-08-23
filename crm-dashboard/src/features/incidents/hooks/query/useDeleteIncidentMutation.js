import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IncidentsService } from "../../services";

export const useDeleteIncidentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => IncidentsService.deleteIncident(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-incidents"] });
      queryClient.invalidateQueries({ queryKey: ["all-incidents-summary"] });
    },
  });
};
