export const LOGS_GROUP = {
  Timestamp: {
    hex: "#d97706",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
  Request: {
    hex: "#2563eb",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  Response: {
    hex: "#0891b2",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
  },
  Details: {
    hex: "#7c3aed",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
};

export const LOGS_FILTERS = [
  {
    id: "source",
    name: "Source",
    filterName: "source",
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="8" width="4" height="8" rx="1" />
        <rect x="10" y="5" width="4" height="14" rx="1" />
        <rect x="18" y="10" width="4" height="6" rx="1" />
      </svg>
    ),
    options: [
      { value: "check", label: "Check" },
      { value: "request", label: "Request" },
    ],
  },
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
  {
    id: "region",
    name: "Region",
    filterName: "region",
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
      { value: "default", label: "Default" },
      { value: "us-east", label: "US East" },
      { value: "us-west", label: "US West" },
      { value: "eu-west", label: "EU West" },
      { value: "ap-south", label: "AP South" },
    ],
  },
];

// Quick time-window control wired to the real filters[dateFrom] param —
// values are ms-durations (as strings, since <select> values are strings).
export const LOG_RANGE_OPTIONS = [
  { value: "all", label: "All time" },
  { value: "900000", label: "Last 15 min" },
  { value: "3600000", label: "Last 1 hour" },
  { value: "21600000", label: "Last 6 hours" },
  { value: "86400000", label: "Last 24 hours" },
  { value: "604800000", label: "Last 7 days" },
  { value: "2592000000", label: "Last 30 days" },
];
