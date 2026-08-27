import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { AuditLogService } from "../../services";

export const useGetAuditLogQuery = (params, options = {}) => {
  return useQuery({
    queryKey: ["audit-log", params],
    queryFn: () => AuditLogService.fetchAll(params),
    placeholderData: keepPreviousData,
    ...options,
  });
};
