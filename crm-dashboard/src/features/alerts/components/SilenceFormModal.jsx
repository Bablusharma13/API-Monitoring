import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import FormModal from "../../../components/ui/FormModal";
import UiInput from "../../../components/ui/Input";
import UiSelect from "../../../components/ui/SingleSelect";
import MultiSelect from "../../../formComponents/MultiSelect";
import { useCreateSilenceMutation } from "../hooks/query/useCreateSilenceMutation";
import { useGetCategoriesOptionsQuery } from "../hooks/query/useGetCategoriesOptionsQuery";
import { useGetApisOptionsQuery } from "../hooks/query/useGetApisOptionsQuery";
import { SCOPE_TYPE_OPTIONS } from "../constants";

const toLocalInputValue = (date) => {
  const d = date ? new Date(date) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const emptyForm = () => ({
  scopeType: "all",
  categoryIds: [],
  apiIds: [],
  reason: "",
  startsAt: toLocalInputValue(new Date()),
  endsAt: toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)),
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

export const SilenceFormModal = ({ open, onClose }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const { mutate: createSilence, isPending } = useCreateSilenceMutation();

  const { data: categories = [] } = useGetCategoriesOptionsQuery(
    open && form.scopeType === "category",
  );
  const { data: apis = [] } = useGetApisOptionsQuery(
    open && form.scopeType === "api",
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
      setForm(emptyForm());
      setErrors({});
    }
  }, [open]);

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
    if (!form.endsAt) errs.endsAt = true;
    if (
      form.startsAt &&
      form.endsAt &&
      new Date(form.endsAt) <= new Date(form.startsAt)
    )
      errs.endsAt = true;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = {
      scope: {
        type: form.scopeType,
        categoryIds: form.scopeType === "category" ? form.categoryIds : [],
        apiIds: form.scopeType === "api" ? form.apiIds : [],
      },
      reason: form.reason.trim() || undefined,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
      endsAt: new Date(form.endsAt).toISOString(),
    };

    createSilence(payload, {
      onSuccess: () => {
        toast.success("Silence added — matching alerts are muted");
        onClose?.();
      },
      onError: (error) =>
        toast.error(error?.response?.data?.message || "Failed to add silence"),
    });
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Add Silence"
      subtitle="Suppress notifications for a scope during a time window"
      size="sm"
      footer={
        <>
          <Btn onClick={onClose} disabled={isPending}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : "Add Silence"}
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <UiSelect
          label="Silence scope"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UiInput
            label="Start"
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => update("startsAt", e.target.value)}
          />
          <UiInput
            label="End"
            required
            type="datetime-local"
            value={form.endsAt}
            error={errors.endsAt ? "End must be after start" : ""}
            onChange={(e) => {
              update("endsAt", e.target.value);
              clearErr("endsAt");
            }}
          />
        </div>

        <UiInput
          label="Reason"
          value={form.reason}
          placeholder="e.g. Planned maintenance window"
          onChange={(e) => update("reason", e.target.value)}
        />
      </div>
    </FormModal>
  );
};
