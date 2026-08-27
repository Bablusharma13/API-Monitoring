import { toast } from "sonner";
import { useAckAlertMutation } from "../hooks/query/useAckAlertMutation";
import { useResolveAlertMutation } from "../hooks/query/useResolveAlertMutation";

// Self-contained inline actions for one alert row — kept out of
// alertsColumns' plain data shape by living in its own cell component.
export const AlertRowActions = ({ row }) => {
  const { mutate: ack, isPending: acking } = useAckAlertMutation();
  const { mutate: resolve, isPending: resolving } = useResolveAlertMutation();
  const busy = acking || resolving;

  const onError = (error) =>
    toast.error(error?.response?.data?.message || "Action failed");

  if (row.status === "resolved" || row.status === "silenced") {
    return <span className="text-[11px] text-gray-300">—</span>;
  }

  return (
    <div
      className="flex items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      {row.status === "firing" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => ack(row._id, { onError })}
          className="px-2 py-1 border border-gray-200 rounded-md text-[11px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
        >
          Ack
        </button>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => resolve(row._id, { onError })}
        className="px-2 py-1 border border-green-200 bg-green-50 rounded-md text-[11px] text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
      >
        Resolve
      </button>
    </div>
  );
};
