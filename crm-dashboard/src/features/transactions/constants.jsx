// ── HTTP method ──────────────────────────────────────────────────────────
export const METHOD_META = {
  GET: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  POST: { color: "#2563eb", bg: "#eff4ff", border: "#c7d9fb" },
  PUT: { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  PATCH: { color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
  DELETE: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

export const METHOD_OPTIONS = ["GET", "POST", "PUT", "PATCH", "DELETE"].map(
  (m) => ({ value: m, label: m }),
);

// ── Step assertions ──────────────────────────────────────────────────────
export const ASSERTION_OPERATOR_OPTIONS = [
  { value: "equals", label: "Equals" },
  { value: "exists", label: "Exists" },
  { value: "contains", label: "Contains" },
  { value: "gt", label: "Greater than" },
  { value: "lt", label: "Less than" },
];

// ── Run frequency (matches Transaction.frequency — a raw cron pattern) ────
export const FREQUENCY_OPTIONS = [
  { value: "*/1 * * * *", label: "Every 1 minute" },
  { value: "*/5 * * * *", label: "Every 5 minutes" },
  { value: "*/15 * * * *", label: "Every 15 minutes" },
  { value: "*/30 * * * *", label: "Every 30 minutes" },
  { value: "0 * * * *", label: "Hourly" },
  { value: "0 */6 * * *", label: "Every 6 hours" },
  { value: "0 0 * * *", label: "Daily" },
];

// ── stats.lastRunStatus — real Transaction.stats enum: "success" | "failed" ──
export const LAST_RUN_STATUS_META = {
  success: { label: "Success", variant: "active" },
  failed: { label: "Failed", variant: "down" },
};

// ── Table group color map ──────────────────────────────────────────────────
export const TRANSACTIONS_GROUP = {
  Identity: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Config: { hex: "#7c3aed", bg: "bg-violet-50", text: "text-violet-600" },
  Notifications: {
    hex: "#0891b2",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
  },
  Health: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Controls: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// ── Filter pill defs (Table.jsx / NewTableConfig format) ──────────────────
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

// Only "enabled" is wired here — it's the one field the transactions listing
// endpoint actually accepts as `filters[enabled]` server-side.
export const TRANSACTIONS_FILTERS = [
  {
    id: "enabled",
    name: "Status",
    filterName: "enabled",
    icon: powerIcon,
    options: [
      { value: "true", label: "Enabled" },
      { value: "false", label: "Disabled" },
    ],
  },
];
