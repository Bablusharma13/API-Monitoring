import { useMemo, useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { useGetQuotaUsageQuery } from "../hooks/query/useGetQuotaUsageQuery";
import { quotaColumns } from "./columns";
import { SaturationStatsCardRow } from "./SaturationStatsCardRow";
import {
  CAPACITY_WARN_AT,
  CAPACITY_CRITICAL_AT,
  capacityStatus,
  SATURATION_GROUP,
  SATURATION_FILTERS,
} from "../constants";

const TENANT_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#16a34a",
  "#d97706",
  "#db2777",
  "#059669",
  "#ea580c",
  "#dc2626",
  "#4f46e5",
];

function gaugeColor(pct) {
  if (pct >= CAPACITY_CRITICAL_AT) return "#ef4444";
  if (pct >= CAPACITY_WARN_AT) return "#f97316";
  if (pct >= 50) return "#eab308";
  if (pct >= 25) return "#84cc16";
  return "#22c55e";
}

// ── Per-tenant capacity gauge (half-arc), replaces the 5 CPU/mem/db/net/disk
// gauges — the only real per-tenant signal we have is % of monthly cap used.
function CapacityGauge({ usedPct }) {
  const value = Math.min(100, usedPct || 0);
  const cx = 140,
    cy = 140,
    r = 110,
    sw = 16;
  const startAngle = Math.PI,
    total = Math.PI;
  const steps = 100;

  const segments = Array.from({ length: steps }, (_, i) => {
    const a1 = startAngle + (total * i) / steps;
    const a2 = startAngle + (total * (i + 1)) / steps;
    const x1 = cx + r * Math.cos(a1),
      y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2),
      y2 = cy + r * Math.sin(a2);
    const filled = i < Math.round((steps * value) / 100);
    return { x1, y1, x2, y2, color: gaugeColor(i), filled };
  });

  const wa = startAngle + (CAPACITY_WARN_AT / 100) * total;
  const wx1 = cx + (r - sw) * Math.cos(wa),
    wy1 = cy + (r - sw) * Math.sin(wa);
  const wx2 = cx + (r + sw) * Math.cos(wa),
    wy2 = cy + (r + sw) * Math.sin(wa);

  const na = startAngle + (value / 100) * total;
  const nx = cx + (r - 22) * Math.cos(na),
    ny = cy + (r - 22) * Math.sin(na);

  return (
    <svg width="180" height="105" viewBox="0 0 280 160">
      {segments.map((s, i) => (
        <path
          key={i}
          d={`M${s.x1.toFixed(2)},${s.y1.toFixed(2)} A${r},${r} 0 0,1 ${s.x2.toFixed(2)},${s.y2.toFixed(2)}`}
          stroke={s.color}
          strokeWidth={sw}
          fill="none"
          opacity={s.filled ? 1 : 0.18}
        />
      ))}
      <line
        x1={wx1.toFixed(1)}
        y1={wy1.toFixed(1)}
        x2={wx2.toFixed(1)}
        y2={wy2.toFixed(1)}
        stroke="#dc2626"
        strokeWidth="2"
        opacity="0.7"
      />
      {[0, 50, 100].map((t) => {
        const a = startAngle + (t / 100) * total;
        const tx = cx + (r + 22) * Math.cos(a),
          ty = cy + (r + 22) * Math.sin(a);
        return (
          <text
            key={t}
            x={tx.toFixed(1)}
            y={(ty + 4).toFixed(1)}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="10"
          >
            {t}
          </text>
        );
      })}
      <line
        x1={cx}
        y1={cy}
        x2={nx.toFixed(2)}
        y2={ny.toFixed(2)}
        stroke="#1c1f2e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="5" fill="#1c1f2e" />
    </svg>
  );
}

// ── Single request-volume-vs-cap bar-grid, replaces the 5-resource bar chart.
function CapacityBarChart({ tenants }) {
  const w = 480,
    h = 220,
    padL = 40,
    padR = 16,
    padT = 10,
    padB = 34;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const n = Math.max(1, tenants.length);
  const barGroupW = chartW / n;
  const barW = Math.min(28, barGroupW * 0.5);
  const yTicks = [0, 25, 50, 75, 100];
  const capY = padT + chartH - (100 / 100) * chartH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 220 }}>
      {yTicks.map((t) => {
        const y = padT + chartH - (t / 100) * chartH;
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={padL + chartW} y2={y} stroke="#f0f2f7" strokeWidth="1" />
            <text x={padL - 5} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="10">
              {t}%
            </text>
          </g>
        );
      })}
      <line
        x1={padL}
        y1={capY}
        x2={padL + chartW}
        y2={capY}
        stroke="#dc2626"
        strokeWidth="1"
        strokeDasharray="4,4"
        opacity="0.5"
      />
      <text x={padL + chartW - 4} y={capY - 3} textAnchor="end" fill="#dc2626" fontSize="9" opacity="0.7">
        cap
      </text>
      {tenants.map((t, i) => {
        const cx = padL + barGroupW * i + barGroupW / 2;
        const pct = Math.min(100, t.usedPct || 0);
        const barH = (pct / 100) * chartH;
        const label = (t.tenantName || "").split(" ")[0];
        return (
          <g key={t.tenantId || i}>
            <rect
              x={cx - barW / 2}
              y={padT + chartH - barH}
              width={barW}
              height={barH}
              fill={gaugeColor(t.usedPct || 0)}
              opacity="0.75"
              rx="2"
            />
            <text
              x={cx}
              y={padT + chartH + 16}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="9.5"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Request volume share by tenant — real, derived from usedThisMonth.
function RequestVolumeShareDonut({ tenants }) {
  const data = tenants.slice(0, 8).map((t, i) => ({
    label: (t.tenantName || "").split(" ")[0],
    value: t.usedThisMonth || 0,
    color: TENANT_COLORS[i % TENANT_COLORS.length],
  }));
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const cx = 90,
    cy = 90,
    r = 60,
    sw = 22;
  const circ = 2 * Math.PI * r;
  const arcs = data.reduce((acc, d) => {
    const dash = (d.value / total) * circ;
    const prevOffset = acc.length
      ? acc[acc.length - 1].offset + acc[acc.length - 1].dash
      : 0;
    acc.push({ dash, offset: prevOffset, color: d.color });
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative flex-shrink-0" style={{ width: 180, height: 180 }}>
        <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f2f7" strokeWidth={sw} />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={sw}
              strokeDasharray={`${a.dash} ${circ - a.dash}`}
              strokeDashoffset={-a.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[18px] text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {total.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-400">requests</div>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-[12.5px] text-gray-700">{d.label}</span>
            </div>
            <div className="font-mono text-[12px] text-gray-400">
              {((d.value / total) * 100).toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Saturation = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("usedPct");
  const [sortType, setSortType] = useState("desc");
  const [activeFilters, setActiveFilters] = useState({});

  const { data, isLoading, isFetching } = useGetQuotaUsageQuery();
  const tenants = useMemo(() => data || [], [data]);

  const stats = useMemo(() => {
    const totalTenants = tenants.length;
    const withPct = tenants.filter((t) => t.usedPct != null);
    const avgUsedPct = withPct.length
      ? Math.round(
          (withPct.reduce((a, t) => a + t.usedPct, 0) / withPct.length) * 100,
        ) / 100
      : null;
    const nearCap = tenants.filter(
      (t) => t.usedPct != null && t.usedPct >= CAPACITY_WARN_AT && t.usedPct < CAPACITY_CRITICAL_AT,
    ).length;
    const overCap = tenants.filter(
      (t) => t.usedPct != null && t.usedPct >= CAPACITY_CRITICAL_AT,
    ).length;
    const totalRequestsThisMonth = tenants.reduce(
      (a, t) => a + (t.usedThisMonth || 0),
      0,
    );
    return { totalTenants, avgUsedPct, nearCap, overCap, totalRequestsThisMonth };
  }, [tenants]);

  const gaugesTenants = useMemo(
    () => [...tenants].sort((a, b) => (b.usedPct || 0) - (a.usedPct || 0)),
    [tenants],
  );

  const filteredTenants = useMemo(() => {
    let list = tenants;
    if (activeFilters.plan) {
      list = list.filter((t) => t.plan === activeFilters.plan);
    }
    if (activeFilters.status) {
      list = list.filter((t) => capacityStatus(t.usedPct) === activeFilters.status);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((t) => t.tenantName?.toLowerCase().includes(q));
    }
    return list;
  }, [tenants, activeFilters, searchTerm]);

  const sortedTenants = useMemo(() => {
    if (!sortField) return filteredTenants;
    const dir = sortType === "desc" ? -1 : 1;
    return [...filteredTenants].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string") return av.localeCompare(bv) * dir;
      return (av - bv) * dir;
    });
  }, [filteredTenants, sortField, sortType]);

  const totalResults = sortedTenants.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageLimit));
  const paginated = sortedTenants.slice(
    (pageIndex - 1) * pageLimit,
    pageIndex * pageLimit,
  );

  return (
    <div className="container-page">
      <PageHeader
        icon={
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d97706"
            strokeWidth="1.8"
          >
            <path d="M18 20V10" />
            <path d="M12 20V4" />
            <path d="M6 20v-6" />
          </svg>
        }
        iconGradient=""
        title="Tenant Capacity"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Tenant Capacity" },
        ]}
      />

      <Section>
        <SaturationStatsCardRow isLoading={isLoading} {...stats} />
      </Section>

      <Section>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            % of Monthly Request Cap Consumed — by Tenant
          </div>
          <div className="px-5 py-5">
            {!isLoading && gaugesTenants.length === 0 && (
              <div className="py-8 text-center text-gray-400 text-[13px]">
                No tenant quota data available.
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {gaugesTenants.map((t) => (
                <div
                  key={t.tenantId}
                  className="border border-gray-200 rounded-xl p-4 flex flex-col items-center hover:border-gray-300 transition-colors"
                >
                  <div className="text-[13.5px] text-gray-800 mb-0.5 text-center truncate w-full" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {t.tenantName}
                  </div>
                  <div className="text-[11px] text-gray-400 mb-2 capitalize">{t.plan}</div>
                  <CapacityGauge usedPct={t.usedPct} />
                  <div className="text-[26px] text-gray-800 font-light mt-1 leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {t.usedPct != null ? `${t.usedPct}%` : "—"}
                  </div>
                  <div
                    className={`text-[11.5px] mt-1 ${
                      capacityStatus(t.usedPct) === "critical"
                        ? "text-red-600"
                        : capacityStatus(t.usedPct) === "warning"
                          ? "text-amber-600"
                          : "text-green-600"
                    }`}
                  >
                    {capacityStatus(t.usedPct) === "critical"
                      ? "Over cap"
                      : capacityStatus(t.usedPct) === "warning"
                        ? `Watch — warn at ${CAPACITY_WARN_AT}%`
                        : "Healthy"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Request Volume vs. Cap — by Tenant
            </div>
            <div className="px-5 py-4">
              <CapacityBarChart tenants={gaugesTenants} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Request Volume Share by Tenant
            </div>
            <div className="px-5 py-4">
              <RequestVolumeShareDonut tenants={gaugesTenants} />
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <NewTableConfig
          module="tenant-capacity"
          columns={quotaColumns}
          data={paginated}
          isLoading={isFetching}
          group={SATURATION_GROUP}
          currentPage={pageIndex}
          setCurrentPage={setPageIndex}
          pageLimit={pageLimit}
          handlePageLimitChange={setPageLimit}
          totalResults={totalResults}
          totalPages={totalPages}
          searchQuery={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v);
            setPageIndex(1);
          }}
          sortBy={sortField}
          sortOrder={sortType}
          handleServerSideSorting={({ sortBy, sortDirection }) => {
            setSortField(sortBy);
            setSortType(sortDirection);
          }}
          availableAdditionalFilters={SATURATION_FILTERS}
          onFiltersChange={(f) => {
            setActiveFilters(f);
            setPageIndex(1);
          }}
          showRowNumbers={false}
        />
      </Section>
    </div>
  );
};
