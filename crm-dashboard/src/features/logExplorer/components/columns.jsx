import { Badge } from "../../../components/ui/Badge";
import { formatDateTime } from "../../../utils/helpers";

// Status vocabulary is the union of both underlying sources: "check" docs
// use ok/warn/error/timeout, "request" docs are reduced to ok/error.
const STATUS_CONFIG = {
  ok: {
    label: "OK",
    dot: "fill-green-500",
    ring: "ring-green-500",
    text: "text-green-700",
  },
  warn: {
    label: "Warn",
    dot: "fill-yellow-500",
    ring: "ring-yellow-500",
    text: "text-yellow-700",
  },
  error: {
    label: "Error",
    dot: "fill-red-500",
    ring: "ring-red-500",
    text: "text-red-700",
  },
  timeout: {
    label: "Timeout",
    dot: "fill-purple-500",
    ring: "ring-purple-500",
    text: "text-purple-700",
  },
};

export const LogStatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status ?? "—",
    dot: "fill-gray-400",
    ring: "ring-gray-400",
    text: "text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 ${cfg.text} ${cfg.ring}`}
    >
      <svg
        viewBox="0 0 6 6"
        aria-hidden="true"
        className={`size-1.5 ${cfg.dot}`}
      >
        <circle r={3} cx={3} cy={3} />
      </svg>
      {cfg.label}
    </span>
  );
};

const SOURCE_CONFIG = {
  check: { label: "Check", cls: "bg-blue-50 text-blue-700 ring-blue-600/20" },
  request: {
    label: "Request",
    cls: "bg-purple-50 text-purple-700 ring-purple-600/20",
  },
};

export const SourceBadge = ({ source }) => {
  const cfg = SOURCE_CONFIG[source] ?? {
    label: source ?? "—",
    cls: "bg-gray-50 text-gray-600 ring-gray-400/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[11px] ring-1 ring-inset whitespace-nowrap ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
};

export const StatusCodeText = ({ code }) => {
  if (code == null) return <span className="text-gray-400 text-[12px]">—</span>;
  const cls =
    code >= 500
      ? "text-red-600"
      : code >= 400
        ? "text-amber-600"
        : code >= 300
          ? "text-blue-600"
          : "text-green-600";
  return <span className={`font-mono text-[12px] ${cls}`}>{code}</span>;
};

export const LatencyText = ({ ms }) => {
  if (ms == null) return <span className="text-gray-400 text-[12px]">—</span>;
  const cls =
    ms > 1000 ? "text-red-500" : ms > 500 ? "text-amber-500" : "text-gray-700";
  return (
    <span className={`font-mono text-[12px] ${cls}`}>{ms} ms</span>
  );
};

export const logColumns = [
  {
    id: "timestamp",
    accessor: "timestamp",
    name: "Timestamp",
    Header: "TIMESTAMP",
    group: "Timestamp",
    cell: (row) => (
      <span className="font-mono text-[11px] text-gray-500">
        {formatDateTime(row.timestamp)}
      </span>
    ),
  },
  {
    id: "source",
    accessor: "source",
    name: "Source",
    Header: "SOURCE",
    group: "Request",
    cell: (row) => <SourceBadge source={row.source} />,
  },
  {
    id: "target",
    accessor: "target",
    name: "Target",
    Header: "TARGET",
    group: "Request",
    cell: (row) => (
      <span className="text-[12.5px] font-medium text-gray-800 truncate">
        {row.target || "—"}
      </span>
    ),
  },
  {
    id: "method",
    accessor: "method",
    name: "Method",
    Header: "METHOD",
    group: "Request",
    cell: (row) =>
      row.method ? (
        <Badge value={row.method} />
      ) : (
        <span className="text-gray-400 text-[12px]">—</span>
      ),
  },
  {
    id: "statusCode",
    accessor: "statusCode",
    name: "Status Code",
    Header: "STATUS CODE",
    group: "Response",
    cell: (row) => <StatusCodeText code={row.statusCode} />,
  },
  {
    id: "latencyMs",
    accessor: "latencyMs",
    name: "Latency",
    Header: "LATENCY",
    group: "Response",
    cell: (row) => <LatencyText ms={row.latencyMs} />,
  },
  {
    id: "status",
    accessor: "status",
    name: "Status",
    Header: "STATUS",
    group: "Response",
    cell: (row) => <LogStatusBadge status={row.status} />,
  },
  {
    id: "message",
    accessor: "message",
    name: "Message",
    Header: "MESSAGE",
    group: "Details",
    cell: (row) => (
      <span className="line-clamp-1 text-gray-600 text-[12.5px]">
        {row.message ?? "—"}
      </span>
    ),
  },
];
