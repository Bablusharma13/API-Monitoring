import { toast } from "sonner";
import { Drawer, DrawerSection, DrawerRow } from "../../../components/ui/Drawer";
import { Badge } from "../../../components/ui/Badge";
import { formatDateTime } from "../../../utils/helpers";
import { SEVERITY_META, ALERT_STATUS_META } from "../constants";
import { useAckAlertMutation } from "../hooks/query/useAckAlertMutation";
import { useResolveAlertMutation } from "../hooks/query/useResolveAlertMutation";

export const AlertDetailsDrawer = ({ alert, onClose }) => {
  const { mutate: ack, isPending: acking } = useAckAlertMutation();
  const { mutate: resolve, isPending: resolving } = useResolveAlertMutation();

  const severityMeta = SEVERITY_META[alert?.severity] || {
    label: alert?.severity,
    variant: "default",
  };
  const statusMeta = ALERT_STATUS_META[alert?.status] || {
    label: alert?.status,
    variant: "default",
  };

  const onError = (error) =>
    toast.error(error?.response?.data?.message || "Action failed");

  return (
    <Drawer
      isOpen={!!alert}
      onClose={onClose}
      title={alert?.title || "Alert Details"}
      subtitle={
        alert && (
          <div className="flex items-center gap-2">
            <Badge value={severityMeta.label} variant={severityMeta.variant} />
            <Badge value={statusMeta.label} variant={statusMeta.variant} />
          </div>
        )
      }
      size="md"
    >
      {alert && (
        <div className="space-y-0">
          <DrawerSection label="Basic Information">
            <DrawerRow label="API" value={alert.api?.name} />
            <DrawerRow label="Rule" value={alert.rule?.name} />
            <DrawerRow label="Signal" value={alert.rule?.signal} />
            <DrawerRow
              label="Value"
              value={alert.value != null ? String(alert.value) : "—"}
            />
            <DrawerRow
              label="Threshold"
              value={alert.threshold != null ? String(alert.threshold) : "—"}
              noBorder
            />
          </DrawerSection>

          <DrawerSection label="Message">
            <p className="text-[12.5px] text-gray-600 leading-relaxed py-2">
              {alert.message || "—"}
            </p>
          </DrawerSection>

          <DrawerSection label="Timeline">
            <DrawerRow
              label="Triggered"
              value={formatDateTime(alert.triggeredAt)}
              mono
            />
            <DrawerRow
              label="Acknowledged"
              value={
                alert.acknowledgedAt
                  ? `${formatDateTime(alert.acknowledgedAt)}${alert.acknowledgedBy ? ` · ${alert.acknowledgedBy}` : ""}`
                  : "—"
              }
              mono
            />
            <DrawerRow
              label="Resolved"
              value={alert.resolvedAt ? formatDateTime(alert.resolvedAt) : "—"}
              mono
              noBorder
            />
          </DrawerSection>

          <DrawerSection label="Notified Channels">
            {alert.notifiedChannels?.length ? (
              <div className="flex flex-col gap-0">
                {alert.notifiedChannels.map((n, i) => (
                  <div
                    key={n.channel?._id || i}
                    className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-b-0 text-[12.5px]"
                  >
                    <span className="text-gray-700">
                      {n.channel?.name || n.channel?.type || "Channel"}
                    </span>
                    <Badge
                      value={n.status === "failed" ? "Failed" : "Sent"}
                      variant={n.status === "failed" ? "down" : "active"}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-gray-400 py-1.5">
                No notifications recorded for this alert.
              </p>
            )}
          </DrawerSection>

          {(alert.status === "firing" || alert.status === "acknowledged") && (
            <DrawerSection label="Actions">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {alert.status === "firing" && (
                  <button
                    type="button"
                    disabled={acking}
                    onClick={() => ack(alert._id, { onError })}
                    className="btn btn-sm"
                  >
                    {acking ? "Acknowledging…" : "Acknowledge"}
                  </button>
                )}
                <button
                  type="button"
                  disabled={resolving}
                  onClick={() => resolve(alert._id, { onError })}
                  className="btn btn-sm btn-primary"
                >
                  {resolving ? "Resolving…" : "Resolve"}
                </button>
              </div>
            </DrawerSection>
          )}
        </div>
      )}
    </Drawer>
  );
};
