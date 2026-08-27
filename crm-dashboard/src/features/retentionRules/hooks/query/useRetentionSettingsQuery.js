import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { RetentionService } from "../../services";

export const useRetentionSettingsQuery = () => {
  return useQuery({
    queryKey: ["retention-settings"],
    queryFn: () => RetentionService.fetchRetentionSettings(),
    placeholderData: keepPreviousData,
  });
};
