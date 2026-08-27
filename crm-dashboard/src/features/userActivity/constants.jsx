export const USER_ACTIVITY_GROUP = {
  Identity: {
    hex: "#7c3aed",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  Tenant: {
    hex: "#2563eb",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  Activity: {
    hex: "#16a34a",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  Performance: {
    hex: "#0891b2",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
};

// The backend only resolves these two window buckets (analytics.service.js
// WINDOW_MS) — anything else silently falls back to "7d".
export const USER_ACTIVITY_WINDOWS = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
];

export const TENANT_FILTER_ICON = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 21V8l9-5 9 5v13" />
    <path d="M9 21v-6h6v6" />
  </svg>
);
