import { useQuery } from "@tanstack/react-query";
import { LogsService } from "../../services";

// Fallback path for LogDetailTrace: only used when the row wasn't handed
// over via router state (hard refresh / direct link), so it's keyed off
// the /:source/:id params and disabled unless both are present.
export const useGetLogByIdQuery = (source, id) => {
  return useQuery({
    queryKey: ["log-detail", source, id],
    queryFn: () => LogsService.fetchLogById(source, id),
    enabled: Boolean(source && id),
  });
};
