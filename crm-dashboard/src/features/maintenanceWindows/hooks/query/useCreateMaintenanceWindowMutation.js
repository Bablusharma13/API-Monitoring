import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MaintenanceWindowsService } from "../../services";

export const useCreateMaintenanceWindowMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => MaintenanceWindowsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
    },
  });
};
