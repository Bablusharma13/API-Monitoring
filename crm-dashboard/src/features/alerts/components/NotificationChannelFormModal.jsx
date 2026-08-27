import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import FormModal from "../../../components/ui/FormModal";
import UiInput from "../../../components/ui/Input";
import UiSelect from "../../../components/ui/SingleSelect";
import MultiSelect from "../../../formComponents/MultiSelect";
import { useCreateNotificationChannelMutation } from "../hooks/query/useCreateNotificationChannelMutation";
import { useUpdateNotificationChannelMutation } from "../hooks/query/useUpdateNotificationChannelMutation";
import { CHANNEL_TYPE_OPTIONS, SEVERITY_OPTIONS } from "../constants";

const emptyForm = {
  name: "",
  type: "slack",
  to: "",
  webhookUrl: "",
  url: "",
  headersText: "",
  severityFilter: [],
  enabled: true,
};

const channelToForm = (channel) => {
  if (!channel) return emptyForm;
  const cfg = channel.config || {};
  return {
    name: channel.name || "",
    type: channel.type || "slack",
    to: Array.isArray(cfg.to) ? cfg.to.join(", ") : cfg.to || "",
    webhookUrl: cfg.webhookUrl || "",
    url: cfg.url || "",
    headersText: Array.isArray(cfg.headers)
      ? cfg.headers.map(([k, v]) => `${k}: ${v}`).join("\n")
      : "",
    severityFilter: channel.severityFilter || [],
    enabled: channel.enabled ?? true,
  };
};

const parseHeaders = (text) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return [line, ""];
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
    });

const Btn = ({ children, variant = "default", disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`form-modal-btn ${variant === "primary" ? "form-modal-btn-primary" : ""}`}
  >
    {children}
  </button>
);

export const NotificationChannelFormModal = ({ open, onClose, channel }) => {
  const isEdit = !!channel?._id;
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const { mutate: createChannel, isPending: creating } =
    useCreateNotificationChannelMutation();
  const { mutate: updateChannel, isPending: updating } =
    useUpdateNotificationChannelMutation();
  const isPending = creating || updating;

  useEffect(() => {
    if (open) {
      setForm(channelToForm(channel));
      setErrors({});
    }
  }, [open, channel]);

  const update = useCallback(
    (key, val) => setForm((f) => ({ ...f, [key]: val })),
    [],
  );
  const clearErr = useCallback(
    (key) => setErrors((e) => ({ ...e, [key]: false })),
    [],
  );

  const handleSubmit = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    if (form.type === "email" && !form.to.trim()) errs.to = true;
    if (["slack", "discord", "pagerduty"].includes(form.type) && !form.webhookUrl.trim())
      errs.webhookUrl = true;
    if (form.type === "webhook" && !form.url.trim()) errs.url = true;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    let config = {};
    if (form.type === "email") {
      config = {
        to: form.to
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      };
    } else if (["slack", "discord", "pagerduty"].includes(form.type)) {
      config = { webhookUrl: form.webhookUrl.trim() };
    } else if (form.type === "webhook") {
      config = {
        url: form.url.trim(),
        headers: parseHeaders(form.headersText),
      };
    }

    const payload = {
      name: form.name.trim(),
      type: form.type,
      config,
      severityFilter: form.severityFilter,
      enabled: form.enabled,
    };

    const onError = (error) =>
      toast.error(error?.response?.data?.message || "Failed to save channel");
    const onSuccess = () => {
      toast.success(isEdit ? "Channel updated" : "Channel created");
      onClose?.();
    };

    if (isEdit) {
      updateChannel({ id: channel._id, payload }, { onSuccess, onError });
    } else {
      createChannel(payload, { onSuccess, onError });
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Notification Channel" : "Add Notification Channel"}
      subtitle="Connect a destination for alert notifications"
      size="md"
      footer={
        <>
          <Btn onClick={onClose} disabled={isPending}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Add Channel"}
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <UiInput
          label="Channel Name"
          required
          value={form.name}
          placeholder="e.g. Slack #alerts"
          error={errors.name ? "Channel name is required" : ""}
          onChange={(e) => {
            update("name", e.target.value);
            clearErr("name");
          }}
        />

        <UiSelect
          label="Type"
          value={form.type}
          options={CHANNEL_TYPE_OPTIONS}
          onChange={(e) => update("type", e.target.value)}
        />

        {form.type === "email" && (
          <UiInput
            label="To (comma-separated)"
            required
            value={form.to}
            placeholder="ops@company.com, oncall@company.com"
            error={errors.to ? "At least one recipient is required" : ""}
            onChange={(e) => {
              update("to", e.target.value);
              clearErr("to");
            }}
          />
        )}

        {["slack", "discord", "pagerduty"].includes(form.type) && (
          <UiInput
            label="Webhook URL"
            required
            value={form.webhookUrl}
            placeholder="https://hooks.slack.com/services/…"
            error={errors.webhookUrl ? "Webhook URL is required" : ""}
            onChange={(e) => {
              update("webhookUrl", e.target.value);
              clearErr("webhookUrl");
            }}
          />
        )}

        {form.type === "webhook" && (
          <>
            <UiInput
              label="Endpoint URL"
              required
              value={form.url}
              placeholder="https://hooks.yourservice.com/…"
              error={errors.url ? "Endpoint URL is required" : ""}
              onChange={(e) => {
                update("url", e.target.value);
                clearErr("url");
              }}
            />
            <div>
              <div className="text-[11.5px] text-gray-500 mb-1.5">
                Custom headers{" "}
                <span className="text-gray-400">(optional, one per line)</span>
              </div>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12.5px] font-mono outline-none focus:border-blue-500 resize-y"
                rows={3}
                value={form.headersText}
                placeholder={"Authorization: Bearer token\nX-Custom-Header: value"}
                onChange={(e) => update("headersText", e.target.value)}
              />
            </div>
          </>
        )}

        <MultiSelect
          label="Severity filter"
          value={form.severityFilter}
          onChange={(val) => update("severityFilter", val)}
          options={SEVERITY_OPTIONS}
          placeholder="All severities"
        />

        <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => update("enabled", e.target.checked)}
            className="accent-blue-600"
          />
          Channel is enabled
        </label>
      </div>
    </FormModal>
  );
};
