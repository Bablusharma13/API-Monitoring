import { Link } from "react-router-dom";
import { DEFAULT_SLO_TARGETS } from "../constants";

const SLO_STATUS_CONFIG = {
  met: {
    label: "Met",
    dot: "fill-green-500",
    ring: "ring-green-500",
    text: "text-green-700",
  },
  risk: {
    label: "At Risk",
    dot: "fill-amber-500",
    ring: "ring-amber-500",
    text: "text-amber-700",
  },
  breached: {
    label: "Breached",
    dot: "fill-red-500",
    ring: "ring-red-500",
    text: "text-red-700",
  },
};

export function SloStatusBadge({ status }) {
  const cfg = SLO_STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status ?? "—",
    dot: "fill-gray-400",
    ring: "ring-gray-400",
    text: "text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 ${cfg.text} ${cfg.ring}`}
    >
      <svg
        viewBox="0 0 6 6"
        aria-hidden="true"
        className={`size-1.5 ${cfg.dot}`}
      >
        <circle r={3} cx={3} cy={3} />
      </svg>
      {cfg.label}
    </span>
  );
}

function MetricCell({ value, target, unit, betterWhen }) {
  if (value == null) return <span className="text-gray-400">—</span>;
  const met =
    target == null
      ? true
      : betterWhen === "gte"
        ? value >= target
        : value <= target;
  return (
    <div className="flex flex-col leading-tight">
      <span
        className={`font-mono text-[12.5px] ${met ? "text-gray-800" : "text-red-600"}`}
      >
        {value}
        {unit}
      </span>
      {target != null && (
        <span className="text-[10.5px] text-gray-400">
          target {betterWhen === "gte" ? "≥" : "≤"} {target}
          {unit}
        </span>
      )}
    </div>
  );
}

// Columns are built as a function of `targets` since the current-vs-target
// comparison depends on the shared SLO targets returned alongside `apis`.
export const buildSloColumns = (targets = DEFAULT_SLO_TARGETS) => [
  {
    id: "apiName",
    accessor: "apiName",
    name: "API Name",
    Header: "API NAME",
    group: "Identity",
    cell: (row) =>
      row.apiId ? (
        <Link to={`/dashboard/apis/${row.apiId}`} className="text-blue-500">
          {row.apiName}
        </Link>
      ) : (
        <span>{row.apiName}</span>
      ),
  },
  {
    id: "status",
    accessor: "status",
    name: "SLO Status",
    Header: "SLO STATUS",
    group: "Compliance",
    cell: (row) => <SloStatusBadge status={row.status} />,
  },
  {
    id: "uptimePct",
    accessor: "uptimePct",
    name: "Uptime",
    Header: "UPTIME",
    group: "Metrics",
    cell: (row) => (
      <MetricCell
        value={row.uptimePct}
        target={targets.uptimePct}
        unit="%"
        betterWhen="gte"
      />
    ),
  },
  {
    id: "avgLatencyMs",
    accessor: "avgLatencyMs",
    name: "Avg Latency",
    Header: "AVG LATENCY",
    group: "Metrics",
    cell: (row) => (
      <MetricCell
        value={row.avgLatencyMs}
        target={targets.latencyMs}
        unit="ms"
        betterWhen="lte"
      />
    ),
  },
  {
    id: "errorRatePct",
    accessor: "errorRatePct",
    name: "Error Rate",
    Header: "ERROR RATE",
    group: "Metrics",
    cell: (row) => (
      <MetricCell
        value={row.errorRatePct}
        target={targets.errorRatePct}
        unit="%"
        betterWhen="lte"
      />
    ),
  },
];
