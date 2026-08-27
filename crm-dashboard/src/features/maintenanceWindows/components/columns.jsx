import { Badge } from "../../../components/ui/Badge";
import { formatDateTime } from "../../../utils/helpers";
import {
  SCOPE_TYPE_OPTIONS,
  WINDOW_STATUS_META,
  formatScope,
  getWindowStatus,
} from "../constants";

const scopeTypeLabel = (type) =>
  SCOPE_TYPE_OPTIONS.find((o) => o.value === type)?.label || type || "—";

const WindowStatusBadge = ({ window }) => {
  const status = getWindowStatus(window);
  const cfg = WINDOW_STATUS_META[status] ?? {
    label: status,
    variant: "default",
  };
  return <Badge value={cfg.label} variant={cfg.variant} />;
};

export const maintenanceWindowsColumns = [
  {
    id: "reason",
    accessor: "reason",
    name: "Reason",
    Header: "REASON",
    group: "Window",
    width: 240,
    cell: (row) => (
      <span className="text-[13px] text-gray-800 font-medium">
        {row.reason || "—"}
      </span>
    ),
  },
  {
    id: "status",
    accessor: "status",
    name: "Status",
    Header: "STATUS",
    group: "Window",
    width: 110,
    disableSortBy: true,
    cell: (row) => <WindowStatusBadge window={row} />,
  },
  {
    id: "startsAt",
    accessor: "startsAt",
    name: "Starts At",
    Header: "STARTS AT",
    group: "Window",
    width: 160,
    cell: (row) => (
      <span className="font-mono text-[11.5px] text-gray-500">
        {formatDateTime(row.startsAt)}
      </span>
    ),
  },
  {
    id: "endsAt",
    accessor: "endsAt",
    name: "Ends At",
    Header: "ENDS AT",
    group: "Window",
    width: 160,
    cell: (row) => (
      <span className="font-mono text-[11.5px] text-gray-500">
        {formatDateTime(row.endsAt)}
      </span>
    ),
  },
  {
    id: "scopeType",
    accessor: "scope.type",
    name: "Scope Type",
    Header: "SCOPE TYPE",
    group: "Scope",
    width: 120,
    cell: (row) => (
      <span className="text-[12px] text-gray-500">
        {scopeTypeLabel(row.scope?.type)}
      </span>
    ),
  },
  {
    id: "scope",
    accessor: "scope",
    name: "Scope",
    Header: "SCOPE",
    group: "Scope",
    width: 160,
    cell: (row) => (
      <span className="text-[12px] text-gray-500">
        {formatScope(row.scope)}
      </span>
    ),
  },
  {
    id: "createdBy",
    accessor: "createdBy",
    name: "Created By",
    Header: "CREATED BY",
    group: "Metadata",
    width: 180,
    cell: (row) => (
      <span className="text-[12px] text-gray-500">
        {row.createdBy || "—"}
      </span>
    ),
  },
  {
    id: "createdAt",
    accessor: "createdAt",
    name: "Created",
    Header: "CREATED",
    group: "Metadata",
    width: 150,
    cell: (row) => (
      <span className="font-mono text-[11px] text-gray-400">
        {formatDateTime(row.createdAt)}
      </span>
    ),
  },
];
