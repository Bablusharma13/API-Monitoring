import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useUpdateTenantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, payload }) =>
      TenantService.updateTenant(tenantId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["tenants-cards"] });
      queryClient.invalidateQueries({ queryKey: ["tenants-summary"] });
    },
  });
};
