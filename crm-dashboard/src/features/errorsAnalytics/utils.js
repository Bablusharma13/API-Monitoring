// Small formatting helpers local to the Errors page — kept in-feature rather
// than added to the shared src/utils/helpers.js since they're specific to
// the alert feed / timeline widgets here.

export function timeAgo(dateLike) {
  if (!dateLike) return "—";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "just now";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// Alert lifecycle timestamp used for "most recent event" ordering — a
// resolved alert's most relevant moment is when it resolved, not when it
// first fired.
export function alertEventTime(alert) {
  return alert?.resolvedAt || alert?.acknowledgedAt || alert?.triggeredAt || alert?.createdAt;
}

export function alertTimelineIcon(alert) {
  if (alert?.status === "resolved") return "check";
  return alert?.severity === "critical" ? "error" : "warning";
}
