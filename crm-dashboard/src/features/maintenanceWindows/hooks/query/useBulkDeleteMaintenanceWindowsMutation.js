import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MaintenanceWindowsService } from "../../services";

// No bulk endpoint exists on the backend for maintenance windows (only
// single-id PUT/DELETE), so a "bulk delete" is fired as one DELETE per id.
export const useBulkDeleteMaintenanceWindowsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids) =>
      Promise.all(ids.map((id) => MaintenanceWindowsService.remove(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-windows"] });
    },
  });
};
