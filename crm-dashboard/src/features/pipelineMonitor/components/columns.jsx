import { Badge } from "../../../components/ui/Badge";
import { formatDateTime } from "../../../utils/helpers";

export const deadLetterColumns = [
  {
    id: "name",
    accessor: "name",
    name: "Job Name",
    Header: "JOB NAME",
    group: "Job",
    cell: (row) => (
      <span className="font-mono text-[12px] text-gray-800">
        {row.name ?? "—"}
      </span>
    ),
  },
  {
    id: "queue",
    accessor: "queue",
    name: "Queue",
    Header: "QUEUE",
    group: "Job",
    cell: (row) => <Badge value={row.queue} variant="beta" />,
  },
  {
    id: "attemptsMade",
    accessor: "attemptsMade",
    name: "Attempts",
    Header: "ATTEMPTS",
    group: "Result",
    cell: (row) => <span>{row.attemptsMade ?? 0}</span>,
  },
  {
    id: "failedReason",
    accessor: "failedReason",
    name: "Failure Reason",
    Header: "FAILURE REASON",
    group: "Result",
    cell: (row) => (
      <span
        className="line-clamp-1 text-red-600"
        title={row.failedReason ?? ""}
      >
        {row.failedReason ?? "—"}
      </span>
    ),
  },
  {
    id: "timestamp",
    accessor: "timestamp",
    name: "Failed At",
    Header: "FAILED AT",
    group: "Timing",
    cell: (row) => (
      <span className="font-mono text-[11.5px] text-gray-500">
        {formatDateTime(row.timestamp)}
      </span>
    ),
  },
];
