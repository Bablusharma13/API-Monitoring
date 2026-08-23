export const INCIDENTS_GROUP = {
  Identity: {
    hex: "#2563eb",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  Classification: {
    hex: "#7c3aed",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  Monitoring: {
    hex: "#0891b2",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
  Ownership: {
    hex: "#f97316",
    bg: "bg-orange-50",
    text: "text-orange-500",
  },
  Security: {
    hex: "#10b981",
    bg: "bg-emerald-50",
    text: "text-emerald-500",
  },
  Metrics: {
    hex: "#f97316",
    bg: "bg-orange-50",
    text: "text-orange-500",
  },
  Details: {
    hex: "#10b981",
    bg: "bg-emerald-50",
    text: "text-emerald-500",
  },
};

export const INCIDENTS_FILTERS = [
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
      { value: "ongoing", label: "Ongoing" },
      { value: "in_progress", label: "In Progress" },
      { value: "resolved", label: "Resolved" },
      { value: "closed", label: "Closed" },
    ],
  },
  {
    id: "severity",
    name: "Severity",
    filterName: "severity",
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    options: [
      { value: "critical", label: "Critical" },
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
    ],
  },
];
