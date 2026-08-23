import { useState, useEffect } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import { ExportIcon, RefreshIcon, EditIcon } from "../components/ui/Icons";
import { StatCard } from "../components/ui/StatCard3";
import { useGetTenantDetailsQuery } from "../features/tenants/hooks/query/useGetTenantDetails";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetTenantEmployeesQuery } from "../features/tenants/hooks/query/useGetTenantEmployeesQuery";
import { useGetTenantEndpointMatricsQuery } from "../features/tenants/hooks/query/useGetTenantEndpointMatrics";
import useFetchCurrentUser from "../hooks/useFetchCurrentUser";
import { useGetTenantRequestLogQuery } from "../features/tenants/hooks/query/useGetTenantRequestLog";
import { useUpdateTenantMutation } from "../features/tenants/hooks/query/useUpdateTenantMutation";
import {
  Fingerprint,
  Building2,
  Globe,
  Mail,
  Phone,
  Hash,
  LogIn,
  Database,
  Clock,
  Calendar,
} from "lucide-react";

// ── DATA ──────────────────────────────────────────────────────────────────────

const ACTIVITY = [
  {
    type: "check",
    bg: "bg-green-50",
    color: "text-green-600",
    title: "Deployment v3.2.1",
    sub: "Production — successful",
    time: "14m ago",
  },
  {
    type: "user",
    bg: "bg-blue-50",
    color: "text-blue-600",
    title: "Priya added new user",
    sub: "Aryan Gupta · Viewer role",
    time: "1h ago",
  },
  {
    type: "warning",
    bg: "bg-amber-50",
    color: "text-amber-600",
    title: "Rate limit warning",
    sub: "820/1,200 rps threshold",
    time: "2h ago",
  },
  {
    type: "db",
    bg: "bg-gray-100",
    color: "text-gray-500",
    title: "DB backup completed",
    sub: "prod-db-nx-01 · 4.2 GB",
    time: "6h ago",
  },
  {
    type: "shield",
    bg: "bg-green-50",
    color: "text-green-600",
    title: "SSL cert renewed",
    sub: "*.nexuscorp.io · 365 days",
    time: "1d ago",
  },
];

const QUOTA_ITEMS = [
  {
    label: "API Calls (monthly)",
    val: "3.2M / 10M",
    pct: 32,
    barColor: "bg-blue-600",
    status: "On track",
    statusColor: "text-green-600",
    sub: "32% used · resets in 12 days",
  },
  {
    label: "Rate Limit",
    val: "820 / 1,200 rps",
    pct: 68,
    barColor: "bg-amber-500",
    status: "Watch",
    statusColor: "text-amber-600",
    sub: "68% of cap",
  },
  {
    label: "Data Retention",
    val: "52 / 90 days",
    pct: 58,
    barColor: "bg-green-500",
    status: "Healthy",
    statusColor: "text-green-600",
    sub: "58% used",
  },
  {
    label: "Team Members",
    val: "28 / 50 seats",
    pct: 56,
    barColor: "bg-blue-600",
    status: "Fine",
    statusColor: "text-green-600",
    sub: "56% occupied",
  },
];

const SLO_ITEMS = [
  {
    label: "Uptime SLO",
    val: "99.98%",
    target: "99.9%",
    pct: 99,
    barColor: "bg-green-500",
    budget: "87% remaining",
    status: "Met",
    statusVariant: "active",
  },
  {
    label: "Latency SLO (p95)",
    val: "188ms",
    target: "600ms",
    pct: 31,
    barColor: "bg-green-500",
    budget: "96% remaining",
    status: "Met",
    statusVariant: "active",
  },
  {
    label: "Error Rate SLO",
    val: "0.3%",
    target: "<2%",
    pct: 15,
    barColor: "bg-green-500",
    budget: "92% remaining",
    status: "Met",
    statusVariant: "active",
  },
  {
    label: "Throughput SLO",
    val: "820 rps",
    target: "1,200 rps",
    pct: 68,
    barColor: "bg-amber-500",
    budget: "Near cap — monitor closely",
    status: "Watch",
    statusVariant: "warning",
  },
];

const METHOD_STYLE = {
  GET: { bg: "bg-blue-50", text: "text-blue-700" },
  POST: { bg: "bg-green-50", text: "text-green-700" },
  PUT: { bg: "bg-amber-50", text: "text-amber-700" },
  DEL: { bg: "bg-red-50", text: "text-red-700" },
};

const STATUS_COLOR = {
  200: "text-green-600",
  201: "text-green-600",
  204: "text-green-600",
  429: "text-amber-600",
  401: "text-red-600",
  500: "text-red-600",
};

// ── ENDPOINT TABLE GROUPS ─────────────────────────────────────────────────────
const USER_GROUPS = {
  Identity: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
  Contact: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Status: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

const LOG_GROUPS = {
  Request: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Response: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Context: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
};

const ENDPOINT_METRICS_GROUPS = {
  Endpoint: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Latency: { hex: "#d97706", bg: "bg-amber-50", text: "text-amber-600" },
  Traffic: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Status: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// ── SEEDED RNG ────────────────────────────────────────────────────────────────
function seededRnd(seed, a, b) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.round((x - Math.floor(x)) * (b - a) + a);
}

// ── SIGNAL CHART (SVG) ────────────────────────────────────────────────────────
function SignalChart() {
  const w = 700,
    h = 180,
    padL = 40,
    padR = 44,
    padT = 8,
    padB = 24;
  const chartW = w - padL - padR,
    chartH = h - padT - padB;
  const pts = 24;

  const traffic = Array.from({ length: pts }, (_, i) => {
    if (i < 6) return seededRnd(i * 7, 200, 400);
    if (i < 10) return seededRnd(i * 7, 600, 1000);
    if (i < 18) return seededRnd(i * 7, 700, 1200);
    return seededRnd(i * 7, 400, 700);
  });
  const latency = traffic.map((v, i) =>
    Math.round(100 + (v / 1200) * 180 + seededRnd(i * 11, -15, 15)),
  );
  const errors = traffic.map((_, i) => seededRnd(i * 13, 0, 50) / 100);

  const maxT = 1300,
    maxL = 320,
    maxE = 0.6;
  const toX = (i) => padL + (i / (pts - 1)) * chartW;
  const toTY = (v) => padT + chartH - (v / maxT) * chartH;
  const toLY = (v) => padT + chartH - (v / maxL) * chartH;

  const latLine = latency
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toLY(v).toFixed(1)}`,
    )
    .join(" ");
  const errLine = errors
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${(padT + chartH - (v / maxE) * chartH).toFixed(1)}`,
    )
    .join(" ");
  const errArea = `${errLine} L${toX(pts - 1).toFixed(1)},${(padT + chartH).toFixed(1)} L${toX(0).toFixed(1)},${(padT + chartH).toFixed(1)} Z`;

  const yTicks = [0, 400, 800, 1200];
  const xTicks = [0, 6, 12, 18, 23];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 160 }}>
      {yTicks.map((t) => {
        const y = toTY(t);
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
      {/* Bars */}
      {traffic.map((v, i) => {
        const bw = Math.max(2, chartW / pts - 3);
        const x = toX(i) - bw / 2;
        const barH = (v / maxT) * chartH;
        return (
          <rect
            key={i}
            x={x}
            y={toTY(v)}
            width={bw}
            height={barH}
            fill="#2563eb18"
            rx="1"
          />
        );
      })}
      {/* Error area */}
      <path d={errArea} fill="#dc262610" />
      <path d={errLine} stroke="#dc2626" strokeWidth="1.5" fill="none" />
      {/* Latency line */}
      <path d={latLine} stroke="#d97706" strokeWidth="2" fill="none" />
      {/* Right Y (latency) */}
      {[0, 100, 200, 300].map((t) => (
        <text
          key={t}
          x={padL + chartW + 5}
          y={padT + chartH - (t / maxL) * chartH + 4}
          textAnchor="start"
          fill="#d97706"
          fontSize="10"
          fontFamily="DM Mono, monospace"
          opacity="0.7"
        >
          {t}ms
        </text>
      ))}
      {xTicks.map((i) => (
        <text
          key={i}
          x={toX(i)}
          y={padT + chartH + 16}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="10"
          fontFamily="DM Mono, monospace"
        >
          {i.toString().padStart(2, "0")}:00
        </text>
      ))}
    </svg>
  );
}

// ── ACTIVITY ICONS ────────────────────────────────────────────────────────────
const ActivityIcon = ({ type }) => {
  const icons = {
    check: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    user: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
    warning: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
      </svg>
    ),
    db: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="2" width="20" height="8" rx="2" />
      </svg>
    ),
    shield: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  };
  return icons[type] || null;
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function TenantDetail() {
  const [emPageIndex, setEMPageIndex] = useState(0);
  const [emPageLimit, setEMPageLimit] = useState(25);
  const [emSearchInput, setEMSearchInput] = useState("");
  const [emSortField, setEMSortField] = useState(null);
  const [emSortType, setEMSortType] = useState(null);
  const [uPageIndex, setUPageIndex] = useState(0);
  const [uPageLimit, setUPageLimit] = useState(25);
  const [lPageIndex, setLPageIndex] = useState(0);
  const [lPageLimit, setLPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);
  const [uSearchInput, setUSearchInput] = useState("");
  const [lSortField, setLSortField] = useState(null);
  const [lSortType, setLSortType] = useState(null);
  const [lSearchInput, setLSearchInput] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const uSortBy = sortField;
  const uSortOrder = sortType;

  // Reset to page 0 when search/sort changes
  useEffect(() => {
    setUPageIndex(0);
  }, [uSearchInput, sortField, sortType]);

  useEffect(() => {
    setLPageIndex(0);
  }, [lSearchInput, lSortField, lSortType]);

  useEffect(() => {
    setEMPageIndex(0);
  }, [emSearchInput, emSortField, emSortType]);

  const { id } = useParams();

  const { data: tenantData, isLoading } = useGetTenantDetailsQuery(id);
  const { data: tenentEmployees, isLoading: isLoadingTenantEmployees } =
    useGetTenantEmployeesQuery(
      id,
      uPageIndex + 1,
      uPageLimit,
      uSearchInput || undefined,
      uSortBy || undefined,
      uSortOrder || undefined,
    );
  const { data: tenantEndpointMetrics, isLoading: isLoadingEndpointMetrics } =
    useGetTenantEndpointMatricsQuery(
      id,
      emPageIndex + 1,
      emPageLimit,
      emSearchInput || undefined,
      emSortField || undefined,
      emSortType || undefined,
    );
  const { data: tenantRequestLog, isLoading: isLoadingRequestLog } =
    useGetTenantRequestLogQuery(
      id,
      lPageIndex + 1,
      lPageLimit,
      lSearchInput || undefined,
      lSortField || undefined,
      lSortType || undefined,
    );

  const requestLogData = tenantRequestLog?.data ?? [];
  const requestLogPagination = tenantRequestLog?.pagination ?? {
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0,
  };

  const navigate = useNavigate();
  const { mutate: updateTenant, isPending: isUpdating } =
    useUpdateTenantMutation();

  const endpointMetricsData = tenantEndpointMetrics?.data ?? [];
  const endpointMetricsPagination = tenantEndpointMetrics?.pagination ?? {
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0,
  };

  const tenantUsers = tenentEmployees?.data ?? [];
  const tenantUsersPagination = tenentEmployees?.pagination ?? {
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0,
  };

  const SIGNAL_METERS = [
    {
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2"
        >
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
      iconBg: "bg-blue-50",
      label: "Latency",
      val:
        tenantData?.tenantMetric?.[0]?.avgP95 != null
          ? `${tenantData.tenantMetric[0].avgP95.toFixed(0)}ms`
          : "NA",

      valColor: "text-green-600",
      pct: 31,
      barColor: "bg-green-500",
      sub: "SLO: 600ms",
    },
    {
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
        >
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        </svg>
      ),
      iconBg: "bg-green-50",
      label: "Traffic",
      val:
        tenantData?.tenantMetric?.[0]?.avgRequestsPerMinute != null
          ? `${tenantData.tenantMetric[0].avgRequestsPerMinute} rpm`
          : "NA",

      valColor: "text-gray-700",
      pct: 68,
      barColor: "bg-blue-600",
    },
    {
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
        </svg>
      ),
      iconBg: "bg-green-50",
      label: "Errors",
      val:
        tenantData?.tenantMetric?.[0]?.errorRate != null
          ? `${tenantData.tenantMetric[0].errorRate.toLocaleString()}%`
          : "NA",

      valColor: "text-green-600",
      pct: 15,
      barColor: "bg-green-500",
    },
    {
      icon: (
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6b7280"
          strokeWidth="2"
        >
          <path d="M18 20V10" />
          <path d="M12 20V4" />
          <path d="M6 20v-6" />
        </svg>
      ),
      iconBg: "bg-gray-100",
      label: "CPU",
      val: "-CS-",
      valColor: "text-gray-500",
      pct: 52,
      barColor: "bg-blue-600",
      sub: "Warn: 80%",
    },
  ];

  const userCols = [
    {
      id: "name",
      name: "User",
      width: 200,
      group: "Identity",
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          {row.image_url ? (
            <img
              src={row.image_url}
              alt=""
              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0 bg-purple-500">
              {row.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          )}
          <div
            onClick={() =>
              navigate(`/dashboard/tenants/${id}/employees/${row._id}`)
            }
            className="flex flex-col cursor-pointer text-blue-500"
          >
            <span className="text-[13px]  leading-tight">{row.name}</span>
          </div>
        </div>
      ),
    },
    {
      id: "email",
      name: "Email",
      width: 200,
      group: "Contact",
      cell: (row) => (
        <span className="text-[12.5px] text-gray-600">{row.email}</span>
      ),
    },
    {
      id: "phone",
      name: "Phone",
      width: 140,
      group: "Contact",
      cell: (row) => (
        <span className="font-mono text-[12px] text-gray-500">{row.phone}</span>
      ),
    },
    {
      id: "employee_id",
      name: "Employee ID",
      width: 100,
      group: "Identity",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-gray-400">
          {row.employee_id}
        </span>
      ),
    },
    {
      id: "status",
      name: "Status",
      width: 100,
      group: "Status",
      cell: (row) => <Badge value={row.status} status={row.status} />,
    },
  ];

  const endpointMetricsCols = [
    {
      id: "endpoint",
      name: "Endpoint",
      width: 220,
      group: "Endpoint",
      cell: (row) => (
        <Link
          to={`/dashboard/endpoint-explorer/endpoint-detail?endpoint=${row.endpoint}&method=${row.method}`}
          className="font-mono text-[12px] text-blue-500"
        >
          {row.endpoint}
        </Link>
      ),
    },
    {
      id: "avgRps",
      name: "Avg RPS",
      width: 90,
      group: "Traffic",
      cell: (row) => (
        <span className="font-mono text-[12px]">{row.avgRps}</span>
      ),
    },
    {
      id: "totalRequests",
      name: "Requests",
      width: 90,
      group: "Traffic",
      cell: (row) => (
        <span className="font-mono text-[12px]">
          {row.totalRequests?.toLocaleString()}
        </span>
      ),
    },
    {
      id: "p50",
      name: "p50",
      width: 80,
      group: "Latency",
      cell: (row) => <span className="font-mono text-[12px]">{row.p50}ms</span>,
    },
    {
      id: "p95",
      name: "p95",
      width: 80,
      group: "Latency",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.p95 > 400 ? "text-red-600" : row.p95 > 250 ? "text-amber-600" : "text-gray-700"}`}
        >
          {row.p95}ms
        </span>
      ),
    },
    {
      id: "p99",
      name: "p99",
      width: 80,
      group: "Latency",
      cell: (row) => (
        <span className="font-mono text-[12px] text-gray-400">{row.p99}ms</span>
      ),
    },
    {
      id: "errorRate",
      name: "Error Rate",
      width: 100,
      group: "Status",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.errorRate > 0 ? "text-red-600" : "text-gray-400"}`}
        >
          {row.errorRate}%
        </span>
      ),
    },
    {
      id: "status",
      name: "Status",
      width: 100,
      group: "Status",
      cell: (row) => {
        if (row.status === "slow")
          return <Badge value="Slow" variant="warning" />;
        if (row.status === "degraded")
          return <Badge value="Degraded" variant="down" />;
        return <Badge value="Healthy" variant="active" />;
      },
    },
  ];

  const logCols = [
    {
      id: "method",
      name: "Method",
      width: 70,
      group: "Request",
      cell: (row) => {
        const s = METHOD_STYLE[row.method] || {
          bg: "bg-gray-100",
          text: "text-gray-600",
        };
        return (
          <span
            className={`inline-flex px-1.5 py-0.5 rounded font-mono text-[10.5px] font-medium ${s.bg} ${s.text}`}
          >
            {row.method}
          </span>
        );
      },
    },
    {
      id: "endpoint",
      name: "Endpoint",
      width: 220,
      group: "Request",
      cell: (row) => (
        <Link
          to={`/dashboard/endpoint-explorer/endpoint-detail?endpoint=${row.endpoint}&method=${row.method}`}
          className="font-mono text-[12px] text-blue-500"
        >
          {row.endpoint}
        </Link>
      ),
    },
    {
      id: "statusCode",
      name: "Status",
      width: 70,
      group: "Response",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${STATUS_COLOR[row.statusCode] || "text-gray-400"}`}
        >
          {row.statusCode}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </div>
    );
  }
  return (
    <>
      <div className="container-page">
        {/* Topbar */}
        <div className="flex items-center justify-between">
          <div>
            <div
              className="flex items-center gap-2 mb-1"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19 }}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0">
                {tenantData?.data?.company?.slice(0, 1)}
              </div>
              <span className="text-gray-800">{tenantData?.data?.company}</span>
              <Badge value="Healthy" variant="active" />
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
              <Link to={"/dashboard/tenant"} className="hover:text-blue-600">
                Dashboard
              </Link>
              <span className="opacity-40">/</span>
              <span className="text-gray-700">{tenantData?.data?.company}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ActionButton
              action="edit"
              label="Edit"
              icon={EditIcon}
              onClick={() => setEditDialogOpen(true)}
            />
            {/* <ActionButton action="export" label="Export" icon={ExportIcon} /> */}

            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[12px] transition-colors">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              Create Alert -CS-
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Tenant Identity Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex flex-wrap">
              {/* Identity */}
              <div className="px-6 py-4 flex items-center gap-4 flex-1 min-w-[280px] border-r border-gray-200">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-[16px] font-semibold text-white flex-shrink-0">
                  {tenantData?.data?.company?.slice(0, 1)}
                </div>
                <div>
                  <div
                    className="text-[17px] text-gray-800 mb-1"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {tenantData?.data?.company}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge value="Basic" variant="category" />
                    <Badge value="Healthy" variant="active" />
                    <span className="text-[11px] text-gray-400">
                      ID: {tenantData?.data?._id}
                    </span>
                  </div>
                </div>
              </div>
              {/* Meta stats */}
              <div className="flex flex-wrap flex-[3]">
                {[
                  {
                    label: "Plan -CS-",
                    val: "Basic",
                    mono: false,
                    color: "",
                  },
                  {
                    label: "Region -CS-",
                    val: "ap-south-1",
                    mono: true,
                    color: "",
                  },
                  {
                    label: "Employees",
                    val:
                      tenantData?.teammembers != null
                        ? `${tenantData.teammembers} members`
                        : "NA",
                    mono: false,
                    color: "",
                  },
                  {
                    label: "Since",
                    val: tenantData?.data?.createdAt?.slice(0, 10),
                    mono: true,
                    color: "",
                  },
                  {
                    label: "Uptime 30d",
                    val: "99.98%",
                    mono: false,
                    color: "text-green-600",
                  },
                  {
                    label: "Open Alerts",
                    val: "0",
                    mono: false,
                    color: "text-gray-400",
                  },
                ].map((item, i, arr) => (
                  <div
                    key={item.label}
                    className={`px-5 py-3.5 flex-1 min-w-[110px] ${i < arr.length - 1 ? "border-r border-gray-200" : ""}`}
                  >
                    <div className="text-[11px] text-gray-400 mb-1">
                      {item.label}
                    </div>
                    <div
                      className={`text-[13px] ${item.mono ? "font-mono text-[12.5px]" : ""} ${item.color || "text-gray-800"}`}
                    >
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Uptime strip */}
            <div className="px-6 py-2.5 border-t border-gray-100 bg-gray-50/60 flex items-center gap-3.5">
              <span className="text-[11px] text-gray-400 flex-shrink-0">
                30-day uptime
              </span>
              <div className="flex gap-0.5 flex-1">
                {Array.from({ length: 30 }, (_, i) => (
                  <div
                    key={i}
                    className="h-4 rounded-[2px] flex-1"
                    style={{
                      background: i === 11 || i === 12 ? "#d97706" : "#16a34a",
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] text-green-600 flex-shrink-0">
                99.98%
              </span>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="1.8"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                count:
                  tenantData?.tenantMetric?.[0]?.avgP95 != null
                    ? `${tenantData.tenantMetric[0].avgP95.toFixed(0)}ms`
                    : "NA",
                countColor: "text-blue-600",
                badge: "Good",
                badgeVariant: "active",
                title: "p95 Latency",
                delta: "▼ −18ms vs yesterday",
                badgeBg: "bg-green-50",
                deltaColor: "text-green-600",
              },
              {
                icon: (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="1.8"
                  >
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                ),
                count:
                  tenantData?.tenantMetric?.[0]?.avgRequestsPerMinute != null
                    ? tenantData.tenantMetric[0].avgRequestsPerMinute
                    : "NA",
                countColor: "text-green-600",
                badge: "Peak 1.2k",
                badgeVariant: "beta",
                title: "Requests / min",
                delta: "▲ +12% vs yesterday",
                badgeBg: "bg-green-50",
                deltaColor: "text-green-600",
              },
              {
                icon: (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                ),
                count:
                  tenantData?.tenantMetric?.[0]?.errorRate != null
                    ? `${tenantData.tenantMetric[0].errorRate.toLocaleString()}%`
                    : "NA",
                countColor: "text-gray-800",
                badge: "Nominal",
                badgeVariant: "active",
                title: "Error Rate",
                delta: "▼ −0.1% vs yesterday",
                badgeBg: "bg-green-50",
                deltaColor: "text-green-600",
              },
              {
                icon: (
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8552e2ff"
                    strokeWidth="1.8"
                  >
                    <path d="M18 20V10" />
                    <path d="M12 20V4" />
                    <path d="M6 20v-6" />
                  </svg>
                ),
                count: "-CS-",
                countColor: "text-purple-800",
                badge: "Healthy",
                badgeVariant: "active",
                title: "CPU Saturation",
                delta: "— stable vs yesterday",
                badgeBg: "bg-gray-50",
                deltaColor: "text-gray-400",
              },
            ].map((s, i) => (
              <StatCard
                key={i}
                icon={s.icon}
                iconColor={s.iconColor}
                count={s.count}
                countColor={s.countColor}
                title={s.title}
                badgeText={s.delta}
                badgeBg={s.badgeBg}
                badgeTextColor={s.deltaColor}
              />
            ))}
          </div>

          {/* Signal Chart + Signal Health */}
          <div
            className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4"
          >
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
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
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  All Signals — Last 24h -CS-
                </div>
                <div className="flex items-center gap-4 text-[11.5px] text-gray-400">
                  {[
                    { color: "#2563eb", label: "Traffic", bar: true },
                    { color: "#d97706", label: "Latency" },
                    { color: "#dc2626", label: "Errors" },
                  ].map((l) => (
                    <span key={l.label} className="flex items-center gap-1">
                      <span
                        className={`flex-shrink-0 ${l.bar ? "w-3 h-2 rounded-sm opacity-25" : "w-3 h-0.5 rounded-full"}`}
                        style={{ background: l.color }}
                      />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-5 py-4">
                <SignalChart />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Signal Health
              </div>
              {SIGNAL_METERS.map((sm) => (
                <div
                  key={sm.label}
                  className="flex items-center gap-3.5 px-5 py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div
                    className={`w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0 ${sm.iconBg}`}
                  >
                    {sm.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-[12.5px] text-gray-700">
                        {sm.label}
                      </span>
                      <span className={`font-mono text-[12px] ${sm.valColor}`}>
                        {sm.val}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${sm.barColor}`}
                        style={{ width: `${sm.pct}%` }}
                      />
                    </div>
                    <div className="text-[10.5px] text-gray-400 mt-0.5">
                      {sm.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quota + SLO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <div
                  className="text-[14px] text-gray-800"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Quota &amp; Rate Limits -CS-
                </div>
                <Badge value="Basic Plan" variant="beta" />
              </div>
              <div className="px-5 py-4 flex flex-col gap-4">
                {QUOTA_ITEMS.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[13px] text-gray-700">
                        {item.label}
                      </span>
                      <span className="font-mono text-[12px] text-blue-600">
                        {item.val}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.barColor}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px] text-gray-400">
                        {item.sub}
                      </span>
                      <span className={`text-[11px] ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
                <div
                  className="text-[14px] text-gray-800"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  SLO Dashboard -CS-
                </div>
                <Badge value="All SLOs Met" variant="active" />
              </div>
              <div className="px-5 py-4 flex flex-col gap-4">
                {SLO_ITEMS.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[13px] text-gray-700">
                        {item.label}
                      </span>
                      <span className="font-mono text-[12px]">
                        <span
                          className={
                            item.statusVariant === "active"
                              ? "text-green-600"
                              : "text-amber-600"
                          }
                        >
                          {item.val}
                        </span>
                        <span className="text-gray-400"> / {item.target}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.barColor}`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px] text-gray-400">
                        {item.budget}
                      </span>
                      <Badge value={item.status} variant={item.statusVariant} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Endpoint Metrics Table */}
          <div className="overflow-hidden">
            <Table
              columns={endpointMetricsCols}
              group={ENDPOINT_METRICS_GROUPS}
              tableName="tenant-endpoint-metrics"
              data={endpointMetricsData}
              loading={isLoadingEndpointMetrics}
              enableSearch={true}
              searchInput={emSearchInput}
              setSearchInput={setEMSearchInput}
              pageIndex={emPageIndex}
              setPageIndex={setEMPageIndex}
              pageLimit={emPageLimit}
              setPageLimit={setEMPageLimit}
              paginationData={{
                totalCount: endpointMetricsPagination.total,
                totalPages: endpointMetricsPagination.totalPages || 1,
              }}
              sortField={emSortField}
              setSortField={setEMSortField}
              sortType={emSortType}
              setSortType={setEMSortType}
              activeFilters={{}}
              setActiveFilters={() => {}}
              showRowNumbers={false}
            />
          </div>

          {/* Users + Activity */}
          <div
            className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4"
          >
            <div className="overflow-hidden">
              <Table
                columns={userCols}
                group={USER_GROUPS}
                tableName="tenant-users"
                data={tenantUsers}
                loading={isLoadingTenantEmployees}
                enableSearch={true}
                searchInput={uSearchInput}
                setSearchInput={setUSearchInput}
                pageIndex={uPageIndex}
                setPageIndex={setUPageIndex}
                pageLimit={uPageLimit}
                setPageLimit={setUPageLimit}
                paginationData={{
                  totalCount: tenantUsersPagination.total,
                  totalPages: tenantUsersPagination.totalPages || 1,
                }}
                sortField={sortField}
                setSortField={setSortField}
                sortType={sortType}
                setSortType={setSortType}
                activeFilters={{}}
                setActiveFilters={() => {}}
                showRowNumbers={false}
              />
            </div>

            {/* Activity Timeline */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 text-[14px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Recent Activity -CS-
              </div>
              <div className="px-4 py-4 flex flex-col gap-0">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="flex gap-3 pb-4 relative">
                    {i < ACTIVITY.length - 1 && (
                      <div className="absolute left-[13px] top-6 bottom-0 w-0.5 bg-gray-100" />
                    )}
                    <div
                      className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${a.bg} ${a.color}`}
                    >
                      <ActivityIcon type={a.type} />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="text-[13px] text-gray-800">{a.title}</div>
                      <div className="text-[11.5px] text-gray-400">{a.sub}</div>
                      <div className="text-[11px] text-gray-300 mt-0.5">
                        {a.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Request Log */}
          <div className="overflow-hidden">
            <Table
              columns={logCols}
              group={LOG_GROUPS}
              tableName="tenant-request-log"
              data={requestLogData}
              loading={isLoadingRequestLog}
              enableSearch={true}
              searchInput={lSearchInput}
              setSearchInput={setLSearchInput}
              pageIndex={lPageIndex}
              setPageIndex={setLPageIndex}
              pageLimit={lPageLimit}
              setPageLimit={setLPageLimit}
              paginationData={{
                totalCount: requestLogPagination.total,
                totalPages: requestLogPagination.totalPages || 1,
              }}
              sortField={lSortField}
              setSortField={setLSortField}
              sortType={lSortType}
              setSortType={setLSortType}
              activeFilters={{}}
              setActiveFilters={() => {}}
              showRowNumbers={false}
            />
          </div>
        </div>
      </div>

      {editDialogOpen && (
        <EditTenantDialog
          tenant={tenantData?.data}
          isUpdating={isUpdating}
          onSave={(payload) =>
            updateTenant(
              { tenantId: id, payload },
              { onSuccess: () => setEditDialogOpen(false) },
            )
          }
          onClose={() => setEditDialogOpen(false)}
        />
      )}
    </>
  );
}

function EditTenantDialog({ tenant, isUpdating, onSave, onClose }) {
  const [origins, setOrigins] = useState(tenant?.origin?.join("\n") ?? "");

  if (!tenant) return null;

  const fields = [
    { label: "ID", value: tenant._id, icon: Hash },
    { label: "Name", value: tenant.name, icon: Fingerprint },
    { label: "Company", value: tenant.company, icon: Building2 },
    { label: "Website", value: tenant.website, icon: Globe },
    { label: "Business Email", value: tenant.business_email, icon: Mail },
    { label: "Phone", value: tenant.phone, icon: Phone },
    {
      label: "Tenant Unique Name",
      value: tenant.tenant_unique_name,
      icon: Fingerprint,
    },
    { label: "Login URL", value: tenant.login_url, icon: LogIn },
    { label: "Setup Status", value: tenant.setup_status, icon: Clock },
    {
      label: "Created At",
      value: tenant.createdAt?.slice(0, 10),
      icon: Calendar,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <span
            className="text-[17px] text-gray-800"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Edit Tenant
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {fields.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label}>
                  <div className="text-[11px] text-gray-400 mb-1">
                    {f.label}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-400">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <input
                      className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-[13px] font-mono text-gray-800 bg-gray-50 cursor-not-allowed"
                      value={String(f.value ?? "")}
                      disabled
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-200">
            <div className="text-[13px] text-gray-800 mb-1.5 font-medium">
              Origin (editable)
            </div>
            <div className="relative">
              <div className="absolute top-3 left-0 flex items-center pl-2.5 pointer-events-none text-gray-400">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <textarea
                className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-[13px] font-mono text-gray-800 resize-none focus:outline-none focus:border-blue-400 focus:bg-white bg-white"
                rows={5}
                value={origins}
                onChange={(e) => setOrigins(e.target.value)}
              />
            </div>
            <div className="text-[11px] text-gray-400 mt-1">
              One origin per line
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-[12px] text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                origin: origins
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            disabled={isUpdating}
            className="px-4 py-1.5 text-[12px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {isUpdating ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
