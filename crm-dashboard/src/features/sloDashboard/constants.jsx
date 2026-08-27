// Fallback shown until the real targets arrive from GET /analytics/slo.
// Mirrors crm-dashboard-backend/src/config/sla.js SLO_TARGETS.
export const DEFAULT_SLO_TARGETS = {
  uptimePct: 99.9,
  latencyMs: 500,
  errorRatePct: 1,
};

export const SLO_GROUP = {
  Identity: {
    hex: "#2563eb",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  Compliance: {
    hex: "#7c3aed",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  Metrics: {
    hex: "#0891b2",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
};

export const SLO_STATUS_FILTER = {
  id: "status",
  name: "SLO Status",
  filterName: "status",
  icon: (
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
  ),
  options: [
    { value: "met", label: "Met" },
    { value: "risk", label: "At Risk" },
    { value: "breached", label: "Breached" },
  ],
};
