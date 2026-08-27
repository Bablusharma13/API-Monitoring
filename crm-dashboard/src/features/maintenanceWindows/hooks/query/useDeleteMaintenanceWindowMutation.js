import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MaintenanceWindowsService } from "../../services";

export const useDeleteMaintenanceWindowMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => MaintenanceWindowsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
    },
  });
};
