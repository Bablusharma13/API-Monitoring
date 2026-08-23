import { NewBadge } from "../../../components/ui/NewBadge";
import { Avatar } from "../../../components/ui/ProfileAvtar";

export const categoriesColumns = [
  {
    id: "name",
    accessor: "name",
    name: "Category",
    Header: "CATEGORY",
    group: "Identity",
    cell: (row) => (
      <div className="flex items-center gap-2.5 py-1">
        {row.color && (
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: row.color }}
          />
        )}
        <div className="flex flex-col gap-0.5">
          <div className="font-normal text-gray-900">{row.name}</div>
        </div>
      </div>
    ),
  },
  {
    id: "health",
    accessor: "health",
    name: "Health",
    Header: "HEALTH",
    group: "Status",
    cell: (row) => {
      const score = row.stats?.healthScore ?? 100;
      const status =
        score === 100 ? "healthy" : score >= 80 ? "warning" : "critical";
      return <NewBadge type="status" status={status} />;
    },
  },
  {
    id: "isActive",
    accessor: "isActive",
    name: "Active",
    Header: "ACTIVE",
    group: "Status",
    cell: (row) => (
      <NewBadge type="status" status={row.isActive ? "active" : "inactive"} />
    ),
  },
  {
    id: "totalApis",
    accessor: "totalApis",
    name: "Total APIs",
    Header: "TOTAL APIS",
    group: "Metrics",
    cell: (row) => <span>{row.stats?.totalApis ?? "—"}</span>,
  },
  {
    id: "activeApis",
    accessor: "activeApis",
    name: "Active APIs",
    Header: "ACTIVE APIS",
    group: "Metrics",
    cell: (row) => <span>{row.stats?.activeApis ?? "—"}</span>,
  },
  {
    id: "downApis",
    accessor: "downApis",
    name: "Down",
    Header: "DOWN",
    group: "Metrics",
    cell: (row) => (
      <span
        className={row.stats?.downApis > 0 ? "text-red-600 font-medium" : ""}
      >
        {row.stats?.downApis ?? "—"}
      </span>
    ),
  },
  {
    id: "avgUptime",
    accessor: "avgUptime",
    name: "Avg Uptime",
    Header: "AVG UPTIME",
    group: "Metrics",
    cell: (row) => (
      <span className="text-emerald-600 font-medium">
        {row.stats?.avgUptime != null ? `${row.stats.avgUptime}%` : "—"}
      </span>
    ),
  },
  {
    id: "avgResponse",
    accessor: "avgResponse",
    name: "Avg Response",
    Header: "AVG RESPONSE",
    group: "Metrics",
    cell: (row) => (
      <span className="font-mono text-gray-500">
        {row.stats?.avgResponse != null ? `${row.stats.avgResponse}ms` : "—"}
      </span>
    ),
  },
  {
    id: "totalIncidents",
    accessor: "totalIncidents",
    name: "Incidents",
    Header: "INCIDENTS",
    group: "Monitoring",
    cell: (row) => <span>{row.stats?.totalIncidents ?? "—"}</span>,
  },
  {
    id: "lastIncidentAt",
    accessor: "lastIncidentAt",
    name: "Last Incident",
    Header: "LAST INCIDENT",
    group: "Monitoring",
    cell: (row) => (
      <span className="text-gray-500">
        {row.stats?.lastIncidentAt
          ? new Date(row.stats.lastIncidentAt).toLocaleString()
          : "—"}
      </span>
    ),
  },
  {
    id: "owner",
    accessor: "owner",
    name: "Owner",
    Header: "OWNER",
    group: "Details",
    cell: (row) => {
      if (!row.owner) return <span className="text-gray-300">—</span>;
      const name = typeof row.owner === "object" ? row.owner.name : row.owner;
      const src = typeof row.owner === "object" ? row.owner.profileImage : undefined;
      return (
        <div className="flex items-center gap-1.5">
          <Avatar src={src} name={name} size="xsm" />
          <span className="text-[12px] text-[#1c1f2e]">{name}</span>
        </div>
      );
    },
  },
  {
    id: "compliance",
    accessor: "compliance",
    name: "Compliance",
    Header: "COMPLIANCE",
    group: "Details",
    cell: (row) =>
      row.compliance?.length ? (
        <div className="flex flex-wrap gap-1">
          {row.compliance.map((c) => (
            <span
              key={c}
              className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium"
            >
              {c}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-400">—</span>
      ),
  },
  {
    id: "updatedAt",
    accessor: "updatedAt",
    name: "Updated",
    Header: "UPDATED",
    group: "Metadata",
    cell: (row) => (
      <span className="text-gray-500">
        {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "—"}
      </span>
    ),
  },
  {
    id: "actions",
    accessor: "actions",
    name: "Actions",
    Header: "",
    group: "Actions",
    width: 60,
    cell: (row) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log("Actions clicked for category:", row.name);
        }}
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>
    ),
  },
];

