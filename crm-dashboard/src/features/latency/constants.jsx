// Fixed SLO threshold used across the Latency feature — matches the
// convention already established in the (former) mock page: p95 < 600ms.
export const SLO_THRESHOLD_MS = 600;

// Column group colors for the "Slowest Endpoints" table.
export const LATENCY_ENDPOINT_GROUP = {
  Endpoint: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Latency: { hex: "#d97706", bg: "bg-amber-50", text: "text-amber-600" },
  Traffic: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Status: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// Deterministic per-tenant color, same approach used on TenantOverview /
// RequestLog / GlobalDashboard — hash the tenant id into a fixed palette so
// the same tenant always renders with the same swatch across pages.
const TENANT_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#16a34a",
  "#0891b2",
  "#ea580c",
  "#d97706",
  "#4f46e5",
  "#dc2626",
  "#059669",
  "#db2777",
  "#f59e0b",
  "#6366f1",
  "#14b8a6",
  "#8b5cf6",
  "#10b981",
  "#f97316",
];

function strHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++)
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function tenantColor(id) {
  return TENANT_COLORS[strHash(String(id)) % TENANT_COLORS.length];
}
