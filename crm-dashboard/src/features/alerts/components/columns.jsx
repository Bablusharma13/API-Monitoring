import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/Badge";
import { formatDateTime } from "../../../utils/helpers";
import {
  SEVERITY_META,
  ALERT_STATUS_META,
  SIGNAL_META,
  CHANNEL_TYPE_META,
  formatCondition,
  formatScope,
  formatChannelConfig,
} from "../constants";
import { AlertRuleEnabledToggle } from "./AlertRuleEnabledToggle";
import { NotificationChannelEnabledToggle } from "./NotificationChannelEnabledToggle";
import { NotificationChannelTestButton } from "./NotificationChannelTestButton";
import { AlertRowActions } from "./AlertRowActions";

const SeverityBadge = ({ severity }) => {
  const cfg = SEVERITY_META[severity] ?? {
    label: severity ?? "—",
    variant: "default",
  };
  return <Badge value={cfg.label} variant={cfg.variant} />;
};

const AlertStatusBadge = ({ status }) => {
  const cfg = ALERT_STATUS_META[status] ?? {
    label: status ?? "—",
    variant: "default",
  };
  return <Badge value={cfg.label} variant={cfg.variant} />;
};

const SignalPill = ({ signal }) => {
  const cfg = SIGNAL_META[signal] ?? { label: signal ?? "—", dot: "#9ca3af" };
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
      />
      <span className="text-[12.5px] text-gray-700">{cfg.label}</span>
    </div>
  );
};

// ── Alerts (used by both Active Alerts + Alert History panels) ──────────
export const alertsColumns = [
  {
    id: "severity",
    accessor: "severity",
    name: "Severity",
    Header: "SEVERITY",
    group: "Priority",
    width: 100,
    cell: (row) => <SeverityBadge severity={row.severity} />,
  },
  {
    id: "title",
    accessor: "title",
    name: "Alert",
    Header: "ALERT",
    group: "Identity",
    width: 240,
    cell: (row) => (
      <div>
        <div className="text-[13px] text-gray-800 font-medium leading-snug">
          {row.title || "—"}
        </div>
        {row.message && (
          <div className="text-[11.5px] text-gray-400 line-clamp-1 mt-0.5">
            {row.message}
          </div>
        )}
      </div>
    ),
  },
  {
    id: "api",
    accessor: "api",
    name: "API",
    Header: "API",
    group: "Identity",
    width: 150,
    cell: (row) => {
      const apiId = row.api?.apiId;
      return apiId ? (
        <Link to={`/dashboard/apis/${apiId}`} className="text-blue-500">
          {row.api?.name}
        </Link>
      ) : (
        <span className="text-gray-700">{row.api?.name ?? "—"}</span>
      );
    },
  },
  {
    id: "rule",
    accessor: "rule",
    name: "Rule",
    Header: "RULE",
    group: "Identity",
    width: 160,
    cell: (row) => (
      <span className="text-[12px] text-gray-500">
        {row.rule?.name ?? "—"}
      </span>
    ),
  },
  {
    id: "status",
    accessor: "status",
    name: "Status",
    Header: "STATUS",
    group: "Lifecycle",
    width: 120,
    cell: (row) => <AlertStatusBadge status={row.status} />,
  },
  {
    id: "value",
    accessor: "value",
    name: "Value / Threshold",
    Header: "VALUE / THRESHOLD",
    group: "Lifecycle",
    width: 140,
    cell: (row) =>
      row.value != null ? (
        <span className="font-mono text-[12px] text-gray-700">
          {row.value}
          {row.threshold != null ? ` / ${row.threshold}` : ""}
        </span>
      ) : (
        <span className="text-gray-400">—</span>
      ),
  },
  {
    id: "triggeredAt",
    accessor: "triggeredAt",
    name: "Triggered At",
    Header: "TRIGGERED AT",
    group: "Lifecycle",
    width: 160,
    cell: (row) => (
      <span className="font-mono text-[11.5px] text-gray-400">
        {formatDateTime(row.triggeredAt)}
      </span>
    ),
  },
  {
    id: "resolvedAt",
    accessor: "resolvedAt",
    name: "Resolved At",
    Header: "RESOLVED AT",
    group: "Lifecycle",
    width: 160,
    cell: (row) => (
      <span className="font-mono text-[11.5px] text-gray-400">
        {row.resolvedAt ? formatDateTime(row.resolvedAt) : "—"}
      </span>
    ),
  },
  {
    id: "escalatedTiers",
    accessor: "escalatedTiers",
    name: "Escalated",
    Header: "ESCALATED",
    group: "Notifications",
    width: 100,
    cell: (row) => {
      const tiers = row.escalatedTiers || [];
      if (!tiers.length) return null;
      return (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[11px] font-medium"
          title={`Escalated through ${tiers.length} tier${tiers.length === 1 ? "" : "s"}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          {tiers.length}
        </span>
      );
    },
  },
  {
    id: "notifiedChannels",
    accessor: "notifiedChannels",
    name: "Notified",
    Header: "NOTIFIED",
    group: "Notifications",
    width: 180,
    cell: (row) => {
      const notified = row.notifiedChannels || [];
      if (!notified.length)
        return <span className="text-[11px] text-gray-400">—</span>;
      return (
        <div className="flex gap-1 flex-wrap">
          {notified.map((n, i) => (
            <Badge
              key={n.channel?._id || i}
              value={n.channel?.name || n.channel?.type || "channel"}
              variant={n.status === "failed" ? "down" : "default"}
            />
          ))}
        </div>
      );
    },
  },
  {
    id: "rowActions",
    accessor: "rowActions",
    name: "Actions",
    Header: "ACTIONS",
    group: "Lifecycle",
    width: 130,
    disableSortBy: true,
    cell: (row) => <AlertRowActions row={row} />,
  },
];

// ── Alert Rules ───────────────────────────────────────────────────────────
export const alertRulesColumns = [
  {
    id: "enabled",
    accessor: "enabled",
    name: "On",
    Header: "ON",
    group: "Controls",
    width: 60,
    disableSortBy: true,
    cell: (row) => <AlertRuleEnabledToggle row={row} />,
  },
  {
    id: "name",
    accessor: "name",
    name: "Rule Name",
    Header: "RULE NAME",
    group: "Rule Info",
    width: 220,
    cell: (row) => (
      <span className="text-[13px] text-gray-800 font-medium">
        {row.name}
      </span>
    ),
  },
  {
    id: "signal",
    accessor: "signal",
    name: "Signal",
    Header: "SIGNAL",
    group: "Rule Info",
    width: 120,
    cell: (row) => <SignalPill signal={row.signal} />,
  },
  {
    id: "severity",
    accessor: "severity",
    name: "Severity",
    Header: "SEVERITY",
    group: "Criteria",
    width: 100,
    cell: (row) => <SeverityBadge severity={row.severity} />,
  },
  {
    id: "condition",
    accessor: "condition",
    name: "Condition",
    Header: "CONDITION",
    group: "Criteria",
    width: 200,
    cell: (row) => (
      <span className="font-mono text-[11.5px] text-blue-600">
        {formatCondition(row)}
      </span>
    ),
  },
  {
    id: "scope",
    accessor: "scope",
    name: "Scope",
    Header: "SCOPE",
    group: "Criteria",
    width: 130,
    cell: (row) => (
      <span className="text-[12px] text-gray-500">
        {formatScope(row.scope)}
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
    cell: (row) => {
      const channels = row.channels || [];
      if (!channels.length)
        return <span className="text-[11px] text-gray-400">—</span>;
      return (
        <div className="flex gap-1 flex-wrap">
          {channels.map((c) => (
            <Badge key={c._id} value={c.name} variant="default" />
          ))}
        </div>
      );
    },
  },
  {
    id: "cooldownMinutes",
    accessor: "cooldownMinutes",
    name: "Cooldown",
    Header: "COOLDOWN",
    group: "Notifications",
    width: 100,
    cell: (row) => (
      <span className="font-mono text-[11.5px] text-gray-500">
        {row.cooldownMinutes ?? 0} min
      </span>
    ),
  },
  {
    id: "autoResolve",
    accessor: "autoResolve",
    name: "Auto-resolve",
    Header: "AUTO-RESOLVE",
    group: "Notifications",
    width: 110,
    cell: (row) => (
      <Badge
        value={row.autoResolve ? "Yes" : "No"}
        variant={row.autoResolve ? "active" : "default"}
      />
    ),
  },
  {
    id: "createdAt",
    accessor: "createdAt",
    name: "Created",
    Header: "CREATED",
    group: "Rule Info",
    width: 150,
    cell: (row) => (
      <span className="font-mono text-[11px] text-gray-400">
        {formatDateTime(row.createdAt)}
      </span>
    ),
  },
];

// ── Notification Channels ──────────────────────────────────────────────
export const notificationChannelsColumns = [
  {
    id: "name",
    accessor: "name",
    name: "Channel",
    Header: "CHANNEL",
    group: "Identity",
    width: 200,
    cell: (row) => {
      const meta = CHANNEL_TYPE_META[row.type] ?? {
        emoji: "🔔",
        color: "#6b7280",
      };
      return (
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[14px] flex-shrink-0"
            style={{ background: meta.color + "18" }}
          >
            {meta.emoji}
          </span>
          <span className="text-[13px] text-gray-800">{row.name}</span>
        </div>
      );
    },
  },
  {
    id: "type",
    accessor: "type",
    name: "Type",
    Header: "TYPE",
    group: "Identity",
    width: 110,
    cell: (row) => (
      <Badge
        value={CHANNEL_TYPE_META[row.type]?.label ?? row.type}
        variant="default"
      />
    ),
  },
  {
    id: "config",
    accessor: "config",
    name: "Destination",
    Header: "DESTINATION",
    group: "Identity",
    width: 200,
    cell: (row) => (
      <span
        className="text-[11.5px] text-gray-500 truncate block"
        title={formatChannelConfig(row)}
      >
        {formatChannelConfig(row)}
      </span>
    ),
  },
  {
    id: "severityFilter",
    accessor: "severityFilter",
    name: "Severities",
    Header: "SEVERITIES",
    group: "Delivery",
    width: 170,
    cell: (row) => {
      const sevs = row.severityFilter || [];
      if (!sevs.length) return <Badge value="All" variant="beta" />;
      return (
        <div className="flex gap-1 flex-wrap">
          {sevs.map((s) => (
            <SeverityBadge key={s} severity={s} />
          ))}
        </div>
      );
    },
  },
  {
    id: "sent",
    accessor: "stats.sent",
    name: "Sent",
    Header: "SENT",
    group: "Delivery",
    width: 80,
    cell: (row) => (
      <span className="font-mono text-[12px] text-green-600">
        {row.stats?.sent ?? 0}
      </span>
    ),
  },
  {
    id: "failed",
    accessor: "stats.failed",
    name: "Failed",
    Header: "FAILED",
    group: "Delivery",
    width: 80,
    cell: (row) => (
      <span
        className={`font-mono text-[12px] ${row.stats?.failed ? "text-red-600" : "text-gray-400"}`}
      >
        {row.stats?.failed ?? 0}
      </span>
    ),
  },
  {
    id: "lastUsed",
    accessor: "stats.lastUsed",
    name: "Last Used",
    Header: "LAST USED",
    group: "Delivery",
    width: 150,
    cell: (row) => (
      <span className="font-mono text-[11.5px] text-gray-400">
        {row.stats?.lastUsed ? formatDateTime(row.stats.lastUsed) : "Never"}
      </span>
    ),
  },
  {
    id: "enabled",
    accessor: "enabled",
    name: "Enabled",
    Header: "ENABLED",
    group: "Controls",
    width: 80,
    disableSortBy: true,
    cell: (row) => <NotificationChannelEnabledToggle row={row} />,
  },
  {
    id: "test",
    accessor: "test",
    name: "Test",
    Header: "TEST",
    group: "Controls",
    width: 90,
    disableSortBy: true,
    cell: (row) => <NotificationChannelTestButton row={row} />,
  },
];
