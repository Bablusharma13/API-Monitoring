import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MaintenanceWindowsService } from "../../services";

export const useUpdateMaintenanceWindowMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      MaintenanceWindowsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
    },
  });
};
