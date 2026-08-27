import { Link } from "react-router-dom";

const CHECK_STATUS_CONFIG = {
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

const CheckStatusBadge = ({ status }) => {
  const cfg = CHECK_STATUS_CONFIG[status?.toLowerCase()] ?? {
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

export const checksColumns = [
  {
    id: "api",
    accessor: "api",
    name: "API Name",
    Header: "API NAME",
    group: "Identity",
    cell: (row) => {
      const apiId = row.api?.apiId;
      return apiId ? (
        <Link to={`/dashboard/apis/${apiId}`} className="text-blue-500">
          {row.apiName}
        </Link>
      ) : (
        <span>{row.apiName}</span>
      );
    },
  },
  {
    id: "status",
    accessor: "status",
    name: "Status",
    Header: "STATUS",
    group: "Result",
    cell: (row) => <CheckStatusBadge status={row.status} />,
  },
  {
    id: "statusCode",
    accessor: "statusCode",
    name: "HTTP Code",
    Header: "HTTP CODE",
    group: "Result",
    cell: (row) => <span>{row.statusCode ?? "—"}</span>,
  },
  {
    id: "responseTime",
    accessor: "responseTime",
    name: "Response Time",
    Header: "RESPONSE TIME",
    group: "Timing",
    cell: (row) =>
      row.responseTime != null ? (
        <span>{row.responseTime} ms</span>
      ) : (
        <span>—</span>
      ),
  },
  {
    id: "checkedAt",
    accessor: "checkedAt",
    name: "Checked At",
    Header: "CHECKED AT",
    group: "Timing",
    cell: (row) => {
      if (!row.checkedAt) return <span>—</span>;
      const d = new Date(row.checkedAt);
      const date = d.toISOString().slice(0, 10);
      const time = d.toTimeString().slice(0, 8);
      return <span>{date} {time}</span>;
    },
  },
  {
    id: "error",
    accessor: "error",
    name: "Error",
    Header: "ERROR",
    group: "Result",
    cell: (row) => (
      <span className="line-clamp-1 text-gray-500">{row.error ?? "—"}</span>
    ),
  },
  {
    id: "region",
    accessor: "region",
    name: "Region",
    Header: "REGION",
    group: "Identity",
    cell: (row) => <span>{row.region ?? "—"}</span>,
  },
];
