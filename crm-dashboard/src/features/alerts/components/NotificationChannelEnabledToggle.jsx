import { toast } from "sonner";
import { Toggle } from "./Toggle";
import { useUpdateNotificationChannelMutation } from "../hooks/query/useUpdateNotificationChannelMutation";

export const NotificationChannelEnabledToggle = ({ row }) => {
  const { mutate, isPending } = useUpdateNotificationChannelMutation();

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
                error?.response?.data?.message || "Failed to update channel",
              ),
          },
        )
      }
    />
  );
};
