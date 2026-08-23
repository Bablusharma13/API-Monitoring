import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useCreateTenantMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => TenantService.createTenant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants-cards"] });
      queryClient.invalidateQueries({ queryKey: ["tenants-summary"] });
      queryClient.invalidateQueries({ queryKey: ["tenants-fleet-summary"] });
    },
  });
};
