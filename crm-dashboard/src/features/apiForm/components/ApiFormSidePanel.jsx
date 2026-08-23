import React from "react";

// ── Icon set for quick actions ────────────────────────────────────────────────
const Icons = {
  clone: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  disable: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
  logs: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  incidents: (
    <svg
      width="13"
      height="13"
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
  refresh: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  play: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  delete: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  send: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  curl: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
};

// ── Static config per mode ────────────────────────────────────────────────────
const SIDE_PANEL_CONFIG = {
  add: {
    quickActions: [
      { label: "Clone API", icon: Icons.clone },
      { label: "Disable API", icon: Icons.disable },
      { label: "View Logs", icon: Icons.logs },
      { label: "View Incidents", icon: Icons.incidents },
      { label: "Run Manual Check", icon: Icons.refresh },
      { label: "Test API Now", icon: Icons.play },
    ],
    statusRows: [
      { key: "Status", value: "Draft", badge: "gray" },
      { key: "Uptime (30d)", value: "N/A", mono: true, color: "#6b7280" },
      { key: "Avg Response", value: "N/A", mono: true, color: "#6b7280" },
      { key: "Risk Score", value: "—", mono: true, color: "#6b7280" },
      { key: "Incidents", value: "0", mono: true, color: "#1c1f2e" },
    ],
    changeHistory: [
      {
        initials: "AM",
        color: "#2563eb",
        user: "Alex Morgan",
        msg: "Created API draft",
        time: "Today 14:20",
      },
      {
        initials: "SR",
        color: "#16a34a",
        user: "Sara Rodriguez",
        msg: "Added monitoring defaults",
        time: "Today 14:12",
      },
      {
        initials: "JL",
        color: "#7c3aed",
        user: "James Lee",
        msg: "Attached auth policy template",
        time: "Today 13:58",
      },
    ],
  },
  edit: {
    quickActions: [
      { label: "Clone API", icon: Icons.clone },
      { label: "Disable API", icon: Icons.disable },
      { label: "View Logs", icon: Icons.logs },
      { label: "View Incidents", icon: Icons.incidents },
      { label: "Run Manual Check", icon: Icons.refresh },
      { label: "Test API Now", icon: Icons.play },
    ],
    statusRows: [
      { key: "Status", value: "Down", badge: "red" },
      { key: "Uptime (30d)", value: "94.2%", mono: true, color: "#d97706" },
      { key: "Avg Response", value: "Down", mono: true, color: "#dc2626" },
      { key: "Risk Score", value: "88", mono: true, color: "#dc2626" },
      { key: "Incidents", value: "12", mono: true, color: "#1c1f2e" },
    ],
    changeHistory: [
      {
        initials: "AM",
        color: "#2563eb",
        user: "Alex Morgan",
        msg: "Updated check frequency from 5 min → 1 min",
        time: "Today 13:40",
      },
      {
        initials: "SR",
        color: "#16a34a",
        user: "Sara Rodriguez",
        msg: "Rotated JWT token",
        time: "Today 10:12",
      },
      {
        initials: "JL",
        color: "#7c3aed",
        user: "James Lee",
        msg: "Added Slack alert channel",
        time: "Yesterday 16:55",
      },
      {
        initials: "MC",
        color: "#d97706",
        user: "Mike Chen",
        msg: "Updated failure threshold to 3",
        time: "2 days ago",
      },
    ],
    dangerAction: "Delete API",
  },
  test: {
    quickActions: [
      { label: "Send Request", icon: Icons.send },
      { label: "Copy cURL", icon: Icons.curl },
      { label: "Copy Postman", icon: Icons.clone },
      { label: "View Logs", icon: Icons.logs },
    ],
    statusRows: [
      { key: "Method", value: "POST", mono: true, color: "#2563eb" },
      { key: "Expected", value: "200 / <1000ms", mono: true, color: "#1c1f2e" },
      {
        key: "Last Result",
        value: "503 Service Unavailable",
        mono: true,
        color: "#dc2626",
      },
      { key: "Retry", value: "30 sec", mono: true, color: "#6b7280" },
    ],
    changeHistory: [
      {
        initials: "SY",
        color: "#2563eb",
        user: "System",
        msg: "Prepared test request body",
        time: "now",
      },
      {
        initials: "SY",
        color: "#6b7280",
        user: "System",
        msg: "Awaiting test execution",
        time: "now",
      },
    ],
  },
};

// ── Badge variants ────────────────────────────────────────────────────────────
const BADGE = {
  red: "bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]",
  green: "bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]",
  amber: "bg-[#fffbeb] text-[#d97706] border border-[#fde68a]",
  blue: "bg-[#eff4ff] text-[#2563eb] border border-[#c7d9fb]",
  gray: "bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]",
};

const StatusDot = ({ badge }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2 py-[2px] rounded-full text-[11.5px] leading-none ${BADGE[badge] ?? BADGE.gray}`}
  >
    <span
      className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${badge === "red" ? "bg-[#dc2626]" : badge === "green" ? "bg-[#16a34a]" : "bg-[#9aa2b2]"}`}
    />
    {badge === "red" ? "Down" : badge === "green" ? "Up" : "Draft"}
  </span>
);

// ── Component ─────────────────────────────────────────────────────────────────
const ApiFormSidePanel = ({ mode = "edit" }) => {
  const panel = SIDE_PANEL_CONFIG[mode] || SIDE_PANEL_CONFIG.edit;

  return (
    <div className="w-[248px] shrink-0 border-l border-[#e9ebf0] bg-white sticky top-0 max-h-[calc(100vh-120px)] overflow-y-auto self-start">
      {/* ── Quick Actions ── */}
      <div className="p-4 border-b border-[#e9ebf0]">
        <div className="text-[11px] tracking-[0.08em] uppercase text-[#6b7280] mb-2.5">
          Quick Actions -CS-
        </div>
        <div className="flex flex-col gap-[3px]">
          {panel.quickActions.map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-[7px] text-[12.5px] text-[#1c1f2e] border border-transparent
                transition-all duration-100 cursor-pointer bg-transparent text-left w-full
                hover:bg-[#eff4ff] hover:text-[#2563eb] hover:border-[#c7d9fb]
                [&>svg]:opacity-55 hover:[&>svg]:opacity-100"
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Current Status ── */}
      <div className="p-4 border-b border-[#e9ebf0]">
        <div className="text-[11px] tracking-[0.08em] uppercase text-[#6b7280] mb-3">
          Current Status
        </div>
        <div className="flex flex-col gap-0">
          {panel.statusRows.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between py-[7px] border-b border-[#f3f5f9] last:border-0 gap-2"
            >
              <span className="text-[12px] text-[#6b7280] shrink-0">
                {row.key}
              </span>
              {row.badge ? (
                <StatusDot badge={row.badge} />
              ) : (
                <span
                  className="text-[12px] font-mono text-right"
                  style={{ color: row.color ?? "#1c1f2e" }}
                >
                  {row.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Change History ── */}
      <div className="p-4 border-b border-[#e9ebf0]">
        <div className="text-[11px] tracking-[0.08em] uppercase text-[#6b7280] mb-3">
          Change History
        </div>
        <div className="flex flex-col gap-0">
          {panel.changeHistory.map((item, i) => (
            <div
              key={`${item.user}-${item.time}-${i}`}
              className="flex items-start gap-2.5 py-2 border-b border-[#f3f5f9] last:border-0"
            >
              {/* Initials avatar */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-semibold text-white shrink-0 mt-[1px]"
                style={{ backgroundColor: item.color }}
              >
                {item.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-[#1c1f2e] font-medium leading-tight">
                  {item.user}
                </div>
                <div className="text-[11.5px] text-[#6b7280] mt-[2px] leading-snug">
                  {item.msg}
                </div>
                <div className="text-[10.5px] text-[#c2c8d4] mt-[3px]">
                  {item.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Danger Zone ── */}
      {panel.dangerAction && (
        <div className="p-4">
          <div className="text-[11px] tracking-[0.08em] uppercase text-[#dc2626] mb-2.5">
            Danger Zone
          </div>
          <button
            type="button"
            className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-[7px] text-[12.5px] text-[#dc2626] border border-transparent
              transition-all duration-100 cursor-pointer bg-transparent text-left w-full
              hover:bg-[#fef2f2] hover:border-[#fecaca]
              [&>svg]:opacity-70 hover:[&>svg]:opacity-100"
          >
            {Icons.delete}
            {panel.dangerAction}
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiFormSidePanel;
