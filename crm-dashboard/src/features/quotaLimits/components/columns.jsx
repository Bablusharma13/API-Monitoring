import { Badge } from "../../../components/ui/Badge";
import { PLAN_META, QUOTA_STATUS_META, planCapLabel } from "../constants";

const PlanBadge = ({ plan }) => (
  <Badge value={plan || "—"} variant={PLAN_META[plan]?.variant ?? "default"} />
);

const QuotaStatusBadge = ({ status }) => {
  const meta = QUOTA_STATUS_META[status] ?? QUOTA_STATUS_META.unknown;
  return <Badge value={meta.label} variant={meta.variant} />;
};

const QuotaBar = ({ pct, status }) => {
  if (pct == null)
    return <span className="text-[11px] text-gray-400">—</span>;
  const color =
    status === "over"
      ? "bg-red-500"
      : status === "warn"
        ? "bg-amber-500"
        : "bg-green-500";
  const textColor =
    status === "over"
      ? "text-red-600"
      : status === "warn"
        ? "text-amber-600"
        : "text-green-600";
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className={`font-mono text-[12px] ${textColor}`}>{pct}%</span>
    </div>
  );
};

export const quotaLimitsColumns = [
  {
    id: "tenantName",
    accessor: "tenantName",
    name: "Tenant",
    Header: "TENANT",
    group: "Tenant",
    cell: (row) => (
      <span className="text-[13px] text-gray-800">{row.tenantName}</span>
    ),
  },
  {
    id: "plan",
    accessor: "plan",
    name: "Plan",
    Header: "PLAN",
    group: "Tenant",
    cell: (row) => <PlanBadge plan={row.plan} />,
  },
  {
    id: "monthCap",
    accessor: "monthCap",
    name: "Monthly Cap",
    Header: "MONTHLY CAP",
    group: "Quota",
    cell: (row) =>
      row.monthCap ? (
        <span className="font-mono text-[12px] text-gray-700">
          {(row.monthCap / 1000000).toFixed(2)}M
        </span>
      ) : (
        <span className="text-[11px] text-gray-400">
          {planCapLabel(row.plan)}
        </span>
      ),
  },
  {
    id: "usedThisMonth",
    accessor: "usedThisMonth",
    name: "Used This Month",
    Header: "USED THIS MONTH",
    group: "Quota",
    cell: (row) => (
      <span className="font-mono text-[12px] text-gray-700">
        {((row.usedThisMonth ?? 0) / 1000000).toFixed(2)}M
      </span>
    ),
  },
  {
    id: "usedPct",
    accessor: "usedPct",
    name: "Quota Used",
    Header: "QUOTA USED",
    group: "Quota",
    cell: (row) => <QuotaBar pct={row.usedPct} status={row.status} />,
  },
  {
    id: "status",
    accessor: "status",
    name: "Status",
    Header: "STATUS",
    group: "Status",
    cell: (row) => <QuotaStatusBadge status={row.status} />,
  },
];
