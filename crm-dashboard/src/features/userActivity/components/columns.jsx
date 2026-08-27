const AVATAR_PALETTE = [
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#16a34a",
  "#d97706",
  "#db2777",
  "#059669",
  "#ea580c",
];

// Deterministic color from a real identifier (name/employeeId) — presentational
// only, never fabricated business data.
function colorFor(seed) {
  const s = String(seed || "");
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function initialsFor(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] || "") + (parts[1]?.[0] || "")
  ).toUpperCase() || "?";
}

function formatLastSeen(value) {
  if (!value) return "—";
  const d = new Date(value);
  const date = d.toISOString().slice(0, 10);
  const time = d.toTimeString().slice(0, 8);
  return (
    <span>
      {date} {time}
    </span>
  );
}

// Columns are built as a function of `maxRequestCount` (from the current page's
// full user list) so the activity bar renders relative to the busiest user.
export const buildUserActivityColumns = (maxRequestCount = 1) => [
  {
    id: "name",
    accessor: "name",
    name: "User",
    Header: "USER",
    group: "Identity",
    cell: (row) => (
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium text-white flex-shrink-0"
          style={{ background: colorFor(row.employeeId || row.name) }}
        >
          {initialsFor(row.name)}
        </div>
        <span className="text-[13px] text-gray-800">{row.name || "Unknown"}</span>
      </div>
    ),
  },
  {
    id: "tenantName",
    accessor: "tenantName",
    name: "Tenant",
    Header: "TENANT",
    group: "Tenant",
    cell: (row) => (
      <div className="flex items-center gap-1.5">
        <div
          className="w-3.5 h-3.5 rounded-[3px] flex-shrink-0"
          style={{ background: colorFor(row.tenantId || row.tenantName) }}
        />
        <span className="text-[12.5px] text-gray-700">
          {row.tenantName || "Unknown"}
        </span>
      </div>
    ),
  },
  {
    id: "requestCount",
    accessor: "requestCount",
    name: "Requests",
    Header: "REQUESTS",
    group: "Activity",
    cell: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-14 h-1 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{
              width: `${Math.round(((row.requestCount || 0) / maxRequestCount) * 100)}%`,
            }}
          />
        </div>
        <span className="font-mono text-[12px]">
          {(row.requestCount || 0).toLocaleString()}
        </span>
      </div>
    ),
  },
  {
    id: "errorCount",
    accessor: "errorCount",
    name: "Errors",
    Header: "ERRORS",
    group: "Performance",
    cell: (row) => {
      const errPct = row.requestCount
        ? Math.round(((row.errorCount || 0) / row.requestCount) * 1000) / 10
        : 0;
      return (
        <span
          className={`font-mono text-[12px] ${errPct > 1 ? "text-red-600" : errPct > 0 ? "text-amber-600" : "text-gray-400"}`}
        >
          {row.errorCount || 0} ({errPct}%)
        </span>
      );
    },
  },
  {
    id: "avgLatency",
    accessor: "avgLatency",
    name: "Avg Latency",
    Header: "AVG LATENCY",
    group: "Performance",
    cell: (row) => (
      <span
        className={`font-mono text-[12px] ${row.avgLatency > 400 ? "text-amber-600" : "text-gray-700"}`}
      >
        {row.avgLatency != null ? `${row.avgLatency}ms` : "—"}
      </span>
    ),
  },
  {
    id: "lastSeenAt",
    accessor: "lastSeenAt",
    name: "Last Active",
    Header: "LAST ACTIVE",
    group: "Activity",
    cell: (row) => (
      <span className="font-mono text-[11.5px] text-gray-400">
        {formatLastSeen(row.lastSeenAt)}
      </span>
    ),
  },
];
