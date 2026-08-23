"use client";

import { useState } from "react";
import SingleSelect from "../formComponents/SingleSelect";
import AvatarSelect from "../formComponents/AvatarSelect";
import MultiSelect from "../formComponents/MultiSelect";
import AvatarMultiSelect from "../formComponents/AvatarMultiSelect";
import { Clock, Star, Zap, Flame, CheckCircle, XCircle } from "lucide-react";

// ─── Sidebar nav data (same as InputShowcase) ─────────────────────────────────
const NAV = [
  { group: "TEXT INPUTS", items: [{ label: "Text Inputs", count: 7 }, { label: "Textarea", count: 3 }] },
  { group: "SELECT", items: [{ label: "Select Inputs", count: 5, active: true }] },
  { group: "BOOLEAN", items: [{ label: "Boolean Inputs", count: 5 }] },
  { group: "DATE & TIME", items: [{ label: "Date & Time", count: 4 }] },
  { group: "SPECIAL", items: [{ label: "Special Inputs", count: 5 }] },
  { group: "RANGE & STEP", items: [{ label: "Slider / Range", count: 2 }, { label: "Step Input", count: 1 }] },
  { group: "LOCATION", items: [{ label: "Location Input", count: 3 }] },
  { group: "PAYMENT", items: [{ label: "Payment Input", count: 3 }] },
  { group: "ADVANCED", items: [{ label: "Advanced Inputs", count: 4 }] },
  { group: "SYSTEM", items: [{ label: "Hidden / System", count: 3 }] },
];
const USERS = [
  {
    label: "Alice Johnson", value: "alice",
    initials: "AJ", sub: "Sales Lead", color: "bg-purple-600",
    image: "https://i.pravatar.cc/80?img=47",
  },
  {
    label: "Bob Martinez", value: "bob",
    initials: "BM", sub: "Account Exec", color: "bg-green-600",
    image: "https://i.pravatar.cc/80?img=12",
  },
  {
    label: "Carol Kim", value: "carol",
    initials: "CK", sub: "SDR", color: "bg-orange-500",
    image: "https://i.pravatar.cc/80?img=32",
  },
  {
    label: "David Ren", value: "david",
    initials: "DR", sub: "On leave", color: "bg-gray-300",
    image: "https://i.pravatar.cc/80?img=53",
    disabled: true,
  },
];
const Status = [
  { value: "prospecting", label: "Prospecting", dot: "#9ca3af" },
  { value: "qualified", label: "Qualified", dot: "#3b82f6" },
  { value: "proposal", label: "Proposal", dot: "#a855f7" },
  { value: "negotiation", label: "Negotiation", dot: "#f97316" },
  { value: "closed_won", label: "Closed Won", dot: "#22c55e" },
  { value: "closed_lost", label: "Closed Lost", dot: "#ef4444" },
];
const STAGES = [
  { value: "prospecting", label: "Prospecting", },
  { value: "qualified", label: "Qualified", },
  { value: "proposal", label: "Proposal", },
  { value: "negotiation", label: "Negotiation", },
  { value: "closed_won", label: "Closed Won", },
  { value: "closed_lost", label: "Closed Lost", },
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

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const LayersIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);
const ChevronDown = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="m4 6 4 4 4-4" />
  </svg>
);

// ─── Layout helpers ───────────────────────────────────────────────────────────
const StateLabel = ({ children }) => (
  <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">{children}</p>
);

const StateMsg = ({ type, children }) => {
  if (!children) return null;
  const cls = type === "error" ? "text-red-500" : "text-green-600";
  return <p className={`text-[11px] mt-1 ${cls}`}>{children}</p>;
};

const StoryCard = ({ children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">{children}</div>
);
const UserIcon = () => (
  <svg
    className="w-3 h-3"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const Divider = () => <hr className="border-gray-100 my-6" />;

const SectionHeading = ({ icon, color = "text-orange-500", title, description }) => (
  <div className="mb-4 mt-8">
    <div className="flex items-center gap-2 mb-1">
      <span className={color}>{icon}</span>
      <h2 className="text-[14px] font-semibold text-gray-800">{title}</h2>
    </div>
    {description && <p className="text-[12px] text-gray-400 ml-6">{description}</p>}
  </div>
);

// ─── Option datasets ──────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "failed", label: "Failed" },
  { value: "pending", label: "Pending" },
];

const DEPT_OPTIONS = [
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
  { value: "product", label: "Product" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "Human Resources" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const COUNTRY_OPTIONS = [
  { value: "in", label: "India" },
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "sg", label: "Singapore" },
  { value: "de", label: "Germany" },
];
const Data = [
  { value: "prospecting",  label: "Prospecting",  icon: <Clock size={16} color="#9ca3af" /> },
  { value: "qualified",    label: "Qualified",    icon: <Star size={16} color="#3b82f6" /> },
  { value: "proposal",     label: "Proposal",     icon: <Zap size={16} color="#a855f7" /> },
  { value: "negotiation",  label: "Negotiation",  icon: <Flame size={16} color="#f97316" /> },
  { value: "closed_won",   label: "Closed Won",   icon: <CheckCircle size={16} color="#22c55e" /> },
  { value: "closed_lost",  label: "Closed Lost",  icon: <XCircle size={16} color="#ef4444" /> },
];
// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SingleSelectShowcase() {
  const [user, setUser] = useState("");
  // Story 1 — All States
  const [s1Default, setS1Default] = useState(null);
  const [s1Hover, setS1Hover] = useState({ value: "active", label: "Active" });
  const [s1Focus, setS1Focus] = useState({ value: "active", label: "Active" });
  const [s1Success, setS1Success] = useState({ value: "active", label: "Active" });
  const [assignees, setAssignees] = useState([]);
  // Story 2 — With Label variants
  const [s2A, setS2A] = useState(null);
  const [s2B, setS2B] = useState({ value: "engineering", label: "Engineering" });
  const [s2C, setS2C] = useState(null);
  const [s2D, setS2D] = useState({ value: "high", label: "High" });

  // Story 3 — Real-world usage
  const [dept, setDept] = useState(null);
  const [priority, setPriority] = useState({ value: "medium", label: "Medium" });
  const [country, setCountry] = useState(null);
  const [status, setStatus] = useState({ value: "active", label: "Active" });
  const [stages, setStages] = useState([]);
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-800">

      {/* ── Sidebar ── */}
      {/* <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <span className="text-[13px] font-bold text-gray-900">WDC Storybook</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5 tracking-widest uppercase">Input Components · V2.0</p>
        </div>

        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md px-2 h-7">
            <SearchIcon className="w-3 h-3 text-gray-400" />
            <input placeholder="Search components..." className="flex-1 bg-transparent text-[11.5px] outline-none placeholder:text-gray-400" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.map(({ group, items }) => (
            <div key={group} className="mb-1">
              <p className="px-4 py-1 text-[9.5px] font-semibold tracking-widest text-gray-400 uppercase">{group}</p>
              {items.map(({ label, count, active }) => (
                <button
                  key={label}
                  className={`w-full flex items-center justify-between px-4 py-1.5 text-[12.5px] rounded transition-colors
                    ${active ? "bg-orange-50 text-orange-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-orange-400" : DOT_COLORS[group] || "bg-gray-300"}`} />
                    {label}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium
                    ${active ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside> */}

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">

        {/* Page header */}
        <div className="border-b border-gray-200 bg-white px-8 py-4">
          <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-1">
            <span>Components</span><span>›</span>
            <span>Select Inputs</span><span>›</span>
            <span className="text-gray-700 font-medium">Single Select</span>
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 flex items-center gap-2">
            <LayersIcon className="w-5 h-5 text-orange-400" />
            Single Select
          </h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Searchable single-select dropdown with all states and label variants.
          </p>
          <div className="mt-3">
            <code className="text-[12px] bg-gray-100 text-gray-500 px-2.5 py-1.5 rounded-lg">
              import SingleSelect from "../components/SingleSelect"
            </code>
          </div>
        </div>

        <div className="px-8 py-7 max-w-5xl">

          {/* ══════════════════════════════════════
              STORY 1 · Dropdown (Single Select) — States
          ══════════════════════════════════════ */}

          {/* ══════════════════════════════════════
              STORY 2 · With Label Variants
          ══════════════════════════════════════ */}
          <SectionHeading
            icon={<LayersIcon className="w-3.5 h-3.5" />}
            color="text-orange-400"
            title="With Label — Variants"
            description="Optional label prop renders above the select. Required fields show a red asterisk."
          />


          <StoryCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                {/* <StateLabel>Hover</StateLabel> */}

                <SingleSelect
                  label="Status"
                  icon={<UserIcon />}   // 👈 add this
                  options={STATUS_OPTIONS}
                  value={s1Hover}
                  onChange={setS1Hover}
                  placeholder="Select..."
                />
              </div>
              <div>
                <SingleSelect
                  label="Status"
                  icon={<UserIcon />}
                  required
                  options={STATUS_OPTIONS}
                  value={s2A}
                  onChange={setS2A}
                  placeholder="Select status"
                  error={!s2A ? "Required" : ""}
                />
              </div>
              <div>
                <SingleSelect
                  label="Department"
                  icon={<UserIcon />}
                  options={DEPT_OPTIONS}
                  value={s2B}
                  onChange={setS2B}
                  placeholder="Select department"
                  maxOptionsVisible={4}
                />
              </div>
              <div>
                <SingleSelect
                  label="Country"
                  icon={<UserIcon />}
                  options={COUNTRY_OPTIONS}
                  value={s2C}
                  onChange={setS2C}
                  placeholder="Select country"
                />
              </div>
              <div>
                <SingleSelect
                  label="Priority"
                  required
                  icon={<UserIcon />}
                  options={PRIORITY_OPTIONS}
                  value={s2D}
                  onChange={setS2D}
                  success="Priority set"
                />
              </div>
            </div>

            <Divider />

            {/* Disabled + loading with label */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <SingleSelect
                  icon={<UserIcon />}
                  label="Assigned To"
                  options={[]}
                  value={null}
                  onChange={() => { }}
                  placeholder="Unassigned"
                  disabled
                />
              </div>
              <div>
                <SingleSelect
                  label="Region"
                  options={[]}
                  icon={<UserIcon />}
                  value={null}
                  onChange={() => { }}
                  placeholder="Loading..."
                  loading
                />
              </div>
              <div>
                <SingleSelect
                  label="Category"
                  required
                  icon={<UserIcon />}
                  options={DEPT_OPTIONS}
                  value={null}
                  onChange={() => { }}
                  placeholder="Select category"
                  error="Category is required"
                />
              </div>
              <div>
                <SingleSelect
                  label="Role"
                  options={[
                    { value: "admin", label: "Admin" },
                    { value: "editor", label: "Editor" },
                    { value: "viewer", label: "Viewer" },
                  ]}
                  value={{ value: "admin", label: "Admin" }}
                  onChange={() => { }}
                  icon={<UserIcon />}
                  success="Access granted"
                />
              </div>
              <SectionHeading
                icon={<LayersIcon className="w-3.5 h-3.5" />}
                color="text-orange-400"
                title="profile image — Variants"
                description="Optional label prop renders above the select. Required fields show a red asterisk."
              />
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"></div>
                <AvatarSelect
                  label="Select Assignee"
                  icon={<UserIcon />}
                  options={USERS}
                  value={user}
                  onChange={setUser}
                  placeholder="Select assignee"
                  errp
                />
              </div>

              <AvatarMultiSelect
                label="Assignees"
                placeholder="Select team members…"
                icon={<UserIcon />}
                options={USERS}
                value={assignees}
                onChange={setAssignees}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div><MultiSelect
                icon={<UserIcon />}
                label="Pipeline stages"
                placeholder="Select stages…"
                options={STAGES}
                value={stages}
                onChange={setStages}
                required
              />

              </div>
              <div>
                <MultiSelect
                  icon={<UserIcon />}
                  label="Status stages"
                  placeholder="Status stages…"
                  options={Status}
                  value={stages}
                  onChange={setStages}
                  required
                />
              </div>
              <div>
              <MultiSelect
      label="Pipeline stages"
      placeholder="Select stages…"
      options={Data}
      value={stages}
      onChange={setStages}
      required
    /></div>
            </div>
          </StoryCard>



        </div>

      </main>
    </div>
  );
}