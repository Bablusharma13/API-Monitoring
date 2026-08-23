import Badge from "../../../components/ui/Badge";
import { Drawer, DrawerSection } from "../../../components/ui/Drawer";

export const AllApisDrawer = ({ selectedRow, setSelectedRow }) => {
  const statusValue = selectedRow?.status?.current || selectedRow?.status;
  const uptimeValue = selectedRow?.stats?.uptime30d ?? 98.7;
  const uptimeBlocks = Array.from({ length: 30 }, (_, idx) => {
    if (statusValue === "down" && idx >= 28) return "#dc2626";
    if (statusValue === "warning" && (idx === 25 || idx === 28))
      return "#d97706";
    return "#16a34a";
  });
  const riskScore = selectedRow?.stats?.riskScore ?? 0;
  const riskColor =
    riskScore >= 70 ? "#dc2626" : riskScore >= 40 ? "#d97706" : "#16a34a";
  const drawerSubtitle = selectedRow ? (
    <div className="flex items-center gap-2">
      <Badge value={statusValue || "Unknown"} />
      <Badge value={selectedRow?.request?.method || "GET"} />
      <Badge value={selectedRow?.mode || "Live"} />
    </div>
  ) : null;

  return (
    <Drawer
      isOpen={!!selectedRow}
      onClose={() => setSelectedRow(null)}
      title={selectedRow?.name || "API Details"}
      subtitle={drawerSubtitle}
      size="lg"
    >
      {selectedRow && (
        <div className="space-y-0">
          <DrawerSection label="30-Day Uptime">
            <div className="flex gap-[1.5px] h-3 items-stretch">
              {uptimeBlocks.map((color, idx) => (
                <div
                  key={idx}
                  className="flex-1 rounded-[1.5px]"
                  style={{ background: color }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="txt-xs">30d ago</span>
              <span
                className="txt-xs font-mono"
                style={{
                  color:
                    uptimeValue >= 99
                      ? "#16a34a"
                      : uptimeValue >= 97
                        ? "#d97706"
                        : "#dc2626",
                }}
              >
                {uptimeValue}%
              </span>
              <span className="txt-xs">Today</span>
            </div>
          </DrawerSection>

          <DrawerSection label="API Info">
            <div className="drow">
              <span className="dkey">URL</span>
              <span className="dval text-[11px] text-[#6b7280] break-all">
                {selectedRow.request?.url || "—"}
              </span>
            </div>
            <div className="drow">
              <span className="dkey">Method</span>
              <span className="dval">
                <Badge value={selectedRow.request?.method || "GET"} />
              </span>
            </div>
            <div className="drow">
              <span className="dkey">Type</span>
              <span className="dval">{selectedRow.type || "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">Mode</span>
              <span className="dval">{selectedRow.mode || "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">Tech</span>
              <span className="dval">{selectedRow.tech || "—"}</span>
            </div>
            <div className="drow border-0">
              <span className="dkey">Version</span>
              <span className="dval">{selectedRow.version || "—"}</span>
            </div>
          </DrawerSection>

          <DrawerSection label="Basic Information">
            <div className="drow">
              <span className="dkey">API Name</span>
              <span className="dval">{selectedRow.name || "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">API ID</span>
              <span className="dval">{selectedRow.apiId || "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">Endpoint URL</span>
              <span className="dval">{selectedRow.request?.url || "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">Owner</span>
              <span className="dval">{selectedRow.owner.name || "—"}</span>
            </div>
            <div className="drow border-0">
              <span className="dkey">Category</span>
              <span className="dval">
                <Badge
                  value={selectedRow.category.name || "—"}
                  variant="category"
                />
              </span>
            </div>
          </DrawerSection>

          <DrawerSection label="Monitoring">
            <div className="drow">
              <span className="dkey">Uptime (30d)</span>
              <span className="dval">
                {selectedRow.stats?.uptime30d != null
                  ? `${selectedRow.stats.uptime30d}%`
                  : "—"}
              </span>
            </div>
            <div className="drow">
              <span className="dkey">Avg Response</span>
              <span className="dval">
                {selectedRow.stats?.avgResponse30d != null
                  ? `${selectedRow.stats.avgResponse30d}ms`
                  : "—"}
              </span>
            </div>
            <div className="drow">
              <span className="dkey">Incidents</span>
              <span className="dval">
                {selectedRow.stats?.totalIncidents ?? "—"}
              </span>
            </div>
            <div className="drow">
              <span className="dkey">Last Checked</span>
              <span className="dval">
                {selectedRow.monitoring?.lastChecked || "—"}
              </span>
            </div>
            <div className="drow border-0">
              <span className="dkey">Frequency</span>
              <span className="dval">
                {selectedRow.monitoring?.frequencyLabel || "—"}
              </span>
            </div>
          </DrawerSection>

          <DrawerSection label="Ownership">
            <div className="drow">
              <span className="dkey">Owner</span>
              <span className="dval">{selectedRow.owner.name || "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">Category</span>
              <span className="dval">
                <Badge
                  value={selectedRow.category.name || "—"}
                  variant="category"
                />
              </span>
            </div>
            <div className="drow">
              <span className="dkey">Compliance</span>
              <span className="dval">
                <Badge
                  value={(selectedRow.compliance || [])[0] || "—"}
                  variant="compliance"
                />
              </span>
            </div>
            <div className="drow border-0">
              <span className="dkey">Risk</span>
              <span className="dval" style={{ color: riskColor }}>
                {riskScore}
              </span>
            </div>
          </DrawerSection>

          <DrawerSection label="Recent Incidents">
            <div className="text-[12px] text-[#6b7280]">
              {(selectedRow.stats?.totalIncidents || 0) > 0
                ? `${selectedRow.stats.totalIncidents} incidents in last 30 days.`
                : "No recent incidents."}
            </div>
          </DrawerSection>

          <DrawerSection label="Quick Actions -CS-">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button type="button" className="btn btn-sm btn-primary">
                Test API
              </button>
              <button type="button" className="btn btn-sm">
                Restart
              </button>
              <button type="button" className="btn btn-sm">
                Incident
              </button>
              <button type="button" className="btn btn-sm">
                View Logs
              </button>
            </div>
          </DrawerSection>
        </div>
      )}
    </Drawer>
  );
};
