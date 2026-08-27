import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import FormModal from "../../../components/ui/FormModal";
import UiInput from "../../../components/ui/Input";
import UiSelect from "../../../components/ui/SingleSelect";
import MultiSelect from "../../../formComponents/MultiSelect";
import { useCreateMaintenanceWindowMutation } from "../hooks/query/useCreateMaintenanceWindowMutation";
import { useUpdateMaintenanceWindowMutation } from "../hooks/query/useUpdateMaintenanceWindowMutation";
import { useGetCategoriesOptionsQuery } from "../hooks/query/useGetCategoriesOptionsQuery";
import { useGetApisOptionsQuery } from "../hooks/query/useGetApisOptionsQuery";
import { SCOPE_TYPE_OPTIONS } from "../constants";

const emptyForm = {
  reason: "",
  startsAt: "",
  endsAt: "",
  scopeType: "all",
  categoryIds: [],
  apiIds: [],
};

const idOf = (v) => v?._id ?? v;

// ISO string ↔ <input type="datetime-local"> ("YYYY-MM-DDTHH:mm") in local time
const toDatetimeLocal = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromDatetimeLocal = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const windowToForm = (maintenanceWindow) => {
  if (!maintenanceWindow) return emptyForm;
  return {
    reason: maintenanceWindow.reason || "",
    startsAt: toDatetimeLocal(maintenanceWindow.startsAt),
    endsAt: toDatetimeLocal(maintenanceWindow.endsAt),
    scopeType: maintenanceWindow.scope?.type || "all",
    categoryIds: (maintenanceWindow.scope?.categoryIds || []).map(idOf),
    apiIds: (maintenanceWindow.scope?.apiIds || []).map(idOf),
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

export const MaintenanceWindowFormModal = ({
  open,
  onClose,
  maintenanceWindow,
}) => {
  const isEdit = !!maintenanceWindow?._id;
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const { mutate: createWindow, isPending: creating } =
    useCreateMaintenanceWindowMutation();
  const { mutate: updateWindow, isPending: updating } =
    useUpdateMaintenanceWindowMutation();
  const isPending = creating || updating;

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
      setForm(windowToForm(maintenanceWindow));
      setErrors({});
    }
  }, [open, maintenanceWindow]);

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
    if (!form.reason.trim()) errs.reason = true;
    if (!form.startsAt) errs.startsAt = true;
    if (!form.endsAt) errs.endsAt = true;
    if (
      form.startsAt &&
      form.endsAt &&
      new Date(form.startsAt).getTime() >= new Date(form.endsAt).getTime()
    ) {
      errs.endsAt = true;
      errs.range = true;
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = {
      reason: form.reason.trim(),
      startsAt: fromDatetimeLocal(form.startsAt),
      endsAt: fromDatetimeLocal(form.endsAt),
      scope: {
        type: form.scopeType,
        categoryIds: form.scopeType === "category" ? form.categoryIds : [],
        apiIds: form.scopeType === "api" ? form.apiIds : [],
      },
    };

    const onError = (error) =>
      toast.error(
        error?.response?.data?.message || "Failed to save maintenance window",
      );
    const onSuccess = () => {
      toast.success(
        isEdit ? "Maintenance window updated" : "Maintenance window created",
      );
      onClose?.();
    };

    if (isEdit) {
      updateWindow(
        { id: maintenanceWindow._id, payload },
        { onSuccess, onError },
      );
    } else {
      createWindow(payload, { onSuccess, onError });
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Maintenance Window" : "New Maintenance Window"}
      subtitle="Suppress alerts for a planned window of downtime"
      size="md"
      footer={
        <>
          <Btn onClick={onClose} disabled={isPending}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Window"}
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
        <UiInput
          label="Reason"
          required
          value={form.reason}
          placeholder="e.g. Scheduled database migration"
          error={errors.reason ? "Reason is required" : ""}
          onChange={(e) => {
            update("reason", e.target.value);
            clearErr("reason");
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UiInput
            label="Starts At"
            required
            type="datetime-local"
            value={form.startsAt}
            error={errors.startsAt ? "Start time is required" : ""}
            onChange={(e) => {
              update("startsAt", e.target.value);
              clearErr("startsAt");
              clearErr("range");
            }}
          />
          <UiInput
            label="Ends At"
            required
            type="datetime-local"
            value={form.endsAt}
            error={
              errors.range
                ? "Must be after the start time"
                : errors.endsAt
                  ? "End time is required"
                  : ""
            }
            onChange={(e) => {
              update("endsAt", e.target.value);
              clearErr("endsAt");
              clearErr("range");
            }}
          />
        </div>

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
      </div>
    </FormModal>
  );
};
