export const CHECKS_GROUP = {
  Identity: {
    hex: "#2563eb",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  Result: {
    hex: "#7c3aed",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  Timing: {
    hex: "#0891b2",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
};

export const CHECKS_FILTERS = [
  {
    id: "status",
    name: "Status",
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
      { value: "ok", label: "OK" },
      { value: "warn", label: "Warn" },
      { value: "error", label: "Error" },
      { value: "timeout", label: "Timeout" },
    ],
  },
];
