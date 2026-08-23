import React, { useState } from "react";
import Input from "../formComponents/Input";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icon = {
  User: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  Mail: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>,
  Phone: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Lock: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Hash: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  Link: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Search: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Eye: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  AlertCircle: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Layers: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  Zap: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Loader: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
  ChevronDown: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>,
};

const ic = (name, cls = "w-3.5 h-3.5") => React.createElement(Icon[name], { className: cls });

// ─── Sidebar nav data ─────────────────────────────────────────────────────────
const NAV = [
  { group: "TEXT INPUTS", items: [{ label: "Text Inputs", count: 7, active: true }, { label: "Textarea", count: 3 }] },
  { group: "SELECT", items: [{ label: "Select Inputs", count: 5 }] },
  { group: "BOOLEAN", items: [{ label: "Boolean Inputs", count: 5 }] },
  { group: "DATE & TIME", items: [{ label: "Date & Time", count: 4 }] },
  { group: "SPECIAL", items: [{ label: "Special Inputs", count: 5 }] },
  { group: "RANGE & STEP", items: [{ label: "Slider / Range", count: 2 }, { label: "Step Input", count: 1 }] },
  { group: "LOCATION", items: [{ label: "Location Input", count: 3 }] },
  { group: "PAYMENT", items: [{ label: "Payment Input", count: 3 }] },
  { group: "ADVANCED", items: [{ label: "Advanced Inputs", count: 4 }] },
  { group: "SYSTEM", items: [{ label: "Hidden / System", count: 3 }] },
];

const DOT_COLORS = {
  "TEXT INPUTS": "bg-blue-500",
  SELECT: "bg-orange-400",
  BOOLEAN: "bg-teal-500",
  "DATE & TIME": "bg-blue-400",
  SPECIAL: "bg-purple-500",
  "RANGE & STEP": "bg-green-500",
  LOCATION: "bg-violet-500",
  PAYMENT: "bg-indigo-500",
  ADVANCED: "bg-pink-500",
  SYSTEM: "bg-gray-400",
};

// ─── Shared layout primitives ─────────────────────────────────────────────────
const StoryCard = ({ children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">{children}</div>
);

const StoryTitle = ({ icon, color = "text-blue-500", title }) => (
  <div className="flex items-center gap-2 mb-1">
    <span className={`${color} flex-shrink-0`}>{icon}</span>
    <h3 className="text-[14px] font-semibold text-gray-800">{title}</h3>
  </div>
);

const StoryDesc = ({ children }) => (
  <p className="text-[12px] text-gray-400 mb-5">{children}</p>
);

const StateLabel = ({ children }) => (
  <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5">{children}</p>
);

const StateMsg = ({ type, children }) => {
  if (!children) return null;
  const cls = type === "error" ? "text-red-500" : type === "success" ? "text-green-500" : "text-amber-500";
  return <p className={`text-[11px] mt-1 ${cls}`}>{children}</p>;
};

// ─── Standard border input (non-floating) ─────────────────────────────────────
const BInput = ({
  placeholder = "", value = "", disabled = false,
  state = "default", // default | focus | error | success | loading
  prefix = null, suffix = null, type = "text",
  onChange,
}) => {
  const borderCls = {
    default: "border-gray-200",
    focus: "border-blue-500 ring-[3px] ring-blue-100",
    error: "border-red-400 ring-[3px] ring-red-50",
    success: "border-green-500 ring-[3px] ring-green-50",
    loading: "border-gray-200",
    hover: "border-gray-400",
    disabled: "border-gray-200 bg-gray-50",
  }[state] || "border-gray-200";

  const bgCls = disabled || state === "disabled" ? "bg-gray-50" : "bg-white";

  return (
    <div className={`flex items-center border rounded-lg px-3 h-10 gap-2 transition-all ${borderCls} ${bgCls}`}>
      {prefix && <span className="text-gray-400 flex-shrink-0 flex items-center">{prefix}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled || state === "disabled" || state === "loading"}
        onChange={onChange || (() => {})}
        className={`flex-1 min-w-0 border-none outline-none bg-transparent text-[13px]
          placeholder:text-gray-300
          ${disabled || state === "disabled" ? "text-gray-300 cursor-not-allowed" : "text-gray-800"}`}
      />
      {suffix && <span className="text-gray-400 flex-shrink-0 flex items-center">{suffix}</span>}
    </div>
  );
};

// ─── 4-col story grid ────────────────────────────────────────────────────────
const Grid4 = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
);
const Grid2 = ({ children }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{children}</div>
);

// ─── Password strength bar ────────────────────────────────────────────────────
const StrengthBar = ({ level }) => {
  const segs = [
    { active: level >= 1, color: "bg-red-400" },
    { active: level >= 2, color: "bg-orange-400" },
    { active: level >= 3, color: "bg-green-500" },
  ];
  const labels = ["", "Weak — add numbers & symbols", "Fair — add symbols to strengthen", "Strong password"];
  const labelColors = ["", "text-red-500", "text-amber-500", "text-green-500"];
  return (
    <div className="mt-3">
      <div className="flex gap-1 mb-1.5">
        {segs.map((s, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${s.active ? s.color : "bg-gray-100"}`} />
        ))}
      </div>
      {level > 0 && <p className={`text-[11px] ${labelColors[level]}`}>{labels[level]}</p>}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function InputShowcase() {
  const [pwVisible, setPwVisible] = useState(false);
  const [pw, setPw] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [emailVal, setEmailVal] = useState("not-an-email");
  const [numberVal, setNumberVal] = useState("");

  const pwStrength = pw.length === 0 ? 0 : pw.length < 5 ? 1 : pw.length < 9 ? 2 : 3;

  // floating-label wrappers using the imported Input component
  const FloatingInput = ({ label, icon, iconColor, placeholder, type = "text", value, onChange, error, success, disabled, required }) => (
    <Input
      label={label}
      icon={icon}
      iconColor={iconColor}
      placeholder={placeholder}
      type={type}
      value={value || ""}
      onChange={onChange || (() => {})}
      error={error}
      success={success}
      disabled={disabled}
      required={required}
    />
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">

      {/* ── Sidebar ── */}
  

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">

        {/* Page header */}
        <div className="border-b border-gray-200 bg-white px-8 py-4">
          <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-1">
            <span>Components</span>
            <span>›</span>
            <span className="text-gray-700 font-medium">Text Inputs</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 flex items-center gap-2">
            <Icon.Hash className="w-5 h-5 text-blue-500" />
            Text Inputs
          </h1>
        </div>

        <div className="px-8 py-7 max-w-5xl">

          {/* ════════════════════════════════════
              STORY 1 · Floating Labels
          ════════════════════════════════════ */}
          <div className="flex items-center gap-2 mb-3">
            <Icon.Hash className="w-3.5 h-3.5 text-blue-500" />
            <h2 className="text-[14px] font-semibold text-blue-600">Floating Labels — Cut-line Style</h2>
          </div>
          <p className="text-[12px] text-gray-400 mb-4">
            Label sits on the border with icon + color. Required fields show a red asterisk. Each input type has its own label color.
          </p>

          <StoryCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <StateLabel>TEXT — DEFAULT</StateLabel>
                <FloatingInput label="Client Name" icon={<Icon.User className="w-3 h-3"/>} iconColor="text-blue-500" placeholder="Enter client full name" required />
              </div>
              <div>
                <StateLabel>EMAIL — DEFAULT</StateLabel>
                <FloatingInput label="Client Email" icon={<Icon.Mail className="w-3 h-3"/>} iconColor="text-red-400" placeholder="client@company.com" required />
              </div>
              <div>
                {/* <StateLabel>SELECT — WITH VALUE</StateLabel> */}
                {/* Placeholder select in floating style */}
                {/* <div className="relative border border-gray-200 rounded-lg px-3 pt-4 pb-2 bg-white">
                  <span className="absolute -top-[9px] left-2.5 bg-white px-1 flex items-center gap-1 text-[11px] leading-none text-amber-500">
                    <Icon.Layers className="w-2.5 h-2.5" />Department<span className="text-red-500">*</span>
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] text-gray-800">Logs – General</span>
                    <Icon.ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div> */}
              </div>
              <div>
                {/* <StateLabel>SELECT — PRIORITY</StateLabel>
                <div className="relative border border-gray-200 rounded-lg px-3 pt-4 pb-2 bg-white">
                  <span className="absolute -top-[9px] left-2.5 bg-white px-1 flex items-center gap-1 text-[11px] leading-none text-purple-500">
                    <Icon.Zap className="w-2.5 h-2.5" />Priority<span className="text-red-500">*</span>
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] text-gray-800">High</span>
                    <Icon.ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                </div> */}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <StateLabel>TEXT — FOCUS</StateLabel>
                <FloatingInput label="Full Name" icon={<Icon.User className="w-3 h-3"/>} iconColor="text-blue-500" value="Alice Johnson" required />
              </div>
              <div>
                <StateLabel>TEXT — ERROR</StateLabel>
                <FloatingInput label="Phone Number" icon={<Icon.AlertCircle className="w-3 h-3"/>} iconColor="text-red-500" value="123" error="Enter a valid 10-digit number" required />
              </div>
              <div>
                <StateLabel>TEXT — SUCCESS</StateLabel>
                <FloatingInput label="GST Number" icon={<Icon.Check className="w-3 h-3"/>} iconColor="text-green-500" value="27AAPFU0939F1ZV" success="Valid GST number" required />
              </div>
              <div>
                <StateLabel>TEXT — DISABLED</StateLabel>
                <FloatingInput label="Account ID" icon={<Icon.Lock className="w-3 h-3"/>} iconColor="text-gray-400" value="USR-00491" disabled />
              </div>
            </div>
          </StoryCard>

          {/* ════════════════════════════════════
              STORY 2 · Text Input — All States
          ════════════════════════════════════ */}
          <div className="flex items-center gap-2 mb-3 mt-8">
            <div className="w-3.5 h-3.5 border border-blue-400 rounded-sm flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-[1px]" />
            </div>
            <h2 className="text-[14px] font-semibold text-gray-800">Text Input — All States</h2>
          </div>
          <p className="text-[12px] text-gray-400 mb-4">
            Standard single-line text input. Shows all 7 states: default, hover, focus, disabled, error, success, loading.
          </p>

          <StoryCard>
            <Grid4>
              <div>
                <StateLabel>Default</StateLabel>
                <BInput placeholder="Enter value..." state="default" />
              </div>
              <div>
                <StateLabel>Hover</StateLabel>
                <BInput value="Hovering..." state="hover" />
              </div>
              <div>
                <StateLabel>Focus</StateLabel>
                <BInput value="Focused value" state="focus" />
              </div>
              <div>
                <StateLabel>Disabled</StateLabel>
                <BInput value="Not editable" state="disabled" disabled />
              </div>
            </Grid4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              <div>
                <StateLabel>Error</StateLabel>
                <BInput value="Invalid input" state="error" />
                <StateMsg type="error">This field is required</StateMsg>
              </div>
              <div>
                <StateLabel>Success</StateLabel>
                <BInput value="john@acme.com" state="success" />
                <StateMsg type="success">Looks good!</StateMsg>
              </div>
              <div>
                <StateLabel>Loading</StateLabel>
                <BInput value="Checking..." state="loading" suffix={<Icon.Loader className="w-3.5 h-3.5 text-blue-500 animate-spin" />} />
              </div>
            </div>
          </StoryCard>

          {/* ════════════════════════════════════
              STORY 3 · Email Input
          ════════════════════════════════════ */}
          <div className="flex items-center gap-2 mb-3 mt-8">
            <Icon.Mail className="w-3.5 h-3.5 text-red-400" />
            <h2 className="text-[14px] font-semibold text-gray-800">Email Input</h2>
          </div>

          <StoryCard>
            <Grid4>
              <div>
                <StateLabel>Default</StateLabel>
                <BInput placeholder="you@example.com" prefix={<Icon.Mail className="w-3.5 h-3.5" />} state="default" />
              </div>
              <div>
                <StateLabel>Focus</StateLabel>
                <BInput value="alice@acme.io" prefix={<Icon.Mail className="w-3.5 h-3.5 text-blue-500" />} state="focus" />
              </div>
              <div>
                <StateLabel>Disabled</StateLabel>
                <BInput value="locked@example.com" prefix={<Icon.Mail className="w-3.5 h-3.5" />} state="disabled" disabled />
              </div>
              <div>
                <StateLabel>Error</StateLabel>
                <BInput value="not-an-email" prefix={<Icon.Mail className="w-3.5 h-3.5 text-red-400" />} state="error" />
                <StateMsg type="error">Enter a valid email address</StateMsg>
              </div>
            </Grid4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div>
                <StateLabel>Success</StateLabel>
                <BInput
                  value="valid@domain.com"
                  prefix={<Icon.Mail className="w-3.5 h-3.5 text-green-500" />}
                  suffix={<Icon.Check className="w-3.5 h-3.5 text-green-500" />}
                  state="success"
                />
                <StateMsg type="success">Email verified</StateMsg>
              </div>
              <div>
                <StateLabel>Loading</StateLabel>
                <BInput
                  value="Verifying..."
                  prefix={<Icon.Mail className="w-3.5 h-3.5" />}
                  suffix={<Icon.Loader className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                  state="loading"
                />
              </div>
            </div>
          </StoryCard>

          {/* ════════════════════════════════════
              STORY 4 · Password Input
          ════════════════════════════════════ */}
          <div className="flex items-center gap-2 mb-3 mt-8">
            <Icon.Lock className="w-3.5 h-3.5 text-blue-400" />
            <h2 className="text-[14px] font-semibold text-gray-800">Password Input</h2>
          </div>

          <StoryCard>
            <Grid4>
              <div>
                <StateLabel>Default</StateLabel>
                <BInput type="password" placeholder="Enter password" prefix={<Icon.Lock className="w-3.5 h-3.5" />} suffix={<Icon.Eye className="w-3.5 h-3.5 cursor-pointer" />} state="default" />
              </div>
              <div>
                <StateLabel>Focus</StateLabel>
                <BInput
                  type={pwVisible ? "text" : "password"}
                  value="••••••••••"
                  prefix={<Icon.Lock className="w-3.5 h-3.5 text-blue-500" />}
                  suffix={
                    <button onClick={() => setPwVisible(v => !v)} className="text-gray-400 hover:text-gray-600">
                      {pwVisible ? <Icon.EyeOff className="w-3.5 h-3.5" /> : <Icon.Eye className="w-3.5 h-3.5" />}
                    </button>
                  }
                  state="focus"
                />
              </div>
              <div>
                <StateLabel>Disabled</StateLabel>
                <BInput type="password" value="••••••" prefix={<Icon.Lock className="w-3.5 h-3.5" />} suffix={<Icon.Lock className="w-3.5 h-3.5" />} state="disabled" disabled />
              </div>
              <div>
                <StateLabel>Error (weak)</StateLabel>
                <BInput type="password" value="••" prefix={<Icon.Lock className="w-3.5 h-3.5 text-red-400" />} suffix={<Icon.Eye className="w-3.5 h-3.5" />} state="error" />
                <StateMsg type="error">Password too weak — min 8 chars</StateMsg>
              </div>
            </Grid4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div>
                <StateLabel>Success (strong)</StateLabel>
                <BInput
                  type="password"
                  value="••••••••••••"
                  prefix={<Icon.Lock className="w-3.5 h-3.5 text-green-500" />}
                  suffix={<Icon.Check className="w-3.5 h-3.5 text-green-500" />}
                  state="success"
                />
                <StateMsg type="success">Strong password</StateMsg>
              </div>
              <div />
            </div>

            {/* Strength indicator */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <StateLabel>Strength indicator</StateLabel>
              <div className="max-w-sm">
                <BInput
                  type="password"
                  placeholder="Type to test strength..."
                  value={pw}
                  prefix={<Icon.Lock className="w-3.5 h-3.5 text-gray-400" />}
                  state={pw.length === 0 ? "default" : pwStrength === 1 ? "error" : pwStrength === 2 ? "default" : "success"}
                  onChange={(e) => setPw(e.target.value)}
                />
                <StrengthBar level={pwStrength} />
              </div>
            </div>
          </StoryCard>

          {/* ════════════════════════════════════
              STORY 5 · Number · Search · URL · Phone
          ════════════════════════════════════ */}
          <div className="flex items-center gap-2 mb-3 mt-8">
            <Icon.Hash className="w-3.5 h-3.5 text-blue-500" />
            <h2 className="text-[14px] font-semibold text-gray-800">Number · Search · URL · Phone — States</h2>
          </div>

          <StoryCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">

              {/* Number */}
              <div>
                <p className="text-[12px] font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                  <Icon.Hash className="w-3 h-3 text-blue-500" /> Number Input
                </p>
                <Grid2>
                  <div>
                    <StateLabel>Default</StateLabel>
                    <BInput type="number" placeholder="0" state="default" />
                  </div>
                  <div>
                    <StateLabel>Focus</StateLabel>
                    <BInput type="number" value="42" state="focus" />
                  </div>
                </Grid2>
                <Grid2>
                  <div className="mt-3">
                    <StateLabel>Disabled</StateLabel>
                    <BInput type="number" value="100" state="disabled" disabled />
                  </div>
                  <div className="mt-3">
                    <StateLabel>Error</StateLabel>
                    <BInput type="number" value="-5" state="error" />
                    <StateMsg type="error">Must be ≥ 0</StateMsg>
                  </div>
                </Grid2>
                <div className="mt-3 max-w-[48%]">
                  <StateLabel>Success</StateLabel>
                  <BInput type="number" value="256" state="success" />
                </div>
                <div className="mt-3 max-w-[48%]">
                  <StateLabel>Loading</StateLabel>
                  <BInput value="" placeholder="" state="loading" suffix={<Icon.Loader className="w-3.5 h-3.5 text-blue-400 animate-spin" />} />
                </div>
              </div>

              {/* Search */}
              <div>
                <p className="text-[12px] font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                  <Icon.Search className="w-3 h-3 text-blue-400" /> Search Input
                </p>
                <Grid2>
                  <div>
                    <StateLabel>Default</StateLabel>
                    <BInput placeholder="Search..." prefix={<Icon.Search className="w-3.5 h-3.5" />} state="default" />
                  </div>
                  <div>
                    <StateLabel>Focus</StateLabel>
                    <BInput value="cloudflare" prefix={<Icon.Search className="w-3.5 h-3.5 text-blue-500" />} state="focus" />
                  </div>
                </Grid2>
                <Grid2>
                  <div className="mt-3">
                    <StateLabel>Disabled</StateLabel>
                    <BInput value="Disabled" prefix={<Icon.Search className="w-3.5 h-3.5" />} state="disabled" disabled />
                  </div>
                  <div className="mt-3">
                    <StateLabel>Results found</StateLabel>
                    <BInput
                      value="domain.com"
                      prefix={<Icon.Search className="w-3.5 h-3.5 text-green-500" />}
                      suffix={<span className="text-[11px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">12</span>}
                      state="success"
                    />
                  </div>
                </Grid2>
                <div className="mt-3">
                  <StateLabel>Loading</StateLabel>
                  <BInput
                    value="Searching..."
                    prefix={<Icon.Search className="w-3.5 h-3.5" />}
                    suffix={<Icon.Loader className="w-3.5 h-3.5 text-blue-400 animate-spin" />}
                    state="loading"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">

              {/* URL */}
              <div>
                <p className="text-[12px] font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                  <Icon.Link className="w-3 h-3 text-blue-400" /> URL Input
                </p>
                <Grid2>
                  <div>
                    <StateLabel>Default</StateLabel>
                    <div className="flex h-10 border border-gray-200 rounded-lg overflow-hidden">
                      <span className="px-2.5 flex items-center bg-gray-50 border-r border-gray-200 text-[11.5px] text-gray-400 whitespace-nowrap">https://</span>
                      <input placeholder="example.com" className="flex-1 min-w-0 px-2.5 text-[13px] outline-none text-gray-800 placeholder:text-gray-300" />
                    </div>
                  </div>
                  <div>
                    <StateLabel>Focus</StateLabel>
                    <div className="flex h-10 border-2 border-blue-500 ring-[3px] ring-blue-100 rounded-lg overflow-hidden">
                      <span className="px-2.5 flex items-center bg-gray-50 border-r border-gray-200 text-[11.5px] text-gray-500 whitespace-nowrap">https://</span>
                      <input defaultValue="cloudflare.com" className="flex-1 min-w-0 px-2.5 text-[13px] outline-none text-gray-800" />
                    </div>
                  </div>
                </Grid2>
                <Grid2>
                  <div className="mt-3">
                    <StateLabel>Disabled</StateLabel>
                    <div className="flex h-10 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <span className="px-2.5 flex items-center bg-gray-50 border-r border-gray-200 text-[11.5px] text-gray-300 whitespace-nowrap">https://</span>
                      <input value="locked.com" disabled className="flex-1 min-w-0 px-2.5 text-[13px] outline-none text-gray-300 cursor-not-allowed bg-gray-50" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <StateLabel>Error</StateLabel>
                    <div className="flex h-10 border-2 border-red-400 ring-[3px] ring-red-50 rounded-lg overflow-hidden">
                      <span className="px-2.5 flex items-center bg-gray-50 border-r border-gray-200 text-[11.5px] text-gray-400 whitespace-nowrap">https://</span>
                      <input defaultValue="not a url" className="flex-1 min-w-0 px-2.5 text-[13px] outline-none text-gray-800" />
                    </div>
                    <StateMsg type="error">Invalid URL</StateMsg>
                  </div>
                </Grid2>
                <div className="mt-3 max-w-[48%]">
                  <StateLabel>Success</StateLabel>
                  <div className="flex h-10 border-2 border-green-500 ring-[3px] ring-green-50 rounded-lg overflow-hidden">
                    <span className="px-2.5 flex items-center bg-gray-50 border-r border-gray-200 text-[11.5px] text-gray-400 whitespace-nowrap">https://</span>
                    <input defaultValue="acme.io" className="flex-1 min-w-0 px-2.5 text-[13px] outline-none text-gray-800" />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <p className="text-[12px] font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
                  <Icon.Phone className="w-3 h-3 text-green-500" /> Phone Input
                </p>
                {[
                  { label: "Default", state: "default", value: "", placeholder: "98765 43210" },
                  { label: "Focus", state: "focus", value: "98765 43210", placeholder: "" },
                  { label: "Disabled", state: "disabled", value: "Disabled", placeholder: "" },
                  { label: "Error", state: "error", value: "123", placeholder: "", error: "Invalid phone number" },
                ].reduce((rows, item, i) => {
                  if (i % 2 === 0) rows.push([]);
                  rows[rows.length - 1].push(item);
                  return rows;
                }, []).map((row, ri) => (
                  <div key={ri} className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${ri > 0 ? "mt-3" : ""}`}>
                    {row.map(({ label, state, value, placeholder, error }) => (
                      <div key={label}>
                        <StateLabel>{label}</StateLabel>
                        <div className={`flex h-10 border rounded-lg overflow-hidden transition-all
                          ${state === "focus" ? "border-2 border-blue-500 ring-[3px] ring-blue-100" : ""}
                          ${state === "error" ? "border-2 border-red-400 ring-[3px] ring-red-50" : ""}
                          ${state === "disabled" ? "border-gray-200 bg-gray-50" : ""}
                          ${state === "default" ? "border-gray-200" : ""}
                        `}>
                          <span className="px-2.5 flex items-center gap-1 border-r border-gray-200 bg-gray-50 text-[11.5px] text-gray-600 whitespace-nowrap">
                            🇮🇳 <span className="text-gray-400">+91</span>
                          </span>
                          <input
                            value={value}
                            placeholder={placeholder}
                            disabled={state === "disabled"}
                            onChange={() => {}}
                            className={`flex-1 min-w-0 px-2.5 text-[13px] outline-none placeholder:text-gray-300
                              ${state === "disabled" ? "text-gray-300 cursor-not-allowed bg-gray-50" : "text-gray-800"}`}
                          />
                        </div>
                        {error && <StateMsg type="error">{error}</StateMsg>}
                      </div>
                    ))}
                  </div>
                ))}
                <div className="mt-3 max-w-[48%]">
                  <StateLabel>Success</StateLabel>
                  <div className="flex h-10 border-2 border-green-500 ring-[3px] ring-green-50 rounded-lg overflow-hidden">
                    <span className="px-2.5 flex items-center gap-1 border-r border-gray-200 bg-gray-50 text-[11.5px] text-gray-600 whitespace-nowrap">
                      🇮🇳 <span className="text-gray-400">+91</span>
                    </span>
                    <input defaultValue="98765 43210" className="flex-1 min-w-0 px-2.5 text-[13px] outline-none text-gray-800" />
                  </div>
                </div>
              </div>
            </div>
          </StoryCard>

          {/* ── Coming soon stub ── */}
          <div className="flex items-center gap-2 mb-3 mt-8">
            <div className="w-3.5 h-3.5 border-dashed border border-gray-400 rounded-sm" />
            <h2 className="text-[14px] font-semibold text-gray-500">More sections coming soon</h2>
            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">in progress</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Textarea", "Select Inputs", "Boolean Inputs", "Date & Time", "Slider / Range", "Phone Input"].map(name => (
              <div key={name} className="border border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 bg-white min-h-[80px]">
                <span className="text-[13px] font-medium text-gray-400">{name}</span>
                <span className="text-[11px] text-gray-300">Not yet built</span>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}