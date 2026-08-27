// Backend only resolves "24h" (5m buckets) and "7d" (60m buckets) windows —
// see crm-dashboard-backend/src/modules/analytics/analytics.service.js
// (resolveWindow / WINDOW_MS). Any other value silently falls back to 24h
// server-side, so we only ever offer these two.
export const TRAFFIC_WINDOW_OPTIONS = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
];

export const TRAFFIC_WINDOW_BUCKET_MINUTES = {
  "24h": 5,
  "7d": 60,
};

export const TRAFFIC_GROUP = {
  Method: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Volume: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Performance: { hex: "#0891b2", bg: "bg-cyan-50", text: "text-cyan-600" },
  Traffic: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
};

export const METHOD_COLORS = {
  GET: "#2563eb",
  POST: "#16a34a",
  PUT: "#d97706",
  PATCH: "#7c3aed",
  DELETE: "#dc2626",
};
export const METHOD_COLOR_FALLBACK = "#6b7280";

export const METHOD_BADGE_STYLE = {
  GET: { bg: "bg-blue-50", text: "text-blue-700" },
  POST: { bg: "bg-green-50", text: "text-green-700" },
  PUT: { bg: "bg-amber-50", text: "text-amber-700" },
  PATCH: { bg: "bg-purple-50", text: "text-purple-700" },
  DELETE: { bg: "bg-red-50", text: "text-red-700" },
};
export const METHOD_BADGE_FALLBACK = { bg: "bg-gray-100", text: "text-gray-600" };

// Cycled by index for the "Traffic Share by Tenant" widget — tenants are
// dynamic (multi-tenant SaaS customers) so there's no fixed color map.
export const TENANT_COLOR_PALETTE = [
  "#2563eb",
  "#7c3aed",
  "#16a34a",
  "#0891b2",
  "#ea580c",
  "#d97706",
  "#db2777",
  "#4f46e5",
  "#059669",
  "#dc2626",
];

// Mongo $dayOfWeek: 1=Sunday .. 7=Saturday. Display order matches the
// original Mon..Sun layout.
export const HEATMAP_DAY_ORDER = [2, 3, 4, 5, 6, 7, 1];
export const HEATMAP_DAY_LABEL = {
  1: "Sun",
  2: "Mon",
  3: "Tue",
  4: "Wed",
  5: "Thu",
  6: "Fri",
  7: "Sat",
};

export const HEATMAP_COLOR_SCALE = [
  "#e0f2fe",
  "#7dd3fc",
  "#38bdf8",
  "#0ea5e9",
  "#0284c7",
  "#2563eb",
];
