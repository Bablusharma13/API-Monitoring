import { toast } from "sonner";
import { Toggle } from "./Toggle";
import { useUpdateAlertRuleMutation } from "../hooks/query/useUpdateAlertRuleMutation";

// Self-contained cell: flips `enabled` via PUT the moment it's toggled, so
// alertRulesColumns stays a plain data-only array (no closures threaded
// through from the panel).
export const AlertRuleEnabledToggle = ({ row }) => {
  const { mutate, isPending } = useUpdateAlertRuleMutation();

  return (
    <Toggle
      checked={!!row.enabled}
      disabled={isPending}
      onChange={(next) =>
        mutate(
          { id: row._id, payload: { enabled: next } },
          {
            onError: (error) =>
              toast.error(
                error?.response?.data?.message || "Failed to update rule",
              ),
          },
        )
      }
    />
  );
};
