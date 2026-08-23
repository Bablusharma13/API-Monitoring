import { Link } from "react-router-dom";
import { NewBadge } from "../../../components/ui/NewBadge";

export const incidentsColumns = [
  {
    id: "id",
    accessor: "_id",
    name: "Incident ID",
    Header: "INCIDENT ID",
    group: "Identity",
    cell: (row) => <span>{row.incidentId || row._id}</span>,
  },
  {
    id: "api",
    accessor: "api",
    name: "API Name",
    Header: "API NAME",
    group: "Identity",
    cell: (row) => {
      const apiId = row.api?.apiId;
      const name = row.api?.name ?? <span>—</span>;

      return apiId ? (
        <Link to={`/dashboard/apis/${apiId}`} className="text-blue-500">
          {name}
        </Link>
      ) : (
        <span>{name}</span>
      );
    },
  },
  {
    id: "status",
    accessor: "status",
    name: "Status",
    Header: "STATUS",
    group: "Classification",
    cell: (row) => <NewBadge type="status" status={row.status} />,
  },
  {
    id: "severity",
    accessor: "severity",
    name: "Severity",
    Header: "SEVERITY",
    group: "Classification",
    cell: (row) => <NewBadge type="priority" status={row.severity} />,
  },
  {
    id: "title",
    accessor: "title",
    name: "Title",
    Header: "TITLE",
    group: "Details",
    cell: (row) => <span className="line-clamp-1">{row.title}</span>,
  },
  {
    id: "triggeredBy",
    accessor: "triggeredBy",
    name: "Triggered By",
    Header: "TRIGGERED BY",
    group: "Details",
    cell: (row) => <span className="capitalize">{row.triggeredBy ?? "—"}</span>,
  },
  {
    id: "duration",
    accessor: "duration",
    name: "Duration",
    Header: "DURATION",
    group: "Metrics",
    cell: (row) => (
      <span>{row.duration != null ? `${row.duration} min` : "—"}</span>
    ),
  },
  {
    id: "startedAt",
    accessor: "startedAt",
    name: "Started At",
    Header: "STARTED AT",
    group: "Metrics",
    cell: (row) => (
      <span>
        {row.startedAt ? new Date(row.startedAt).toLocaleString() : "—"}
      </span>
    ),
  },
  {
    id: "resolvedAt",
    accessor: "resolvedAt",
    name: "Resolved At",
    Header: "RESOLVED AT",
    group: "Metrics",
    cell: (row) => (
      <span>
        {row.resolvedAt ? new Date(row.resolvedAt).toLocaleString() : "—"}
      </span>
    ),
  },
];
