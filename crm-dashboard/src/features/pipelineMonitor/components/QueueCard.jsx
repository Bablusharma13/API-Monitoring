import { Layers } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { formatCount } from "../../../utils/helpers";

const TILES = [
  { key: "waiting", label: "Waiting", color: "#d97706" },
  { key: "active", label: "Active", color: "#2563eb" },
  { key: "completed", label: "Completed", color: "#16a34a" },
  { key: "failed", label: "Failed", color: "#dc2626" },
  { key: "delayed", label: "Delayed", color: "#7c3aed" },
];

export function QueueCard({ queue }) {
  const hasFailures = (queue.failed ?? 0) > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
        <div className="text-[13px] font-medium text-gray-800 flex items-center gap-2">
          <Layers size={14} className="text-gray-400" />
          {queue.name}
        </div>
        <Badge
          value={hasFailures ? "Has Failures" : "Healthy"}
          variant={hasFailures ? "warning" : "active"}
        />
      </div>
      <div className="grid grid-cols-5 gap-2 p-4">
        {TILES.map((t) => (
          <div
            key={t.key}
            className="text-center px-1.5 py-2.5 rounded-lg bg-gray-50"
          >
            <div
              className="text-[17px] font-[Outfit,sans-serif]"
              style={{ color: t.color }}
            >
              {formatCount(queue[t.key] ?? 0)}
            </div>
            <div className="text-[10.5px] text-gray-400 mt-0.5">
              {t.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
