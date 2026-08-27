import { formatDateTime } from "../../../utils/helpers";
import { ACTION_META, ENTITY_TYPE_META, VERB_COLOR } from "../constants";

export const ActionBadge = ({ action }) => {
  const meta = ACTION_META[action];
  const cls = VERB_COLOR[meta?.verb] ?? VERB_COLOR.default;
  return (
    <span
      className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-[11px] ring-1 ring-inset whitespace-nowrap ${cls.bg} ${cls.text} ${cls.ring}`}
    >
      <span className={`size-1.5 rounded-full ${cls.dot}`} />
      {meta?.label ?? action ?? "—"}
    </span>
  );
};

export const EntityTypeBadge = ({ entityType }) => {
  if (!entityType) return <span className="text-gray-400 text-[12px]">—</span>;
  const label = ENTITY_TYPE_META[entityType]?.label ?? entityType;
  return (
    <span className="inline-flex items-center rounded-md px-2 py-1 text-[11px] bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-400/20 whitespace-nowrap">
      {label}
    </span>
  );
};

export const auditLogColumns = [
  {
    id: "actorEmail",
    accessor: "actorEmail",
    name: "Actor",
    Header: "ACTOR",
    group: "Actor",
    cell: (row) => (
      <span className="text-[12.5px] font-medium text-gray-800">
        {row.actorEmail || "System"}
      </span>
    ),
  },
  {
    id: "action",
    accessor: "action",
    name: "Action",
    Header: "ACTION",
    group: "Action",
    cell: (row) => <ActionBadge action={row.action} />,
  },
  {
    id: "entityType",
    accessor: "entityType",
    name: "Entity Type",
    Header: "ENTITY TYPE",
    group: "Action",
    cell: (row) => <EntityTypeBadge entityType={row.entityType} />,
  },
  {
    id: "summary",
    accessor: "summary",
    name: "Summary",
    Header: "SUMMARY",
    group: "Details",
    cell: (row) => (
      <span className="line-clamp-1 text-gray-600 text-[12.5px]">
        {row.summary ?? "—"}
      </span>
    ),
  },
  {
    id: "createdAt",
    accessor: "createdAt",
    name: "Created At",
    Header: "CREATED AT",
    group: "Timestamp",
    cell: (row) => (
      <span className="font-mono text-[11px] text-gray-500">
        {formatDateTime(row.createdAt)}
      </span>
    ),
  },
];
