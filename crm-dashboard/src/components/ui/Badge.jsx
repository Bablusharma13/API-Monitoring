import React from "react";

const colorVariants = {
  green: { dot: "bg-green-500", ring: "ring-green-500/20", text: "text-green-700", bg: "bg-green-50" },
  yellow: { dot: "bg-yellow-500", ring: "ring-yellow-500/20", text: "text-yellow-700", bg: "bg-yellow-50" },
  red: { dot: "bg-red-500", ring: "ring-red-500/20", text: "text-red-700", bg: "bg-red-50" },
  blue: { dot: "bg-blue-500", ring: "ring-blue-500/20", text: "text-blue-700", bg: "bg-blue-50" },
  indigo: { dot: "bg-indigo-500", ring: "ring-indigo-500/20", text: "text-indigo-700", bg: "bg-indigo-50" },
  purple: { dot: "bg-purple-700", ring: "ring-purple-700/20", text: "text-purple-700", bg: "bg-purple-50" },
  pink: { dot: "bg-pink-500", ring: "ring-pink-500/20", text: "text-pink-700", bg: "bg-pink-50" },
  gray: { dot: "bg-gray-400", ring: "ring-gray-400/20", text: "text-gray-600", bg: "bg-gray-50" },
};

function getConfig(type, status) {
  const s = String(status);
  switch (type) {
    case "order":
      return ({ pending: { label: "Pending", color: "yellow" }, active: { label: "Active", color: "green" }, cancelled: { label: "Cancelled", color: "red" }, fraud: { label: "Fraud", color: "purple" }, incomplete: { label: "Incomplete", color: "gray" }, complete: { label: "Complete", color: "blue" } }[s] ?? { label: s, color: "gray" });
    case "invoice":
      return ({ unpaid: { label: "Unpaid", color: "yellow" }, paid: { label: "Paid", color: "green" }, cancelled: { label: "Cancelled", color: "red" }, overdue: { label: "Overdue", color: "pink" }, refunded: { label: "Refunded", color: "blue" }, draft: { label: "Draft", color: "gray" }, "partially paid": { label: "Partially Paid", color: "indigo" } }[s.toLowerCase()] ?? { label: s, color: "gray" });
    case "payment":
      return ({ pending: { label: "Pending", color: "yellow" }, successful: { label: "Successful", color: "green" }, accepted: { label: "Accepted", color: "green" }, recurring: { label: "Recurring", color: "green" }, refunded: { label: "Refunded", color: "blue" }, reversed: { label: "Reversed", color: "blue" }, failed: { label: "Failed", color: "red" }, rejected: { label: "Rejected", color: "red" }, warning: { label: "Warning", color: "red" }, "one-time": { label: "One Time", color: "indigo" }, stripe: { label: "Stripe", color: "purple" }, "bank transfer": { label: "Bank Transfer", color: "pink" }, active: { label: "Active", color: "green" }, down: { label: "Down", color: "red" }, deprecated: { label: "Deprecated", color: "gray" }, beta: { label: "Beta", color: "blue" }, get: { label: "GET", color: "green" }, post: { label: "POST", color: "blue" }, put: { label: "PUT", color: "yellow" }, delete: { label: "DELETE", color: "red" }, live: { label: "Live", color: "yellow" }, test: { label: "Test", color: "indigo" }, sandbox: { label: "Sandbox", color: "gray" } }[s.toLowerCase()] ?? { label: s, color: "gray" });
    case "quotation":
      return ({ pending: { label: "Pending", color: "yellow" }, sent: { label: "Sent", color: "blue" }, accepted: { label: "Accepted", color: "green" }, rejected: { label: "Rejected", color: "red" } }[s.toLowerCase()] ?? { label: s, color: "gray" });
    case "coupon":
    case "products":
      return ({ active: { label: "Active", color: "green" }, draft: { label: "Draft", color: "yellow" }, expired: { label: "Expired", color: "red" }, inactive: { label: "Inactive", color: "gray" } }[s.toLowerCase()] ?? { label: s, color: "gray" });
    case "notification":
      return ({ sent: { label: "Sent", color: "green" }, pending: { label: "Pending", color: "yellow" }, failed: { label: "Failed", color: "red" }, retrying: { label: "Retrying", color: "blue" }, draft: { label: "Draft", color: "gray" } }[s.toLowerCase()] ?? { label: s, color: "gray" });
    case "Subscription":
      return ({ active: { label: "Active", color: "green" }, inactive: { label: "Inactive", color: "red" }, cancelled: { label: "Cancelled", color: "yellow" }, expired: { label: "Expired", color: "blue" } }[s.toLowerCase()] ?? { label: s, color: "gray" });
    case "RecurringInterval":
      return ({ monthly: { label: "Monthly", color: "yellow" }, quarterly: { label: "Quarterly", color: "yellow" }, "semi-annually": { label: "Semi-Annually", color: "yellow" }, annually: { label: "Annually", color: "blue" }, "bi-annually": { label: "Bi-Annually", color: "red" }, "tri-annually": { label: "Tri-Annually", color: "indigo" } }[s.toLowerCase()] ?? { label: s, color: "gray" });
    case "Boolean":
      return s === "true" ? { label: "Yes", color: "blue" } : { label: "No", color: "red" };
    case "BillingType":
      return ({ 1: { label: "One Time", color: "yellow" }, 2: { label: "Recurring", color: "yellow" } }[status] ?? { label: s, color: "gray" });
    default:
      return { label: s, color: "gray" };
  }
}

function legacyToType(value, variant) {
  const normalized = String(variant ?? value ?? "").toLowerCase();
  return { type: "payment", status: normalized || "unknown" };
}

export function Badge({ value, variant, type, status }) {
  const sourceType = type ?? legacyToType(value, variant).type;
  const sourceStatus = status ?? legacyToType(value, variant).status;
  const { label, color } = getConfig(sourceType, sourceStatus);
  const v = colorVariants[color] ?? colorVariants.gray;

  return (
    <span
      className={`inline-flex items-center justify-center gap-x-1.5 rounded-md px-2 py-1 text-[11px] ring-1 ring-inset ${v.bg} ${v.text} ${v.ring}`}
    >
      <span className={`size-1.5 rounded-full ${v.dot}`} />
      {value ?? label}
    </span>
  );
}

export default React.memo(Badge);
