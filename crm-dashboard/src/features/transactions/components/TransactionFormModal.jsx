import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import FormModal from "../../../components/ui/FormModal";
import UiInput from "../../../components/ui/Input";
import UiSelect from "../../../components/ui/SingleSelect";
import AvatarSelect from "../../../components/ui/AvatarSelect";
import MultiSelect from "../../../formComponents/MultiSelect";
import StepsEditor from "./StepsEditor";
import { useCreateTransactionMutation } from "../hooks/query/useCreateTransactionMutation";
import { useUpdateTransactionMutation } from "../hooks/query/useUpdateTransactionMutation";
import { useGetNotificationChannelsOptionsQuery } from "../hooks/query/useGetNotificationChannelsOptionsQuery";
import { useTeamMembersQuery } from "../../categories/hooks/query/useTeamMembersQuery";
import { FREQUENCY_OPTIONS } from "../constants";

const idOf = (v) => v?._id ?? v;

const emptyForm = {
  name: "",
  owner: "",
  frequency: "*/5 * * * *",
  timeout: 15000,
  enabled: true,
  channels: [],
  steps: [],
};

// backend Step → editable form step (KV rows, raw JSON text, string expected values)
const stepToForm = (step) => ({
  name: step.name || "",
  method: step.method || "GET",
  url: step.url || "",
  headers:
    step.headers && typeof step.headers === "object"
      ? Object.entries(step.headers).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      : [],
  bodyText:
    step.body !== undefined && step.body !== null
      ? typeof step.body === "string"
        ? step.body
        : JSON.stringify(step.body, null, 2)
      : "",
  extractVars: (step.extractVars || []).map((v) => ({
    name: v.name || "",
    fromPath: v.fromPath || "",
  })),
  assertions: {
    enabled: step.assertions?.enabled ?? false,
    bodyContains: step.assertions?.bodyContains || [],
    jsonPathChecks: (step.assertions?.jsonPathChecks || []).map((c) => ({
      path: c.path || "",
      operator: c.operator || "equals",
      expected:
        c.expected !== undefined && c.expected !== null
          ? typeof c.expected === "string"
            ? c.expected
            : JSON.stringify(c.expected)
          : "",
    })),
  },
});

const txnToForm = (txn) => {
  if (!txn) return emptyForm;
  return {
    name: txn.name || "",
    owner: idOf(txn.owner) || "",
    frequency: txn.frequency || "*/5 * * * *",
    timeout: txn.timeout ?? 15000,
    enabled: txn.enabled ?? true,
    channels: (txn.channels || []).map(idOf),
    steps: (txn.steps || []).map(stepToForm),
  };
};

// editable form step → backend Step payload
const tryParseJson = (text) => {
  const t = (text || "").trim();
  if (!t) return { ok: true, value: null };
  try {
    return { ok: true, value: JSON.parse(t) };
  } catch {
    return { ok: false, value: null };
  }
};

const parseExpected = (raw) => {
  if (raw === "" || raw === undefined || raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

const buildStepPayload = (step) => {
  const headers = step.headers.reduce(
    (acc, { key, value }) => (key.trim() ? { ...acc, [key.trim()]: value } : acc),
    {},
  );
  const { value: body } = tryParseJson(step.bodyText);

  return {
    name: step.name.trim(),
    method: step.method,
    url: step.url.trim(),
    headers,
    body,
    extractVars: step.extractVars
      .filter((v) => v.name.trim() && v.fromPath.trim())
      .map((v) => ({ name: v.name.trim(), fromPath: v.fromPath.trim() })),
    assertions: {
      enabled: step.assertions.enabled,
      bodyContains: step.assertions.bodyContains,
      jsonPathChecks: step.assertions.jsonPathChecks
        .filter((c) => c.path.trim())
        .map((c) => ({
          path: c.path.trim(),
          operator: c.operator,
          expected: parseExpected(c.expected),
        })),
    },
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

export const TransactionFormModal = ({ open, onClose, transaction }) => {
  const isEdit = !!transaction?._id;
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [stepErrors, setStepErrors] = useState([]);

  const { mutate: createTransaction, isPending: creating } =
    useCreateTransactionMutation();
  const { mutate: updateTransaction, isPending: updating } =
    useUpdateTransactionMutation();
  const isPending = creating || updating;

  const { data: channelsResponse } = useGetNotificationChannelsOptionsQuery({
    enabled: open,
  });
  const { data: teamMembers = [], isLoading: membersLoading } =
    useTeamMembersQuery();

  const channelOptions = useMemo(
    () =>
      (channelsResponse?.data || []).map((c) => ({
        value: c._id,
        label: `${c.name} (${c.type})`,
      })),
    [channelsResponse],
  );
  const ownerOptions = useMemo(
    () =>
      teamMembers.map((m) => ({
        value: m._id,
        label: m.name,
        image: m.image_url,
      })),
    [teamMembers],
  );

  useEffect(() => {
    if (open) {
      setForm(txnToForm(transaction));
      setErrors({});
      setStepErrors([]);
    }
  }, [open, transaction]);

  const update = useCallback(
    (key, val) => setForm((f) => ({ ...f, [key]: val })),
    [],
  );
  const clearErr = useCallback(
    (key) => setErrors((e) => ({ ...e, [key]: false })),
    [],
  );

  const handleStepsChange = useCallback((steps) => {
    setForm((f) => ({ ...f, steps }));
    setStepErrors((prev) =>
      prev.length ? prev.slice(0, steps.length) : prev,
    );
    setErrors((e) => (e.steps ? { ...e, steps: false } : e));
  }, []);

  const handleSubmit = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    if (!form.steps.length) errs.steps = true;

    const nextStepErrors = form.steps.map((step) => {
      const e = {};
      if (!step.name.trim()) e.name = true;
      if (!step.url.trim()) e.url = true;
      if (step.bodyText.trim() && !tryParseJson(step.bodyText).ok)
        e.body = true;
      return e;
    });
    const hasStepErrors = nextStepErrors.some(
      (e) => Object.keys(e).length > 0,
    );

    setErrors(errs);
    setStepErrors(nextStepErrors);
    if (Object.keys(errs).length || hasStepErrors) return;

    const payload = {
      name: form.name.trim(),
      owner: form.owner || undefined,
      frequency: form.frequency,
      timeout: Number(form.timeout) || 15000,
      enabled: form.enabled,
      channels: form.channels,
      steps: form.steps.map(buildStepPayload),
    };

    const onError = (error) =>
      toast.error(
        error?.response?.data?.message || "Failed to save transaction",
      );
    const onSuccess = () => {
      toast.success(isEdit ? "Transaction updated" : "Transaction created");
      onClose?.();
    };

    if (isEdit) {
      updateTransaction(
        { id: transaction._id, payload },
        { onSuccess, onError },
      );
    } else {
      createTransaction(payload, { onSuccess, onError });
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Transaction" : "New Synthetic Transaction"}
      subtitle="Chain multiple HTTP requests into one scripted, scheduled check"
      size="xl"
      footer={
        <>
          <Btn onClick={onClose} disabled={isPending}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={isPending}>
            {isPending
              ? "Saving…"
              : isEdit
                ? "Save Changes"
                : "Create Transaction"}
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <UiInput
          label="Transaction Name"
          required
          value={form.name}
          placeholder="e.g. Checkout flow"
          error={errors.name ? "Transaction name is required" : ""}
          onChange={(e) => {
            update("name", e.target.value);
            clearErr("name");
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AvatarSelect
            label="Owner"
            value={form.owner}
            onChange={(v) => update("owner", v)}
            options={ownerOptions}
            placeholder={membersLoading ? "Loading…" : "Select owner"}
            disabled={membersLoading}
          />
          <UiSelect
            label="Run Frequency"
            value={form.frequency}
            options={FREQUENCY_OPTIONS}
            onChange={(e) => update("frequency", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UiInput
            label="Timeout per step (ms)"
            type="number"
            value={form.timeout}
            onChange={(e) => update("timeout", e.target.value)}
          />
          <MultiSelect
            label="Notify via"
            value={form.channels}
            onChange={(val) => update("channels", val)}
            options={channelOptions}
            placeholder="Select notification channels…"
          />
        </div>

        <label className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => update("enabled", e.target.checked)}
            className="accent-blue-600"
          />
          Transaction is enabled
        </label>

        <div className="border-t border-gray-100 pt-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12.5px] font-medium text-gray-700">
              Steps
            </span>
            {errors.steps && (
              <span className="text-[11.5px] text-red-500">
                Add at least one step
              </span>
            )}
          </div>
          <StepsEditor
            steps={form.steps}
            onChange={handleStepsChange}
            errors={stepErrors}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default TransactionFormModal;
