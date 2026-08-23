import { useState, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import { ExportIcon, RefreshIcon } from "../components/ui/Icons";
import { Section } from "../components/ui/Section";
import { useGetTenantsSummaryQuery } from "../features/tenants/hooks/query/useGetTenantsSummaryQuery";
import { useGetFleetSummaryQuery } from "../features/tenants/hooks/query/useGetFleetSummaryQuery";
import { useGetTenantCardsQuery } from "../features/tenants/hooks/query/useGetTenantCardsQuery";
import { useNavigate } from "react-router-dom";
import { AddTenantModal } from "../features/tenants/components/AddTenantModal";
import { TenantService } from "../features/tenants/services";
import { exportTenantsToCsv } from "../utils/exportCsv";

function fmtNumber(n) {
  if (n == null) return "—";
  if (n >= 1_000_000)
    return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.?0+$/, "") + "k";
  return String(n);
}

// ── DATA ──────────────────────────────────────────────────────────────────────
const TENANTS = [
  {
    id: 1,
    name: "Nexus Corp",
    initials: "NX",
    color: "#2563eb",
    plan: "Enterprise",
    rps: 820,
    lat: 188,
    err: 0.3,
    cpu: 52,
    users: 28,
    uptime: 99.98,
    status: "healthy",
  },
  {
    id: 2,
    name: "Orbis Tech",
    initials: "OT",
    color: "#7c3aed",
    plan: "Enterprise",
    rps: 614,
    lat: 244,
    err: 0.6,
    cpu: 61,
    users: 21,
    uptime: 99.94,
    status: "healthy",
  },
  {
    id: 3,
    name: "Velox Inc",
    initials: "VX",
    color: "#16a34a",
    plan: "Business",
    rps: 541,
    lat: 312,
    err: 1.2,
    cpu: 74,
    users: 14,
    uptime: 99.71,
    status: "warning",
  },
  {
    id: 4,
    name: "Strata AI",
    initials: "SA",
    color: "#0891b2",
    plan: "Enterprise",
    rps: 498,
    lat: 201,
    err: 0.4,
    cpu: 48,
    users: 19,
    uptime: 99.96,
    status: "healthy",
  },
  {
    id: 5,
    name: "Pulsar Labs",
    initials: "PL",
    color: "#ea580c",
    plan: "Business",
    rps: 387,
    lat: 428,
    err: 2.8,
    cpu: 81,
    users: 9,
    uptime: 98.2,
    status: "critical",
  },
  {
    id: 6,
    name: "Delphi Sys",
    initials: "DS",
    color: "#d97706",
    plan: "Business",
    rps: 334,
    lat: 280,
    err: 0.9,
    cpu: 67,
    users: 11,
    uptime: 99.6,
    status: "warning",
  },
  {
    id: 7,
    name: "Aether Co",
    initials: "AE",
    color: "#4f46e5",
    plan: "Enterprise",
    rps: 298,
    lat: 196,
    err: 0.2,
    cpu: 43,
    users: 16,
    uptime: 99.99,
    status: "healthy",
  },
  {
    id: 8,
    name: "Magna Cloud",
    initials: "MC",
    color: "#dc2626",
    plan: "Enterprise",
    rps: 211,
    lat: 390,
    err: 3.4,
    cpu: 88,
    users: 7,
    uptime: 97.8,
    status: "critical",
  },
  {
    id: 9,
    name: "Solaris Tech",
    initials: "ST",
    color: "#059669",
    plan: "Business",
    rps: 198,
    lat: 165,
    err: 0.1,
    cpu: 38,
    users: 12,
    uptime: 99.99,
    status: "healthy",
  },
  {
    id: 10,
    name: "Vertex Labs",
    initials: "VL",
    color: "#7c3aed",
    plan: "Business",
    rps: 176,
    lat: 220,
    err: 0.5,
    cpu: 55,
    users: 8,
    uptime: 99.88,
    status: "healthy",
  },
  {
    id: 11,
    name: "Nimbus IO",
    initials: "NI",
    color: "#0ea5e9",
    plan: "Starter",
    rps: 142,
    lat: 178,
    err: 0.2,
    cpu: 31,
    users: 5,
    uptime: 99.95,
    status: "healthy",
  },
  {
    id: 12,
    name: "Apex Systems",
    initials: "AP",
    color: "#64748b",
    plan: "Business",
    rps: 138,
    lat: 244,
    err: 0.7,
    cpu: 59,
    users: 9,
    uptime: 99.7,
    status: "healthy",
  },
  {
    id: 13,
    name: "Crest Digital",
    initials: "CD",
    color: "#db2777",
    plan: "Business",
    rps: 121,
    lat: 310,
    err: 1.4,
    cpu: 71,
    users: 6,
    uptime: 99.4,
    status: "warning",
  },
  {
    id: 14,
    name: "Forge Labs",
    initials: "FL",
    color: "#f59e0b",
    plan: "Starter",
    rps: 110,
    lat: 195,
    err: 0.3,
    cpu: 42,
    users: 4,
    uptime: 99.92,
    status: "healthy",
  },
  {
    id: 15,
    name: "Comet Analytics",
    initials: "CA",
    color: "#6366f1",
    plan: "Enterprise",
    rps: 104,
    lat: 158,
    err: 0.1,
    cpu: 28,
    users: 13,
    uptime: 100.0,
    status: "healthy",
  },
  {
    id: 16,
    name: "Drift Systems",
    initials: "DR",
    color: "#14b8a6",
    plan: "Business",
    rps: 98,
    lat: 188,
    err: 0.4,
    cpu: 45,
    users: 7,
    uptime: 99.82,
    status: "healthy",
  },
  {
    id: 17,
    name: "Zenith Corp",
    initials: "ZC",
    color: "#8b5cf6",
    plan: "Business",
    rps: 91,
    lat: 210,
    err: 0.5,
    cpu: 50,
    users: 6,
    uptime: 99.76,
    status: "healthy",
  },
  {
    id: 18,
    name: "Atlas Cloud",
    initials: "AC",
    color: "#10b981",
    plan: "Enterprise",
    rps: 88,
    lat: 142,
    err: 0.1,
    cpu: 34,
    users: 10,
    uptime: 99.99,
    status: "healthy",
  },
  {
    id: 19,
    name: "Bastion AI",
    initials: "BA",
    color: "#f97316",
    plan: "Starter",
    rps: 74,
    lat: 220,
    err: 0.6,
    cpu: 48,
    users: 3,
    uptime: 99.8,
    status: "healthy",
  },
  {
    id: 20,
    name: "Lynx Data",
    initials: "LD",
    color: "#06b6d4",
    plan: "Starter",
    rps: 68,
    lat: 194,
    err: 0.3,
    cpu: 39,
    users: 4,
    uptime: 99.91,
    status: "healthy",
  },
  {
    id: 21,
    name: "Nova Platforms",
    initials: "NP",
    color: "#a855f7",
    plan: "Business",
    rps: 62,
    lat: 230,
    err: 0.8,
    cpu: 53,
    users: 5,
    uptime: 99.65,
    status: "healthy",
  },
  {
    id: 22,
    name: "Crisp Analytics",
    initials: "CR",
    color: "#22c55e",
    plan: "Starter",
    rps: 54,
    lat: 168,
    err: 0.2,
    cpu: 31,
    users: 3,
    uptime: 99.97,
    status: "healthy",
  },
  {
    id: 23,
    name: "Flux Systems",
    initials: "FX",
    color: "#ef4444",
    plan: "Business",
    rps: 48,
    lat: 255,
    err: 0.9,
    cpu: 58,
    users: 4,
    uptime: 99.55,
    status: "healthy",
  },
  {
    id: 24,
    name: "Orbit AI",
    initials: "OA",
    color: "#3b82f6",
    plan: "Starter",
    rps: 38,
    lat: 180,
    err: 0.2,
    cpu: 27,
    users: 2,
    uptime: 99.9,
    status: "healthy",
  },
];

// ── SEEDED RNG ────────────────────────────────────────────────────────────────
function seededRnd(seed, a, b) {
  const x = Math.sin(seed + 1) * 10000;
  return (x - Math.floor(x)) * (b - a) + a;
}

function strHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const TENANT_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#16a34a",
  "#0891b2",
  "#ea580c",
  "#d97706",
  "#4f46e5",
  "#dc2626",
  "#059669",
  "#db2777",
  "#f59e0b",
  "#6366f1",
  "#14b8a6",
  "#8b5cf6",
  "#10b981",
  "#f97316",
];

function tenantColor(id) {
  return TENANT_COLORS[strHash(String(id)) % TENANT_COLORS.length];
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
const latColor = (v) =>
  v > 350 ? "text-red-600" : v > 250 ? "text-amber-600" : "text-green-600";
const errColor = (v) =>
  v > 2 ? "text-red-600" : v > 1 ? "text-amber-600" : "text-gray-400";
const cpuColor = (v) =>
  v > 80 ? "text-red-600" : v > 70 ? "text-amber-600" : "text-gray-400";
const cpuBg = (v) =>
  v > 80 ? "bg-red-500" : v > 70 ? "bg-amber-500" : "bg-gray-400";

// ── SPARKLINE (SVG) ───────────────────────────────────────────────────────────
function MiniSparkline({ tenant }) {
  const w = 80,
    h = 32;
  const color =
    tenant.status === "critical"
      ? "#dc2626"
      : tenant.status === "warning"
        ? "#d97706"
        : "#2563eb";
  const rps = tenant.metrics?.rps ?? tenant.rps ?? 0;
  const seed = strHash(String(tenant.id));
  const data = Array.from({ length: 16 }, (_, j) =>
    Math.max(0, rps + seededRnd(seed * 7 + j * 3, -rps * 0.3, rps * 0.3)),
  );
  const max = Math.max(...data),
    min = Math.min(...data),
    range = max - min || 1;
  const toX = (i) => (i / (data.length - 1)) * w;
  const toY = (v) => h - ((v - min) / range) * (h * 0.78) - h * 0.1;
  const path = data
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`,
    )
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path
        d={path}
        stroke={color}
        strokeWidth="1.6"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── TRAFFIC CHART (SVG) ───────────────────────────────────────────────────────
function TrafficChart({ tenants = [] }) {
  const top8 = [...tenants]
    .sort((a, b) => b.rps - a.rps)
    .slice(0, 8);
  if (!top8.length) return null;
  const w = 600,
    h = 170,
    padL = 40,
    padR = 44,
    padT = 8,
    padB = 24;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const maxRps = Math.max(...top8.map((t) => t.rps));
  const maxErr = Math.max(...top8.map((t) => t.err));
  const barW = chartW / top8.length - 6;
  const toRY = (v) => padT + chartH - (v / maxRps) * chartH;
  const toEY = (v) => padT + chartH - (v / (maxErr * 1.2)) * chartH;

  const errPath = top8
    .map((t, i) => {
      const x = padL + i * (chartW / top8.length) + barW / 2;
      const y = toEY(t.err);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 152 }}>
      {[0, 200, 400, 600, 800].map((t) => {
        const y = toRY(t);
        return (
          <g key={t}>
            <line
              x1={padL}
              y1={y}
              x2={padL + chartW}
              y2={y}
              stroke="#e9ebf0"
              strokeWidth="1"
              opacity="0.5"
            />
            <text
              x={padL - 4}
              y={y + 4}
              textAnchor="end"
              fill="#9ca3af"
              fontSize="10"
              fontFamily="DM Mono, monospace"
            >
              {t > 0 ? t + "r" : "0"}
            </text>
          </g>
        );
      })}
      {top8.map((t, i) => {
        const x = padL + i * (chartW / top8.length);
        const bh = (t.rps / maxRps) * chartH;
        return (
          <rect
            key={i}
            x={x + 3}
            y={toRY(t.rps)}
            width={barW}
            height={bh}
            fill={t.color}
            opacity="0.27"
            rx="3"
          />
        );
      })}
      <path d={errPath} stroke="#dc2626" strokeWidth="2" fill="none" />
      {top8.map((t, i) => {
        const x = padL + i * (chartW / top8.length) + barW / 2;
        return <circle key={i} cx={x} cy={toEY(t.err)} r="3" fill="#dc2626" />;
      })}
      {top8.map((t, i) => {
        const x = padL + i * (chartW / top8.length) + barW / 2;
        return (
          <text
            key={i}
            x={x}
            y={padT + chartH + 16}
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="10"
            fontFamily="DM Mono, monospace"
          >
            {t.name.split(" ")[0]}
          </text>
        );
      })}
      {[0, 1, 2, 3].map((t) => (
        <text
          key={t}
          x={padL + chartW + 5}
          y={padT + chartH - (t / (maxErr * 1.2)) * chartH + 4}
          textAnchor="start"
          fill="#dc2626"
          fontSize="10"
          fontFamily="DM Mono, monospace"
          opacity="0.7"
        >
          {t}%
        </text>
      ))}
    </svg>
  );
}

// ── UPTIME BLOCKS ─────────────────────────────────────────────────────────────
function UptimeBlocks({ uptime, id, count = 30 }) {
  const seed = strHash(String(id));
  return (
    <div className="flex gap-0.5 flex-wrap">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="w-2 h-3.5 rounded-[2px]"
          style={{
            background:
              seededRnd(seed * 100 + i, 0, 1) < uptime / 100
                ? "#16a34a"
                : "#dc2626",
          }}
        />
      ))}
    </div>
  );
}

// ── TENANT CARD ───────────────────────────────────────────────────────────────
function TenantCard({ tenant }) {
  const navigate = useNavigate();
  const statusBar =
    tenant.status === "critical"
      ? "bg-red-500"
      : tenant.status === "warning"
        ? "bg-amber-400"
        : "bg-green-500";

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors cursor-pointer">
      <div className={`h-[3px] w-full ${statusBar}`} />
      <div className="px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center text-[11px] text-white font-medium flex-shrink-0"
            style={{ background: tenantColor(tenant.id) }}
          >
            {tenant.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] text-gray-800 truncate">
              {tenant.company}
            </div>
          </div>
          {tenant.status === "healthy" && (
            <Badge value="Healthy" variant="active" />
          )}
          {tenant.status === "warning" && (
            <Badge value="Warning" variant="warning" />
          )}
          {tenant.status === "critical" && (
            <Badge value="Critical" variant="down" />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {tenant.plan?.toLowerCase() === "enterprise" && (
            <Badge value="Enterprise" variant="category" />
          )}
          {tenant.plan?.toLowerCase() === "business" && (
            <Badge value="Business" variant="beta" />
          )}
          {tenant.plan?.toLowerCase() === "starter" && (
            <Badge value="Starter" variant="default" />
          )}
          <span className="font-mono text-[11px] text-gray-400 ml-auto">
            Uptime {tenant.metrics.uptime30d.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="px-4 py-3 flex flex-col gap-2">
        {[
          {
            label: "Traffic",
            val: `${tenant.metrics.rps} rps`,
            color: "text-gray-700",
          },
          {
            label: "p95 Latency",
            val: `${tenant.metrics.p95ms}ms`,
            color: latColor(tenant.metrics.p95ms),
          },
          {
            label: "Error Rate",
            val: `${tenant.metrics.errorRate}%`,
            color: errColor(tenant.metrics.errorRate),
          },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">{item.label}</span>
            <span className={`font-mono text-[12.5px] ${item.color}`}>
              {item.val}
            </span>
          </div>
        ))}

        <div>
          <div className="text-[11px] text-gray-400 mb-1">30-day uptime</div>
          <UptimeBlocks uptime={tenant.metrics.uptime30d} id={tenant.id} />
        </div>
      </div>
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <MiniSparkline tenant={tenant} />
        <button
          onClick={(e) => navigate(`/dashboard/tenants/${tenant.id}`)}
          className="px-2.5 py-1 bg-blue-600 text-white text-[11.5px] rounded-md hover:bg-blue-700 transition-colors"
        >
          Detail →
        </button>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function TenantOverview() {
  const { data: summaryData, refetch: refetchSummary } =
    useGetTenantsSummaryQuery();
  const { data: fleetData, refetch: refetchFleet } = useGetFleetSummaryQuery();
  const fleetSummary = fleetData?.summary;
  const quickStats = fleetData?.quickStats;

  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid"); // "grid" | "table"
  const [activeFilters, setActiveFilters] = useState({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);

  const SORT_MAP = {
    rps: "rps",
    lat: "latency",
    err: "errorRate",
    cpu: "cpu",
    name: "company",
  };

  const cardsParams = useMemo(() => {
    const params = {
      page: pageIndex + 1,
      limit: pageLimit,
      sort: SORT_MAP[activeFilters.sort] ?? "rps",
    };
    if (statusFilter !== "all") params.status = statusFilter;
    if (activeFilters.plan) params.plan = activeFilters.plan.toLowerCase();
    if (query) params.search = query;
    return params;
  }, [statusFilter, query, activeFilters, pageIndex, pageLimit]);

  const {
    data: cardsData,
    isLoading: cardsLoading,
    refetch: refetchCards,
  } = useGetTenantCardsQuery(cardsParams);
  const tenantCards = cardsData?.tenants ?? [];

  const handleRefresh = () => {
    refetchSummary();
    refetchFleet();
    refetchCards();
  };

  const stats = [
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      iconColor: "text-blue-600",
      count: summaryData?.total ?? "—",
      title: "Total Tenants",
      badgeText: "▲ +2 this month",
      badgeBg: "bg-blue-50",
      badgeTextColor: "text-blue-600",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      iconColor: "text-green-600",
      count: summaryData?.healthy ?? "—",
      countColor: "text-green-600",
      title: "Healthy Tenants",
      badgeText: "▲ +2 vs yesterday",
      badgeBg: "bg-green-50",
      badgeTextColor: "text-green-600",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
        </svg>
      ),
      iconColor: "text-amber-500",
      count: summaryData?.warning ?? "—",
      countColor: "text-amber-600",
      title: "Warning Tenants",
      badgeText: "▲ +1 vs yesterday",
      badgeBg: "bg-amber-50",
      badgeTextColor: "text-amber-600",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      iconColor: "text-red-500",
      count: summaryData?.critical ?? "—",
      countColor: "text-red-600",
      title: "Critical Tenants",
      badgeText: "▲ +2 needs attention",
      badgeBg: "bg-red-50",
      badgeTextColor: "text-red-600",
    },
  ];

  return (
    <div className="container-page">
      {/* Topbar */}
      <div className="flex items-center justify-between">
        <PageHeader
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="Tenant Overview"
          breadcrumbs={[
            { label: "Home", href: "#" },
            { label: "Tenant Overview" },
          ]}
        />

        <div className="flex items-center gap-2">
          <ActionButton
            action="export"
            label="Export"
            icon={ExportIcon}
            onClick={async () => {
              const all = await TenantService.fetchTenantCards({
                page: 1,
                limit: 10000,
              });
              exportTenantsToCsv(all?.tenants ?? [], "tenants-export.csv");
            }}
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[12px] rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Tenant
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <Section>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <StatCard
                key={i}
                icon={s.icon}
                iconColor={s.iconColor}
                count={s.count}
                countColor={s.countColor}
                title={s.title}
              />
            ))}
          </div>
        </Section>

        <Section>
          {/* Fleet Summary + Traffic Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Fleet Summary */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <div
                  className="text-[14px] text-gray-800"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Fleet Summary
                </div>
                <Badge
                  value={
                    fleetSummary
                      ? `${fleetSummary.window} window`
                      : "24h window"
                  }
                  variant="beta"
                />
              </div>
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-0">
                {[
                  {
                    val: fmtNumber(fleetSummary?.totalRequests),
                    color: "text-green-600",
                    label: "Total Requests",
                    border: "border-r border-b",
                  },
                  {
                    val: fmtNumber(fleetSummary?.totalErrors),
                    color: "text-red-600",
                    label: "Total Errors",
                    border: "border-b border-l pl-4",
                  },
                  {
                    val: fleetSummary ? `${fleetSummary.avgP95Latency}ms` : "—",
                    color: "text-amber-600",
                    label: "Avg p95 Latency",
                    border: "border-r",
                  },
                  {
                    val: fleetSummary ? `${fleetSummary.avgUptime30d}%` : "—",
                    color: "text-gray-800",
                    label: "Avg Uptime (30d)",
                    border: "border-l pl-4",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`py-2.5 ${item.border} border-gray-100`}
                  >
                    <div
                      className={`text-[22px] font-light leading-none ${item.color}`}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {item.val}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic Chart */}
            <div className="bg-white  border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <div
                  className="flex items-center gap-1.5 text-[14px] text-gray-800"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                  >
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  </svg>
                  Traffic by Tenant
                </div>
                <div className="flex items-center gap-4 text-[11.5px] text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 rounded-full bg-blue-600 opacity-50 inline-block" />
                    RPS
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                    Error %
                  </span>
                </div>
              </div>
              <div className="px-5 py-4">
                <TrafficChart
                  tenants={tenantCards.map((t) => ({
                    name: t.company,
                    rps: t.metrics?.rps ?? 0,
                    err: t.metrics?.errorRate ?? 0,
                    color: tenantColor(t.id),
                  }))}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Card Grid View */}
        {view === "grid" && (
          <div>
            {cardsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-xl h-64 animate-pulse"
                  />
                ))}
              </div>
            ) : tenantCards.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl px-12 py-16 text-center">
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div className="text-[14px] text-gray-700 mb-1">
                  No tenants found
                </div>
                <div className="text-[12px] text-gray-400">
                  Try adjusting your search or filters
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tenantCards.map((t) => (
                  <TenantCard key={t.id} tenant={t} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <AddTenantModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
