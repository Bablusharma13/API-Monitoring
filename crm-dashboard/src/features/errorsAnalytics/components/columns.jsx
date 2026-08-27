import { TENANT_COLOR_PALETTE } from "../../traffic/constants";

// Tiered coloring for an error-rate percentage. There's no configured SLO
// in the /analytics/errors contract, so these are just visual risk tiers
// (not a claimed SLO threshold): <1% ok, 1-2% elevated, >2% high.
function errorTier(pct) {
  if (pct > 2) return { text: "text-red-600", bar: "bg-red-500", label: "High", badge: "bg-red-50 text-red-600" };
  if (pct > 1) return { text: "text-amber-600", bar: "bg-amber-500", label: "Elevated", badge: "bg-amber-50 text-amber-600" };
  return { text: "text-green-600", bar: "bg-green-500", label: "OK", badge: "bg-green-50 text-green-600" };
}

export const getErrorTenantColumns = () => [
  {
    id: "tenantName",
    accessor: "tenantName",
    name: "Tenant",
    Header: "TENANT",
    group: "Tenant",
    width: 200,
    // `_colorIndex` is stamped onto each row by the caller (stable position
    // in the full byTenant list) so the swatch color survives pagination.
    cell: (row) => {
      const idx = row._colorIndex ?? 0;
      const color = TENANT_COLOR_PALETTE[idx % TENANT_COLOR_PALETTE.length];
      return (
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-[4px] flex-shrink-0" style={{ background: color }} />
          <span className="text-[13px] text-gray-800">{row.tenantName || "Unknown"}</span>
        </div>
      );
    },
  },
  {
    id: "errorRatePct",
    accessor: "errorRatePct",
    name: "Error Rate",
    Header: "ERROR RATE",
    group: "Errors",
    width: 100,
    cell: (row) => {
      const pct = row.errorRatePct ?? 0;
      const tier = errorTier(pct);
      return <span className={`font-mono text-[12.5px] font-medium ${tier.text}`}>{pct}%</span>;
    },
  },
  {
    id: "errorBar",
    accessor: "errorBar",
    name: "Trend",
    Header: "TREND",
    group: "Errors",
    width: 160,
    disableSortBy: true,
    cell: (row) => {
      const pct = row.errorRatePct ?? 0;
      const tier = errorTier(pct);
      const barW = Math.min(100, Math.round((pct / 4) * 100));
      return (
        <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${tier.bar}`} style={{ width: `${barW}%` }} />
        </div>
      );
    },
  },
  {
    id: "status",
    accessor: "status",
    name: "Status",
    Header: "STATUS",
    group: "Errors",
    width: 100,
    disableSortBy: true,
    cell: (row) => {
      const pct = row.errorRatePct ?? 0;
      const tier = errorTier(pct);
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${tier.badge}`}>
          {tier.label}
        </span>
      );
    },
  },
];
