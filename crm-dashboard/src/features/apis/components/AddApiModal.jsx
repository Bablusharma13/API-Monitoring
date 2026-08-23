import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Tag,
  GitBranch,
  Globe,
  AlignLeft,
  Cpu,
  FolderOpen,
  User,
  Clock,
  Timer,
  KeyRound,
} from "lucide-react";
import { useCreateApiMutation } from "../hooks/query/useCreateApiMutation";
import { useGetCategoriesListQuery } from "../../categories/hooks/query/useGetCategoriesListQuery";
import { useTeamMembersQuery } from "../../categories/hooks/query/useTeamMembersQuery";
import AvatarSelect from "../../../components/ui/AvatarSelect";
import UiInput from "../../../components/ui/Input";
import { isValidUrl } from "../../../utils/helpers";
import SingleSelect from "../../../components/ui/SingleSelect";
import { TextareaField } from "../../../components/ui/TextArea";
import FormModal from "../../../components/ui/FormModal";

const FREQ_CRON = {
  "1 min": "*/1 * * * *",
  "2 min": "*/2 * * * *",
  "5 min": "*/5 * * * *",
  "10 min": "*/10 * * * *",
  "30 min": "*/30 * * * *",
  hourly: "0 * * * *",
};

const FREQ_LABEL = {
  "1 min": "Every 1 min",
  "2 min": "Every 2 min",
  "5 min": "Every 5 min",
  "10 min": "Every 10 min",
  "30 min": "Every 30 min",
  hourly: "Hourly",
};

const AUTH_METHOD = {
  None: null,
  "Bearer Token": "Bearer",
};

const STATUS_CODE_MAP = {
  200: 200,
  201: 201,
  204: 204,
  "Any 2xx": 200,
};

function buildPayload(form) {
  const headers = {};
  form.headers.forEach(({ key, value }) => {
    if (key.trim()) headers[key.trim()] = value;
  });

  const params = {};
  form.params.forEach(({ key, value }) => {
    if (key.trim()) params[key.trim()] = value;
  });

  const authMethod = AUTH_METHOD[form.auth];
  const auth = authMethod
    ? {
        method: authMethod,
        ...(form.auth === "Bearer Token" && { token: form.bearerToken }),
        ...(form.auth === "API Key" && {
          headerName: form.apiKeyName,
          token: form.apiKeyValue,
        }),
        ...(form.auth === "Basic Auth" && {
          username: form.basicUser,
          password: form.basicPass,
        }),
      }
    : undefined;

  const compliance = form.compliance
    ? form.compliance
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return {
    name: form.name,
    version: form.version || undefined,
    category: form.category || undefined,
    owner: form.owner || undefined,
    tags: form.tags,
    notes: form.description || undefined,
    request: {
      url: form.url.startsWith("http") ? form.url : `https://${form.url}`,
      method: form.method,
      headers: Object.keys(headers).length ? headers : undefined,
      params: Object.keys(params).length ? params : undefined,
      ...(BODY_METHODS.includes(form.method) && form.body.trim()
        ? {
            body: (() => {
              try {
                return JSON.parse(form.body);
              } catch {
                return form.body;
              }
            })(),
          }
        : {}),
    },
    type: form.type,
    mode: form.mode,
    tech: form.tech || undefined,
    compliance,
    ...(auth && { auth }),
    monitoring: {
      enabled: true,
      frequency: FREQ_CRON[form.freq] || "*/1 * * * *",
      frequencyLabel: FREQ_LABEL[form.freq] || form.freq,
      timeout: Number(form.timeout),
      expectedStatus: STATUS_CODE_MAP[form.statusCode] ?? 200,
    },
    alertChannels: ["email"],
  };
}

// ── Icons ─────────────────────────────────────────────────────────────────────
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

const ChevronRight = () => <Icon d="M9 18l6-6-6-6" />;
const ChevronLeft = () => <Icon d="M15 18l-6-6 6-6" />;
const X = () => <Icon d="M18 6L6 18M6 6l12 12" />;
const Check = () => <Icon d="M20 6L9 17l-5-5" stroke={2.5} />;
const Plus = () => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
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

// ── Constants ─────────────────────────────────────────────────────────────────
const STEPS = ["Basic Info", "Configuration", "Auth & Headers", "Review"];

const METHODS = [
  { label: "GET", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { label: "POST", color: "#2563eb", bg: "#eff4ff", border: "#c7d9fb" },
  { label: "PUT", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { label: "DELETE", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  { label: "PATCH", color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
];

const TYPES = ["Public", "Private", "Internal", "External"];
const MODES = ["Live", "Test"];
const AUTH_TYPES = ["None", "Bearer Token"];
const STATUS_CODES = ["200", "201", "204", "Any 2xx"];

const TECHS = [
  "Laravel",
  "Node.js",
  "Python",
  "Go",
  "Java",
  "Django",
  "FastAPI",
  "Ruby on Rails",
  "Other",
];
const FREQS = [
  { value: "1 min", label: "Every 1 minute" },
  { value: "2 min", label: "Every 2 minutes" },
  { value: "5 min", label: "Every 5 minutes" },
  { value: "10 min", label: "Every 10 minutes" },
  { value: "30 min", label: "Every 30 minutes" },
  { value: "hourly", label: "Hourly" },
];

const BODY_METHODS = ["POST", "PUT", "PATCH"];

const INITIAL_FORM = {
  name: "",
  url: "",
  version: "",
  description: "",
  method: "GET",
  type: "Public",
  mode: "Live",
  tech: "",
  category: "",
  owner: "",
  team: "",
  freq: "1 min",
  compliance: "",
  timeout: "5000",
  tags: [],
  auth: "None",
  bearerToken: "",
  apiKeyName: "X-API-Key",
  apiKeyValue: "",
  basicUser: "",
  basicPass: "",
  statusCode: "200",
  headers: [{ key: "", value: "" }],
  params: [],
  body: "",
};

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldLabel = ({ children, required }) => (
  <label
    style={{
      fontSize: 11.5,
      fontWeight: 500,
      color: "#6b7280",
      display: "flex",
      alignItems: "center",
      gap: 4,
      marginBottom: 5,
    }}
  >
    {children}
    {required && <span style={{ color: "#dc2626", fontSize: 10 }}>*</span>}
  </label>
);

const ToggleGroup = ({ options, value, onChange, getColor }) => (
  <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
    {options.map((opt) => {
      const label = typeof opt === "string" ? opt : opt.label;
      const active = value === label;
      const color = getColor ? getColor(label) : null;
      return (
        <button
          key={label}
          onClick={() => onChange(label)}
          style={{
            padding: "6px 13px",
            borderRadius: 20,
            fontSize: 12.5,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all .14s",
            border: "1px solid",
            borderColor: active ? color?.border || "#2563eb" : "#e9ebf0",
            background: active ? color?.bg || "#eff4ff" : "#fff",
            color: active ? color?.color || "#2563eb" : "#6b7280",
            fontWeight: active ? 500 : 400,
          }}
        >
          {label}
        </button>
      );
    })}
  </div>
);

const Badge = ({ children, variant = "gray" }) => {
  const variants = {
    gray: { bg: "#f3f4f6", color: "#4b5563", border: "#e5e7eb" },
    blue: { bg: "#eff4ff", color: "#2563eb", border: "#c7d9fb" },
    green: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
    amber: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    red: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    purple: { bg: "#f5f3ff", color: "#7c3aed", border: "#c4b5fd" },
    cyan: { bg: "#ecfeff", color: "#0891b2", border: "#a5f3fc" },
  };
  const v = variants[variant] || variants.gray;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 20,
        fontSize: 11,
        background: v.bg,
        color: v.color,
        border: `1px solid ${v.border}`,
      }}
    >
      {children}
    </span>
  );
};

const SummaryRow = ({ label, children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "5px 0",
      borderBottom: "1px solid #f3f5f9",
    }}
  >
    <span style={{ fontSize: 12, color: "#6b7280" }}>{label}</span>
    <div
      style={{
        fontSize: 12.5,
        color: "#1c1f2e",
        fontWeight: 500,
        textAlign: "right",
        maxWidth: 280,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {children}
    </div>
  </div>
);

const ErrMsg = ({ show, children }) =>
  show ? (
    <span style={{ fontSize: 11, color: "#dc2626", marginTop: 3 }}>
      {children}
    </span>
  ) : null;

const Hint = ({ children }) => (
  <span style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
    {children}
  </span>
);

const KVRow = ({ row, onChange, onRemove }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_28px] gap-1.5 items-start">
    <UiInput
      placeholder="Key"
      value={row.key}
      onChange={(e) => onChange("key", e.target.value)}
    />
    <UiInput
      placeholder="Value"
      value={row.value}
      onChange={(e) => onChange("value", e.target.value)}
    />
    <button
      onClick={onRemove}
      style={{
        width: 28,
        height: 36,
        border: "1px solid #fecaca",
        background: "#fef2f2",
        borderRadius: 7,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#dc2626",
        fontSize: 16,
        flexShrink: 0,
        transition: "all .13s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#dc2626";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#fef2f2";
        e.currentTarget.style.color = "#dc2626";
      }}
    >
      ×
    </button>
  </div>
);

const AddRowBtn = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 12,
      color: "#2563eb",
      cursor: "pointer",
      background: "none",
      border: "none",
      fontFamily: "inherit",
      padding: 0,
      marginTop: 6,
    }}
  >
    <Plus />
    {children}
  </button>
);

const Btn = ({ children, variant = "default", disabled, onClick, style }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`form-modal-btn ${variant === "primary" ? "form-modal-btn-primary" : ""}`}
    style={style}
  >
    {children}
  </button>
);

// ── Step Bar ─────────────────────────────────────────────────────────────────
const StepBar = ({ current }) => (
  <div className="form-modal-step-bar">
    {STEPS.map((label, i) => {
      const step = i + 1;
      const done = step < current;
      const active = step === current;
      return (
        <div
          key={step}
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10.5,
                fontWeight: 600,
                flexShrink: 0,
                transition: "all .2s",
                border: `2px solid ${done ? "#16a34a" : active ? "#2563eb" : "#e9ebf0"}`,
                background: done ? "#16a34a" : active ? "#2563eb" : "#fff",
                color: done || active ? "#fff" : "#6b7280",
              }}
            >
              {done ? <Check /> : step}
            </div>
            <span
              style={{
                fontSize: 11.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: done ? "#16a34a" : active ? "#2563eb" : "#6b7280",
                fontWeight: active ? 500 : 400,
              }}
            >
              {label}
            </span>
          </div>
          {step < STEPS.length && (
            <div
              style={{
                flex: 1,
                height: 1,
                background: done ? "#16a34a" : "#e9ebf0",
                margin: "0 8px",
                transition: "background .2s",
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

// ── Steps ────────────────────────────────────────────────────────────────────
const Step1 = ({ form, errors, update, clearErr }) => {
  const methodColor = (m) => METHODS.find((x) => x.label === m);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <UiInput
          label="API Name"
          required
          icon={<Tag />}
          error={errors.name ? "API name is required" : ""}
          value={form.name}
          placeholder="e.g. payment-api"
          onChange={(e) => {
            update("name", e.target.value);
            clearErr("name");
          }}
        />
        <UiInput
          label="Version"
          required
          icon={<GitBranch />}
          value={form.version}
          placeholder="e.g. v2.0.1"
          error={errors.version ? "Enter a valid version like v1.0.0" : ""}
          onChange={(e) => {
            update("version", e.target.value);
            clearErr("version");
          }}
        />
      </div>

      <UiInput
        label="API URL"
        required
        icon={<Globe />}
        error={errors.url ? "A valid URL starting with http:// or https:// is required" : ""}
        value={form.url}
        placeholder="https://api.example.com/v1/endpoint"
        onChange={(e) => {
          update("url", e.target.value);
          clearErr("url");
        }}
      />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <FieldLabel required>Method</FieldLabel>
        <ToggleGroup
          options={METHODS}
          value={form.method}
          onChange={(v) => update("method", v)}
          getColor={methodColor}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <FieldLabel>Type</FieldLabel>
          <ToggleGroup
            options={TYPES}
            value={form.type}
            onChange={(v) => update("type", v)}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <FieldLabel>Mode</FieldLabel>
          <ToggleGroup
            options={MODES}
            value={form.mode}
            onChange={(v) => update("mode", v)}
          />
        </div>
      </div>

      <TextareaField
        label="Description"
        icon={<AlignLeft />}
        value={form.description}
        placeholder="Brief description of what this API does…"
        rows={3}
        onChange={(e) => update("description", e.target.value)}
      />
    </div>
  );
};

const Step2 = ({
  form,
  errors,
  update,
  clearErr,
  categories,
  teamMembers,
  loadingMembers,
}) => {
  const memberOptions = useMemo(
    () =>
      teamMembers.map((m) => ({
        value: m._id,
        label: m.name,
        sub: m.email,
        avatar: m.image_url,
      })),
    [teamMembers],
  );
  const [tagInput, setTagInput] = useState("");

  const addTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.replace(",", "").trim();
      if (val && !form.tags.includes(val)) update("tags", [...form.tags, val]);
      setTagInput("");
    }
  };
  const removeTag = (tag) =>
    update(
      "tags",
      form.tags.filter((t) => t !== tag),
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SingleSelect
          label="Tech Stack"
          required
          icon={<Cpu />}
          placeholder="Select tech…"
          options={TECHS.map((t) => ({ value: t, label: t }))}
          value={form.tech}
          onChange={(e) => {
            update("tech", e.target.value);
            clearErr("tech");
          }}
          error={errors.tech ? "Tech stack is required" : ""}
        />
        <SingleSelect
          label="Category"
          required
          icon={<FolderOpen />}
          placeholder="Select category…"
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
          value={form.category}
          onChange={(e) => {
            update("category", e.target.value);
            clearErr("category");
          }}
          error={errors.category ? "Category is required" : ""}
        />
      </div>

      <div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <AvatarSelect
            label="Responsible Person"
            required
            icon={<User />}
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
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SingleSelect
          label="Check Frequency"
          icon={<Clock />}
          options={FREQS}
          value={form.freq}
          onChange={(e) => update("freq", e.target.value)}
        />
        {/* <div style={{ display: "flex", flexDirection: "column" }}> */}
        {/*   <FieldLabel>Compliance</FieldLabel> */}
        {/*   <Input */}
        {/*     value={form.compliance} */}
        {/*     placeholder="e.g. SOC2, ISO 27001, GDPR" */}
        {/*     onChange={(e) => update("compliance", e.target.value)} */}
        {/*   /> */}
        {/* </div> */}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <UiInput
          label="Timeout (ms)"
          required
          icon={<Timer />}
          type="number"
          value={form.timeout}
          error={errors.timeout ? "Enter a value between 100 and 30000" : ""}
          onChange={(e) => {
            update("timeout", e.target.value);
            clearErr("timeout");
          }}
        />
        <Hint>
          Request will be flagged as failed if it exceeds this duration
        </Hint>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <FieldLabel>Tags</FieldLabel>
        <div
          style={{
            border: "1px solid #e9ebf0",
            borderRadius: 8,
            padding: "6px 10px",
            display: "flex",
            flexWrap: "wrap",
            gap: 5,
            cursor: "text",
            background: "#fff",
            minHeight: 42,
            alignItems: "center",
          }}
          onClick={() => document.getElementById("syb-tag-input")?.focus()}
        >
          {form.tags.map((tag) => (
            <span
              key={tag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "#eff4ff",
                color: "#2563eb",
                border: "1px solid #c7d9fb",
                borderRadius: 20,
                padding: "2px 8px",
                fontSize: 11.5,
              }}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  padding: 0,
                  lineHeight: 1,
                  fontSize: 13,
                  opacity: 0.7,
                }}
              >
                ×
              </button>
            </span>
          ))}
          <input
            id="syb-tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder={form.tags.length === 0 ? "Type and press Enter…" : ""}
            style={{
              border: "none",
              outline: "none",
              fontFamily: "inherit",
              fontSize: 12.5,
              color: "#1c1f2e",
              background: "transparent",
              minWidth: 100,
              flex: 1,
            }}
          />
        </div>
        <Hint>Press Enter or comma to add a tag</Hint>
      </div>
    </div>
  );
};

const Step3 = ({ form, update }) => {
  const [bodyError, setBodyError] = useState(null);
  const updateHeader = (i, field, val) => {
    const next = [...form.headers];
    next[i] = { ...next[i], [field]: val };
    update("headers", next);
  };
  const addHeader = () =>
    update("headers", [...form.headers, { key: "", value: "" }]);
  const removeHeader = (i) =>
    update(
      "headers",
      form.headers.filter((_, j) => j !== i),
    );

  const updateParam = (i, field, val) => {
    const next = [...form.params];
    next[i] = { ...next[i], [field]: val };
    update("params", next);
  };
  const addParam = () =>
    update("params", [...form.params, { key: "", value: "" }]);
  const removeParam = (i) =>
    update(
      "params",
      form.params.filter((_, j) => j !== i),
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <FieldLabel>Auth Type</FieldLabel>
        <ToggleGroup
          options={AUTH_TYPES}
          value={form.auth}
          onChange={(v) => update("auth", v)}
        />
      </div>

      {form.auth === "Bearer Token" && (
        <UiInput
          label="Bearer Token"
          icon={<KeyRound />}
          type="password"
          value={form.bearerToken}
          placeholder="eyJhbGciOiJSUzI1NiIsIn…"
          onChange={(e) => update("bearerToken", e.target.value)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <FieldLabel>Custom Headers</FieldLabel>
          <AddRowBtn onClick={addHeader}>Add header</AddRowBtn>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {form.headers.map((row, i) => (
            <KVRow
              key={i}
              row={row}
              onChange={(field, val) => updateHeader(i, field, val)}
              onRemove={() => removeHeader(i)}
            />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <FieldLabel>
            Query Params{" "}
            <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 400 }}>
              (GET requests)
            </span>
          </FieldLabel>
          <AddRowBtn onClick={addParam}>Add param</AddRowBtn>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {form.params.map((row, i) => (
            <KVRow
              key={i}
              row={row}
              onChange={(field, val) => updateParam(i, field, val)}
              onRemove={() => removeParam(i)}
            />
          ))}
          {form.params.length === 0 && (
            <div style={{ fontSize: 12, color: "#c2c8d4", padding: "8px 0" }}>
              No query params added yet
            </div>
          )}
        </div>
      </div>

      {BODY_METHODS.includes(form.method) && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <FieldLabel>Request Body (JSON)</FieldLabel>
            {bodyError && (
              <span style={{ fontSize: 11, color: "#d97706" }}>
                Invalid JSON — will be sent as plain text
              </span>
            )}
          </div>
          <textarea
            value={form.body}
            placeholder={'{\n  "key": "value"\n}'}
            rows={6}
            onChange={(e) => {
              update("body", e.target.value);
              try {
                if (e.target.value.trim()) JSON.parse(e.target.value);
                setBodyError(null);
              } catch {
                setBodyError(true);
              }
            }}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: `1px solid ${bodyError ? "#fde68a" : "#e9ebf0"}`,
              borderRadius: 8,
              fontFamily: "monospace",
              fontSize: 12,
              color: "#1c1f2e",
              background: bodyError ? "#fffbeb" : "#fff",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              lineHeight: 1.6,
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        <FieldLabel>Expected Status Code</FieldLabel>
        <ToggleGroup
          options={STATUS_CODES}
          value={form.statusCode}
          onChange={(v) => update("statusCode", v)}
          getColor={() => ({
            color: "#16a34a",
            bg: "#f0fdf4",
            border: "#bbf7d0",
          })}
        />
      </div>
    </div>
  );
};

const Step4 = ({ form, teamMembers }) => {
  const methodVariant = {
    GET: "green",
    POST: "blue",
    PUT: "amber",
    DELETE: "red",
    PATCH: "purple",
  };
  const SummarySection = ({ title, children }) => (
    <div
      style={{
        background: "#fafbfc",
        border: "1px solid #e9ebf0",
        borderRadius: 10,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#6b7280",
          textTransform: "uppercase",
          letterSpacing: ".07em",
          borderBottom: "1px solid #e9ebf0",
          paddingBottom: 6,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          background: "#eff4ff",
          border: "1px solid #c7d9fb",
          borderRadius: 10,
          padding: "11px 14px",
          display: "flex",
          alignItems: "center",
          gap: 9,
          fontSize: 12.5,
          color: "#2563eb",
        }}
      >
        <svg
          width={14}
          height={14}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Review your API configuration before submitting. You can go back to edit
        any section.
      </div>

      <SummarySection title="Basic Info">
        <SummaryRow label="Name">{form.name || "—"}</SummaryRow>
        <SummaryRow label="URL">
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11.5,
              color: "#6b7280",
            }}
          >
            https://{form.url || "—"}
          </span>
        </SummaryRow>
        <SummaryRow label="Version">{form.version || "—"}</SummaryRow>
        <SummaryRow label="Method">
          <Badge variant={methodVariant[form.method] || "gray"}>
            {form.method}
          </Badge>
        </SummaryRow>
        <SummaryRow label="Type">{form.type}</SummaryRow>
        <SummaryRow label="Mode">{form.mode}</SummaryRow>
      </SummarySection>

      <SummarySection title="Configuration">
        <SummaryRow label="Tech">
          {form.tech ? <Badge variant="cyan">{form.tech}</Badge> : "—"}
        </SummaryRow>
        <SummaryRow label="Category">{form.category || "—"}</SummaryRow>
        <SummaryRow label="Owner">
          {teamMembers.find((m) => m._id === form.owner)?.name || "—"}
        </SummaryRow>
        <SummaryRow label="Frequency">Every {form.freq}</SummaryRow>
        <SummaryRow label="Timeout">{form.timeout}ms</SummaryRow>
        <SummaryRow label="Compliance">{form.compliance || "—"}</SummaryRow>
        <SummaryRow label="Tags">
          {form.tags.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {form.tags.map((t) => (
                <Badge key={t} variant="gray">
                  {t}
                </Badge>
              ))}
            </div>
          ) : (
            "—"
          )}
        </SummaryRow>
      </SummarySection>

      <SummarySection title="Auth & Monitoring">
        <SummaryRow label="Auth Type">{form.auth}</SummaryRow>
        <SummaryRow label="Expected Status">
          <Badge variant="green">{form.statusCode}</Badge>
        </SummaryRow>
        <SummaryRow label="Custom Headers">
          {form.headers.filter((h) => h.key).length} defined
        </SummaryRow>
        {BODY_METHODS.includes(form.method) && (
          <SummaryRow label="Request Body">
            {form.body.trim() ? (
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#6b7280",
                }}
              >
                {form.body.trim().length > 60
                  ? form.body.trim().slice(0, 60) + "…"
                  : form.body.trim()}
              </span>
            ) : (
              "—"
            )}
          </SummaryRow>
        )}
      </SummarySection>
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
export const AddApiModal = ({ open, onClose }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const { mutate: createApi, isPending } = useCreateApiMutation();
  const { data: categories = [] } = useGetCategoriesListQuery();
  const { data: teamMembers = [], isLoading: loadingMembers } =
    useTeamMembersQuery();

  // Reset form when modal opens so there's no setTimeout running state updates
  useEffect(() => {
    if (open) {
      setStep(1);
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

  const hasValidHostname = (url) => {
    try {
      const { hostname } = new URL(url);
      return hostname.includes(".") || hostname === "localhost" || hostname === "127.0.0.1";
    } catch {
      return false;
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    if (!form.url.trim()) {
      errs.url = true;
    } else {
      const urlToCheck = form.url.startsWith("http") ? form.url : `https://${form.url}`;
      if (!isValidUrl(urlToCheck) || !hasValidHostname(urlToCheck)) {
        errs.url = true;
      }
    }
    if (!form.version.trim()) {
      errs.version = true;
    } else if (!/^v?\d+\.\d+\.\d+([-+][\w.]+)?$/i.test(form.version.trim())) {
      errs.version = true;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.tech) errs.tech = true;
    if (!form.category) errs.category = true;
    if (!form.owner) errs.owner = true;
    const timeoutNum = Number(form.timeout);
    if (!form.timeout.toString().trim() || isNaN(timeoutNum) || timeoutNum < 100 || timeoutNum > 30000) {
      errs.timeout = true;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (step === 1 && !validate()) return;
    if (step === 2 && !validateStep2()) return;
    if (step < 4) setStep((s) => s + 1);
    else handleSubmit();
  };
  const prev = () => setStep((s) => s - 1);

  const handleSubmit = () => {
    const payload = buildPayload(form);
    createApi(payload, {
      onSuccess: () => handleClose(),
    });
  };

  const handleClose = () => {
    onClose?.();
  };

  if (!open) return null;

  return (
    <FormModal
      open={open}
      onClose={handleClose}
      title="Add New API"
      subtitle="Register and configure an API endpoint for monitoring"
      size="lg"
      headerExtra={<StepBar current={step} />}
      footer={
        <>
          {step > 1 && (
            <Btn onClick={prev}>
              <ChevronLeft /> Back
            </Btn>
          )}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <Btn onClick={handleClose}>Cancel</Btn>
            <Btn variant="primary" disabled={isPending} onClick={next}>
              {isPending ? (
                <>
                  <Spinner /> Saving…
                </>
              ) : step === 4 ? (
                <>
                  <Check /> Submit API
                </>
              ) : (
                <>
                  Next <ChevronRight />
                </>
              )}
            </Btn>
          </div>
        </>
      }
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {step === 1 && (
        <Step1
          form={form}
          errors={errors}
          update={update}
          clearErr={clearErr}
        />
      )}
      {step === 2 && (
        <Step2
          form={form}
          errors={errors}
          update={update}
          clearErr={clearErr}
          categories={categories}
          teamMembers={teamMembers}
          loadingMembers={loadingMembers}
        />
      )}
      {step === 3 && <Step3 form={form} update={update} />}
      {step === 4 && <Step4 form={form} teamMembers={teamMembers} />}
    </FormModal>
  );
};
