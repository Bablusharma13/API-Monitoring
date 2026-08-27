// ── Severity ─────────────────────────────────────────────────────────────
export const SEVERITY_META = {
  critical: { label: "Critical", variant: "down", dot: "#dc2626" },
  warning: { label: "Warning", variant: "warning", dot: "#d97706" },
  info: { label: "Info", variant: "beta", dot: "#2563eb" },
};

export const SEVERITY_OPTIONS = [
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" },
];

// ── Alert lifecycle status ──────────────────────────────────────────────
export const ALERT_STATUS_META = {
  firing: { label: "Firing", variant: "down" },
  acknowledged: { label: "Acknowledged", variant: "warning" },
  resolved: { label: "Resolved", variant: "active" },
  silenced: { label: "Silenced", variant: "default" },
};

// ── Rule signal ──────────────────────────────────────────────────────────
export const SIGNAL_META = {
  status: { label: "Status", dot: "#2563eb" },
  latency: { label: "Latency", dot: "#d97706" },
  errorRate: { label: "Error Rate", dot: "#dc2626" },
};

export const SIGNAL_OPTIONS = [
  { value: "status", label: "Status" },
  { value: "latency", label: "Latency" },
  { value: "errorRate", label: "Error Rate" },
];

export const CONDITION_STATUS_OPTIONS = [
  { value: "down", label: "Down" },
  { value: "warning", label: "Warning" },
];

// ── Rule / silence scope ────────────────────────────────────────────────
export const SCOPE_TYPE_OPTIONS = [
  { value: "all", label: "All APIs" },
  { value: "category", label: "By Category" },
  { value: "api", label: "Specific APIs" },
];

// ── Notification channel type ───────────────────────────────────────────
export const CHANNEL_TYPE_META = {
  email: { label: "Email", emoji: "📧", color: "#4285f4" },
  slack: { label: "Slack", emoji: "💬", color: "#611f69" },
  webhook: { label: "Webhook", emoji: "🔗", color: "#ff4a00" },
  pagerduty: { label: "PagerDuty", emoji: "📟", color: "#06ac38" },
  discord: { label: "Discord", emoji: "🎮", color: "#5865f2" },
};

export const CHANNEL_TYPE_OPTIONS = Object.entries(CHANNEL_TYPE_META).map(
  ([value, meta]) => ({ value, label: meta.label }),
);

// ── Formatting helpers (pure — no fabricated data, only what the rule /
//    channel document actually carries) ─────────────────────────────────
export const formatCondition = (rule) => {
  if (!rule) return "—";
  const c = rule.condition || {};
  if (rule.signal === "status") {
    return c.statuses?.length ? `status = ${c.statuses.join(" or ")}` : "—";
  }
  if (rule.signal === "latency") {
    return c.thresholdMs != null ? `response time > ${c.thresholdMs}ms` : "—";
  }
  if (rule.signal === "errorRate") {
    return c.thresholdPct != null ? `error rate > ${c.thresholdPct}%` : "—";
  }
  return "—";
};

export const formatScope = (scope) => {
  if (!scope || !scope.type || scope.type === "all") return "All APIs";
  if (scope.type === "category") {
    const n = scope.categoryIds?.length || 0;
    return n === 1
      ? scope.categoryIds[0]?.name || "1 category"
      : `${n} categor${n === 1 ? "y" : "ies"}`;
  }
  if (scope.type === "api") {
    const n = scope.apiIds?.length || 0;
    return n === 1 ? scope.apiIds[0]?.name || "1 API" : `${n} APIs`;
  }
  return "—";
};

export const formatChannelConfig = (channel) => {
  if (!channel) return "—";
  const cfg = channel.config || {};
  switch (channel.type) {
    case "email":
      return Array.isArray(cfg.to) ? cfg.to.join(", ") : cfg.to || "—";
    case "slack":
    case "discord":
    case "pagerduty":
      return cfg.webhookUrl ? maskUrl(cfg.webhookUrl) : "—";
    case "webhook":
      return cfg.url ? maskUrl(cfg.url) : "—";
    default:
      return "—";
  }
};

const maskUrl = (url) => {
  try {
    const u = new URL(url);
    return u.host + (u.pathname !== "/" ? u.pathname.slice(0, 12) + "…" : "");
  } catch {
    return url;
  }
};

// ── Table group color maps ──────────────────────────────────────────────
export const ALERTS_GROUP = {
  Identity: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Priority: { hex: "#ea580c", bg: "bg-orange-50", text: "text-orange-700" },
  Lifecycle: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Notifications: {
    hex: "#7c3aed",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
};

export const ALERT_RULES_GROUP = {
  "Rule Info": { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Criteria: { hex: "#0891b2", bg: "bg-cyan-50", text: "text-cyan-700" },
  Notifications: {
    hex: "#16a34a",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  Controls: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

export const NOTIFICATION_CHANNELS_GROUP = {
  Identity: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Delivery: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Controls: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

export const SILENCES_GROUP = {
  Scope: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Window: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
};

// ── Filter pill defs (Table.jsx / NewTableConfig format) ────────────────
const clockIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const priorityIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
);

const signalIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const powerIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
    <line x1="12" y1="2" x2="12" y2="12" />
  </svg>
);

const typeIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
  </svg>
);

export const ALERTS_FILTERS = [
  {
    id: "status",
    name: "Status",
    filterName: "status",
    icon: clockIcon,
    options: [
      { value: "firing", label: "Firing" },
      { value: "acknowledged", label: "Acknowledged" },
      { value: "resolved", label: "Resolved" },
      { value: "silenced", label: "Silenced" },
    ],
  },
  {
    id: "severity",
    name: "Severity",
    filterName: "severity",
    icon: priorityIcon,
    options: SEVERITY_OPTIONS,
  },
];

export const ALERT_RULES_FILTERS = [
  {
    id: "signal",
    name: "Signal",
    filterName: "signal",
    icon: signalIcon,
    options: SIGNAL_OPTIONS,
  },
  {
    id: "severity",
    name: "Severity",
    filterName: "severity",
    icon: priorityIcon,
    options: SEVERITY_OPTIONS,
  },
  {
    id: "enabled",
    name: "Enabled",
    filterName: "enabled",
    icon: powerIcon,
    options: [
      { value: "true", label: "Enabled" },
      { value: "false", label: "Disabled" },
    ],
  },
];

export const NOTIFICATION_CHANNELS_FILTERS = [
  {
    id: "type",
    name: "Type",
    filterName: "type",
    icon: typeIcon,
    options: CHANNEL_TYPE_OPTIONS,
  },
  {
    id: "enabled",
    name: "Enabled",
    filterName: "enabled",
    icon: powerIcon,
    options: [
      { value: "true", label: "Enabled" },
      { value: "false", label: "Disabled" },
    ],
  },
];
