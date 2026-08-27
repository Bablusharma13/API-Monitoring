import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import { SLO_THRESHOLD_MS } from "../constants";

// Same method → badge-color mapping used on the real EndpointExplorer page,
// which this table's data source (useGetTenantEndpointExplorerQuery) also
// powers.
const METHOD_STYLE = {
  GET: { bg: "bg-blue-50", text: "text-blue-700" },
  POST: { bg: "bg-green-50", text: "text-green-700" },
  PUT: { bg: "bg-amber-50", text: "text-amber-700" },
  DELETE: { bg: "bg-red-50", text: "text-red-700" },
  PATCH: { bg: "bg-purple-50", text: "text-purple-700" },
};

// Column defs for the "Slowest Endpoints" table. This is the real per-endpoint
// p50/p95/p99 data from EndpointMetric (via tenants/endpoint-explorer),
// aggregated across all tenants — same shape/renderers as EndpointExplorer's
// table, plus the SLO-oriented "vs SLO" / "Status" columns the original
// Latency mock had (now driven off the real p95 value instead of fake data).
export const latencyEndpointColumns = [
  {
    id: "method",
    name: "Method",
    width: 80,
    group: "Endpoint",
    disableSortBy: true,
    cell: (row) => {
      const s = METHOD_STYLE[row.method] || {
        bg: "bg-gray-100",
        text: "text-gray-600",
      };
      return (
        <span
          className={`inline-flex px-2 py-0.5 rounded font-mono text-[11px] font-medium ${s.bg} ${s.text}`}
        >
          {row.method}
        </span>
      );
    },
  },
  {
    id: "endpoint",
    name: "Endpoint",
    width: 260,
    group: "Endpoint",
    disableSortBy: true,
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
    id: "totalHits",
    name: "Req Count",
    width: 100,
    group: "Traffic",
    cell: (row) => (
      <span className="font-mono text-[12px]">
        {row.totalHits?.toLocaleString()}
      </span>
    ),
  },
  {
    id: "p50",
    name: "p50",
    width: 80,
    group: "Latency",
    cell: (row) => (
      <span className="font-mono text-[12px] text-gray-500">{row.p50}ms</span>
    ),
  },
  {
    id: "p95",
    name: "p95",
    width: 80,
    group: "Latency",
    cell: (row) => {
      const c =
        row.p95 > SLO_THRESHOLD_MS
          ? "text-red-600"
          : row.p95 > SLO_THRESHOLD_MS * 0.67
            ? "text-amber-600"
            : "text-gray-700";
      return <span className={`font-mono text-[12px] ${c}`}>{row.p95}ms</span>;
    },
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
    id: "vsSlo",
    name: "vs SLO",
    width: 90,
    group: "Latency",
    disableSortBy: true,
    cell: (row) => {
      const diff = Math.round((row.p95 ?? 0) - SLO_THRESHOLD_MS);
      return diff > 0 ? (
        <span className="font-mono text-[12px] text-red-600">+{diff}ms</span>
      ) : (
        <span className="font-mono text-[12px] text-green-600">{diff}ms</span>
      );
    },
  },
  {
    id: "errorRate",
    name: "Err %",
    width: 70,
    group: "Traffic",
    cell: (row) => {
      const v = row.errorRate ?? 0;
      const c =
        v > 2 ? "text-red-600" : v > 1 ? "text-amber-600" : "text-gray-400";
      return <span className={`font-mono text-[12px] ${c}`}>{v}%</span>;
    },
  },
  {
    id: "status",
    name: "Status",
    width: 90,
    group: "Status",
    disableSortBy: true,
    cell: (row) => {
      if (row.p95 > SLO_THRESHOLD_MS) return <Badge value="Breached" variant="down" />;
      if (row.p95 > SLO_THRESHOLD_MS * 0.67)
        return <Badge value="At risk" variant="warning" />;
      return <Badge value="OK" variant="active" />;
    },
  },
];
