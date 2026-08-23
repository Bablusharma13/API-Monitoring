import { useQuery } from "@tanstack/react-query";
import { CategoriesService } from "../../services";

export const useTeamMembersQuery = () =>
  useQuery({
    queryKey: ["team-members"],
    queryFn: CategoriesService.fetchTeamMembers,
    staleTime: 5 * 60 * 1000,
  });
