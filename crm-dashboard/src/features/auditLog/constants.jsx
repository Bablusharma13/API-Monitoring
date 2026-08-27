// ── Entity type vocabulary ──────────────────────────────────────────────
// Mirrors the literal entityType values the backend's recordAudit() call
// sites actually write (see crm-dashboard-backend/src/modules/*/**.controller.js).
export const ENTITY_TYPE_META = {
  Api: { label: "API" },
  AlertRule: { label: "Alert Rule" },
  Alert: { label: "Alert" },
  AlertSilence: { label: "Alert Silence" },
  Category: { label: "Category" },
  CronJob: { label: "Cron Job" },
  NotificationChannel: { label: "Notification Channel" },
  TeamMember: { label: "Team Member" },
  Tenant: { label: "Tenant" },
  RetentionSetting: { label: "Retention Setting" },
};

export const ENTITY_TYPE_OPTIONS = Object.entries(ENTITY_TYPE_META).map(
  ([value, meta]) => ({ value, label: meta.label }),
);

// ── Action vocabulary ───────────────────────────────────────────────────
// Literal `action` strings written by recordAudit() across the backend,
// each mapped to a readable label and a verb used only for badge color.
export const ACTION_META = {
  "api.create": { label: "API Created", verb: "create" },
  "api.update": { label: "API Updated", verb: "update" },
  "api.toggle": { label: "API Toggled", verb: "toggle" },
  "api.delete": { label: "API Deleted", verb: "delete" },
  "api.bulkDelete": { label: "API Bulk Deleted", verb: "delete" },
  "api.removeCronJob": { label: "API Cron Job Removed", verb: "update" },
  "alertRule.create": { label: "Alert Rule Created", verb: "create" },
  "alertRule.update": { label: "Alert Rule Updated", verb: "update" },
  "alertRule.delete": { label: "Alert Rule Deleted", verb: "delete" },
  "alert.acknowledge": { label: "Alert Acknowledged", verb: "update" },
  "alert.resolve": { label: "Alert Resolved", verb: "update" },
  "alertSilence.create": { label: "Alert Silence Created", verb: "create" },
  "alertSilence.delete": { label: "Alert Silence Deleted", verb: "delete" },
  "category.create": { label: "Category Created", verb: "create" },
  "category.update": { label: "Category Updated", verb: "update" },
  "category.delete": { label: "Category Deleted", verb: "delete" },
  "category.bulkDelete": { label: "Category Bulk Deleted", verb: "delete" },
  "cronJob.create": { label: "Cron Job Created", verb: "create" },
  "cronJob.update": { label: "Cron Job Updated", verb: "update" },
  "cronJob.delete": { label: "Cron Job Deleted", verb: "delete" },
  "cronJob.toggle": { label: "Cron Job Toggled", verb: "toggle" },
  "cronJob.runNow": { label: "Cron Job Run Now", verb: "toggle" },
  "notificationChannel.create": {
    label: "Notification Channel Created",
    verb: "create",
  },
  "notificationChannel.update": {
    label: "Notification Channel Updated",
    verb: "update",
  },
  "notificationChannel.delete": {
    label: "Notification Channel Deleted",
    verb: "delete",
  },
  "notificationChannel.test": {
    label: "Notification Channel Tested",
    verb: "toggle",
  },
  "teamMember.create": { label: "Team Member Created", verb: "create" },
  "teamMember.update": { label: "Team Member Updated", verb: "update" },
  "teamMember.delete": { label: "Team Member Deleted", verb: "delete" },
  "tenant.updateOrigin": { label: "Tenant Origin Updated", verb: "update" },
  "retentionSetting.update": {
    label: "Retention Setting Updated",
    verb: "update",
  },
};

export const ACTION_OPTIONS = Object.entries(ACTION_META).map(
  ([value, meta]) => ({ value, label: meta.label }),
);

// Verb → badge color, keyed off ACTION_META[...].verb. Falls back to gray
// for any action not present above (e.g. a newly added backend action).
export const VERB_COLOR = {
  create: { dot: "bg-green-500", ring: "ring-green-500/20", text: "text-green-700", bg: "bg-green-50" },
  update: { dot: "bg-blue-500", ring: "ring-blue-500/20", text: "text-blue-700", bg: "bg-blue-50" },
  delete: { dot: "bg-red-500", ring: "ring-red-500/20", text: "text-red-700", bg: "bg-red-50" },
  toggle: { dot: "bg-purple-500", ring: "ring-purple-500/20", text: "text-purple-700", bg: "bg-purple-50" },
  default: { dot: "bg-gray-400", ring: "ring-gray-400/20", text: "text-gray-600", bg: "bg-gray-50" },
};

// ── Table group color map ───────────────────────────────────────────────
export const AUDIT_LOG_GROUP = {
  Actor: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Action: { hex: "#7c3aed", bg: "bg-violet-50", text: "text-violet-600" },
  Details: { hex: "#0891b2", bg: "bg-cyan-50", text: "text-cyan-700" },
  Timestamp: { hex: "#d97706", bg: "bg-amber-50", text: "text-amber-600" },
};

// ── Filter pill defs (Table.jsx / NewTableConfig format) ────────────────
const entityIcon = (
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

const actionIcon = (
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

export const AUDIT_LOG_FILTERS = [
  {
    id: "entityType",
    name: "Entity Type",
    filterName: "entityType",
    icon: entityIcon,
    options: ENTITY_TYPE_OPTIONS,
  },
  {
    id: "action",
    name: "Action",
    filterName: "action",
    icon: actionIcon,
    options: ACTION_OPTIONS,
  },
];
