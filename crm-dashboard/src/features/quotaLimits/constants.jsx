export const QUOTA_GROUP = {
  Tenant: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Quota: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Status: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// Fallback display label only — shown when a tenant has no monthCap set on
// its own quota config. Never used to compute usedPct or any real number.
export const PLAN_CAPS = {
  starter: "~500K calls/mo (plan default)",
  pro: "~3M calls/mo (plan default)",
  enterprise: "~10M calls/mo (plan default)",
};

export const planCapLabel = (plan) =>
  PLAN_CAPS[String(plan || "").toLowerCase()] || "Custom limit";

// Derived purely from the real usedPct returned by the API — not fabricated.
export const quotaStatus = (usedPct) => {
  if (usedPct == null) return "unknown";
  if (usedPct >= 95) return "over";
  if (usedPct >= 80) return "warn";
  return "ok";
};

export const QUOTA_STATUS_META = {
  over: { label: "Over", variant: "down" },
  warn: { label: "Near limit", variant: "warning" },
  ok: { label: "OK", variant: "active" },
  unknown: { label: "Unknown", variant: "default" },
};

export const PLAN_META = {
  Enterprise: { variant: "category" },
  Pro: { variant: "beta" },
  Starter: { variant: "default" },
};
