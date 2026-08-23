export const Categories_GROUP = {
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
};

export const Categories_FILTERS = [
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
      { value: "active", label: "Active" },
      { value: "down", label: "Down" },
      { value: "warning", label: "Warning" },
      { value: "deprecated", label: "Deprecated" },
      { value: "beta", label: "Beta" },
    ],
  },
  {
    id: "method",
    name: "Method",
    filterName: "method",
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    options: [
      { value: "GET", label: "GET" },
      { value: "POST", label: "POST" },
      { value: "PUT", label: "PUT" },
      { value: "DELETE", label: "DELETE" },
    ],
  },
  {
    id: "type",
    name: "Type",
    filterName: "type",
    icon: (
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
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    options: [
      { value: "Public", label: "Public" },
      { value: "Private", label: "Private" },
      { value: "Internal", label: "Internal" },
      { value: "External", label: "External" },
    ],
  },
  {
    id: "mode",
    name: "Mode",
    filterName: "mode",
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
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    options: [
      { value: "Live", label: "Live" },
      { value: "Test", label: "Test" },
    ],
  },
  {
    id: "tech",
    name: "Tech",
    filterName: "tech",
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    options: [
      { value: "Laravel", label: "Laravel" },
      { value: "Node.js", label: "Node.js" },
      { value: "Python", label: "Python" },
      { value: "Go", label: "Go" },
      { value: "Java", label: "Java" },
    ],
  },
];

