import { Badge } from "../../../components/ui/Badge";
import { SLO_THRESHOLD_MS, tenantColor } from "../constants";

// Real per-tenant p95 (24h avg, from TenantMetric via /tenants/cards),
// grouped client-side against the fixed SLO threshold — replaces the mock's
// hardcoded SLO_TENANTS array while keeping the same list/progress-bar
// presentation.
export function SloComplianceByTenant({ tenants = [], isLoading = false }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <div
          className="text-[14px] text-gray-800"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          SLO Compliance by Tenant
        </div>
        <Badge value={`SLO: p95 < ${SLO_THRESHOLD_MS}ms`} variant="beta" />
      </div>

      {isLoading ? (
        <div className="px-5 py-8 text-center text-[12.5px] text-gray-400">
          Loading tenant latency…
        </div>
      ) : tenants.length === 0 ? (
        <div className="px-5 py-8 text-center text-[12.5px] text-gray-400">
          No tenant latency data yet.
        </div>
      ) : (
        <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
          {tenants.map((t) => {
            const p95 = t.metrics?.p95ms ?? 0;
            const ok = p95 <= SLO_THRESHOLD_MS;
            const pct = Math.min(100, Math.round((p95 / SLO_THRESHOLD_MS) * 100));
            const barColor = ok
              ? pct > 70
                ? "bg-amber-500"
                : "bg-green-500"
              : "bg-red-500";
            const textColor = ok
              ? pct > 70
                ? "text-amber-600"
                : "text-green-600"
              : "text-red-600";
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-100 last:border-b-0"
              >
                <div
                  className="w-6 h-6 rounded-[6px] flex items-center justify-center text-[9px] font-semibold text-white flex-shrink-0"
                  style={{ background: tenantColor(t.id) }}
                >
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12.5px] text-gray-700 truncate">
                      {t.company}
                    </span>
                    <span
                      className={`font-mono text-[12px] ml-2 flex-shrink-0 ${textColor}`}
                    >
                      {p95}ms
                    </span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {ok ? (
                    <Badge value="Met" variant="active" />
                  ) : (
                    <Badge value="Breached" variant="down" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
