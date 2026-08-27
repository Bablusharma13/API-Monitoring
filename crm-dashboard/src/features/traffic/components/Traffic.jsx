import { useMemo, useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { ActionButton } from "../../../components/ui/ActionButton";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { ExportIcon } from "../../../components/ui/Icons";
import { formatCount } from "../../../utils/helpers";
import { useGetTrafficAnalyticsQuery } from "../hooks/query/useGetTrafficAnalyticsQuery";
import { getTrafficColumns } from "./columns";
import { TrafficStatsCardRow } from "./TrafficStatsCardRow";
import {
  TRAFFIC_WINDOW_OPTIONS,
  TRAFFIC_WINDOW_BUCKET_MINUTES,
  TRAFFIC_GROUP,
  METHOD_COLORS,
  METHOD_COLOR_FALLBACK,
  TENANT_COLOR_PALETTE,
  HEATMAP_DAY_ORDER,
  HEATMAP_DAY_LABEL,
  HEATMAP_COLOR_SCALE,
} from "../constants";

// ── shared bits ─────────────────────────────────────────────────────────────
function EmptyState({ label = "No data for this window yet" }) {
  return <div className="py-10 text-center text-[12.5px] text-gray-400">{label}</div>;
}

function RangeBtns({ options, active, onChange }) {
  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-[12px] border-r last:border-r-0 border-gray-200 transition-colors ${
            active === opt.value ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const fmtBucketTime = (bucket, window) => {
  const d = new Date(bucket);
  if (Number.isNaN(d.getTime())) return "—";
  if (window === "7d") {
    const wd = d.toLocaleDateString([], { weekday: "short" });
    const hh = String(d.getHours()).padStart(2, "0");
    return `${wd} ${hh}:00`;
  }
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
};

// ── Requests-over-time chart (real rpm buckets) ─────────────────────────────
function TrafficChart({ rpm, window: win }) {
  if (!rpm.length) return <EmptyState />;

  const w = 900,
    h = 200,
    padL = 44,
    padR = 16,
    padT = 10,
    padB = 28;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const pts = rpm.length;

  const counts = rpm.map((b) => b.count || 0);
  const maxVal = Math.max(...counts, 1);
  const yMax = Math.ceil(maxVal / 10) * 10 || 10;

  const toX = (i) => padL + (pts <= 1 ? 0 : (i / (pts - 1)) * chartW);
  const toY = (v) => padT + chartH - (v / yMax) * chartH;

  const linePath = rpm
    .map((b, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(b.count || 0).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${(padL + chartW).toFixed(1)},${(padT + chartH).toFixed(1)} L${padL.toFixed(1)},${(padT + chartH).toFixed(1)} Z`;

  const yTicks = [0, yMax / 2, yMax];
  const tickCount = Math.min(6, pts);
  const xTickIdx = Array.from({ length: tickCount }, (_, i) =>
    Math.round((i / Math.max(1, tickCount - 1)) * (pts - 1)),
  );

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 180 }}>
      {yTicks.map((t) => {
        const y = toY(t);
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={padL + chartW} y2={y} stroke="#e9ebf0" strokeWidth="1" opacity="0.5" />
            <text x={padL - 5} y={y + 4} textAnchor="end" fill="#9ca3af" fontSize="10" fontFamily="DM Mono, monospace">
              {formatCount(Math.round(t))}
            </text>
          </g>
        );
      })}
      {rpm.map((b, i) => {
        const bw = Math.max(1, chartW / pts - (pts > 80 ? 0.5 : 3));
        const x = toX(i) - bw / 2;
        const ok = b.ok || 0;
        const fail = b.fail || 0;
        return (
          <g key={i}>
            <rect x={x} y={toY(ok)} width={bw} height={(ok / yMax) * chartH} fill="#16a34a22" rx="1" />
            <rect x={x} y={toY(b.count || 0)} width={bw} height={(fail / yMax) * chartH} fill="#dc262622" rx="1" />
          </g>
        );
      })}
      <path d={areaPath} fill="#2563eb" opacity="0.06" />
      <path d={linePath} stroke="#2563eb" strokeWidth="2" fill="none" />
      {xTickIdx.map((i) => (
        <text
          key={i}
          x={toX(i)}
          y={padT + chartH + 16}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="10"
          fontFamily="DM Mono, monospace"
        >
          {fmtBucketTime(rpm[i].bucket, win)}
        </text>
      ))}
    </svg>
  );
}

// ── Method donut (real methods[]) ───────────────────────────────────────────
function MethodDonut({ methods }) {
  if (!methods.length) return <EmptyState />;
  const total = methods.reduce((a, b) => a + (b.count || 0), 0) || 1;
  const cx = 70,
    cy = 70,
    r = 52,
    sw = 20;
  const circ = 2 * Math.PI * r;
  const dashes = methods.map((m) => ((m.count || 0) / total) * circ);
  const arcs = methods.map((m, i) => ({
    dash: dashes[i],
    offset: dashes.slice(0, i).reduce((a, d) => a + d, 0),
    color: METHOD_COLORS[m.method] || METHOD_COLOR_FALLBACK,
  }));

  return (
    <div className="flex items-center gap-7">
      <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f2f7" strokeWidth={sw} />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={a.color + "99"}
              strokeWidth={sw}
              strokeDasharray={`${a.dash} ${circ - a.dash}`}
              strokeDashoffset={-a.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[20px] text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {formatCount(total)}
          </div>
          <div className="text-[10px] text-gray-400">total</div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-2.5">
        {methods.map((m) => {
          const color = METHOD_COLORS[m.method] || METHOD_COLOR_FALLBACK;
          const pct = Math.round(((m.count || 0) / total) * 100);
          return (
            <div key={m.method} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-[3px] flex-shrink-0" style={{ background: color }} />
                <span className="text-[13px] text-gray-700">{m.method || "—"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="font-mono text-[12px] text-gray-400 min-w-[32px] text-right">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Traffic share by tenant (real byTenant[]) ───────────────────────────────
function TenantShare({ byTenant }) {
  if (!byTenant.length) return <EmptyState />;
  const totalRps = byTenant.reduce((a, b) => a + (b.rps || 0), 0) || 1;
  return (
    <div className="flex flex-col gap-2.5">
      {byTenant.map((t, i) => {
        const color = TENANT_COLOR_PALETTE[i % TENANT_COLOR_PALETTE.length];
        const pct = Math.round(((t.rps || 0) / totalRps) * 100);
        return (
          <div key={t.tenantId || t.tenantName} className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-[5px] flex-shrink-0" style={{ background: color }} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-[12.5px] text-gray-700 truncate">{t.tenantName || "Unknown"}</span>
                <span className="font-mono text-[11.5px] text-gray-400 flex-shrink-0 ml-2">
                  {t.rps ?? 0} rps &middot; {pct}%
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full opacity-80" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Heatmap (real day/hour/count[]) ─────────────────────────────────────────
function Heatmap({ heatmap }) {
  if (!heatmap.length) return <EmptyState />;
  const byKey = new Map(heatmap.map((c) => [`${c.day}-${c.hour}`, c.count || 0]));
  const maxV = Math.max(...heatmap.map((c) => c.count || 0), 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const toColor = (v) => {
    if (!v) return "#f0f2f7";
    const i = Math.min(HEATMAP_COLOR_SCALE.length - 1, Math.floor((v / maxV) * HEATMAP_COLOR_SCALE.length));
    return HEATMAP_COLOR_SCALE[i];
  };

  return (
    <div className="chart-scroll-x">
      <div className="min-w-[560px]">
        <div className="flex mb-1.5 pl-11">
          <div className="grid gap-0.5 flex-1" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
            {hours.map((h) => (
              <div key={h} className="text-center font-mono text-[9px] text-gray-400">
                {h % 3 === 0 ? h.toString().padStart(2, "0") : ""}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          {HEATMAP_DAY_ORDER.map((day) => (
            <div key={day} className="flex items-center gap-1.5">
              <div className="w-9 text-[11px] text-gray-400 text-right flex-shrink-0">
                {HEATMAP_DAY_LABEL[day]}
              </div>
              <div className="grid gap-0.5 flex-1" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
                {hours.map((h) => {
                  const v = byKey.get(`${day}-${h}`) || 0;
                  return (
                    <div
                      key={h}
                      title={`${v.toLocaleString()} requests`}
                      className="h-5 rounded-[3px]"
                      style={{ background: toColor(v) }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[11px] text-gray-400">
          Each cell = total requests for that hour, across the selected window. Darker = higher traffic.
        </div>
      </div>
    </div>
  );
}

// ── local CSV export (no shared-file edits — mirrors utils/exportCsv.js) ───
const csvEscape = (val) => {
  const str = val == null ? "" : String(val);
  return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str.replace(/"/g, '""')}"` : str;
};
function exportTopEndpointsToCsv(rows, filename) {
  const cols = [
    { header: "Method", key: "method" },
    { header: "Endpoint", key: "endpoint" },
    { header: "RPS", key: "rps" },
    { header: "Total Hits", key: "totalHits" },
    { header: "Avg Latency (ms)", key: "avgLatency" },
  ];
  const header = cols.map((c) => csvEscape(c.header)).join(",");
  const body = rows.map((row) => cols.map((c) => csvEscape(row[c.key])).join(","));
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export const Traffic = () => {
  const [window_, setWindow] = useState("24h");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isFetching } = useGetTrafficAnalyticsQuery({ window: window_ });

  const rpm = useMemo(() => data?.rpm ?? [], [data]);
  const methods = useMemo(() => data?.methods ?? [], [data]);
  const byTenant = useMemo(() => data?.byTenant ?? [], [data]);
  const topEndpoints = useMemo(() => data?.topEndpoints ?? [], [data]);
  const heatmap = useMemo(() => data?.heatmap ?? [], [data]);

  const bucketMinutes = TRAFFIC_WINDOW_BUCKET_MINUTES[window_] ?? 5;

  const stats = useMemo(() => {
    const totalRequests = rpm.reduce((a, b) => a + (b.count || 0), 0);
    const totalOk = rpm.reduce((a, b) => a + (b.ok || 0), 0);
    const lastBucket = rpm[rpm.length - 1];
    const peakBucket = rpm.reduce(
      (max, b) => ((b.count || 0) > (max?.count || 0) ? b : max),
      null,
    );
    return {
      reqPerMin: lastBucket ? (lastBucket.count || 0) / bucketMinutes : 0,
      peakReqPerMin: peakBucket ? (peakBucket.count || 0) / bucketMinutes : 0,
      peakTimeLabel: peakBucket ? fmtBucketTime(peakBucket.bucket, window_) : "—",
      totalRequests,
      activeTenants: byTenant.length,
      successRatePct: totalRequests > 0 ? Math.round((totalOk / totalRequests) * 1000) / 10 : 100,
    };
  }, [rpm, byTenant, bucketMinutes, window_]);

  const filteredEndpoints = useMemo(() => {
    if (!searchTerm) return topEndpoints;
    const q = searchTerm.toLowerCase();
    return topEndpoints.filter(
      (e) => e.endpoint?.toLowerCase().includes(q) || e.method?.toLowerCase().includes(q),
    );
  }, [topEndpoints, searchTerm]);

  const paginatedEndpoints = filteredEndpoints.slice(
    (pageIndex - 1) * pageLimit,
    pageIndex * pageLimit,
  );

  const maxRps = Math.max(...topEndpoints.map((e) => e.rps || 0), 1);
  const trafficColumns = useMemo(() => getTrafficColumns({ maxRps }), [maxRps]);

  return (
    <div className="container-page">
      <PageHeader
        icon={<ArrowUpIcon />}
        iconGradient="bg-transparent"
        title="Traffic"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Golden Signals" },
          { label: "Traffic" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <RangeBtns options={TRAFFIC_WINDOW_OPTIONS} active={window_} onChange={setWindow} />
            <ActionButton
              action="export"
              label="Export"
              icon={ExportIcon}
              onClick={() =>
                exportTopEndpointsToCsv(
                  filteredEndpoints,
                  `traffic-endpoints-${window_}-${new Date().toISOString().slice(0, 10)}.csv`,
                )
              }
            />
          </div>
        }
      />

      <Section>
        <TrafficStatsCardRow
          reqPerMin={stats.reqPerMin}
          peakReqPerMin={stats.peakReqPerMin}
          peakTimeLabel={stats.peakTimeLabel}
          totalRequests={stats.totalRequests}
          windowLabel={window_}
          activeTenants={stats.activeTenants}
          successRatePct={stats.successRatePct}
        />
      </Section>

      <Section>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                </svg>
                Requests over time
              </div>
              <span className="text-[12px] text-gray-400">
                Last {window_} &middot; {bucketMinutes}m buckets
              </span>
            </div>
            <div className="flex items-center gap-4 text-[12px] text-gray-400">
              {[
                { color: "#2563eb", label: "Total" },
                { color: "#16a34a", label: "Successful" },
                { color: "#dc2626", label: "Failed" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3.5 h-0.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="mb-4">
              <div
                className="text-[24px] text-gray-800 font-light leading-none"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {formatCount(Math.round(stats.reqPerMin))}{" "}
                <span className="text-[14px] text-gray-400">req/min</span>
              </div>
              <div className="text-[12px] text-gray-400 mt-1">
                Peak {formatCount(Math.round(stats.peakReqPerMin))} req/min at {stats.peakTimeLabel} &middot;
                Total: {formatCount(stats.totalRequests)}
              </div>
            </div>
            <TrafficChart rpm={rpm} window={window_} />
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Requests by Method
            </div>
            <div className="px-5 py-4">
              <MethodDonut methods={methods} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Traffic Share by Tenant
            </div>
            <div className="px-5 py-4">
              <TenantShare byTenant={byTenant} />
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <NewTableConfig
            module="traffic-top-endpoints"
            columns={trafficColumns}
            data={paginatedEndpoints}
            isLoading={isFetching}
            group={TRAFFIC_GROUP}
            currentPage={pageIndex}
            setCurrentPage={setPageIndex}
            pageLimit={pageLimit}
            handlePageLimitChange={setPageLimit}
            totalResults={filteredEndpoints.length}
            totalPages={Math.ceil(filteredEndpoints.length / pageLimit) || 1}
            searchQuery={searchTerm}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setPageIndex(1);
            }}
            showRowNumbers={false}
          />
        </div>
      </Section>

      <Section>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
            <div className="text-[14px] text-gray-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Traffic Heatmap — Requests by Hour &amp; Day
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-gray-400">
              <span>Low</span>
              <div className="flex gap-0.5">
                {HEATMAP_COLOR_SCALE.map((c) => (
                  <div key={c} className="w-3.5 h-3.5 rounded-[3px]" style={{ background: c }} />
                ))}
              </div>
              <span>High</span>
            </div>
          </div>
          <div className="px-6 py-5">
            <Heatmap heatmap={heatmap} />
          </div>
        </div>
      </Section>
    </div>
  );
};

function ArrowUpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

// Named + default export — the existing mock page this replaces
// (src/pages/Traffic.jsx) is imported as a default export from App.jsx.
export default Traffic;
