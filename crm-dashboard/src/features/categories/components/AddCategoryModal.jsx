import { useState, useEffect, useCallback, useMemo } from "react";
import { Tag, AlignLeft, User } from "lucide-react";
import { useCreateCategoryMutation } from "../hooks/query/useCreateCategoryMutation";
import { useTeamMembersQuery } from "../hooks/query/useTeamMembersQuery";
import AvatarSelect from "../../../components/ui/AvatarSelect";
import UiInput from "../../../components/ui/Input";
import { TextareaField } from "../../../components/ui/TextArea";
import FormModal from "../../../components/ui/FormModal";

const INITIAL_FORM = {
  name: "",
  description: "",
  owner: "",
  tags: [],
};

const Icon = ({ d, size = 14, stroke = 2 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
  </svg>
);

const Check = () => <Icon d="M20 6L9 17l-5-5" stroke={2.5} />;
const Spinner = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    style={{ animation: "spin .75s linear infinite" }}
  >
    <circle cx="12" cy="12" r="10" strokeOpacity=".2" />
    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
  </svg>
);

const Hint = ({ children }) => (
  <span className="form-modal-hint">{children}</span>
);

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

export const AddCategoryModal = ({ open, onClose }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");

  const { mutate: createCategory, isPending } = useCreateCategoryMutation();
  const { data: teamMembers = [], isLoading: loadingMembers } = useTeamMembersQuery();

  const memberOptions = useMemo(
    () => teamMembers.map((m) => ({ value: m._id, label: m.name, sub: m.email, avatar: m.avatar })),
    [teamMembers],
  );

  useEffect(() => {
    if (open) {
      setForm(INITIAL_FORM);
      setErrors({});
      setTagInput("");
    }
  }, [open]);

  const update = useCallback((key, val) => setForm((f) => ({ ...f, [key]: val })), []);
  const clearErr = useCallback((key) => setErrors((e) => ({ ...e, [key]: false })), []);

  const addTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.replace(",", "").trim();
      if (val && !form.tags.includes(val)) update("tags", [...form.tags, val]);
      setTagInput("");
    }
  };
  const removeTag = (tag) => update("tags", form.tags.filter((t) => t !== tag));

  const handleSubmit = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    if (!form.owner) errs.owner = true;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      owner: form.owner || undefined,
      tags: form.tags,
    };
    createCategory(payload, { onSuccess: () => onClose?.() });
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="New Category"
      subtitle="Organise your APIs under a named category"
      size="md"
      footer={
        <>
          <Btn onClick={onClose} disabled={isPending}>
            Cancel
          </Btn>
          <Btn variant="primary" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Spinner /> Saving…
              </>
            ) : (
              <>
                <Check /> Save Category
              </>
            )}
          </Btn>
        </>
      }
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div className="flex flex-col gap-3.5">
        <UiInput
          label="Category Name"
          required
          icon={<Tag />}
          error={errors.name ? "Category name is required" : ""}
          value={form.name}
          placeholder="e.g. Payments"
          onChange={(e) => {
            update("name", e.target.value);
            clearErr("name");
          }}
        />

        <TextareaField
          label="Description"
          icon={<AlignLeft />}
          value={form.description}
          placeholder="What APIs belong to this category?"
          rows={3}
          onChange={(e) => update("description", e.target.value)}
        />

        <AvatarSelect
          label="Responsible Person"
          icon={<User />}
          required
          placeholder={loadingMembers ? "Loading…" : "Assign owner…"}
          options={memberOptions}
          value={form.owner}
          onChange={(val) => {
            update("owner", val);
            clearErr("owner");
          }}
          disabled={loadingMembers}
          error={errors.owner ? "Responsible person is required" : ""}
        />

        <div className="flex flex-col">
          <label className="text-[11.5px] font-medium text-stone-400 dark:text-stone-400 mb-1.5 flex items-center gap-1">
            Tags
          </label>
          <div
            className="form-modal-tag-field"
            onClick={() => document.getElementById("cat-tag-input")?.focus()}
          >
            {form.tags.map((tag) => (
              <span key={tag} className="form-modal-tag-chip">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="bg-transparent border-none cursor-pointer opacity-70 leading-none p-0 text-inherit"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="cat-tag-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder={form.tags.length === 0 ? "billing, critical, external…" : ""}
              className="form-modal-tag-input"
            />
          </div>
          <Hint>Press Enter or comma to add a tag</Hint>
        </div>
      </div>
    </FormModal>
  );
};
