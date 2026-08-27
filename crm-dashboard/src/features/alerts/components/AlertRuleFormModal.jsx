import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import FormModal from "../../../components/ui/FormModal";
import UiInput from "../../../components/ui/Input";
import UiSelect from "../../../components/ui/SingleSelect";
import MultiSelect from "../../../formComponents/MultiSelect";
import { useCreateAlertRuleMutation } from "../hooks/query/useCreateAlertRuleMutation";
import { useUpdateAlertRuleMutation } from "../hooks/query/useUpdateAlertRuleMutation";
import { useGetNotificationChannelsQuery } from "../hooks/query/useGetNotificationChannelsQuery";
import { useGetCategoriesOptionsQuery } from "../hooks/query/useGetCategoriesOptionsQuery";
import { useGetApisOptionsQuery } from "../hooks/query/useGetApisOptionsQuery";
import {
  SIGNAL_OPTIONS,
  SEVERITY_OPTIONS,
  SCOPE_TYPE_OPTIONS,
  CONDITION_STATUS_OPTIONS,
} from "../constants";

const emptyForm = {
  name: "",
  signal: "status",
  statuses: ["down"],
  thresholdMs: "",
  thresholdPct: "",
  scopeType: "all",
  categoryIds: [],
  apiIds: [],
  channels: [],
  severity: "warning",
  cooldownMinutes: 15,
  autoResolve: true,
  enabled: true,
  escalation: [],
};

const idOf = (v) => v?._id ?? v;

const ruleToForm = (rule) => {
  if (!rule) return emptyForm;
  return {
    name: rule.name || "",
    signal: rule.signal || "status",
    statuses: rule.condition?.statuses?.length
      ? rule.condition.statuses
      : ["down"],
    thresholdMs: rule.condition?.thresholdMs ?? "",
    thresholdPct: rule.condition?.thresholdPct ?? "",
    scopeType: rule.scope?.type || "all",
    categoryIds: (rule.scope?.categoryIds || []).map(idOf),
    apiIds: (rule.scope?.apiIds || []).map(idOf),
    channels: (rule.channels || []).map(idOf),
    severity: rule.severity || "warning",
    cooldownMinutes: rule.cooldownMinutes ?? 15,
    autoResolve: rule.autoResolve ?? true,
    enabled: rule.enabled ?? true,
    escalation: (rule.escalation || []).map((tier) => ({
      afterMinutes: tier.afterMinutes ?? "",
      channels: (tier.channels || []).map(idOf),
    })),
  };
};

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

export const AlertRuleFormModal = ({ open, onClose, rule }) => {
  const isEdit = !!rule?._id;
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const { mutate: createRule, isPending: creating } =
    useCreateAlertRuleMutation();
  const { mutate: updateRule, isPending: updating } =
    useUpdateAlertRuleMutation();
  const isPending = creating || updating;

  const { data: channelsResponse } = useGetNotificationChannelsQuery(
    { limit: 200 },
    { enabled: open },
  );
  const { data: categories = [] } = useGetCategoriesOptionsQuery(
    open && form.scopeType === "category",
  );
  const { data: apis = [] } = useGetApisOptionsQuery(
    open && form.scopeType === "api",
  );

  const channelOptions = useMemo(
    () =>
      (channelsResponse?.data || []).map((c) => ({
        value: c._id,
        label: `${c.name} (${c.type})`,
      })),
    [channelsResponse],
  );
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c._id, label: c.name })),
    [categories],
  );
  const apiOptions = useMemo(
    () => apis.map((a) => ({ value: a._id, label: a.name })),
    [apis],
  );

  useEffect(() => {
    if (open) {
      setForm(ruleToForm(rule));
      setErrors({});
    }
  }, [open, rule]);

  const update = useCallback(
    (key, val) => setForm((f) => ({ ...f, [key]: val })),
    [],
  );
  const clearErr = useCallback(
    (key) => setErrors((e) => ({ ...e, [key]: false })),
    [],
  );

  const addEscalationTier = () =>
    setForm((f) => ({
      ...f,
      escalation: [...f.escalation, { afterMinutes: "", channels: [] }],
    }));
  const removeEscalationTier = (i) =>
    setForm((f) => ({
      ...f,
      escalation: f.escalation.filter((_, idx) => idx !== i),
    }));
  const updateEscalationTier = (i, field, val) =>
    setForm((f) => ({
      ...f,
      escalation: f.escalation.map((t, idx) =>
        idx === i ? { ...t, [field]: val } : t,
      ),
    }));

  const handleSubmit = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    if (form.signal === "latency" && !form.thresholdMs) errs.thresholdMs = true;
    if (form.signal === "errorRate" && !form.thresholdPct)
      errs.thresholdPct = true;
    if (form.signal === "status" && !form.statuses.length)
      errs.statuses = true;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const condition = {};
    if (form.signal === "status") condition.statuses = form.statuses;
    if (form.signal === "latency")
      condition.thresholdMs = Number(form.thresholdMs);
    if (form.signal === "errorRate")
      condition.thresholdPct = Number(form.thresholdPct);

    const payload = {
      name: form.name.trim(),
      signal: form.signal,
      condition,
      scope: {
        type: form.scopeType,
        categoryIds: form.scopeType === "category" ? form.categoryIds : [],
        apiIds: form.scopeType === "api" ? form.apiIds : [],
      },
      channels: form.channels,
      severity: form.severity,
      cooldownMinutes: Number(form.cooldownMinutes) || 0,
      autoResolve: form.autoResolve,
      enabled: form.enabled,
      escalation: form.escalation.map((tier) => ({
        afterMinutes: Number(tier.afterMinutes) || 0,
        channels: tier.channels,
      })),
    };

    const onError = (error) =>
      toast.error(error?.response?.data?.message || "Failed to save rule");
    const onSuccess = () => {
      toast.success(isEdit ? "Alert rule updated" : "Alert rule created");
      onClose?.();
    };

    if (isEdit) {
      updateRule({ id: rule._id, payload }, { onSuccess, onError });
    } else {
      createRule(payload, { onSuccess, onError });
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Alert Rule" : "New Alert Rule"}
      subtitle="Define when this rule fires and who gets notified"
      size="lg"
      footer={
        <>
          <Btn onClick={onClose} disabled={isPending}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Rule"}
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <UiInput
          label="Rule Name"
          required
          value={form.name}
          placeholder="e.g. Payment API downtime"
          error={errors.name ? "Rule name is required" : ""}
          onChange={(e) => {
            update("name", e.target.value);
            clearErr("name");
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UiSelect
            label="Signal"
            value={form.signal}
            options={SIGNAL_OPTIONS}
            onChange={(e) => update("signal", e.target.value)}
          />
          <UiSelect
            label="Severity"
            value={form.severity}
            options={SEVERITY_OPTIONS}
            onChange={(e) => update("severity", e.target.value)}
          />
        </div>

        {form.signal === "status" && (
          <MultiSelect
            label="Fires when status becomes"
            required
            value={form.statuses}
            onChange={(val) => {
              update("statuses", val);
              clearErr("statuses");
            }}
            options={CONDITION_STATUS_OPTIONS}
            showSelectAll={false}
            error={errors.statuses ? "Select at least one status" : ""}
          />
        )}
        {form.signal === "latency" && (
          <UiInput
            label="Response time threshold (ms)"
            required
            type="number"
            value={form.thresholdMs}
            placeholder="e.g. 1000"
            error={errors.thresholdMs ? "Threshold is required" : ""}
            onChange={(e) => {
              update("thresholdMs", e.target.value);
              clearErr("thresholdMs");
            }}
          />
        )}
        {form.signal === "errorRate" && (
          <UiInput
            label="Error rate threshold (%)"
            required
            type="number"
            value={form.thresholdPct}
            placeholder="e.g. 5"
            error={errors.thresholdPct ? "Threshold is required" : ""}
            onChange={(e) => {
              update("thresholdPct", e.target.value);
              clearErr("thresholdPct");
            }}
          />
        )}

        <UiSelect
          label="Scope"
          value={form.scopeType}
          options={SCOPE_TYPE_OPTIONS}
          onChange={(e) => update("scopeType", e.target.value)}
        />
        {form.scopeType === "category" && (
          <MultiSelect
            label="Categories"
            value={form.categoryIds}
            onChange={(val) => update("categoryIds", val)}
            options={categoryOptions}
            placeholder="Select categories…"
          />
        )}
        {form.scopeType === "api" && (
          <MultiSelect
            label="APIs"
            value={form.apiIds}
            onChange={(val) => update("apiIds", val)}
            options={apiOptions}
            placeholder="Select APIs…"
          />
        )}

        <MultiSelect
          label="Notify via"
          value={form.channels}
          onChange={(val) => update("channels", val)}
          options={channelOptions}
          placeholder="Select notification channels…"
        />

        <div>
          <div className="text-[11.5px] text-gray-500 mb-1.5">
            Escalation{" "}
            <span className="text-gray-400">
              (optional — notify more channels if still unresolved)
            </span>
          </div>
          {form.escalation.map((tier, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <div className="w-[110px] shrink-0">
                <UiInput
                  type="number"
                  placeholder="After (min)"
                  value={tier.afterMinutes}
                  onChange={(e) =>
                    updateEscalationTier(i, "afterMinutes", e.target.value)
                  }
                />
              </div>
              <div className="flex-1">
                <MultiSelect
                  value={tier.channels}
                  onChange={(val) => updateEscalationTier(i, "channels", val)}
                  options={channelOptions}
                  placeholder="Escalate to…"
                />
              </div>
              <button
                type="button"
                onClick={() => removeEscalationTier(i)}
                aria-label="Remove escalation tier"
                className="w-[34px] h-[34px] flex items-center justify-center shrink-0 border border-gray-200 rounded-lg text-gray-400 hover:border-red-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addEscalationTier}
            className="flex items-center gap-1.5 text-[12px] text-blue-600 hover:text-blue-700 mt-1"
          >
            <Plus size={14} />
            Add escalation tier
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UiInput
            label="Cooldown (minutes)"
            type="number"
            value={form.cooldownMinutes}
            onChange={(e) => update("cooldownMinutes", e.target.value)}
          />
          <UiSelect
            label="Auto-resolve"
            value={form.autoResolve ? "true" : "false"}
            options={[
              { value: "true", label: "Yes — clear when condition clears" },
              { value: "false", label: "No — manual resolve only" },
            ]}
            onChange={(e) => update("autoResolve", e.target.value === "true")}
          />
        </div>

        <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => update("enabled", e.target.checked)}
            className="accent-blue-600"
          />
          Rule is enabled
        </label>
      </div>
    </FormModal>
  );
};
