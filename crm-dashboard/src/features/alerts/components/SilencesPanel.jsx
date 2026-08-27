import { useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "../../../components/ui/ActionButton";
import { AddIcon } from "../../../components/ui/Icons";
import { formatDateTime } from "../../../utils/helpers";
import { formatScope } from "../constants";
import { useGetSilencesQuery } from "../hooks/query/useGetSilencesQuery";
import { useDeleteSilenceMutation } from "../hooks/query/useDeleteSilenceMutation";
import { SilenceFormModal } from "./SilenceFormModal";

const remainingLabel = (endsAt) => {
  const diffMs = new Date(endsAt).getTime() - Date.now();
  if (diffMs <= 0) return { label: "Expired", expired: true };
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return { label: `${mins}m left`, expired: false };
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return { label: `${hours}h ${rem}m left`, expired: false };
};

export const SilencesPanel = () => {
  const [formOpen, setFormOpen] = useState(false);

  const { data: silencesResponse, isFetching } = useGetSilencesQuery({
    limit: 100,
    sortBy: "endsAt",
    sortOrder: "asc",
  });
  const { mutate: deleteSilence, isPending: isDeleting } =
    useDeleteSilenceMutation();

  const silences = silencesResponse?.data || [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] text-gray-800 font-medium">
          Silences{" "}
          <span className="text-[12px] text-gray-400 font-normal">
            ({silencesResponse?.pagination?.total ?? silences.length})
          </span>
        </h3>
        <ActionButton
          action="search"
          label="Add Silence"
          icon={AddIcon}
          onClick={() => setFormOpen(true)}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isFetching && !silences.length && (
          <div className="px-4 py-8 text-center text-[13px] text-gray-400">
            Loading silences…
          </div>
        )}

        {!isFetching && !silences.length && (
          <div className="px-4 py-8 text-center text-[13px] text-gray-400">
            No silences configured. Alerts are notifying normally.
          </div>
        )}

        {silences.map((s) => {
          const remaining = remainingLabel(s.endsAt);
          return (
            <div
              key={s._id}
              className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0"
            >
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${remaining.expired ? "bg-gray-400" : "bg-amber-500"}`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gray-800 mb-0.5">
                  {formatScope(s.scope)}
                </div>
                <div className="text-[11px] text-gray-400">
                  {s.reason || "No reason given"}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  {formatDateTime(s.startsAt)} – {formatDateTime(s.endsAt)}
                  {s.createdBy ? ` · by ${s.createdBy}` : ""}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className={`font-mono text-[12px] mb-1.5 ${remaining.expired ? "text-gray-400" : "text-amber-600"}`}
                >
                  {remaining.label}
                </div>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() =>
                    deleteSilence(s._id, {
                      onSuccess: () => toast.success("Silence removed"),
                      onError: (error) =>
                        toast.error(
                          error?.response?.data?.message ||
                            "Failed to remove silence",
                        ),
                    })
                  }
                  className="px-2.5 py-1 border border-red-200 bg-red-50 rounded-md text-[11.5px] text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {remaining.expired ? "Remove" : "End Now"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <SilenceFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
};
