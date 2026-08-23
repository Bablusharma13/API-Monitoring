import { useQuery } from "@tanstack/react-query";
import { TenantService } from "../../services";

export const useGetTenantCardsQuery = (params = {}) => {
  return useQuery({
    queryKey: ["tenants-cards", params],
    queryFn: () => TenantService.fetchTenantCards(params),
  });
};
