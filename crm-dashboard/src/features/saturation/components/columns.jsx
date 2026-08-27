import { Link } from "react-router-dom";
import { capacityStatus } from "../constants";

const PLAN_CONFIG = {
  starter: { label: "Starter", text: "text-gray-600", ring: "ring-gray-400", dot: "fill-gray-400" },
  business: { label: "Business", text: "text-blue-700", ring: "ring-blue-500", dot: "fill-blue-500" },
  enterprise: { label: "Enterprise", text: "text-purple-700", ring: "ring-purple-500", dot: "fill-purple-500" },
};

export function PlanBadge({ plan }) {
  const cfg = PLAN_CONFIG[plan?.toLowerCase()] ?? {
    label: plan ?? "—",
    text: "text-gray-600",
    ring: "ring-gray-400",
    dot: "fill-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 ${cfg.text} ${cfg.ring}`}
    >
      <svg viewBox="0 0 6 6" aria-hidden="true" className={`size-1.5 ${cfg.dot}`}>
        <circle r={3} cx={3} cy={3} />
      </svg>
      {cfg.label}
    </span>
  );
}

const STATUS_CONFIG = {
  ok: { label: "OK", text: "text-green-700", ring: "ring-green-500", dot: "fill-green-500" },
  warning: { label: "Warning", text: "text-amber-700", ring: "ring-amber-500", dot: "fill-amber-500" },
  critical: { label: "Over cap", text: "text-red-700", ring: "ring-red-500", dot: "fill-red-500" },
  unknown: { label: "—", text: "text-gray-500", ring: "ring-gray-400", dot: "fill-gray-400" },
};

export function CapacityStatusBadge({ usedPct }) {
  const cfg = STATUS_CONFIG[capacityStatus(usedPct)];
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 ${cfg.text} ${cfg.ring}`}
    >
      <svg viewBox="0 0 6 6" aria-hidden="true" className={`size-1.5 ${cfg.dot}`}>
        <circle r={3} cx={3} cy={3} />
      </svg>
      {cfg.label}
    </span>
  );
}

function barColor(usedPct) {
  const s = capacityStatus(usedPct);
  if (s === "critical") return "bg-red-500";
  if (s === "warning") return "bg-amber-500";
  return "bg-green-500";
}

export const quotaColumns = [
  {
    id: "tenantName",
    accessor: "tenantName",
    name: "Tenant",
    Header: "TENANT",
    group: "Identity",
    cell: (row) =>
      row.tenantId ? (
        <Link
          to={`/dashboard/tenants/${row.tenantId}`}
          className="text-blue-500"
        >
          {row.tenantName}
        </Link>
      ) : (
        <span>{row.tenantName}</span>
      ),
  },
  {
    id: "plan",
    accessor: "plan",
    name: "Plan",
    Header: "PLAN",
    group: "Identity",
    cell: (row) => <PlanBadge plan={row.plan} />,
  },
  {
    id: "usedThisMonth",
    accessor: "usedThisMonth",
    name: "Used This Month",
    Header: "USED THIS MONTH",
    group: "Capacity",
    cell: (row) => (
      <span className="font-mono text-[12px]">
        {(row.usedThisMonth || 0).toLocaleString()}
      </span>
    ),
  },
  {
    id: "monthCap",
    accessor: "monthCap",
    name: "Monthly Cap",
    Header: "MONTHLY CAP",
    group: "Capacity",
    cell: (row) => (
      <span className="font-mono text-[12px] text-gray-500">
        {row.monthCap != null ? row.monthCap.toLocaleString() : "—"}
      </span>
    ),
  },
  {
    id: "usedPct",
    accessor: "usedPct",
    name: "% of Cap Used",
    Header: "% OF CAP USED",
    group: "Capacity",
    cell: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
          <div
            className={`h-full rounded-full ${barColor(row.usedPct)}`}
            style={{ width: `${Math.min(100, row.usedPct || 0)}%` }}
          />
        </div>
        <span className="font-mono text-[12px]">
          {row.usedPct != null ? `${row.usedPct}%` : "—"}
        </span>
      </div>
    ),
  },
  {
    id: "rateLimitPerMinute",
    accessor: "rateLimitPerMinute",
    name: "Rate Limit /min",
    Header: "RATE LIMIT /MIN",
    group: "Capacity",
    cell: (row) => (
      <span className="font-mono text-[12px] text-gray-500">
        {row.rateLimitPerMinute != null ? row.rateLimitPerMinute : "—"}
      </span>
    ),
  },
  {
    id: "status",
    accessor: "status",
    name: "Status",
    Header: "STATUS",
    group: "Status",
    disableSortBy: true,
    cell: (row) => <CapacityStatusBadge usedPct={row.usedPct} />,
  },
];
