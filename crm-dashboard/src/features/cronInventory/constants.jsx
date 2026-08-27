import { ENV_OPTIONS, CATEGORY_OPTIONS } from "./hooks/usecronInventory.js";

export const CRON_INVENTORY_GROUP = {
  Identity: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Schedule: { hex: "#7c3aed", bg: "bg-violet-50", text: "text-violet-600" },
  Health: { hex: "#0891b2", bg: "bg-cyan-50", text: "text-cyan-600" },
};

// env / category are freeform strings on CronJob (no backend enum) — these
// map to the real `filters[env]` / `filters[category]` query params the
// cron-jobs listing endpoint already supports.
export const CRON_INVENTORY_FILTERS = [
  {
    id: "env",
    name: "Environment",
    filterName: "env",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 3v4M8 3v4M2 11h20" />
      </svg>
    ),
    options: ENV_OPTIONS.map((e) => ({ value: e, label: e })),
  },
  {
    id: "category",
    name: "Category",
    filterName: "category",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
      </svg>
    ),
    options: CATEGORY_OPTIONS.map((c) => ({ value: c, label: c })),
  },
];
