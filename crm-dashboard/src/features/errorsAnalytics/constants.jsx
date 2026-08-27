// Same backend window support as traffic — only "24h" and "7d" resolve
// server-side (see analytics.service.js resolveWindow / WINDOW_MS).
export const ERRORS_WINDOW_OPTIONS = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
];

export const ERROR_TENANT_GROUP = {
  Tenant: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Errors: { hex: "#dc2626", bg: "bg-red-50", text: "text-red-600" },
};

// error breakdown "code" values come from the backend $switch: literal HTTP
// codes for the common ones, else a bucketed "4xx" / "5xx" / "other".
export const ERROR_CODE_COLORS = {
  "404": "#6b7280",
  "429": "#4f46e5",
  "500": "#dc2626",
  "502": "#ea580c",
  "503": "#ea580c",
  "504": "#ea580c",
  "4xx": "#d97706",
  "5xx": "#dc2626",
  other: "#9ca3af",
};
export const ERROR_CODE_COLOR_FALLBACK = "#9ca3af";

export const ERROR_CODE_PALETTE = [
  "#6b7280",
  "#d97706",
  "#4f46e5",
  "#dc2626",
  "#ea580c",
  "#0891b2",
  "#7c3aed",
];

// Alert severities per CRM_Alert schema (alert.model.js): critical|warning|info.
export const ALERT_SEVERITY_META = {
  critical: { label: "Critical", badgeVariant: "down", color: "#dc2626", bg: "bg-red-50" },
  warning: { label: "Warning", badgeVariant: "warning", color: "#d97706", bg: "bg-amber-50" },
  info: { label: "Info", badgeVariant: "beta", color: "#2563eb", bg: "bg-blue-50" },
};
export const ALERT_SEVERITY_FALLBACK = {
  label: "Unknown",
  badgeVariant: "beta",
  color: "#6b7280",
  bg: "bg-gray-50",
};
