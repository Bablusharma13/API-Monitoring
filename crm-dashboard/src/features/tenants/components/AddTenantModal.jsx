import { useState, useEffect, useCallback } from "react";
import {
  User,
  Building2,
  Globe,
  Mail,
  Phone,
  Fingerprint,
  Link,
  Hash,
} from "lucide-react";
import UiInput from "../../../components/ui/Input";
import { useCreateTenantMutation } from "../hooks/query/useCreateTenantMutation";
import { toast } from "sonner";
import FormModal from "../../../components/ui/FormModal";

const INITIAL_FORM = {
  name: "",
  company: "",
  website: "",
  business_email: "",
  phone: "",
  tenant_identity: "",
  login_url: "",
  tenant_company_identity: "",
};


const ModalBtn = ({ children, variant = "default", disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`form-modal-btn ${variant === "primary" ? "form-modal-btn-primary" : ""}`}
  >
    {children}
  </button>
);

export const AddTenantModal = ({ open, onClose }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const { mutate: createTenant, isPending } = useCreateTenantMutation();

  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
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

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.company.trim()) errs.company = "Company is required";
    if (!form.website.trim()) errs.website = "Website is required";
    if (!form.business_email.trim())
      errs.business_email = "Business email is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!form.tenant_identity.trim())
      errs.tenant_identity = "Tenant identity is required";
    if (!form.login_url.trim()) errs.login_url = "Login URL is required";
    if (!form.tenant_company_identity.trim())
      errs.tenant_company_identity = "Tenant company identity is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form };
    createTenant(payload, {
      onSuccess: () => onClose?.(),
      onError: (error) => {
        toast.error(error.response.data.message);
      },
    });
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Add Tenant"
      subtitle="Register a new tenant in the system"
      size="md"
      footer={
        <>
          <ModalBtn onClick={() => onClose?.()}>Cancel</ModalBtn>
          <ModalBtn variant="primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : "Add Tenant"}
          </ModalBtn>
        </>
      }
    >
      <div className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <UiInput
                  label="Name"
                  required
                  icon={<User />}
                  error={errors.name || ""}
                  value={form.name}
                  placeholder="e.g. John Doe"
                  onChange={(e) => {
                    update("name", e.target.value);
                    clearErr("name");
                  }}
                />
                <UiInput
                  label="Company"
                  required
                  icon={<Building2 />}
                  error={errors.company || ""}
                  value={form.company}
                  placeholder="e.g. Acme Inc"
                  onChange={(e) => {
                    update("company", e.target.value);
                    clearErr("company");
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <UiInput
                  label="Website"
                  required
                  icon={<Globe />}
                  error={errors.website || ""}
                  value={form.website}
                  placeholder="e.g. acme.com"
                  onChange={(e) => {
                    update("website", e.target.value);
                    clearErr("website");
                  }}
                />
                <UiInput
                  label="Business Email"
                  required
                  icon={<Mail />}
                  error={errors.business_email || ""}
                  value={form.business_email}
                  placeholder="e.g. john@acme.com"
                  onChange={(e) => {
                    update("business_email", e.target.value);
                    clearErr("business_email");
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <UiInput
                  label="Phone"
                  required
                  icon={<Phone />}
                  error={errors.phone || ""}
                  value={form.phone}
                  placeholder="e.g. 919041925042"
                  onChange={(e) => {
                    update("phone", e.target.value);
                    clearErr("phone");
                  }}
                />
                <UiInput
                  label="Tenant Identity"
                  required
                  icon={<Fingerprint />}
                  error={errors.tenant_identity || ""}
                  value={form.tenant_identity}
                  placeholder="e.g. deepanshu"
                  onChange={(e) => {
                    update("tenant_identity", e.target.value);
                    clearErr("tenant_identity");
                  }}
                />
              </div>

              <UiInput
                label="Login URL"
                required
                icon={<Link />}
                error={errors.login_url || ""}
                value={form.login_url}
                placeholder="e.g. deepanshu.auth.enopsy.xyz"
                onChange={(e) => {
                  update("login_url", e.target.value);
                  clearErr("login_url");
                }}
              />

              <UiInput
                label="Tenant Company Identity"
                required
                icon={<Hash />}
                error={errors.tenant_company_identity || ""}
                value={form.tenant_company_identity}
                placeholder="Company identifier"
                onChange={(e) => {
                  update("tenant_company_identity", e.target.value);
                  clearErr("tenant_company_identity");
                }}
              />
      </div>
    </FormModal>
  );
};
