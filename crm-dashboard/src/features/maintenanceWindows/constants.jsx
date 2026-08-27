// ── Scope ────────────────────────────────────────────────────────────────
export const SCOPE_TYPE_OPTIONS = [
  { value: "all", label: "All APIs" },
  { value: "category", label: "By Category" },
  { value: "api", label: "Specific APIs" },
];

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

// ── Window lifecycle status (derived — not stored on the document) ──────
export const WINDOW_STATUS_META = {
  upcoming: { label: "Upcoming", variant: "beta", dot: "#2563eb" },
  active: { label: "Active", variant: "warning", dot: "#d97706" },
  ended: { label: "Ended", variant: "default", dot: "#9ca3af" },
};

export const getWindowStatus = (window) => {
  if (!window?.startsAt || !window?.endsAt) return "ended";
  const now = Date.now();
  const starts = new Date(window.startsAt).getTime();
  const ends = new Date(window.endsAt).getTime();
  if (now < starts) return "upcoming";
  if (now > ends) return "ended";
  return "active";
};

// ── Table group color map ───────────────────────────────────────────────
export const MAINTENANCE_WINDOWS_GROUP = {
  Window: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Scope: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
  Metadata: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// ── Filter pill defs (Table.jsx / NewTableConfig format) ────────────────
const scopeIcon = (
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

export const MAINTENANCE_WINDOWS_FILTERS = [
  {
    id: "scope.type",
    name: "Scope Type",
    filterName: "scope.type",
    icon: scopeIcon,
    options: SCOPE_TYPE_OPTIONS,
  },
];
