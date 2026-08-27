import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { PipelineMonitorService } from "../../services";

// Queue depths / dead-letter counts are cheap to read from BullMQ (in-memory
// Redis counters), so a fast 5s poll is fine here — unlike most other
// features, which should NOT poll this aggressively.
export const usePipelineStatsQuery = (params) => {
  return useQuery({
    queryKey: ["pipeline-stats", params],
    queryFn: () => PipelineMonitorService.fetchPipelineStats(params),
    placeholderData: keepPreviousData,
    refetchInterval: 5000,
  });
};
