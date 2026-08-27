import { toast } from "sonner";
import { useTestNotificationChannelMutation } from "../hooks/query/useTestNotificationChannelMutation";

export const NotificationChannelTestButton = ({ row }) => {
  const { mutate: test, isPending } = useTestNotificationChannelMutation();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation();
        test(row._id, {
          onSuccess: (result) => {
            if (result?.success === false) {
              toast.error(result?.error || "Test notification failed");
            } else {
              toast.success("Test notification dispatched");
            }
          },
          onError: (error) =>
            toast.error(
              error?.response?.data?.message || "Failed to send test",
            ),
        });
      }}
      className="px-2.5 py-1 border border-gray-200 rounded-md text-[11.5px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
    >
      {isPending ? "Sending…" : "Test"}
    </button>
  );
};
