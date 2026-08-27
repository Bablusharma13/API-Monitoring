export const CAPACITY_WARN_AT = 80; // % of monthly cap
export const CAPACITY_CRITICAL_AT = 100; // % of monthly cap (over quota)

export const capacityStatus = (usedPct) => {
  if (usedPct == null) return "unknown";
  if (usedPct >= CAPACITY_CRITICAL_AT) return "critical";
  if (usedPct >= CAPACITY_WARN_AT) return "warning";
  return "ok";
};

export const SATURATION_GROUP = {
  Identity: {
    hex: "#2563eb",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  Capacity: {
    hex: "#d97706",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  Status: {
    hex: "#6b7280",
    bg: "bg-gray-50",
    text: "text-gray-500",
  },
};

export const SATURATION_FILTERS = [
  {
    id: "plan",
    name: "Plan",
    filterName: "plan",
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2 2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    options: [
      { value: "starter", label: "Starter" },
      { value: "business", label: "Business" },
      { value: "enterprise", label: "Enterprise" },
    ],
  },
  {
    id: "status",
    name: "Capacity Status",
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
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    options: [
      { value: "ok", label: "OK" },
      { value: "warning", label: "Warning" },
      { value: "critical", label: "Over cap" },
    ],
  },
];
