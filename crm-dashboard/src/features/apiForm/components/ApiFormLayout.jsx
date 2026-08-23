"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/SingleSelect";
import { TextareaField } from "../../../components/ui/TextArea";
import AvatarSelect from "../../../components/ui/AvatarSelect";
import SkillsTagsInput from "../../../formComponents/SkillsTagsInput";
import { InfoCard } from "../../../components/ui/InfoCard";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import ApiTestModal from "../../../components/ui/Modal";
import Button from "../../../components/ButtonComponents/Button";
import { Button as UiButton } from "../../../components/ui/Button";
import { AlertDialog } from "../../../components/ui/AlertDialog";
import {
  Copy,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Tag,
  Hash,
  Globe,
  Layers,
  FolderOpen,
  Activity,
  Code2,
  TrendingUp,
  Clock,
  Timer,
  CheckSquare,
  Zap,
  Key,
  Lock,
  Shield,
  User,
  Fingerprint,
  FileText,
  AlertTriangle,
  Users,
  ArrowUpCircle,
  ShieldCheck,
  Server,
  Calendar,
  PowerOff,
  Power,
  X,
} from "lucide-react";
import ApiFormSidePanel from "./ApiFormSidePanel";
import { useApiDetailsQuery } from "../../apiDetails/hooks/useApiDetailsQuery";
import { useUpdateApiMutation } from "../../apis/hooks/query/useUpdateApiMutation";
import { useDisableApiMutation } from "../../apis/hooks/query/useDisableApiMutation";
import { useDeleteApiMutation } from "../../apis/hooks/query/useDeleteApiMutation";
import { useTeamMembersQuery } from "../../categories/hooks/query/useTeamMembersQuery";
import { useGetCategoriesListQuery } from "../../categories/hooks/query/useGetCategoriesListQuery";
import {
  BellIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  InfoCircleIcon,
  LockIcon,
  PulseWaveIcon,
  SettingsIcon,
  ShieldIcon,
  UsersIcon,
} from "../../../components/ui/AppIcons";

// ─── Shared micro-components ──────────────────────────────────────────────────

const FieldLabel = ({ children, required }) => (
  <p className="text-[12px] text-[#6b7280] mb-[5px] flex items-center gap-1">
    {children}
    {required && <span className="text-red-500 text-[11px]">*</span>}
  </p>
);

const HelperText = ({ children }) => (
  <p className="mt-1 text-[11.5px] text-[#6b7280]">{children}</p>
);

const Divider = () => <div className="border-t border-[#f3f5f9] my-4" />;

const RequiredBadge = () => (
  <span className="text-[11px] text-[#215bcf] border border-[#2563eb] rounded-full px-3 py-[2px] bg-blue-200">
    Required
  </span>
);

/** Toggle row with label + subtitle + switch */
const ToggleRow = ({ label, sub, checked, onChange, disabled }) => (
  <div className="flex items-center justify-between py-[9px] border-b border-[#f3f5f9] last:border-b-0">
    <div>
      <div className="text-[13px] text-[#1c1f2e]">{label}</div>
      {sub && (
        <div className="text-[11.5px] text-[#6b7280] mt-[2px]">{sub}</div>
      )}
    </div>
    <label className={`relative w-9 h-5 shrink-0 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={disabled ? undefined : onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="absolute inset-0 bg-[#e5e7eb] rounded-full transition-colors peer-checked:bg-[#2563eb]" />
      <div className="absolute top-[3px] left-[3px] w-[14px] h-[14px] bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
    </label>
  </div>
);

const METHOD_STYLES = {
  GET: {
    bg: "#f0fdf4",
    text: "#16a34a",
    border: "#bbf7d0",
    divider: "#bbf7d0",
  },
  POST: {
    bg: "#eff4ff",
    text: "#2563eb",
    border: "#c7d9fb",
    divider: "#c7d9fb",
  },
  PUT: {
    bg: "#fffbeb",
    text: "#d97706",
    border: "#fde68a",
    divider: "#fde68a",
  },
  DELETE: {
    bg: "#fef2f2",
    text: "#dc2626",
    border: "#fecaca",
    divider: "#fecaca",
  },
  PATCH: {
    bg: "#f5f3ff",
    text: "#7c3aed",
    border: "#c4b5fd",
    divider: "#c4b5fd",
  },
};
const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"];

/** Combined method selector + URL input + copy button */
const UrlMethodInput = ({ method, onMethodChange, value, onChange, error }) => {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const ms = METHOD_STYLES[method] || METHOD_STYLES.GET;

  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const copy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const borderColor = error ? "#f87171" : focused ? "#2563eb" : "#e9ebf0";
  const boxShadow = focused
    ? error
      ? "0 0 0 3px rgba(248,113,113,0.15)"
      : "0 0 0 3px rgba(37,99,235,0.08)"
    : "none";

  return (
    <div className="w-full">
      {/* Floating label wrapper */}
      <div className="relative">
        <span className="absolute -top-[9px] left-2.5 px-1 flex items-center gap-1 text-[11px] leading-none bg-white text-gray-500 z-[1]">
          <Globe size={11} className="text-blue-500" />
          API URL / Endpoint
          <span className="text-red-500">*</span>
        </span>

        <div
          className="flex items-stretch rounded-lg border transition-all duration-200"
          style={{
            borderColor,
            boxShadow,
            transition: "border-color .15s, box-shadow .15s",
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {/* Method selector */}
          <div className="shrink-0">
            <button
              ref={buttonRef}
              type="button"
              onClick={openDropdown}
              className="flex items-center gap-1.5 px-3 h-full font-mono text-[12.5px] font-medium transition-colors border-r rounded-l-lg"
              style={{
                background: ms.bg,
                color: ms.text,
                borderColor: ms.divider,
              }}
            >
              {method}
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {open &&
              createPortal(
                <div
                  ref={dropdownRef}
                  className="fixed bg-white border border-[#e9ebf0] rounded-lg shadow-xl z-[9999] py-1 min-w-[110px]"
                  style={{ top: dropdownPos.top, left: dropdownPos.left }}
                >
                  {METHODS.map((m) => {
                    const s = METHOD_STYLES[m];
                    return (
                      <button
                        key={m}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          onMethodChange(m);
                          setOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-[7px] text-[12.5px] font-mono transition-colors hover:bg-[#f8f9fc]"
                        style={{ color: m === method ? s.text : "#374151" }}
                      >
                        <span
                          className="w-[7px] h-[7px] rounded-full shrink-0"
                          style={{ background: s.text }}
                        />
                        {m}
                        {m === method && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            className="ml-auto"
                            style={{ color: s.text }}
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>,
                document.body,
              )}
          </div>

          {/* URL input */}
          <div className="flex-1 flex items-center gap-2 px-3 py-[8px]">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://api.example.com/v1/endpoint"
              className="w-full font-mono text-[12.5px] text-[#1c1f2e] outline-none bg-transparent placeholder:text-[#c2c8d4]"
            />
          </div>

          {/* Copy button */}
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 px-3 text-[12px] text-[#6b7280] border-l border-[#e9ebf0] hover:bg-[#f8f9fc] hover:text-[#2563eb] transition-colors shrink-0 whitespace-nowrap rounded-r-lg"
          >
            <Copy size={13} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-[11.5px] text-red-500 pl-0.5">{error}</p>
      )}
    </div>
  );
};

/** Key-Value rows (headers / query params) */
const KVList = ({ rows, onChange, addLabel = "Add Row" }) => {
  const add = () => onChange([...rows, { key: "", value: "" }]);
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));
  const update = (i, field, val) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const inp =
    "border border-[#e9ebf0] rounded-lg px-3 py-[7px] font-mono text-[12px] text-[#1c1f2e] " +
    "outline-none bg-white focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] transition-all placeholder:text-[#c2c8d4] w-full";

  return (
    <div>
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 mb-2 items-center">
          <input
            className={`${inp} flex-1`}
            placeholder="Key"
            value={row.key}
            onChange={(e) => update(i, "key", e.target.value)}
          />
          <input
            className={`${inp} flex-[1.5]`}
            placeholder="Value"
            value={row.value}
            onChange={(e) => update(i, "value", e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="!w-[26px] !h-[26px] !min-w-[26px] !p-0 shrink-0 hover:!border-red-400 hover:!text-red-500"
            icon={<Trash2 />}
            iconSize={14}
            aria-label="Remove row"
            onClick={() => remove(i)}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        icon={<Plus />}
        iconSize={14}
        className="mt-1 !text-[#2563eb]"
        onClick={add}
      >
        {addLabel}
      </Button>
    </div>
  );
};

/** Auth type selector tabs */
const AuthTabs = ({ active, onChange }) => {
  const tabs = [
    { key: "none", label: "None" },
    { key: "bearer", label: "Bearer Token" },
  ];
  return (
    <div className="flex gap-[5px] flex-wrap mb-4">
      {tabs.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`px-3 py-[5px] rounded-md border text-[12px] transition-all
            ${
              active === key
                ? "bg-[#2563eb] text-white border-[#2563eb]"
                : "bg-white text-[#6b7280] border-[#e9ebf0] hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-[#eff4ff]"
            }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

/** Password / secret input with Show/Hide toggle */
const SecretInput = ({ value, onChange, placeholder, extra }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex gap-2">
      <div
        className="flex-1 flex items-center gap-2 border border-[#e9ebf0] rounded-lg px-3 py-[7px] bg-white
        focus-within:border-[#2563eb] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] transition-all"
      >
        <Lock size={14} className="text-[#9aa2b2] shrink-0" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full font-mono text-[12.5px] text-[#1c1f2e] outline-none bg-transparent placeholder:text-[#c2c8d4]"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setShow(!show)}
      >
        {show ? "Hide" : "Show"}
      </Button>
      {extra}
    </div>
  );
};

/** Alert channel checkbox card */
const ChannelCard = ({ icon, label, checked, onChange, disabled }) => (
  <div
    onClick={!disabled ? onChange : undefined}
    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] border-[1.5px] transition-all text-[13px]
      ${
        disabled
          ? "border-[#e9ebf0] bg-[#f9fafb] text-[#c1c5cd] cursor-not-allowed opacity-50"
          : `cursor-pointer ${
              checked
                ? "border-[#2563eb] bg-[#eff4ff] text-[#2563eb]"
                : "border-[#e9ebf0] bg-white text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-[#eff4ff]"
            }`
      }`}
  >
    <input
      type="checkbox"
      checked={checked}
      readOnly
      disabled={disabled}
      onClick={(e) => e.stopPropagation()}
      className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
    />
    {icon}
    {label}
  </div>
);

/** Day selector pill */
const DayBtn = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-[38px] h-[38px] rounded-lg border-[1.5px] text-[11.5px] flex items-center justify-center transition-all
      ${
        active
          ? "bg-[#2563eb] border-[#2563eb] text-white"
          : "border-[#e9ebf0] bg-white text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb]"
      }`}
  >
    {label}
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ApiFormLayout() {
  const { api: apiId } = useParams();
  const { data: apiData, isLoading, isError } = useApiDetailsQuery(apiId);
  const updateMutation = useUpdateApiMutation();
  const disableMutation = useDisableApiMutation();
  const deleteMutation = useDeleteApiMutation();
  const { data: teamMembers = [], isLoading: loadingMembers } =
    useTeamMembersQuery();
  const { data: categoriesList = [] } = useGetCategoriesListQuery();

  const [isEditMode, setIsEditMode] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activePanelMode, setActivePanelMode] = useState("edit");
  const [showTestModal, setShowTestModal] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // ── Basic Details ──
  const [apiName, setApiName] = useState("");
  const [cName, setCName] = useState("");
  const [apiVersion, setApiVersion] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [apiUrl, setApiUrl] = useState("");
  const [apiType, setApiType] = useState("");
  const [category, setCategory] = useState("");
  const [eta, setEta] = useState("");
  const [apiMode, setApiMode] = useState("");
  const [techStack, setTechStack] = useState("");
  const [usagePattern, setUsagePattern] = useState("");
  const [tags, setTags] = useState([]);

  // ── Monitoring ──
  const [checkFreq, setCheckFreq] = useState("every_1min");
  const [timeoutLimit, setTimeoutLimit] = useState("30000");
  const [expectedStatus, setExpectedStatus] = useState("200");
  const [retryCount, setRetryCount] = useState("3");
  const [retryDelay, setRetryDelay] = useState("5000");
  const [expectedRT, setExpectedRT] = useState("1000");
  const [monEnabled, setMonEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [loggingEnabled, setLoggingEnabled] = useState(true);

  // ── Authentication ──
  const [authType, setAuthType] = useState("none");
  const [bearer, setBearer] = useState("");
  const [akHeader, setAkHeader] = useState("X-API-Key");
  const [akValue, setAkValue] = useState("");
  const [basicUser, setBasicUser] = useState("");
  const [basicPass, setBasicPass] = useState("");
  const [oaClientId, setOaClientId] = useState("");
  const [oaSecret, setOaSecret] = useState("");
  const [oaTokenUrl, setOaTokenUrl] = useState("");

  // ── Request Config ──
  const [headers, setHeaders] = useState([]);
  const [params, setParams] = useState([]);
  const [reqBody, setReqBody] = useState("");
  const [jsonErr, setJsonErr] = useState("");

  // ── Response Validation ──
  const [expectedRes, setExpectedRes] = useState("");
  const [statusCheck, setStatusCheck] = useState(true);
  const [bodyCheck, setBodyCheck] = useState(false);
  const [headerCheck, setHeaderCheck] = useState(false);

  // ── Alert Settings ──
  const [channels, setChannels] = useState({
    email: false,
    slack: false,
    sms: false,
    webhook: false,
  });
  const [failThreshold, setFailThreshold] = useState("3");
  const [cooldown, setCooldown] = useState("15");
  const [respThreshold, setRespThreshold] = useState("1000");
  const [escalation, setEscalation] = useState(false);

  // ── Responsibility ──
  const [responsible, setResponsible] = useState("");
  const [team, setTeam] = useState("");
  const [escalationP, setEscalationP] = useState("none");

  // ── Scheduling ──
  const [is247, setIs247] = useState(true);
  const [activeDays, setActiveDays] = useState([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
  ]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const toggleDay = (d) =>
    setActiveDays((p) =>
      p.includes(d) ? p.filter((x) => x !== d) : [...p, d],
    );

  // ── Security ──
  const [compliance, setCompliance] = useState("");
  const [ipWhitelist, setIpWhitelist] = useState("");
  const [tls, setTls] = useState("tls13");
  const [storeCreds, setStoreCreds] = useState(true);
  const [maskSensitive, setMaskSensitive] = useState(true);
  const [encEnabled, setEncEnabled] = useState(true);

  // ── Meta ──
  const [assignDate, setAssignDate] = useState("");
  const [notes, setNotes] = useState("");

  const navigate = useNavigate();

  const normalizeFreq = (freq) => {
    const legacyMap = {
      every_1min: "*/1 * * * *",
      every_5min: "*/5 * * * *",
      every_15min: "*/15 * * * *",
      every_30min: "*/30 * * * *",
      hourly: "0 * * * *",
      every_6h: "0 */6 * * *",
      daily: "0 0 * * *",
    };
    if (!freq) return "*/1 * * * *";
    if (legacyMap[freq]) return legacyMap[freq];
    return freq;
  };

  useEffect(() => {
    if (!apiData) return;
    setApiName(apiData.name ?? "");
    setCName(apiData.cName ?? "");
    setApiVersion(apiData.version ?? "");
    setEta(apiData.eta ? apiData.eta.slice(0, 10) : "");
    setHttpMethod(apiData.request?.method ?? "GET");
    setApiUrl(apiData.request?.url ?? "");
    setApiType(apiData.type ?? "");
    setCategory(
      typeof apiData.category === "object"
        ? (apiData.category?._id ?? "")
        : (apiData.category ?? ""),
    );
    setApiMode(apiData.mode ?? "");
    setTechStack(apiData.tech ?? "");
    setTags(apiData.tags ?? []);
    setCheckFreq(normalizeFreq(apiData.monitoring?.frequency));
    setTimeoutLimit(String(apiData.monitoring?.timeout ?? "30000"));
    setExpectedStatus(String(apiData.monitoring?.expectedStatus ?? "200"));
    setRetryCount(String(apiData.monitoring?.retries ?? "3"));
    setAuthType((apiData.auth?.method ?? "none").toLowerCase());
    setBearer(apiData.auth?.token ?? "");
    setAkHeader(apiData.auth?.apiKeyHeader ?? "X-API-Key");
    setAkValue(apiData.auth?.apiKey ?? "");
    setBasicUser(apiData.auth?.username ?? "");
    setBasicPass(apiData.auth?.password ?? "");
    setOaClientId(apiData.auth?.clientId ?? "");
    setOaSecret(apiData.auth?.clientSecret ?? "");
    setOaTokenUrl(apiData.auth?.tokenUrl ?? "");
    setChannels({
      email: apiData.alertChannels?.includes("email") ?? false,
      slack: apiData.alertChannels?.includes("slack") ?? false,
      sms: apiData.alertChannels?.includes("sms") ?? false,
      webhook: apiData.alertChannels?.includes("webhook") ?? false,
    });
    setCompliance(apiData.compliance?.[0] ?? "");
    if (
      apiData.request?.headers &&
      typeof apiData.request.headers === "object"
    ) {
      setHeaders(
        Object.entries(apiData.request.headers).map(([key, value]) => ({
          key,
          value: String(value),
        })),
      );
    }
    if (apiData.request?.body) {
      setReqBody(
        typeof apiData.request.body === "string"
          ? apiData.request.body
          : JSON.stringify(apiData.request.body, null, 2),
      );
    }
    if (apiData.monitoring?.assignedAt) {
      setAssignDate(apiData.monitoring.assignedAt.slice(0, 10));
    }
    if (apiData.notes) setNotes(apiData.notes);
    if (apiData.owner) {
      setResponsible(
        typeof apiData.owner === "object"
          ? (apiData.owner?._id ?? "")
          : apiData.owner,
      );
    }
  }, [apiData]);

  const formatJson = () => {
    try {
      setReqBody(JSON.stringify(JSON.parse(reqBody), null, 2));
      setJsonErr("");
    } catch {
      setJsonErr("Invalid JSON — please check syntax");
    }
  };

  // ── Options ──
  const apiTypeOpts = [
    { value: "External", label: "External" },
    { value: "Internal", label: "Internal" },
    { value: "Public", label: "Public" },
    { value: "Private", label: "Private" },
  ];
  const categoryOpts = categoriesList.map((c) => ({
    value: c._id,
    label: c.name,
  }));
  const apiModeOpts = [
    { value: "Live", label: "Live" },
    { value: "Test", label: "Test" },
  ];
  const techStackOpts = [
    { value: "nodejs", label: "Node.js" },
    { value: "python", label: "Python" },
    { value: "go", label: "Go" },
    { value: "java", label: "Java" },
    { value: "ruby", label: "Ruby" },
    { value: "laravel", label: "Laravel" },
  ];
  const usagePatternOpts = [
    { value: "high_frequency", label: "High frequency" },
    { value: "medium_frequency", label: "Medium frequency" },
    { value: "low_frequency", label: "Low frequency" },
    { value: "batch", label: "Batch" },
    { value: "on_demand", label: "On-demand" },
  ];
  const checkFreqOpts = [
    { value: "*/1 * * * *", label: "Every 1 minute" },
    { value: "*/5 * * * *", label: "Every 5 minutes" },
    { value: "*/15 * * * *", label: "Every 15 minutes" },
    { value: "*/30 * * * *", label: "Every 30 minutes" },
    { value: "0 * * * *", label: "Hourly" },
    { value: "0 */6 * * *", label: "Every 6 hours" },
    { value: "0 0 * * *", label: "Daily" },
  ];
  const teamOpts = [
    { value: "payments", label: "Payments Team" },
    { value: "platform", label: "Platform Team" },
    { value: "auth", label: "Auth Team" },
    { value: "data", label: "Data Team" },
  ];
  const escalationOpts = [
    { value: "none", label: "— None —" },
    { value: "alex", label: "Alex Morgan" },
    { value: "james", label: "James Lee" },
    { value: "director", label: "Director Engineering" },
  ];
  const complianceOpts = [
    { value: "soc2", label: "SOC2" },
    { value: "iso", label: "ISO 27001" },
    { value: "gdpr", label: "GDPR" },
    { value: "internal", label: "Internal" },
    { value: "pci", label: "PCI DSS" },
    { value: "hipaa", label: "HIPAA" },
  ];
  const tlsOpts = [
    { value: "tls13", label: "Required (TLS 1.3)" },
    { value: "tls12", label: "Required (TLS 1.2+)" },
    { value: "optional", label: "Optional" },
    { value: "disabled", label: "Disabled" },
  ];
  const tagSuggestions = [
    "billing",
    "critical",
    "production",
    "staging",
    "auth",
    "payments",
    "v2",
    "deprecated",
    "internal",
    "public",
    "beta",
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const timeInput =
    "w-full border border-[#e9ebf0] rounded-lg px-3 py-[7px] text-[13px] text-[#1c1f2e] outline-none bg-white focus:border-[#2563eb] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] transition-all";

  const isNameValid = apiName.trim().length > 0;
  const isUrlValid = /^https?:\/\/\S+/i.test(apiUrl.trim());

  const validateRequired = () => {
    setSubmitAttempted(true);
    return isNameValid && isUrlValid;
  };

  const markDirty = () => {
    if (!hasUnsavedChanges) setHasUnsavedChanges(true);
  };

  const buildPayload = () => ({
    name: apiName,
    cName,
    version: apiVersion,
    type: apiType,
    mode: apiMode,
    tech: techStack,
    tags,
    category,
    eta: eta || undefined,
    owner: responsible || undefined,
    compliance: compliance ? [compliance] : [],
    notes,
    request: {
      method: httpMethod,
      url: apiUrl,
      headers: headers.reduce(
        (acc, { key, value }) => (key ? { ...acc, [key]: value } : acc),
        {},
      ),
      body: reqBody,
    },
    auth: {
      method: authType.charAt(0).toUpperCase() + authType.slice(1),
      ...(authType === "bearer" && { token: bearer }),
      ...(authType === "apikey" && { apiKey: akValue, apiKeyHeader: akHeader }),
      ...(authType === "basic" && { username: basicUser, password: basicPass }),
      ...(authType === "oauth" && {
        clientId: oaClientId,
        clientSecret: oaSecret,
        tokenUrl: oaTokenUrl,
      }),
    },
    monitoring: {
      frequency: checkFreq,
      frequencyLabel:
        checkFreqOpts.find((o) => o.value === checkFreq)?.label ?? checkFreq,
      timeout: Number(timeoutLimit),
      expectedStatus: Number(expectedStatus),
      retries: Number(retryCount),
    },
    alertChannels: Object.entries(channels)
      .filter(([, v]) => v)
      .map(([k]) => k),
  });

  const isApiActive = !apiData?.isDisabled;

  const handleToggleDisable = () => {
    disableMutation.mutate({ id: apiId, isDisabled: isApiActive });
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(apiId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        navigate("/dashboard/apis");
      },
    });
  };

  const handleSave = () => {
    if (!validateRequired()) return;
    updateMutation.mutate(
      { id: apiId, payload: buildPayload() },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          navigate(`/dashboard/apis/${apiId}`);
        },
      },
    );
  };

  if (isLoading)
    return (
      <div className="container-page">
        <p className="text-[#6b7280] text-sm">Loading…</p>
      </div>
    );

  if (isError)
    return (
      <div className="container-page">
        <p className="text-red-500 text-sm">Failed to load API details.</p>
      </div>
    );

  return (
    <div className="container-page">
      <PageHeader
        icon={<PulseWaveIcon />}
        iconGradient=""
        title={isEditMode ? "Edit API" : "Add New API"}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "All APIs", href: "/dashboard/apis" },
          {
            label: isEditMode ? "Edit API" : "Add New API",
            href: "/dashboard/apis/form",
          },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <UiButton
              variant="outline"
              size="lg"
              icon={<X />}
              iconSize={14}
              onClick={() => navigate(`/dashboard/apis/${apiId}`)}
            >
              Cancel
            </UiButton>
            <UiButton
              variant="primary"
              size="lg"
              icon={<Save />}
              iconSize={14}
              loading={updateMutation.isPending}
              onClick={handleSave}
            >
              Save Changes
            </UiButton>
            <UiButton
              variant="red"
              size="lg"
              icon={<Trash2 />}
              iconSize={14}
              loading={deleteMutation.isPending}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </UiButton>
          </div>
        }
      />

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          {/* ── 1. BASIC DETAILS ──────────────────────────────────────────────── */}
          <Section className="mb-5">
            <InfoCard icon={<InfoCircleIcon />} title="Basic Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <Input
                  label="API Name"
                  required
                  icon={<Tag />}
                  value={apiName}
                  onChange={(e) => {
                    setApiName(e.target.value);
                    markDirty();
                  }}
                  placeholder="e.g. payment-api"
                  error={
                    submitAttempted && !isNameValid
                      ? "API Name is required"
                      : ""
                  }
                />
                {/* <Input */}
                {/*   label="C Name" */}
                {/*   icon={<Tag />} */}
                {/*   value={cName} */}
                {/*   onChange={(e) => { */}
                {/*     setCName(e.target.value); */}
                {/*     markDirty(); */}
                {/*   }} */}
                {/*   placeholder="e.g. Common Name" */}
                {/* /> */}
                <Input
                  label="API Version"
                  icon={<Hash />}
                  value={apiVersion}
                  onChange={(e) => setApiVersion(e.target.value)}
                  placeholder="e.g. v1.0.0"
                />
                <AvatarSelect
                  label="Owner"
                  icon={<User />}
                  value={responsible}
                  onChange={setResponsible}
                  options={teamMembers.map((m) => ({
                    value: m._id,
                    label: m.name,
                  }))}
                  placeholder={loadingMembers ? "Loading…" : "Select owner"}
                  disabled={loadingMembers}
                />
              </div>

              <div className="mb-6 mt-1">
                <UrlMethodInput
                  method={httpMethod}
                  onMethodChange={setHttpMethod}
                  value={apiUrl}
                  onChange={(val) => {
                    setApiUrl(val);
                    markDirty();
                  }}
                  error={
                    submitAttempted && !isUrlValid
                      ? "Please enter a valid URL starting with http:// or https://"
                      : ""
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <Select
                  label="API Type"
                  icon={<Layers />}
                  value={apiType}
                  onChange={(e) => setApiType(e.target.value)}
                  options={apiTypeOpts}
                  placeholder="Select"
                />
                <Select
                  label="Category"
                  icon={<FolderOpen />}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={categoryOpts}
                  placeholder="Select"
                />
                <Select
                  label="API Mode"
                  icon={<Activity />}
                  value={apiMode}
                  onChange={(e) => setApiMode(e.target.value)}
                  options={apiModeOpts}
                  placeholder="Select"
                />
              </div>
            </InfoCard>
          </Section>

          {/* ── 2. MONITORING CONFIGURATION ───────────────────────────────────── */}
          <Section className="mb-5">
            <InfoCard icon={<ClockIcon />} title="Monitoring Configuration">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <Select
                  label="Check Frequency"
                  icon={<Clock />}
                  value={checkFreq}
                  onChange={(e) => {
                    setCheckFreq(e.target.value);
                    markDirty();
                  }}
                  options={checkFreqOpts}
                  placeholder="Select frequency"
                />
                <div>
                  <Input
                    label="Timeout Limit (ms)"
                    icon={<Timer />}
                    type="number"
                    value={timeoutLimit}
                    onChange={(e) => setTimeoutLimit(e.target.value)}
                    placeholder="30000"
                  />
                  <HelperText>Request will fail after this duration</HelperText>
                </div>
                <div>
                  <Input
                    label="Expected Status Code"
                    icon={<CheckSquare />}
                    value={expectedStatus}
                    onChange={(e) => setExpectedStatus(e.target.value)}
                    placeholder="200"
                  />
                  <HelperText>Comma separated (200, 201)</HelperText>
                </div>
              </div>

              {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"> */}
              {/*   <Input */}
              {/*     label="Retry Count" */}
              {/*     icon={<RefreshCw />} */}
              {/*     type="number" */}
              {/*     value={retryCount} */}
              {/*     onChange={(e) => setRetryCount(e.target.value)} */}
              {/*     placeholder="3" */}
              {/*   /> */}
              {/*   <Input */}
              {/*     label="Retry Delay (ms)" */}
              {/*     icon={<Clock />} */}
              {/*     type="number" */}
              {/*     value={retryDelay} */}
              {/*     onChange={(e) => setRetryDelay(e.target.value)} */}
              {/*     placeholder="5000" */}
              {/*   /> */}
              {/*   <div> */}
              {/*     <Input */}
              {/*       label="Expected Response Time (ms)" */}
              {/*       icon={<Zap />} */}
              {/*       type="number" */}
              {/*       value={expectedRT} */}
              {/*       onChange={(e) => setExpectedRT(e.target.value)} */}
              {/*       placeholder="1000" */}
              {/*     /> */}
              {/*     <HelperText>Alert if exceeded</HelperText> */}
              {/*   </div> */}
              {/* </div> */}

              {/* <Divider /> */}
              {/* <ToggleRow */}
              {/*   label="Enable Monitoring" */}
              {/*   sub="Actively check this API on the configured schedule" */}
              {/*   checked={monEnabled} */}
              {/*   onChange={() => setMonEnabled(!monEnabled)} */}
              {/* /> */}
              {/* <ToggleRow */}
              {/*   label="Enable Alerts" */}
              {/*   sub="Send notifications when thresholds are breached" */}
              {/*   checked={alertsEnabled} */}
              {/*   onChange={() => setAlertsEnabled(!alertsEnabled)} */}
              {/* /> */}
              {/* <ToggleRow */}
              {/*   label="Enable Logging" */}
              {/*   sub="Store request and response logs for this API" */}
              {/*   checked={loggingEnabled} */}
              {/*   onChange={() => setLoggingEnabled(!loggingEnabled)} */}
              {/* /> */}
            </InfoCard>
          </Section>

          {/* ── 3. AUTHENTICATION ─────────────────────────────────────────────── */}
          <Section className="mb-5">
            <InfoCard icon={<LockIcon />} title="Authentication">
              <AuthTabs active={authType} onChange={setAuthType} />

              {authType === "none" && (
                <div className="px-3 py-3 bg-[#f8f9fc] border border-[#e9ebf0] rounded-lg text-[12.5px] text-[#6b7280]">
                  No authentication required for this API.
                </div>
              )}

              {authType === "apikey" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Input
                    label="Header Key"
                    icon={<Key />}
                    value={akHeader}
                    onChange={(e) => setAkHeader(e.target.value)}
                    placeholder="X-API-Key"
                  />
                  <div>
                    <FieldLabel>API Key Value</FieldLabel>
                    <SecretInput
                      value={akValue}
                      onChange={setAkValue}
                      placeholder="sk_live_xxxxx"
                    />
                  </div>
                </div>
              )}

              {authType === "bearer" && (
                <div>
                  <FieldLabel>JWT / Bearer Token</FieldLabel>
                  <SecretInput
                    value={bearer}
                    onChange={setBearer}
                    placeholder="eyJhbGci…"
                  />
                  <HelperText>
                    Token will be sent as: Authorization: Bearer &lt;token&gt;
                  </HelperText>
                </div>
              )}

              {authType === "basic" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Input
                    label="Username / Email"
                    icon={<User />}
                    value={basicUser}
                    onChange={(e) => setBasicUser(e.target.value)}
                    placeholder="api@example.com"
                  />
                  <div>
                    <FieldLabel>Password</FieldLabel>
                    <SecretInput
                      value={basicPass}
                      onChange={setBasicPass}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {authType === "oauth" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Input
                      label="Client ID"
                      icon={<Fingerprint />}
                      value={oaClientId}
                      onChange={(e) => setOaClientId(e.target.value)}
                      placeholder="client_id_xxx"
                    />
                    <div>
                      <FieldLabel>Client Secret</FieldLabel>
                      <SecretInput
                        value={oaSecret}
                        onChange={setOaSecret}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <Input
                    label="Token URL"
                    icon={<Globe />}
                    value={oaTokenUrl}
                    onChange={(e) => setOaTokenUrl(e.target.value)}
                    placeholder="https://auth.example.com/oauth/token"
                  />
                </div>
              )}
            </InfoCard>
          </Section>

          {/* ── 4. REQUEST CONFIGURATION ──────────────────────────────────────── */}
          <Section className="mb-5">
            <InfoCard
              icon={
                <PulseWaveIcon
                  width={14}
                  height={14}
                  stroke="#6b7280"
                  strokeWidth={2}
                />
              }
              title="Request Configuration"
            >
              <div className="mb-4">
                <FieldLabel>Headers</FieldLabel>
                <KVList
                  rows={headers}
                  onChange={setHeaders}
                  addLabel="Add Header"
                />
              </div>
              {/* <div> */}
              {/*   <div className="flex items-center justify-between mb-[6px]"> */}
              {/*     <span /> */}
              {/*     <Button */}
              {/*       type="button" */}
              {/*       variant="outline" */}
              {/*       size="sm" */}
              {/*       onClick={formatJson} */}
              {/*       className="!text-[11px] !py-1 !px-2" */}
              {/*     > */}
              {/*       Format JSON */}
              {/*     </Button> */}
              {/*   </div> */}
              {/*   <TextareaField */}
              {/*     label="Request Body (JSON)" */}
              {/*     icon={<Code2 />} */}
              {/*     value={reqBody} */}
              {/*     onChange={(e) => { */}
              {/*       setReqBody(e.target.value); */}
              {/*       setJsonErr(""); */}
              {/*     }} */}
              {/*     rows={7} */}
              {/*     placeholder='{"key": "value"}' */}
              {/*     state={jsonErr ? "error" : "default"} */}
              {/*   /> */}
              {/*   {jsonErr && ( */}
              {/*     <p className="mt-1 text-[11.5px] text-red-500">{jsonErr}</p> */}
              {/*   )} */}
              {/* </div> */}
            </InfoCard>
          </Section>

          {/* ── 6. ALERT SETTINGS ─────────────────────────────────────────────── */}
          <Section className="mb-5">
            <InfoCard icon={<BellIcon />} title="Alert Channels">
              <div className="mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  <ChannelCard
                    icon={
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    }
                    label="Email"
                    checked={channels.email}
                    onChange={() =>
                      setChannels((p) => ({ ...p, email: !p.email }))
                    }
                  />
                  <ChannelCard
                    disabled={true}
                    icon={
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    }
                    label="Slack"
                    checked={channels.slack}
                    onChange={() =>
                      setChannels((p) => ({ ...p, slack: !p.slack }))
                    }
                  />
                  <ChannelCard
                    disabled={true}
                    icon={
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="5" y="2" width="14" height="20" rx="2" />
                        <line x1="12" y1="18" x2="12.01" y2="18" />
                      </svg>
                    }
                    label="SMS"
                    checked={channels.sms}
                    onChange={() => setChannels((p) => ({ ...p, sms: !p.sms }))}
                  />
                  <ChannelCard
                    disabled={true}
                    icon={
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      </svg>
                    }
                    label="Webhook"
                    checked={channels.webhook}
                    onChange={() =>
                      setChannels((p) => ({ ...p, webhook: !p.webhook }))
                    }
                  />
                </div>
              </div>
            </InfoCard>
          </Section>

          {/* ── 8. SCHEDULING ─────────────────────────────────────────────────── */}
          <Section className="mb-5">
            <InfoCard icon={<CalendarIcon />} title="Scheduling -CS-">
              <div
                className={!is247 ? "pb-4 mb-4 border-b border-[#f3f5f9]" : ""}
              >
                <ToggleRow
                  label="24×7 Monitoring"
                  sub="Monitor at all hours, every day of the week"
                  checked={true}
                  onChange={() => setIs247(!is247)}
                  disabled={true}
                />
              </div>

              {!is247 && (
                <div>
                  <div className="mb-4">
                    <FieldLabel>Active Days</FieldLabel>
                    <div className="flex gap-1.5 flex-wrap mt-1">
                      {days.map((d) => (
                        <DayBtn
                          key={d}
                          label={d}
                          active={activeDays.includes(d)}
                          onClick={() => toggleDay(d)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Start Time</FieldLabel>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className={timeInput}
                      />
                    </div>
                    <div>
                      <FieldLabel>End Time</FieldLabel>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className={timeInput}
                      />
                    </div>
                  </div>
                </div>
              )}
            </InfoCard>
          </Section>

          {/* ── 9. SECURITY & COMPLIANCE ──────────────────────────────────────── */}
          {/* <Section className="mb-5"> */}
          {/*   <InfoCard icon={<ShieldIcon />} title="Security & Compliance -CS-"> */}
          {/*     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4"> */}
          {/*       <Select */}
          {/*         label="Compliance Type" */}
          {/*         icon={<ShieldCheck />} */}
          {/*         value={compliance} */}
          {/*         onChange={(e) => setCompliance(e.target.value)} */}
          {/*         options={complianceOpts} */}
          {/*         placeholder="Select" */}
          {/*       /> */}
          {/*       <div> */}
          {/*         <Input */}
          {/*           label="IP Whitelist" */}
          {/*           icon={<Server />} */}
          {/*           value={ipWhitelist} */}
          {/*           onChange={(e) => setIpWhitelist(e.target.value)} */}
          {/*           placeholder="192.168.1.0/24, 10.0.0.1" */}
          {/*         /> */}
          {/*         <HelperText>Comma separated IPs or CIDR</HelperText> */}
          {/*       </div> */}
          {/*       <Select */}
          {/*         label="TLS / SSL" */}
          {/*         icon={<Shield />} */}
          {/*         value={tls} */}
          {/*         onChange={(e) => setTls(e.target.value)} */}
          {/*         options={tlsOpts} */}
          {/*         placeholder="Select" */}
          {/*       /> */}
          {/*     </div> */}
          {/**/}
          {/*     <Divider /> */}
          {/*     <ToggleRow */}
          {/*       label="Store Credentials Securely" */}
          {/*       sub="Encrypt API keys and tokens using AES-256" */}
          {/*       checked={storeCreds} */}
          {/*       onChange={() => setStoreCreds(!storeCreds)} */}
          {/*     /> */}
          {/*     <ToggleRow */}
          {/*       label="Mask Sensitive Data in Logs" */}
          {/*       sub="Hide tokens, passwords, and keys from log output" */}
          {/*       checked={maskSensitive} */}
          {/*       onChange={() => setMaskSensitive(!maskSensitive)} */}
          {/*     /> */}
          {/*     <ToggleRow */}
          {/*       label="Encryption Enabled" */}
          {/*       sub="All data at rest and in transit is encrypted" */}
          {/*       checked={encEnabled} */}
          {/*       onChange={() => setEncEnabled(!encEnabled)} */}
          {/*     /> */}
          {/*   </InfoCard> */}
          {/* </Section> */}

          {/* ── 10. META & EXTRA ──────────────────────────────────────────────── */}
          <Section className="mb-5">
            <InfoCard icon={<SettingsIcon />} title="Meta & Extra">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Input
                    label="Last Checked"
                    icon={<Clock />}
                    value="Today 14:24:12 UTC"
                    disabled
                  />
                </div>
                <Input
                  label="Notes / Description"
                  icon={<FileText />}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal notes about this API…"
                />
              </div>
            </InfoCard>
          </Section>
        </div>

        {/* <ApiFormSidePanel mode={activePanelMode} /> */}
      </div>

      <ApiTestModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        method={httpMethod}
        url={apiUrl}
        initialBody={reqBody}
      />

      <AlertDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        title="Delete API"
        description="This will permanently remove all monitoring data, logs, incidents, and configuration for this API. This action cannot be undone."
        checkboxLabel="I understand this action is permanent and cannot be undone."
        itemName="Delete"
        handleOnClick={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        type="danger"
      />
    </div>
  );
}
