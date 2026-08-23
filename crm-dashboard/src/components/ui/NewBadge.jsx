import React from "react";
const colorVariants = {
  green: {
    dot: "fill-green-500",
    ring: "ring-green-500",
    text: "text-green-700",
  },
  yellow: {
    dot: "fill-yellow-500",
    ring: "ring-yellow-500",
    text: "text-yellow-700",
  },
  red: { dot: "fill-red-500", ring: "ring-red-500", text: "text-red-700" },
  blue: { dot: "fill-blue-500", ring: "ring-blue-500", text: "text-blue-700" },
  indigo: {
    dot: "fill-indigo-500",
    ring: "ring-indigo-500",
    text: "text-indigo-700",
  },
  purple: {
    dot: "fill-purple-700",
    ring: "ring-purple-700",
    text: "text-purple-700",
  },
  pink: { dot: "fill-pink-500", ring: "ring-pink-500", text: "text-pink-700" },
  gray: { dot: "fill-gray-400", ring: "ring-gray-400", text: "text-gray-600" },
};
function getConfig(type, status) {
  if (status == null) return { label: "-", color: "gray" };
  const originalStatus = String(status);
  const s = originalStatus.toLowerCase();
  switch (type) {
    case "status":
      return (
        {
          open: { label: "Open", color: "yellow" },
          info: { label: "Info", color: "green" },
          warning: { label: "Warning", color: "yellow" },
          pending: { label: "Pending", color: "green" },
          active: { label: "Active", color: "green" },
          inactive: { label: "Inactive", color: "gray" },
          cancelled: { label: "Cancelled", color: "red" },
          error: { label: "Error", color: "red" },
          critical: { label: "Critical", color: "red" },
          fraud: { label: "Fraud", color: "purple" },
          incomplete: { label: "Incomplete", color: "gray" },
          complete: { label: "Complete", color: "green" },
          closed: { label: "Closed", color: "gray" },
          resolved: { label: "Resolved", color: "green" },
          ongoing: { label: "Ongoing", color: "red" },
          healthy: { label: "Healthy", color: "green" },
          down: { label: "Down", color: "red" },
          paused: { label: "Paused", color: "yellow" },
          "in progress": { label: "In Progress", color: "indigo" },
          "waiting on customer": {
            label: "Waiting on Customer",
            color: "yellow",
          },
          "client-reply": { label: "Client Reply", color: "blue" },
          "customer-reply": { label: "Customer Reply", color: "red" },
          answered: { label: "answered", color: "indigo" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "priority":
      return (
        {
          low: { label: "Low", color: "green" },
          medium: { label: "Medium", color: "yellow" },
          high: { label: "High", color: "red" },
          urgent: { label: "Urgent", color: "red" },
          unpaid: { label: "Unpaid", color: "yellow" },
          paid: { label: "Paid", color: "green" },
          cancelled: { label: "Cancelled", color: "red" },
          overdue: { label: "Overdue", color: "pink" },
          refunded: { label: "Refunded", color: "blue" },
          draft: { label: "Draft", color: "gray" },
          critical: { label: "Critical", color: "red" },
          "partially paid": { label: "Partially Paid", color: "indigo" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "payment":
      return (
        {
          pending: { label: "Pending", color: "yellow" },
          successful: { label: "Successful", color: "green" },
          accepted: { label: "Accepted", color: "green" },
          recurring: { label: "Recurring", color: "green" },
          refunded: { label: "Refunded", color: "blue" },
          reversed: { label: "Reversed", color: "blue" },
          failed: { label: "Failed", color: "red" },
          rejected: { label: "Rejected", color: "red" },
          warning: { label: "Warning", color: "red" },
          "one-time": { label: "One Time", color: "indigo" },
          stripe: { label: "Stripe", color: "purple" },
          "bank transfer": { label: "Bank Transfer", color: "pink" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "method":
      return (
        {
          get: { label: "GET", color: "green" },
          post: { label: "POST", color: "blue" },
          put: { label: "PUT", color: "yellow" },
          patch: { label: "PATCH", color: "indigo" },
          delete: { label: "DELETE", color: "red" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "type":
      return (
        {
          internal: { label: "Internal", color: "indigo" },
          external: { label: "External", color: "blue" },
          third_party: { label: "3rd Party", color: "purple" },
          public: { label: "Public", color: "green" },
          private: { label: "Private", color: "red" },
          partner: { label: "Partner", color: "yellow" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "mode":
      return (
        {
          live: { label: "Live", color: "green" },
          sandbox: { label: "Sandbox", color: "yellow" },
          staging: { label: "Staging", color: "indigo" },
          development: { label: "Development", color: "blue" },
          maintenance: { label: "Maintenance", color: "pink" },
          deprecated: { label: "Deprecated", color: "red" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "tech":
      return (
        {
          rest: { label: "REST", color: "blue" },
          graphql: { label: "GraphQL", color: "pink" },
          grpc: { label: "gRPC", color: "purple" },
          soap: { label: "SOAP", color: "yellow" },
          websocket: { label: "WebSocket", color: "indigo" },
          webhook: { label: "Webhook", color: "green" },
          webhook: { label: "Node.js", color: "green" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "quotation":
      return (
        {
          pending: { label: "Pending", color: "yellow" },
          sent: { label: "Sent", color: "blue" },
          accepted: { label: "Accepted", color: "green" },
          rejected: { label: "Rejected", color: "red" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "coupon":
    case "products":
      return (
        {
          active: { label: "Active", color: "green" },
          draft: { label: "Draft", color: "yellow" },
          expired: { label: "Expired", color: "red" },
          inactive: { label: "Inactive", color: "gray" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "notification":
      return (
        {
          sent: { label: "Sent", color: "green" },
          pending: { label: "Pending", color: "yellow" },
          failed: { label: "Failed", color: "red" },
          retrying: { label: "Retrying", color: "blue" },
          draft: { label: "Draft", color: "gray" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "Subscription":
      return (
        {
          active: { label: "Active", color: "green" },
          inactive: { label: "Inactive", color: "red" },
          cancelled: { label: "Cancelled", color: "yellow" },
          expired: { label: "Expired", color: "blue" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "RecurringInterval":
      return (
        {
          monthly: { label: "Monthly", color: "yellow" },
          quarterly: { label: "Quarterly", color: "yellow" },
          "semi-annually": { label: "Semi-Annually", color: "yellow" },
          annually: { label: "Annually", color: "blue" },
          "bi-annually": { label: "Bi-Annually", color: "red" },
          "tri-annually": { label: "Tri-Annually", color: "indigo" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "Boolean":
      return s === "true"
        ? { label: "Yes", color: "blue" }
        : { label: "No", color: "red" };
    case "BillingType":
      return (
        {
          1: { label: "One Time", color: "yellow" },
          2: { label: "Recurring", color: "yellow" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    case "plan":
      return (
        {
          Paid: { label: "Paid", color: "green" }, // #16a34a
          Trial: { label: "Trial", color: "yellow" }, // #d97706
          Free: { label: "Free", color: "gray" }, // #6b7280
          Partner: { label: "Partner", color: "purple" }, // #7c3aed
          Churned: { label: "Churned", color: "red" }, // #dc2626
          Prospect: { label: "Prospect", color: "blue" }, // #2563eb
          "partially paid": { label: "Partially Paid", color: "indigo" },
        }[s] ?? { label: originalStatus, color: "gray" }
      );
    default:
      return { label: originalStatus, color: "gray" };
  }
}
export const NewBadge = ({ type, status }) => {
  const { label, color } = getConfig(type, status);
  const v = colorVariants[color] || colorVariants.gray;
  return (
    <span
      className={`inline-flex items-center justify-center gap-x-1.5 rounded-md px-2 py-1 ${v.text} ${v.ring}`}
    >
      <svg viewBox="0 0 6 6" aria-hidden="true" className={`size-1.5 ${v.dot}`}>
        <circle r={3} cx={3} cy={3} />
      </svg>
      {label}
    </span>
  );
};
