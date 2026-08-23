import { Drawer, DrawerSection } from "../../../components/ui/Drawer";
import { Badge } from "../../../components/ui/Badge";

export const CategoryDrawer = ({ selectedRow, setSelectedRow }) => {
  const health = selectedRow?.health?.toLowerCase?.();
  const healthVariant =
    health === "critical"
      ? "down"
      : health === "warning"
        ? "warning"
        : "active";
  const drawerSubtitle = selectedRow ? (
    <div className="flex items-center gap-2">
      <Badge value={selectedRow.health || "Healthy"} variant={healthVariant} />
      <Badge value={`${selectedRow.apis ?? 0} APIs`} variant="category" />
    </div>
  ) : null;
  const healthColor =
    health === "critical"
      ? "#dc2626"
      : health === "warning"
        ? "#d97706"
        : "#16a34a";
  const uptimeValue = selectedRow?.uptime ?? 98.4;
  const uptimeBlocks = Array.from({ length: 30 }, (_, idx) => {
    if (health === "critical" && idx >= 27) return "#dc2626";
    if (health === "warning" && (idx === 24 || idx === 27)) return "#d97706";
    return "#16a34a";
  });
  const categoryApis = selectedRow?.apiList || [
    {
      name: `${selectedRow?.name || "category"}-service`,
      status:
        health === "critical"
          ? "down"
          : health === "warning"
            ? "warning"
            : "active",
      resp: selectedRow?.resp || "—",
      inc: selectedRow?.down || 0,
      risk: selectedRow?.down > 0 ? 72 : 24,
    },
  ];
  const incidentsTotal = categoryApis.reduce(
    (acc, item) => acc + (Number(item.inc) || 0),
    0,
  );
  const incidentsActive = categoryApis.filter(
    (item) => item.status !== "active",
  ).length;
  const responseBars = [
    120, 180, 240, 320, 280, 360, 220, 300, 260, 200, 340, 290, 250, 310,
  ];
  const failureBars = [0, 1, 0, 2, 1, 0, 3, 1, 0, 2, 1, 0, 1, 0];
  const maxResp = Math.max(...responseBars);
  const maxFail = Math.max(...failureBars, 1);

  return (
    <Drawer
      isOpen={!!selectedRow}
      onClose={() => setSelectedRow(null)}
      title={selectedRow?.name || "Category Details"}
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

          <DrawerSection label="Category Overview">
            <div className="drow">
              <span className="dkey">Category Name</span>
              <span className="dval">{selectedRow.name || "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">Description</span>
              <span className="dval">{selectedRow.desc || "—"}</span>
            </div>
            <div className="drow border-0">
              <span className="dkey">Owner</span>
              <span className="dval">{selectedRow.owner || "—"}</span>
            </div>
          </DrawerSection>

          <DrawerSection label="Category Health">
            <div className="drow">
              <span className="dkey">Health Status</span>
              <span className="dval">
                <Badge
                  value={selectedRow.health || "Healthy"}
                  variant={healthVariant}
                />
              </span>
            </div>
            <div className="drow">
              <span className="dkey">Active APIs</span>
              <span className="dval">{selectedRow.active ?? "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">Down APIs</span>
              <span className="dval">{selectedRow.down ?? "—"}</span>
            </div>
            <div className="drow border-0">
              <span className="dkey">Avg Response</span>
              <span className="dval">{selectedRow.resp || "—"}</span>
            </div>
          </DrawerSection>

          <DrawerSection label="Monitoring & Ownership">
            <div className="drow">
              <span className="dkey">Total APIs</span>
              <span className="dval">{selectedRow.apis ?? "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">Last Incident</span>
              <span className="dval">{selectedRow.lastInc || "—"}</span>
            </div>
            <div className="drow">
              <span className="dkey">Health Score</span>
              <span className="dval" style={{ color: healthColor }}>
                {selectedRow.score != null ? `${selectedRow.score}%` : "—"}
              </span>
            </div>
            <div className="drow border-0">
              <span className="dkey">Last Updated</span>
              <span className="dval">{selectedRow.updated || "—"}</span>
            </div>
          </DrawerSection>

          <DrawerSection label="APIs in this Category">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="h-[30px] text-[10px] text-gray-400 uppercase tracking-[0.04em] border-b border-gray-200 bg-[#fafbfc]">
                    <th className="text-left px-2">API Name</th>
                    <th className="text-left px-2">Status</th>
                    <th className="text-left px-2">Resp</th>
                    <th className="text-left px-2">Inc</th>
                    <th className="text-left px-2">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryApis.map((apiItem, idx) => (
                    <tr
                      key={`${apiItem.name}-${idx}`}
                      className="h-9 border-b border-[#f3f5f9] last:border-0"
                    >
                      <td className="px-2 text-[#1c1f2e]">{apiItem.name}</td>
                      <td className="px-2">
                        <Badge value={apiItem.status} />
                      </td>
                      <td className="px-2 font-mono text-[11px] text-[#6b7280]">
                        {apiItem.resp ?? "—"}
                      </td>
                      <td className="px-2 font-mono text-[11px]">
                        {apiItem.inc ?? 0}
                      </td>
                      <td className="px-2 font-mono text-[11px]">
                        {apiItem.risk ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DrawerSection>

          <DrawerSection label="Incident Summary">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
              <div className="px-3 py-2 bg-[#f8f9fc] border border-gray-200 rounded-lg text-center">
                <div
                  className="text-[18px] text-[#1c1f2e]"
                  style={{ fontFamily: "Outfit, sans-serif" }}
                >
                  {incidentsTotal}
                </div>
                <div className="txt-xs mt-0.5">Total Incidents</div>
              </div>
              <div className="px-3 py-2 bg-[#f8f9fc] border border-gray-200 rounded-lg text-center">
                <div
                  className="text-[18px]"
                  style={{
                    color: incidentsActive > 0 ? "#dc2626" : "#16a34a",
                    fontFamily: "Outfit, sans-serif",
                  }}
                >
                  {incidentsActive}
                </div>
                <div className="txt-xs mt-0.5">Active Now</div>
              </div>
            </div>
            <div className="text-[12px] text-[#6b7280] bg-[#f8f9fc] border border-gray-200 rounded-[7px] px-2.5 py-2">
              Last issue: {selectedRow.lastInc || "None"}.
            </div>
          </DrawerSection>

          <DrawerSection label="Performance - Last 14 Days">
            <div className="mb-3">
              <div className="txt-xs mb-1">Response time (ms)</div>
              <div className="h-[60px] flex items-end gap-[3px]">
                {responseBars.map((v, idx) => (
                  <div
                    key={`r-${idx}`}
                    className="flex-1 rounded-t-[2px]"
                    style={{
                      height: `${(v / maxResp) * 100}%`,
                      background: v > 300 ? "#d97706" : "#2563eb",
                      opacity: 0.8,
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="txt-xs mb-1">Failures per day</div>
              <div className="h-[60px] flex items-end gap-[3px]">
                {failureBars.map((v, idx) => (
                  <div
                    key={`f-${idx}`}
                    className="flex-1 rounded-t-[2px]"
                    style={{
                      height: `${Math.max((v / maxFail) * 100, v === 0 ? 6 : 10)}%`,
                      background: v > 1 ? "#dc2626" : "#16a34a",
                      opacity: v === 0 ? 0.35 : 0.8,
                    }}
                  />
                ))}
              </div>
            </div>
          </DrawerSection>

          <DrawerSection label="Quick Actions">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button type="button" className="btn btn-sm">
                View APIs
              </button>
              <button type="button" className="btn btn-sm">
                Open Incidents
              </button>
              <button type="button" className="btn btn-sm">
                Assign Owner
              </button>
              <button type="button" className="btn btn-sm btn-red">
                Disable Category
              </button>
            </div>
          </DrawerSection>
        </div>
      )}
    </Drawer>
  );
};
