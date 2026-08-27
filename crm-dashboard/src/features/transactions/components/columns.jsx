import { Badge } from "../../../components/ui/Badge";
import { formatDateTime } from "../../../utils/helpers";
import { METHOD_META, LAST_RUN_STATUS_META } from "../constants";

// ── Owner (populated TeamMember: { _id, name, image_url }) ────────────────
const AVATAR_COLORS = ["4f46e5", "0891b2", "16a34a", "d97706", "dc2626"];
const fallbackAvatar = (name) => {
  const idx = (name || "").length % AVATAR_COLORS.length;
  return `https://ui-avatars.com/api/?background=${AVATAR_COLORS[idx]}&color=fff&name=${encodeURIComponent(name || "?")}`;
};

function OwnerCell({ owner }) {
  if (!owner || typeof owner !== "object") {
    return <span className="text-[12px] text-gray-400">Unassigned</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <img
        src={owner.image_url || fallbackAvatar(owner.name)}
        alt=""
        className="w-6 h-6 rounded-full object-cover border border-gray-200 flex-shrink-0"
        onError={(e) => (e.target.src = fallbackAvatar(owner.name))}
      />
      <span className="text-[12.5px] text-gray-700">{owner.name}</span>
    </div>
  );
}

// ── Steps summary — count + first step's method/url preview ───────────────
function StepsPreview({ steps }) {
  const list = steps || [];
  if (!list.length) {
    return <span className="text-[12px] text-gray-400">No steps</span>;
  }
  const first = list[0];
  const ms = METHOD_META[first.method] || METHOD_META.GET;
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span
        className="text-[10.5px] font-mono font-medium px-1.5 py-[1px] rounded border flex-shrink-0"
        style={{ color: ms.color, background: ms.bg, borderColor: ms.border }}
      >
        {first.method}
      </span>
      <span className="text-[11.5px] text-gray-500 truncate" title={first.url}>
        {first.url}
      </span>
      {list.length > 1 && (
        <span className="text-[10.5px] text-gray-400 flex-shrink-0">
          +{list.length - 1} more
        </span>
      )}
    </div>
  );
}

// ── stats.lastRunStatus badge ──────────────────────────────────────────────
function LastRunBadge({ status }) {
  if (!status) return <Badge value="Never run" variant="default" />;
  const meta = LAST_RUN_STATUS_META[status] ?? {
    label: status,
    variant: "default",
  };
  return <Badge value={meta.label} variant={meta.variant} />;
}

// ── stats.uptime30d bar ─────────────────────────────────────────────────────
function UptimeBar({ pct }) {
  const segs = 10;
  const value = Number.isFinite(pct) ? pct : 0;
  const filled = Math.round((value / 100) * segs);
  const color = value >= 99 ? "#16a34a" : value >= 95 ? "#d97706" : "#dc2626";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-[1.5px]">
        {Array.from({ length: segs }, (_, i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 12,
              borderRadius: 2,
              background: i < filled ? color : "#f0f2f7",
            }}
          />
        ))}
      </div>
      <span className="font-mono text-[11.5px]" style={{ color }}>
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

export const transactionsColumns = [
  {
    id: "name",
    accessor: "name",
    name: "Transaction",
    Header: "TRANSACTION",
    group: "Identity",
    width: 240,
    cell: (row) => (
      <div className="flex flex-col gap-0.5 max-w-[230px]">
        <span
          className="text-[13px] font-medium text-gray-800 truncate"
          title={row.name}
        >
          {row.name}
        </span>
        <span className="font-mono text-[10px] text-gray-400">{row._id}</span>
      </div>
    ),
  },
  {
    id: "owner",
    accessor: "owner",
    name: "Owner",
    Header: "OWNER",
    group: "Identity",
    width: 160,
    disableSortBy: true,
    cell: (row) => <OwnerCell owner={row.owner} />,
  },
  {
    id: "steps",
    accessor: "steps",
    name: "Steps",
    Header: "STEPS",
    group: "Config",
    width: 220,
    disableSortBy: true,
    cell: (row) => <StepsPreview steps={row.steps} />,
  },
  {
    id: "frequency",
    accessor: "frequency",
    name: "Frequency",
    Header: "FREQUENCY",
    group: "Config",
    width: 140,
    cell: (row) => (
      <span className="font-mono text-[11.5px] text-gray-600">
        {row.frequency}
      </span>
    ),
  },
  {
    id: "timeout",
    accessor: "timeout",
    name: "Timeout",
    Header: "TIMEOUT",
    group: "Config",
    width: 100,
    cell: (row) => (
      <span className="font-mono text-[12px] text-gray-600">
        {row.timeout ?? 0} ms
      </span>
    ),
  },
  {
    id: "channels",
    accessor: "channels",
    name: "Channels",
    Header: "CHANNELS",
    group: "Notifications",
    width: 180,
    disableSortBy: true,
    cell: (row) => {
      const channels = row.channels || [];
      if (!channels.length)
        return <span className="text-[11px] text-gray-400">—</span>;
      return (
        <div className="flex gap-1 flex-wrap">
          {channels.map((c) => (
            <Badge
              key={c._id || c}
              value={c.name || "channel"}
              variant={c.enabled === false ? "default" : "beta"}
            />
          ))}
        </div>
      );
    },
  },
  {
    id: "lastRunStatus",
    accessor: "stats.lastRunStatus",
    name: "Last Run",
    Header: "LAST RUN",
    group: "Health",
    width: 110,
    cell: (row) => <LastRunBadge status={row.stats?.lastRunStatus} />,
  },
  {
    id: "lastRunAt",
    accessor: "stats.lastRunAt",
    name: "Last Run At",
    Header: "LAST RUN AT",
    group: "Health",
    width: 160,
    cell: (row) => (
      <span className="font-mono text-[11.5px] text-gray-400">
        {row.stats?.lastRunAt ? formatDateTime(row.stats.lastRunAt) : "—"}
      </span>
    ),
  },
  {
    id: "uptime30d",
    accessor: "stats.uptime30d",
    name: "30D Uptime",
    Header: "30D UPTIME",
    group: "Health",
    width: 140,
    cell: (row) => <UptimeBar pct={row.stats?.uptime30d ?? 0} />,
  },
  {
    id: "enabled",
    accessor: "enabled",
    name: "Status",
    Header: "STATUS",
    group: "Controls",
    width: 100,
    cell: (row) => (
      <Badge
        value={row.enabled ? "Enabled" : "Disabled"}
        variant={row.enabled ? "active" : "default"}
      />
    ),
  },
];
