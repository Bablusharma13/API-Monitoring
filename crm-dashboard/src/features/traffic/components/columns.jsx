import { formatCount } from "../../../utils/helpers";
import {
  METHOD_BADGE_STYLE,
  METHOD_BADGE_FALLBACK,
} from "../constants";

// Latency threshold coloring mirrors the pattern already established in
// src/features/apiDashboard/components/SlowApisColumns.jsx and
// src/features/apiLeaderboard/components/LeaderboardColumns.jsx (>1000ms
// red, >500ms amber, else default).
function LatencyCell({ ms }) {
  if (ms == null) return <span className="font-mono text-[12px] text-gray-400">—</span>;
  const color =
    ms > 1000 ? "text-red-600" : ms > 500 ? "text-amber-600" : "text-[#1c1f2e]";
  return <span className={`font-mono text-[12px] ${color}`}>{Math.round(ms)}ms</span>;
}

function MethodBadge({ method }) {
  const s = METHOD_BADGE_STYLE[method] || METHOD_BADGE_FALLBACK;
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded font-mono text-[11px] font-medium ${s.bg} ${s.text}`}
    >
      {method || "—"}
    </span>
  );
}

// `maxRps` (highest rps among the currently displayed rows) is injected by
// the caller so the share bar renders relative to the visible dataset.
export const getTrafficColumns = ({ maxRps = 1 } = {}) => [
  {
    id: "method",
    accessor: "method",
    name: "Method",
    Header: "METHOD",
    group: "Method",
    width: 90,
    cell: (row) => <MethodBadge method={row.method} />,
  },
  {
    id: "endpoint",
    accessor: "endpoint",
    name: "Endpoint",
    Header: "ENDPOINT",
    group: "Method",
    width: 220,
    cell: (row) => (
      <span className="font-mono text-[12px] text-gray-800">{row.endpoint}</span>
    ),
  },
  {
    id: "rps",
    accessor: "rps",
    name: "RPS",
    Header: "RPS",
    group: "Volume",
    width: 80,
    cell: (row) => <span className="font-mono text-[12px]">{row.rps ?? 0}</span>,
  },
  {
    id: "totalHits",
    accessor: "totalHits",
    name: "Total Hits",
    Header: "TOTAL HITS",
    group: "Volume",
    width: 100,
    cell: (row) => (
      <span className="font-mono text-[12px]">{formatCount(row.totalHits ?? 0)}</span>
    ),
  },
  {
    id: "avgLatency",
    accessor: "avgLatency",
    name: "Avg Latency",
    Header: "AVG LATENCY",
    group: "Performance",
    width: 100,
    cell: (row) => <LatencyCell ms={row.avgLatency} />,
  },
  {
    id: "trafficShare",
    accessor: "trafficShare",
    name: "Traffic share",
    Header: "TRAFFIC SHARE",
    group: "Traffic",
    width: 160,
    disableSortBy: true,
    cell: (row) => {
      const pct = maxRps > 0 ? Math.round(((row.rps ?? 0) / maxRps) * 100) : 0;
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-gray-400">{pct}%</span>
        </div>
      );
    },
  },
];
