import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Activity,
  Ban,
  Box,
  Check,
  ChevronRight,
  Clipboard,
  Copy,
  Eye,
  Pencil,
  Play,
  RefreshCw,
  Trash2,
  PowerOff,
  Power,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { InfoCard } from "../../../components/ui/InfoCard";
import { StatCard as StatCard3 } from "../../../components/ui/StatCard3";
import { useApiDetailsQuery } from "../hooks/useApiDetailsQuery";
import { useDisableApiMutation } from "../../apis/hooks/query/useDisableApiMutation";
import { useDeleteApiMutation } from "../../apis/hooks/query/useDeleteApiMutation";
import {
  ClockIcon as SharedClockIcon,
  PulseWaveIcon,
  ShieldIcon as SharedShieldIcon,
  StatusDownIcon as SharedStatusDownIcon,
  WarningTriangleIcon,
} from "../../../components/ui/AppIcons";
import { Button } from "../../../components/ui/Button";
import { AlertDialog } from "../../../components/ui/AlertDialog";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../../../components/ui/ProfileAvtar";

const SmallIcon = ({ children }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6b7280"
    strokeWidth="2"
  >
    {children}
  </svg>
);
const TinyIcon = ({ children, cls = "" }) => (
  <svg
    className={cls}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    {children}
  </svg>
);
const COLOR_GREEN = "#16a34a";
const COLOR_AMBER = "#d97706";
const COLOR_RED = "#dc2626";
const COLOR_GRAY = "#6b7280";

const statusHex = (status) =>
  ({
    active: COLOR_GREEN,
    down: COLOR_RED,
    warning: COLOR_AMBER,
    paused: COLOR_AMBER,
  })[status] ?? COLOR_GRAY;

const uptimeHex = (pct) =>
  pct >= 99 ? COLOR_GREEN : pct >= 95 ? COLOR_AMBER : COLOR_RED;

const incidentHex = (count) =>
  count === 0 ? COLOR_GREEN : count <= 3 ? COLOR_AMBER : COLOR_RED;

const riskHex = (score) =>
  score < 40 ? COLOR_GREEN : score < 70 ? COLOR_AMBER : COLOR_RED;

const StatusDownIcon = ({ color, width = 16, height = 16 }) => (
  <SharedStatusDownIcon
    width={width}
    height={height}
    stroke={color}
    strokeWidth={2}
  />
);
const UptimeIcon = ({ color, width = 16, height = 16 }) => (
  <SharedClockIcon
    width={width}
    height={height}
    stroke={color}
    strokeWidth={2}
  />
);
const IncidentIcon = ({ color, width = 16, height = 16 }) => (
  <WarningTriangleIcon
    width={width}
    height={height}
    stroke={color}
    strokeWidth={2}
  />
);
const RiskIcon = ({ color, width = 16, height = 16 }) => (
  <SharedShieldIcon
    width={width}
    height={height}
    stroke={color}
    strokeWidth={2}
  />
);

const LOGS = [
  {
    time: "14:24:12",
    level: "ERROR",
    levelCls: "b-red",
    code: "503",
    codeCls: "text-[#dc2626]",
    response: "—",
    message: "Service Unavailable — upstream timeout",
  },
  {
    time: "14:23:12",
    level: "ERROR",
    levelCls: "b-red",
    code: "503",
    codeCls: "text-[#dc2626]",
    response: "—",
    message: "Service Unavailable — upstream timeout",
  },
  {
    time: "14:22:12",
    level: "ERROR",
    levelCls: "b-red",
    code: "503",
    codeCls: "text-[#dc2626]",
    response: "—",
    message: "Connection refused to upstream host",
  },
  {
    time: "14:21:10",
    level: "OK",
    levelCls: "b-green",
    code: "200",
    codeCls: "text-[#16a34a]",
    response: "312ms",
    responseCls: "text-[#16a34a]",
    message: "POST /v2/charge — payment processed",
  },
  {
    time: "14:20:10",
    level: "OK",
    levelCls: "b-green",
    code: "200",
    codeCls: "text-[#16a34a]",
    response: "287ms",
    responseCls: "text-[#16a34a]",
    message: "POST /v2/charge — payment processed",
  },
  {
    time: "14:19:09",
    level: "WARN",
    levelCls: "b-amber",
    code: "200",
    codeCls: "text-[#d97706]",
    response: "1840ms",
    responseCls: "text-[#d97706]",
    message: "High latency detected — above 1000ms threshold",
  },
];

const PAGE = {
  title: "API Details",
  actions: { openLogs: "Open Logs", pause: "Pause", testApi: "Test API" },
};

const PRIMARY_ACTIONS = {
  testApi: "Test API",
  restartMonitoring: "Restart Monitoring",
  manualCheck: "Manual Check",
  copyCurl: "Copy cURL",
  copyPostman: "Copy Postman",
  disableApi: "Disable API",
};

const UPTIME_BARS = 96;
const UPTIME_BAR_RULE = (i) => {
  if (i > 90 || i === 60 || i === 61) return "down";
  if (i === 42 || i === 43 || i === 44) return "warn";
  return "up";
};

const SECTION_LABELS = {
  monitoring: "B — API Monitoring",
  config: "C — Configuration & Access",
  logs: "D — Recent Logs",
};

const LOGS_CARD = { title: "Recent Logs", viewFullLogs: "View Full Logs" };
const UPTIME_CARD = { title: "Uptime Timeline — Last 7 Days" };

const OverviewInfoCard = ({ title, badge, rows }) => (
  <InfoCard
    title={title}
    action={
      badge ? (
        <span className={`badge ${badge.cls} text-[10.5px]`}>
          {badge.label}
        </span>
      ) : null
    }
  >
    <div>
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-center justify-between py-1.5 border-b border-[#f3f5f9] last:border-0"
        >
          <span className="text-[12px] text-[#6b7280]">{row.key}</span>
          <span
            className={`text-[12.5px]  ${row.valueClass || "text-[#1c1f2e]"}`}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  </InfoCard>
);

const CopyButton = ({
  text,
  className = "!w-6 !h-6 !p-0 min-w-0 cursor-pointer",
  iconSize = 14,
  ariaLabel = "Copy",
  variant = "ghost",
}) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!text || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Button
      type="button"
      variant={copied ? "ghost" : variant}
      size="sm"
      className={className}
      icon={copied ? <Check /> : <Copy />}
      iconSize={iconSize}
      aria-label={ariaLabel}
      onClick={handleCopy}
      style={copied ? { color: "#16a34a" } : undefined}
    />
  );
};

function renderConfigRow(row) {
  switch (row.kind) {
    case "text":
      return row.text;
    case "mono":
      return <span className="font-mono text-[12.5px]">{row.text}</span>;
    case "link":
      return (
        <span className="font-mono text-[12.5px] text-[#2563eb]">
          {row.text}
        </span>
      );
    case "badge":
      return (
        <span className={`badge ${row.badge.cls}`}>{row.badge.label}</span>
      );
    case "badges":
      return (
        <div className="flex gap-1.5">
          {row.badges.map((b) => (
            <span key={b.label} className={`badge ${b.cls}`}>
              {b.label}
            </span>
          ))}
        </div>
      );
    case "copy":
      return (
        <div className="inline-flex items-center gap-1.5">
          <span className="font-mono text-[12.5px] text-[#6b7280]">
            {row.text}
          </span>
          <CopyButton text={row.text} ariaLabel="Copy" />
        </div>
      );
    case "frequency":
      return (
        <div className="flex items-center gap-2">
          <span className="badge b-blue">{row.label}</span>
          <span className="font-mono text-[11.5px] text-[#6b7280]">
            {row.cron}
          </span>
        </div>
      );
    case "jwt":
      return (
        <div className="inline-flex items-center gap-1.5 flex-wrap">
          <span className="font-mono text-[12.5px] text-[#6b7280]">
            {row.masked}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="!w-6 !h-6 !p-0 min-w-0"
            icon={<Eye />}
            iconSize={14}
            aria-label="Reveal token"
          />
          <CopyButton text={row.masked} ariaLabel="Copy token" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="!w-6 !h-6 !p-0 min-w-0"
            icon={<RefreshCw />}
            iconSize={14}
            aria-label="Rotate token"
          />
        </div>
      );
    case "password":
      return (
        <div className="inline-flex items-center gap-1.5">
          <span className="font-mono text-[13px] text-[#6b7280]">
            {row.masked}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="!w-6 !h-6 !p-0 min-w-0"
            icon={<Eye />}
            iconSize={14}
            aria-label="Reveal password"
          />
        </div>
      );
    case "endpoint":
      return (
        <div className="inline-flex items-center gap-1.5">
          <span className="font-mono text-[12px] text-[#2563eb]">
            {row.path}
          </span>
          <CopyButton
            className="cursor-pointer"
            text={row.path}
            ariaLabel="Copy endpoint"
          />
        </div>
      );
    case "json":
      return (
        <pre className="bg-[#f8f9fc] border border-[#e9ebf0] rounded-lg p-3 text-[12px] font-mono text-[#1c1f2e]">
          {row.json}
        </pre>
      );
    case "avatar":
      return (
        <div className="flex items-center gap-2">
          <Avatar src={row.src} name={row.name} size="xsm" />
          <span className="text-[12.5px] text-[#1c1f2e]">
            {row.name || "—"}
          </span>
        </div>
      );
    default:
      return null;
  }
}

const ConfigInfoCard = ({ icon, title, editLabel, rows }) => (
  <InfoCard icon={icon} title={title}>
    <div>
      {rows.map((row) => (
        <div
          key={row.key}
          className="flex items-start gap-4 py-2.5 border-b border-[#f3f5f9] last:border-0"
        >
          <div className="w-[150px] shrink-0 text-[12.5px] text-[#6b7280]">
            {row.key}
          </div>
          <div className="flex-1 min-w-0">{row.value}</div>
        </div>
      ))}
    </div>
  </InfoCard>
);

const barToneClass = (tone) => {
  if (tone === "down") return "bg-[#dc2626]";
  if (tone === "warn") return "bg-[#d97706]";
  return "bg-[#16a34a]";
};

const SideStatTrailing = ({ trailing }) => {
  if (trailing === "dot")
    return <span className="w-2 h-2 rounded-full bg-[#16a34a]" />;
  if (trailing === "ban")
    return (
      <TinyIcon cls="text-[#dc2626]">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </TinyIcon>
    );
  if (trailing === "warn")
    return (
      <TinyIcon cls="text-[#d97706]">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </TinyIcon>
    );
  if (trailing === "badge-critical")
    return <span className="badge b-red text-[11px]">Critical</span>;
  if (trailing === "badge-ongoing")
    return <span className="badge b-red text-[11px]">Ongoing</span>;
  return null;
};

const STATUS_COLOR = {
  active: "text-green-600",
  down: "text-red-600",
  warning: "text-amber-600",
};
const STATUS_BADGE = { active: "b-green", down: "b-red", warning: "b-amber" };
const TYPE_BADGE = { Public: "b-blue", Private: "b-red", Internal: "b-purple" };
const MODE_BADGE = { Live: "b-amber", Test: "b-gray" };
const CHANNEL_BADGE = {
  email: "b-blue",
  slack: "b-purple",
  whatsapp: "b-green",
};

const fmtMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`);
const fmtUtc = (iso) => {
  if (!iso) return "—";
  const date = new Date(iso);
  const utcTime = date.toUTCString().slice(17, 25) + " UTC";
  const istTime =
    date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }) + " IST";
  return `${istTime}`;
};
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

export function ApiDetails() {
  const { api: apiId } = useParams();
  const navigate = useNavigate();
  const { data: apiData, isLoading, isError } = useApiDetailsQuery(apiId);
  const disableMutation = useDisableApiMutation();
  const deleteMutation = useDeleteApiMutation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isApiActive = !apiData?.isDisabled;

  const handleToggleDisable = () => {
    disableMutation.mutate({ id: apiId, isDisabled: !apiData?.isDisabled });
  };

  const handleDelete = () => setDeleteDialogOpen(true);

  const handleConfirmDelete = () => {
    deleteMutation.mutate(apiId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        navigate("/dashboard/apis");
      },
    });
  };

  if (isLoading)
    return (
      <div className="container-page">
        <p className="text-[#6b7280] text-sm">Loading…</p>
      </div>
    );
  if (isError)
    return (
      <div className="container-page">
        <p className="text-red-500 text-sm">Failed to load API details.</p>
      </div>
    );

  const currentStatus = apiData?.status?.current ?? "unknown";
  const statusDisplay = cap(currentStatus);
  const statusColor = STATUS_COLOR[currentStatus] ?? "text-[#1c1f2e]";
  const statusBadge = STATUS_BADGE[currentStatus] ?? "b-gray";
  const apiName = apiData?.name ?? "—";
  const apiUrl = apiData?.request?.url ?? "";

  const uptime30 = apiData?.stats?.uptime30d ?? 0;
  const uptimeColor =
    uptime30 >= 99
      ? "text-green-600"
      : uptime30 >= 95
        ? "text-amber-600"
        : "text-red-600";

  const page = {
    title: "API Details",
    actions: PAGE.actions,
    breadcrumbs: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "All APIs", href: "/dashboard/apis" },
      { label: apiName },
    ],
  };

  const incidentCount = apiData?.stats?.totalIncidents ?? 0;
  const riskScore = apiData?.stats?.riskScore ?? 0;

  const statusHexColor = statusHex(currentStatus);
  const uptimeHexColor = uptimeHex(uptime30);
  const incidentHexColor = incidentHex(incidentCount);
  const riskHexColor = riskHex(riskScore);

  const stats = {
    currentStatus: {
      value: statusDisplay,
      label: "Current Status",
      color: statusHexColor,
    },
    uptime: {
      value: `${uptime30}%`,
      label: "Uptime (30 Days)",
      color: uptimeHexColor,
    },
    incidents: {
      value: String(incidentCount),
      label: "Total Incidents",
      color: incidentHexColor,
    },
    riskScore: {
      value: String(riskScore),
      label: "Risk Score",
      color: riskHexColor,
    },
  };

  const riskPct = apiData?.stats?.riskScore ?? 0;
  const summary = {
    apiName,
    url: apiUrl,
    badges: [
      { label: statusDisplay, cls: statusBadge, dot: true },
      ...(apiData?.version ? [{ label: apiData.version, cls: "b-gray" }] : []),
      ...(apiData?.type
        ? [{ label: apiData.type, cls: TYPE_BADGE[apiData.type] ?? "b-gray" }]
        : []),
      ...(apiData?.mode
        ? [
            {
              label: `${apiData.mode} Mode`,
              cls: MODE_BADGE[apiData.mode] ?? "b-gray",
            },
          ]
        : []),
    ],
    tags: [
      ...(apiData?.request?.method
        ? [{ label: apiData.request.method, cls: "b-gray", icon: "pulse" }]
        : []),
      ...(apiData?.tech ? [{ label: apiData.tech, cls: "b-gray" }] : []),
      ...(apiData?.category?.name
        ? [{ label: apiData.category.name, cls: "b-purple" }]
        : []),
      ...(apiData?.compliance?.map((c) => ({ label: c, cls: "b-gray" })) ?? []),
      ...(apiData?.tags?.map((t) => ({ label: t, cls: "b-cyan" })) ?? []),
    ],
    riskRing: String(riskPct),
    riskTitle: "Risk Score",
    riskSubtext:
      riskPct >= 70
        ? "High risk — action required"
        : riskPct >= 40
          ? "Medium risk"
          : "Low risk",
    riskLevelLabel: "Risk level",
    riskLevel: `${riskPct} / 100`,
    riskBarPct: riskPct,
    alertChannelsLabel: "Alert channels:",
    alertChannels: (apiData?.alertChannels ?? []).map((c) => ({
      label: cap(c),
      cls: CHANNEL_BADGE[c] ?? "b-gray",
    })),
    primaryActions: PRIMARY_ACTIONS,
    sideStats: [
      {
        key: "Last Checked",
        value: fmtUtc(apiData?.monitoring?.lastCheckedAt),
        valueClass: "text-[#1c1f2e]",
        trailing: "dot",
      },
      {
        key: "Avg Response",
        value:
          apiData?.status?.lastResponseTime != null
            ? fmtMs(apiData.status.lastResponseTime)
            : "—",
        valueClass:
          currentStatus === "down" ? "text-[#dc2626]" : "text-[#1c1f2e]",
        trailing: currentStatus === "down" ? "ban" : null,
      },
      {
        key: "Uptime (30d)",
        value: `${uptime30}%`,
        valueClass: uptime30 >= 99 ? "text-[#16a34a]" : "text-[#d97706]",
        trailing: "warn",
      },
      {
        key: "Current Downtime",
        value:
          currentStatus === "down" && apiData?.status?.currentDownDuration
            ? `${apiData.status.currentDownDuration} min `
            : "NA",
        valueClass: "text-[#1c1f2e]",
        trailing: currentStatus === "down" ? "badge-ongoing" : null,
      },
    ],
  };

  const overviewCards = [
    {
      title: "Last 24 Hours",
      badge: { label: statusDisplay, cls: statusBadge },
      rows: [
        { key: "Uptime", value: `${apiData?.stats?.uptime24h ?? 0}%` },
        {
          key: "Avg Response",
          value: apiData?.stats?.avgResponse24h
            ? fmtMs(apiData.stats.avgResponse24h)
            : "—",
        },
        { key: "Incidents", value: "—" },
      ],
    },
    {
      title: "Last 7 Days",
      badge: { label: statusDisplay, cls: statusBadge },
      rows: [
        { key: "Uptime", value: `${apiData?.stats?.uptime7d ?? 0}%` },
        {
          key: "Avg Response",
          value: apiData?.stats?.avgResponse7d
            ? fmtMs(apiData.stats.avgResponse7d)
            : "—",
        },
        { key: "Incidents", value: "—" },
      ],
    },
    {
      title: "Last 30 Days",
      badge: { label: statusDisplay, cls: statusBadge },
      rows: [
        { key: "Uptime", value: `${uptime30}%`, valueClass: uptimeColor },
        {
          key: "Avg Response",
          value: apiData?.stats?.avgResponse30d
            ? fmtMs(apiData.stats.avgResponse30d)
            : "—",
        },
        {
          key: "Incidents",
          value: String(apiData?.stats?.totalIncidents ?? 0),
          valueClass:
            (apiData?.stats?.totalIncidents ?? 0) > 0
              ? "text-[#dc2626]"
              : undefined,
        },
      ],
    },
  ];

  const graph = {
    title: "Response Time Graph",
    avgMs: apiData?.stats?.avgResponse30d
      ? fmtMs(apiData.stats.avgResponse30d)
      : "—",
    peakMs: apiData?.stats?.peakResponse30d
      ? fmtMs(apiData.stats.peakResponse30d)
      : "—",
  };

  const config = {
    editLabel: "Edit",
    basic: {
      title: "Basic Info",
      rows: [
        { key: "API ID", kind: "copy", text: apiData?.apiId ?? "—" },
        { key: "API Name", kind: "text", text: apiData?.name ?? "—" },
        {
          key: "Version",
          kind: "badge",
          badge: { label: apiData?.version ?? "—", cls: "b-gray" },
        },
        {
          key: "Category",
          kind: "badge",
          badge: { label: apiData?.category?.name ?? "—", cls: "b-purple" },
        },
        ...(apiData?.tags?.length
          ? [
              {
                key: "Tags",
                kind: "badges",
                badges: apiData.tags.map((t) => ({ label: t, cls: "b-cyan" })),
              },
            ]
          : []),
        {
          key: "Tech",
          kind: "badge",
          badge: { label: apiData?.tech ?? "—", cls: "b-blue" },
        },
        ...(apiData?.compliance?.length
          ? [
              {
                key: "Compliance",
                kind: "badges",
                badges: apiData.compliance.map((c) => ({
                  label: c,
                  cls: "b-green",
                })),
              },
            ]
          : []),
      ],
    },
    ownership: {
      title: "Ownership & Responsibility",
      rows: [
        {
          key: "Owner",
          kind: "avatar",
          name:
            typeof apiData?.owner === "object"
              ? (apiData.owner?.name ?? "—")
              : (apiData?.owner ?? "—"),
          src:
            typeof apiData?.owner === "object"
              ? apiData.owner?.profileImage
              : undefined,
        },
      ],
    },
    scheduling: {
      title: "Scheduling & Monitoring",
      rows: [
        {
          key: "Assigned",
          kind: "mono",
          text: apiData?.monitoring?.assignedAt
            ? new Date(apiData.monitoring.assignedAt).toLocaleString()
            : "—",
        },
        {
          key: "Frequency",
          kind: "frequency",
          label: apiData?.monitoring?.frequencyLabel ?? "—",
          cron: apiData?.monitoring?.frequency ?? "",
        },
        {
          key: "Last Checked",
          kind: "mono",
          text: fmtUtc(apiData?.monitoring?.lastCheckedAt),
        },
        {
          key: "Timeout",
          kind: "mono",
          text: apiData?.monitoring?.timeout
            ? `${apiData.monitoring.timeout / 1000}s`
            : "—",
        },
        {
          key: "Expected Status",
          kind: "mono",
          text: String(apiData?.monitoring?.expectedStatus ?? "—"),
        },
      ],
    },
    access: {
      title: "Access & Security",
      rows: [
        {
          key: "API Mode",
          kind: "badge",
          badge: {
            label: apiData?.mode ?? "—",
            cls: MODE_BADGE[apiData?.mode] ?? "b-gray",
          },
        },
        {
          key: "API Type",
          kind: "badge",
          badge: {
            label: apiData?.type ?? "—",
            cls: TYPE_BADGE[apiData?.type] ?? "b-gray",
          },
        },
      ],
    },
    authentication: {
      title: "Authentication",
      rows: [
        {
          key: "Method",
          kind: "badge",
          badge: { label: apiData?.auth?.method ?? "None", cls: "b-blue" },
        },
      ],
    },
    request: {
      title: "Request Details",
      rows: [
        {
          key: "Method",
          kind: "badge",
          badge: { label: apiData?.request?.method ?? "—", cls: "b-green" },
        },
        { key: "Endpoint", kind: "endpoint", path: apiUrl },
        ...(apiData?.request?.body
          ? [
              {
                key: "Request Body",
                kind: "json",
                json:
                  typeof apiData.request.body === "string"
                    ? apiData.request.body
                    : JSON.stringify(apiData.request.body, null, 2),
              },
            ]
          : []),
      ],
    },
  };

  const logs = LOGS;
  const uptimeBarCount = UPTIME_BARS;
  const uptimeBarRule = UPTIME_BAR_RULE;
  const uptimeUptimePctLabel = `${uptime30}% uptime`;
  const sectionLabels = SECTION_LABELS;
  const uptimeCard = UPTIME_CARD;
  const logsCard = LOGS_CARD;

  const mapConfigRows = (rows) =>
    rows.map((r) => ({ key: r.key, value: renderConfigRow(r) }));

  return (
    <div className="container-page">
      <PageHeader
        icon={<PulseWaveIcon />}
        iconGradient=""
        title={page.title}
        breadcrumbs={page.breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              icon={<Pencil />}
              iconSize={14}
              onClick={() => navigate(`/dashboard/apis/form/${apiId}`)}
            >
              Edit API
            </Button>
            <Button
              variant={isApiActive ? "red" : "primary"}
              size="lg"
              icon={isApiActive ? <PowerOff /> : <Power />}
              iconSize={14}
              loading={disableMutation.isPending}
              onClick={handleToggleDisable}
            >
              {isApiActive ? "Disable" : "Enable"}
            </Button>
            <Button
              variant="red"
              size="lg"
              icon={<Trash2 />}
              iconSize={14}
              loading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        }
      />

      <Section className="mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[14px]">
          <StatCard3
            icon={<StatusDownIcon color={stats.currentStatus.color} />}
            count={stats.currentStatus.value}
            title={stats.currentStatus.label}
            countColor={`text-[${stats.currentStatus.color}]`}
            iconColor={`text-[${stats.currentStatus.color}]`}
          />
          <StatCard3
            icon={<UptimeIcon color={stats.uptime.color} />}
            count={stats.uptime.value}
            title={stats.uptime.label}
            countColor={`text-[${stats.uptime.color}]`}
            iconColor={`text-[${stats.uptime.color}]`}
          />
          <StatCard3
            icon={<IncidentIcon color={stats.incidents.color} />}
            count={stats.incidents.value}
            title={stats.incidents.label}
            countColor={`text-[${stats.incidents.color}]`}
            iconColor={`text-[${stats.incidents.color}]`}
          />
          <StatCard3
            icon={<RiskIcon color={stats.riskScore.color} />}
            count={stats.riskScore.value}
            title={stats.riskScore.label}
            countColor={`text-[${stats.riskScore.color}]`}
            iconColor={`text-[${stats.riskScore.color}]`}
          />
        </div>
      </Section>

      <Section className="mb-5">
        <InfoCard
          icon={<PulseWaveIcon width={16} height={16} />}
          title={`API Summary — ${summary.apiName}`}
        >
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex gap-2 items-center leading-none mb-2 text-2xl">
                <span>{summary.apiName}</span>
                {summary.badges.map((b) => (
                  <span key={b.label} className={`badge ${b.cls}`}>
                    {b.dot ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block mr-0.5" />
                    ) : null}
                    {b.label}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 border border-[#e9ebf0] rounded-lg px-3 py-[7px] bg-[#f8f9fc] text-[12px] text-[#6b7280] font-mono flex items-center gap-2">
                  <TinyIcon cls="text-[#6b7280]">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
                  </TinyIcon>
                  <span>{summary.url}</span>
                </div>
                <CopyButton
                  text={summary.url}
                  variant="outline"
                  className="!p-2 cursor-pointer"
                  ariaLabel="Copy URL"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3.5">
                {summary.tags.map((t) => (
                  <span key={t.label} className={`badge ${t.cls}`}>
                    {t.icon === "pulse" ? (
                      <TinyIcon>
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </TinyIcon>
                    ) : null}
                    {t.label}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-[#e9ebf0] mb-3.5 flex items-center gap-4">
                <div className="w-[52px] h-[52px] rounded-full border-2 border-[#fecaca] bg-[#fef2f2] text-[#dc2626] flex items-center justify-center font-medium">
                  {summary.riskRing}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] text-[#1c1f2e]">
                    {summary.riskTitle} -CS-
                  </div>
                  <div className="text-[11.5px] text-[#6b7280]">
                    {summary.riskSubtext}
                  </div>
                </div>
                <div className="w-[200px]">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#6b7280]">
                      {summary.riskLevelLabel}
                    </span>
                    <span className="text-[#dc2626]">{summary.riskLevel}</span>
                  </div>
                  <div className="h-[6px] rounded-[3px] bg-[#f0f2f7] overflow-hidden">
                    <div
                      className="h-full bg-[#dc2626] rounded-[3px]"
                      style={{ width: `${summary.riskBarPct}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11.5px] text-[#6b7280]">
                    {summary.alertChannelsLabel}
                  </span>
                  {summary.alertChannels.map((c) => (
                    <span key={c.label} className={`badge ${c.cls}`}>
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Play />}
                  iconSize={16}
                >
                  {summary.primaryActions.testApi} -CS-
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RefreshCw />}
                  iconSize={16}
                >
                  {summary.primaryActions.restartMonitoring} -CS-
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Activity />}
                  iconSize={16}
                >
                  {summary.primaryActions.manualCheck} -CS-
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Clipboard />}
                  iconSize={16}
                >
                  {summary.primaryActions.copyCurl} -CS-
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Box />}
                  iconSize={16}
                >
                  {summary.primaryActions.copyPostman} -CS-
                </Button>
              </div>
            </div>

            <div className="w-[220px] shrink-0 space-y-2.5">
              {summary.sideStats.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between border border-[#e9ebf0] rounded-[9px] p-2.5 bg-[#f8f9fc]"
                >
                  <div>
                    <div className="text-[12px] text-[#6b7280]">{s.key}</div>
                    <div className={`text-[16px] ${s.valueClass}`}>
                      {s.value}
                    </div>
                  </div>
                  <SideStatTrailing trailing={s.trailing} />
                </div>
              ))}
            </div>
          </div>
        </InfoCard>
      </Section>

      <Section className="mb-5">
        <div className="text-[11px] uppercase tracking-widest text-[#6b7280] mb-3">
          {sectionLabels.monitoring}
        </div>
        <InfoCard
          icon={
            <SmallIcon>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </SmallIcon>
          }
          title={uptimeCard.title}
          action={
            <span className="inline-flex items-center gap-2 text-[11.5px] text-[#6b7280]">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-[2px] bg-[#16a34a]" />
                Up
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-[2px] bg-[#dc2626]" />
                Down
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-[2px] bg-[#d97706]" />
                Warn
              </span>
              <span className="text-[12px] text-[#d97706] font-mono">
                {uptimeUptimePctLabel}
              </span>
            </span>
          }
        >
          <div className="flex gap-[2px] h-[18px]">
            {Array.from({ length: uptimeBarCount }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 min-w-[2px] rounded-[2px] ${barToneClass(uptimeBarRule(i))}`}
              />
            ))}
          </div>
        </InfoCard>
      </Section>

      <Section className="mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
          {overviewCards.map((card) => (
            <OverviewInfoCard
              key={card.title}
              title={card.title}
              badge={card.badge}
              rows={card.rows}
            />
          ))}
        </div>
      </Section>

      <Section className="mb-5">
        <div className="text-[11px] uppercase tracking-widest text-[#6b7280] mb-3">
          {sectionLabels.config}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <ConfigInfoCard
              title={config.basic.title}
              editLabel={config.editLabel}
              icon={
                <SmallIcon>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </SmallIcon>
              }
              rows={mapConfigRows(config.basic.rows)}
            />
            <ConfigInfoCard
              title={config.ownership.title}
              editLabel={config.editLabel}
              icon={
                <SmallIcon>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </SmallIcon>
              }
              rows={mapConfigRows(config.ownership.rows)}
            />
            <ConfigInfoCard
              title={config.scheduling.title}
              editLabel={config.editLabel}
              icon={
                <SmallIcon>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </SmallIcon>
              }
              rows={mapConfigRows(config.scheduling.rows)}
            />
          </div>

          <div className="space-y-4">
            <ConfigInfoCard
              title={config.access.title}
              editLabel={config.editLabel}
              icon={
                <SmallIcon>
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </SmallIcon>
              }
              rows={mapConfigRows(config.access.rows)}
            />
            <ConfigInfoCard
              title={config.authentication.title}
              editLabel={config.editLabel}
              icon={
                <SmallIcon>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </SmallIcon>
              }
              rows={mapConfigRows(config.authentication.rows)}
            />
            <ConfigInfoCard
              title={config.request.title}
              editLabel={config.editLabel}
              icon={
                <SmallIcon>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </SmallIcon>
              }
              rows={mapConfigRows(config.request.rows)}
            />
          </div>
        </div>
      </Section>

      <AlertDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        type="danger"
        title="Delete API"
        description="This will permanently delete the API and all its monitoring data. This action cannot be undone."
        checkboxLabel="I understand this action is permanent and cannot be undone."
        itemName="Delete API"
        handleOnClick={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default ApiDetails;
