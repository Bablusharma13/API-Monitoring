import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { MaintenanceWindowsService } from "../../services";

export const useGetMaintenanceWindowsQuery = (params, options = {}) => {
  return useQuery({
    queryKey: ["maintenance-windows", params],
    queryFn: () => MaintenanceWindowsService.fetchAll(params),
    placeholderData: keepPreviousData,
    ...options,
  });
};
