// columns/allAPIsColumns.jsx
import { Link } from "react-router-dom";
import { NewBadge } from "../../../components/ui/NewBadge"; // update path as needed
import { Avatar } from "../../../components/ui/ProfileAvtar";

export const allAPIsColumns = [
  // ── Identity ──────────────────────────────────────────────────────
  {
    id: "apiId",
    accessor: "apiId",
    name: "ID",
    Header: "ID",
    group: "Identity",
    description: "Unique identifier for the API",
    cell: (row) => {
      return (
        <Link className="text-blue-500" to={`/dashboard/apis/${row.apiId}`}>
          {row.apiId.toUpperCase()}
        </Link>
      );
    },
  },
  {
    id: "name",
    accessor: "name",
    name: "API Name",
    Header: "API Name",
    group: "Identity",
    description: "Name of the API endpoint",
  },
  {
    id: "request.url",
    accessor: "request.url",
    name: "URL",
    Header: "URL",
    group: "Identity",
    description: "The endpoint URL path",
    cell: (row) => {
      return (
        <Link className="text-blue-500" to={row.request.url} target="_blank">
          {row.request.url}
        </Link>
      );
    },
  },

  // ── Classification ────────────────────────────────────────────────
  {
    id: "status.current",
    accessor: "status.current",
    name: "Status",
    Header: "Status",
    group: "Classification",
    description: "Current operational status of the API",
    cell: (row) => <NewBadge type="status" status={row.status?.current} />,
  },
  {
    id: "request.method",
    accessor: "request.method",
    name: "Method",
    Header: "Method",
    group: "Classification",
    description: "HTTP method used by the API",
    cell: (row) => <NewBadge type="method" status={row.request?.method} />,
  },
  {
    id: "type",
    accessor: "type",
    name: "Type",
    Header: "Type",
    group: "Classification",
    description: "Type of API (Internal, External, etc.)",
    cell: (row) => <NewBadge type="type" status={row.type} />,
  },
  {
    id: "mode",
    accessor: "mode",
    name: "Mode",
    Header: "Mode",
    group: "Classification",
    description: "Operational mode of the API",
    cell: (row) => <NewBadge type="mode" status={row.mode} />,
  },
  {
    id: "tech",
    accessor: "tech",
    name: "Tech",
    Header: "Tech",
    group: "Classification",
    description: "Technology stack used",
    cell: (row) => <NewBadge type="tech" status={row.tech} />,
  },
  {
    id: "version",
    accessor: "version",
    name: "Version",
    Header: "Version",
    group: "Classification",
    description: "API version number",
    cell: (row) => <NewBadge type="status" status={row.version} />,
  },

  // ── Monitoring ────────────────────────────────────────────────────
  {
    id: "stats.avgResponse30d",
    accessor: "stats.avgResponse30d",
    name: "Avg Response",
    Header: "Avg Response",
    group: "Monitoring",
    description: "Average response time over the last 30 days",
    cell: (row) => {
      const val = row.stats?.avgResponse30d;
      if (val === 0) return <span className=" text-sm text-red-600">Down</span>;
      const color = val > 1000 ? "#dc2626" : val > 500 ? "#d97706" : "#1c1f2e";
      return (
        <span className=" text-sm" style={{ color }}>
          {val.toLocaleString()} ms
        </span>
      );
    },
  },
  {
    id: "stats.uptime30d",
    accessor: "stats.uptime30d",
    name: "Uptime",
    Header: "Uptime",
    group: "Monitoring",
    description:
      "Percentage of time the API was available over the last 30 days",
    cell: (row) => {
      const u = row.stats?.uptime30d;
      if (u == null) return <span className="text-gray-300">—</span>;
      const color = u >= 99 ? "#16a34a" : u >= 97 ? "#d97706" : "#dc2626";
      return (
        <div className="flex items-center gap-2 min-w-[100px]">
          <span className=" text-sm w-[38px] flex-shrink-0" style={{ color }}>
            {u}%
          </span>
          <div className="flex-1 h-[4px] bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${u}%`, background: color }}
            />
          </div>
        </div>
      );
    },
  },
  {
    id: "stats.totalIncidents",
    accessor: "stats.totalIncidents",
    name: "Incidents",
    Header: "Incidents",
    group: "Monitoring",
    description: "Number of incidents recorded for this API",
    cell: (row) => {
      const n = row.stats?.totalIncidents;
      if (n == null) return <span className="text-gray-300">—</span>;
      const color = n > 5 ? "#dc2626" : n > 2 ? "#d97706" : "#1c1f2e";
      return (
        <span className=" text-sm" style={{ color }}>
          {n}
        </span>
      );
    },
  },
  {
    id: "stats.riskScore",
    accessor: "stats.riskScore",
    name: "Risk Score",
    Header: "Risk Score",
    group: "Monitoring",
    description: "Security risk score based on various factors",
    cell: (row) => {
      const r = row.stats?.riskScore;
      if (r == null) return <span className="text-gray-300">—</span>;
      const color = r >= 70 ? "#dc2626" : r >= 40 ? "#d97706" : "#16a34a";
      return (
        <div className="flex items-center gap-2 min-w-[80px]">
          <span
            className="font-mono text-sm w-[22px] flex-shrink-0"
            style={{ color }}
          >
            {r}
          </span>
          <div className="flex-1 h-[4px] bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${r}%`, background: color }}
            />
          </div>
        </div>
      );
    },
  },
  {
    id: "monitoring.frequencyLabel",
    accessor: "monitoring.frequencyLabel",
    name: "Frequency",
    Header: "Frequency",
    group: "Monitoring",
    description: "How often the API is monitored",
  },

  // ── Ownership ─────────────────────────────────────────────────────
  {
    id: "owner",
    accessor: "owner",
    name: "Owner",
    Header: "Owner",
    group: "Ownership",
    description: "Team or person responsible for this API",
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
    id: "category",
    accessor: "category",
    name: "Category",
    Header: "Category",
    group: "Ownership",
    description: "Category classification of the API",
    cell: (row) => {
      const name = row.category?.name ?? row.category;
      if (!name) return <span>—</span>;
      return <NewBadge type="status" status={name} />;
    },
  },
  {
    id: "tags",
    accessor: "tags",
    name: "Tags",
    Header: "Tags",
    group: "Ownership",
    description: "Custom tags for easy filtering and organization",
    cell: (row) => {
      const tags = row.tags || [];
      if (!tags.length) return <span className="text-gray-300">—</span>;
      return (
        <div className="flex items-center gap-1 flex-nowrap">
          {tags.slice(0, 2).map((t) => (
            <NewBadge key={t} type="status" status={t} />
          ))}
          {tags.length > 2 && (
            <span className="inline-flex items-center px-1.5 py-[1px] rounded-full text-[10.5px] bg-gray-100 text-gray-500 border border-gray-200">
              +{tags.length - 2}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "compliance",
    accessor: "compliance",
    name: "Compliance",
    Header: "Compliance",
    group: "Ownership",
    description: "Compliance standards this API adheres to",
    cell: (row) => {
      const items = row.compliance || [];
      if (!items.length) return <span className="text-gray-300">—</span>;
      return (
        <div className="flex items-center gap-1 flex-nowrap">
          {items.slice(0, 2).map((c) => (
            <NewBadge key={c} type="status" status={c} />
          ))}
          {items.length > 2 && (
            <span className="inline-flex items-center px-1.5 py-[1px] rounded-full text-[10.5px] bg-gray-100 text-gray-500 border border-gray-200">
              +{items.length - 2}
            </span>
          )}
        </div>
      );
    },
  },

  // ── Security ──────────────────────────────────────────────────────
  {
    id: "auth.token",
    accessor: "auth.token",
    name: "JWT Token",
    Header: "JWT Token",
    group: "Security",
    width: 160,
    description: "Authentication token for API access",
    cell: (row) => {
      if (!row.auth?.token) return <span className="text-gray-300">—</span>;
      return (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[11px] text-gray-400">
            eyJhbGciiuyh••••
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard?.writeText(row.auth.token).catch(() => {});
            }}
            className="w-[20px] h-[20px] flex-shrink-0 inline-flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
          >
            <svg
              width="9"
              height="9"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
      );
    },
  },
];
