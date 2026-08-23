import { Drawer, DrawerSection } from "../../../components/ui/Drawer";
import { Badge } from "../../../components/ui/Badge";

const statusOrder = ["active", "investigating", "fix_applied", "resolved"];
const statusStepIndex = Math.max(0, statusOrder.indexOf(status));
const statusSteps = [
  { key: "active", label: "Active" },
  { key: "investigating", label: "Investigating" },
  { key: "fix_applied", label: "Fix Applied" },
  { key: "resolved", label: "Resolved" },
];
const statusMeta = {
  active: { label: "Active", variant: "active" },
  investigating: { label: "Investigating", variant: "warning" },
  fix_applied: { label: "Fix Applied", variant: "beta" },
  resolved: { label: "Resolved", variant: "active" },
  down: { label: "Down", variant: "down" },
  warning: { label: "Warning", variant: "warning" },
};
const severityMeta = {
  critical: { label: "Critical", variant: "down" },
  high: { label: "High", variant: "warning" },
  medium: { label: "Medium", variant: "beta" },
  low: { label: "Low", variant: "active" },
  warning: { label: "Warning", variant: "warning" },
};
const avatarBg = (name = "") => {
  const colors = ["#2563eb", "#16a34a", "#7c3aed", "#d97706", "#ea580c"];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
};
const initials = (name = "NA") =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "NA";

export const IncidentsDrawer = ({ selectedRow, setSelectedRow }) => {
  const status = selectedRow?.status;
  const statusInfo = statusMeta[status] || {
    label: status || "Unknown",
    variant: "default",
  };
  const severityInfo = severityMeta[selectedRow?.severity] || {
    label: selectedRow?.severity || "Low",
    variant: "default",
  };
  const drawerSubtitle = selectedRow ? (
    <div className="flex items-center gap-2">
      <Badge value={statusInfo.label} variant={statusInfo.variant} />
      <Badge value={severityInfo.label} variant={severityInfo.variant} />
    </div>
  ) : null;
  const timelineItems = [
    {
      title: "Incident Detected",
      time: selectedRow?.createdAt || "Now",
      note: selectedRow?.message || "Incident was captured by monitoring.",
    },
    {
      title: "Alert Sent",
      time: selectedRow?.updatedAt || "A moment ago",
      note: "Notification sent to incident channel and owner.",
    },
    {
      title: "Team Assigned",
      time: selectedRow?.updatedAt || "A moment ago",
      note: `${selectedRow?.owner || "Unassigned"} is currently handling this incident.`,
    },
    {
      title: "Fix Applied",
      time:
        selectedRow?.status === "resolved"
          ? selectedRow?.updatedAt || "Recently"
          : "Pending",
      note:
        selectedRow?.status === "resolved"
          ? "Fix deployed and validated."
          : "Waiting for mitigation confirmation.",
    },
    {
      title: "Resolved",
      time:
        selectedRow?.status === "resolved"
          ? selectedRow?.updatedAt || "Recently"
          : "Pending",
      note:
        selectedRow?.status === "resolved"
          ? "Service recovered and stable."
          : "Incident still in progress.",
    },
  ];
  return (
    <Drawer
      isOpen={!!selectedRow}
      onClose={() => setSelectedRow(null)}
      title={selectedRow?.id || "Incident Details"}
      subtitle={drawerSubtitle}
      size="lg"
    >
      {selectedRow && (
        <div className="space-y-0">
          <DrawerSection label="Status Flow">
            <div className="flex items-center gap-0 my-2">
              {statusSteps.map((step, i) => {
                const isDone = i < statusStepIndex;
                const isActive = i === statusStepIndex;
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div
                      className={`px-2.5 py-1 rounded-[5px] text-[11px] border whitespace-nowrap ${
                        isDone
                          ? "bg-green-50 border-green-200 text-green-700"
                          : isActive
                            ? "bg-red-50 border-red-200 text-red-700 font-medium"
                            : "bg-gray-50 border-gray-200 text-gray-500"
                      }`}
                    >
                      {step.label}
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className="flex-1 h-px bg-gray-200 min-w-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </DrawerSection>

          <DrawerSection label="Basic Information">
            <div className="drow">
              <span className="dkey">API Name</span>
              <span className="dval">{selectedRow.api.name || "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">Incident ID</span>
              <span className="dval">{selectedRow.id || "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">Issue Type</span>
              <span className="dval">{selectedRow.message || "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">Response Time</span>
              <span className="dval">{selectedRow.responseTime || "—"}</span>
            </div>
            <div className="drow border-0">
              <span className="dkey">Uptime</span>
              <span className="dval text-green-600">
                {selectedRow.uptime || "—"}
              </span>
            </div>
          </DrawerSection>

          <DrawerSection label="Impact">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-center">
                <div
                  className="text-[18px] text-red-600 font-normal"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {selectedRow.status === "resolved" ? "0 min" : "Live"}
                </div>
                <div className="txt-xs mt-0.5">Downtime</div>
              </div>
              <div className="px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <div
                  className="text-[18px] text-amber-600 font-normal"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {selectedRow.status === "resolved" ? "0" : "—"}
                </div>
                <div className="txt-xs mt-0.5">Failures</div>
              </div>
              <div className="px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div
                  className="text-[18px] text-blue-600 font-normal"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {selectedRow.owner ? "Team" : "—"}
                </div>
                <div className="txt-xs mt-0.5">Affected</div>
              </div>
            </div>
          </DrawerSection>

          <DrawerSection label="Incident Timeline">
            <div className="flex flex-col gap-0 py-1">
              {timelineItems.map((step, idx) => {
                const done = idx <= statusStepIndex;
                return (
                  <div
                    key={step.title}
                    className="flex items-start gap-3 py-2 relative"
                  >
                    {idx < timelineItems.length - 1 && (
                      <div className="absolute left-[10px] top-7 w-[2px] h-[calc(100%-8px)] bg-gray-200" />
                    )}
                    <div
                      className={`w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 mt-0.5 z-10 ${
                        done
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${done ? "bg-green-500" : "bg-gray-300"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] text-[#1c1f2e] font-medium">
                        {step.title}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {step.time}
                      </div>
                      <div className="text-[11.5px] text-gray-500 mt-1 leading-[1.45]">
                        {step.note}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DrawerSection>

          <DrawerSection label="Recent Error Logs">
            <div className="font-mono text-[11.5px]">
              <div className="flex items-baseline gap-2 py-1.5 border-b border-[#f3f5f9]">
                <span className="text-[#c2c8d4]">
                  {selectedRow.updatedAt || "now"}
                </span>
                <Badge value="Down" variant="down" />
                <span className="text-[#1c1f2e] truncate">
                  {selectedRow.message || "Incident error captured."}
                </span>
              </div>
              <div className="flex items-baseline gap-2 py-1.5 border-b border-[#f3f5f9]">
                <span className="text-[#c2c8d4]">
                  {selectedRow.updatedAt || "now"}
                </span>
                <Badge value="Warning" variant="warning" />
                <span className="text-[#1c1f2e] truncate">
                  Response time threshold reached:{" "}
                  {selectedRow.responseTime || "—"}.
                </span>
              </div>
              <div className="flex items-baseline gap-2 py-1.5">
                <span className="text-[#c2c8d4]">
                  {selectedRow.createdAt || "now"}
                </span>
                <Badge value="Beta" variant="beta" />
                <span className="text-[#1c1f2e] truncate">
                  Incident {selectedRow.id || ""} created for{" "}
                  {selectedRow.api.name || "API"}.
                </span>
              </div>
            </div>
          </DrawerSection>

          <DrawerSection label="Notes & Comments">
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 py-1.5">
                <div
                  className="w-6 h-6 rounded-full text-white text-[9px] font-semibold flex items-center justify-center shrink-0"
                  style={{ background: avatarBg(selectedRow.owner) }}
                >
                  {initials(selectedRow.owner)}
                </div>
                <div className="min-w-0">
                  <div className="text-[11.5px] text-gray-500">
                    {selectedRow.owner || "Unassigned"} · now
                  </div>
                  <div className="text-[12.5px] text-[#1c1f2e] mt-0.5 leading-[1.45]">
                    Monitoring this incident. Latest signal:{" "}
                    {selectedRow.message || "No additional details"}.
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  className="w-full border border-gray-200 rounded-md px-2.5 py-1.5 text-[12.5px] text-[#1c1f2e] outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)]"
                  placeholder="Add a comment…"
                  readOnly
                />
                <button type="button" className="btn btn-sm btn-primary">
                  Post
                </button>
              </div>
            </div>
          </DrawerSection>

          <DrawerSection label="Quick Actions">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button type="button" className="btn btn-sm">
                Restart Check
              </button>
              <button type="button" className="btn btn-sm">
                Send Alert
              </button>
              <button type="button" className="btn btn-sm">
                Escalate
              </button>
              <button type="button" className="btn btn-sm">
                Assign Owner
              </button>
              <button type="button" className="btn btn-sm btn-red">
                Disable API
              </button>
              <button type="button" className="btn btn-sm">
                Create Ticket
              </button>
            </div>
          </DrawerSection>
        </div>
      )}
    </Drawer>
  );
};
