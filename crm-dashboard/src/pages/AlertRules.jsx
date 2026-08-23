import { useState, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import SingleSelect from "../components/ui/SingleSelect";
import { ExportIcon, RefreshIcon, AddIcon } from "../components/ui/Icons";
import ActionsCell from "../components/TableComponents/ActionsCell";
import { Section } from "../components/ui/Section";

// ── DATA ──────────────────────────────────────────────────────────────────────
const RULES_DATA = [
  {
    id: "RUL-001",
    name: "Error Rate > 2%",
    signal: "Errors",
    sev: "critical",
    cond: "error_rate > 2%",
    scope: "All tenants",
    channels: ["Slack", "PagerDuty"],
    fires: 3,
    last: "24m ago",
    by: "Arjun Kumar",
    enabled: true,
  },
  {
    id: "RUL-002",
    name: "p95 Latency > 600ms",
    signal: "Latency",
    sev: "critical",
    cond: "p95 > 600ms",
    scope: "All tenants",
    channels: ["Slack", "PagerDuty"],
    fires: 1,
    last: "1h ago",
    by: "Arjun Kumar",
    enabled: true,
  },
  {
    id: "RUL-003",
    name: "CPU Saturation > 80%",
    signal: "Saturation",
    sev: "critical",
    cond: "cpu > 80%",
    scope: "All tenants",
    channels: ["Slack", "PagerDuty"],
    fires: 2,
    last: "24m ago",
    by: "Priya Mehta",
    enabled: true,
  },
  {
    id: "RUL-004",
    name: "DB Pool > 70%",
    signal: "Saturation",
    sev: "warning",
    cond: "db_pool > 70%",
    scope: "All tenants",
    channels: ["Slack"],
    fires: 1,
    last: "2h ago",
    by: "Priya Mehta",
    enabled: true,
  },
  {
    id: "RUL-005",
    name: "p99 Latency > 1s",
    signal: "Latency",
    sev: "critical",
    cond: "p99 > 1000ms",
    scope: "All tenants",
    channels: ["Slack", "Email"],
    fires: 1,
    last: "18m ago",
    by: "Arjun Kumar",
    enabled: true,
  },
  {
    id: "RUL-006",
    name: "Error Rate > 1% (warning)",
    signal: "Errors",
    sev: "warning",
    cond: "error_rate > 1%",
    scope: "All tenants",
    channels: ["Slack"],
    fires: 4,
    last: "12m ago",
    by: "Arjun Kumar",
    enabled: true,
  },
  {
    id: "RUL-007",
    name: "429 Rate Limit > 5%",
    signal: "Traffic",
    sev: "warning",
    cond: "rate_429 > 5%",
    scope: "All tenants",
    channels: ["Slack", "Email"],
    fires: 1,
    last: "31m ago",
    by: "Rohan Sharma",
    enabled: true,
  },
  {
    id: "RUL-008",
    name: "p95 > 250ms (early warn)",
    signal: "Latency",
    sev: "warning",
    cond: "p95 > 250ms",
    scope: "Enterprise",
    channels: ["Slack"],
    fires: 2,
    last: "44m ago",
    by: "Rohan Sharma",
    enabled: true,
  },
  {
    id: "RUL-009",
    name: "RPS Drop > 50%",
    signal: "Traffic",
    sev: "warning",
    cond: "rps_drop > 50%",
    scope: "All tenants",
    channels: ["Slack", "PagerDuty"],
    fires: 0,
    last: "3d ago",
    by: "Arjun Kumar",
    enabled: true,
  },
  {
    id: "RUL-010",
    name: "Memory > 85%",
    signal: "Saturation",
    sev: "warning",
    cond: "memory > 85%",
    scope: "All tenants",
    channels: ["Slack"],
    fires: 0,
    last: "1d ago",
    by: "Priya Mehta",
    enabled: true,
  },
  {
    id: "RUL-011",
    name: "5xx Spike > 10/min",
    signal: "Errors",
    sev: "info",
    cond: "5xx > 10/min",
    scope: "Specific",
    channels: ["Email"],
    fires: 0,
    last: "Never",
    by: "Arjun Kumar",
    enabled: false,
  },
  {
    id: "RUL-012",
    name: "High RPS Alert > 1k",
    signal: "Traffic",
    sev: "info",
    cond: "rps > 1000",
    scope: "All tenants",
    channels: ["Slack"],
    fires: 0,
    last: "Never",
    by: "Dev Nair",
    enabled: false,
  },
];

const CHANGE_LOG = [
  {
    icon: "add",
    bg: "bg-blue-50",
    color: "text-blue-600",
    title: "New rule created — Error Rate > 1%",
    sub: "Arjun Kumar · RUL-006",
    time: "2h ago",
  },
  {
    icon: "edit",
    bg: "bg-amber-50",
    color: "text-amber-600",
    title: "Rule edited — p95 Latency > 600ms",
    sub: "Threshold changed 500ms → 600ms",
    time: "5h ago",
  },
  {
    icon: "pause",
    bg: "bg-gray-100",
    color: "text-gray-500",
    title: "Rule paused — 5xx Spike > 10/min",
    sub: "Rohan Sharma · maintenance window",
    time: "1d ago",
  },
  {
    icon: "delete",
    bg: "bg-red-50",
    color: "text-red-600",
    title: "Rule deleted — Old latency warning",
    sub: "Arjun Kumar · replaced by RUL-008",
    time: "2d ago",
  },
  {
    icon: "add",
    bg: "bg-blue-50",
    color: "text-blue-600",
    title: "New rule created — RPS Drop > 50%",
    sub: "Arjun Kumar · RUL-009",
    time: "3d ago",
  },
];

const SIG_COLOR = {
  Errors: { dot: "bg-red-500", text: "text-red-600" },
  Latency: { dot: "bg-amber-500", text: "text-amber-600" },
  Traffic: { dot: "bg-blue-500", text: "text-blue-600" },
  Saturation: { dot: "bg-purple-500", text: "text-purple-600" },
};

const SIG_COUNTS = [
  { s: "Errors", n: 4, color: "#dc2626" },
  { s: "Latency", n: 3, color: "#d97706" },
  { s: "Saturation", n: 3, color: "#7c3aed" },
  { s: "Traffic", n: 2, color: "#2563eb" },
];

const ALERT_GROUPS = {
  "Rule Info": { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Criteria: { hex: "#0d8294ff", bg: "bg-cyan-50", text: "text-cyan-700" },
  Notifications: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Activity: { hex: "#7c3aed", bg: "bg-purple-50", text: "text-purple-700" },
  Controls: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function SevBadge({ sev }) {
  const variantMap = { critical: "down", warning: "warning", info: "beta" };
  return (
    <Badge
      value={sev.charAt(0).toUpperCase() + sev.slice(1)}
      variant={variantMap[sev] ?? "default"}
    />
  );
}

function Toggle({ checked, onChange }) {
  return (
    <div
      className="relative w-9 h-5 cursor-pointer flex-shrink-0"
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
    >
      <div
        className={`absolute inset-0 rounded-full transition-colors duration-200 ${checked ? "bg-green-500" : "bg-gray-200"}`}
      />
      <div
        className={`absolute top-[3px] left-[3px] w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-4" : ""}`}
      />
    </div>
  );
}

// ── DRAWER ────────────────────────────────────────────────────────────────────
function RuleDrawer({ isOpen, mode, rule, onClose, onSave }) {
  const [condPreview, setCondPreview] = useState("error_rate > 2% for 5m");
  const [channels, setChannels] = useState(["Slack", "PagerDuty"]);
  const isEdit = mode === "edit";

  const toggleChannel = (ch) =>
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );

  const updatePreview = (e) => {
    setCondPreview(`error_rate > 2% for 5m`);
  };

  const CHANNEL_OPTIONS = [
    {
      id: "Slack",
      label: "Slack · #alerts",
      sub: "Fires immediately on trigger",
      color: "#611f69",
      connected: true,
    },
    {
      id: "PagerDuty",
      label: "PagerDuty · ops-critical",
      sub: "Critical only · auto-escalation",
      color: "#06ac38",
      connected: true,
    },
    {
      id: "Email",
      label: "Email · ops@company.com",
      sub: "Digest mode · 15 min cooldown",
      color: "#4285f4",
      connected: false,
    },
    {
      id: "Webhook",
      label: "Webhook · custom endpoint",
      sub: "POST JSON payload on fire",
      color: "#ff4a00",
      connected: false,
    },
  ];

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white transition-colors";
  const selectCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white cursor-pointer";
  const SecDiv = ({ children }) => (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-gray-400 mb-3 mt-5">
      {children}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/30 z-[998] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 w-[480px] max-w-full h-full bg-white border-l border-gray-200 z-[999] flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <div
              className="text-[15px] text-gray-800"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {isEdit ? "Edit Rule" : "New Alert Rule"}
            </div>
            <div className="text-[11.5px] text-gray-400 mt-0.5">
              {isEdit
                ? `${rule?.id} · ${rule?.name}`
                : "Configure condition, scope and notifications"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto px-5 py-5"
          style={{ scrollbarWidth: "thin" }}
        >
          <SecDiv>Rule identity</SecDiv>
          <div className="mb-3.5">
            <div className="text-[12.5px] text-gray-700 mb-1">Rule name</div>
            <input
              className={inputCls}
              defaultValue={rule?.name || ""}
              placeholder="e.g. Error Rate > 2% — All Tenants"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="mb-3.5">
              <div className="text-[12.5px] text-gray-700 mb-1">Severity</div>
              <select
                className={selectCls}
                defaultValue={rule?.sev || "warning"}
              >
                <option value="critical">🔴 Critical (P1)</option>
                <option value="warning">🟡 Warning (P2)</option>
                <option value="info">🔵 Info (P3)</option>
              </select>
            </div>
            <div className="mb-3.5">
              <div className="text-[12.5px] text-gray-700 mb-1">Signal</div>
              <select
                className={selectCls}
                defaultValue={rule?.signal || "Errors"}
              >
                <option>Errors</option>
                <option>Latency</option>
                <option>Traffic</option>
                <option>Saturation</option>
              </select>
            </div>
          </div>

          <SecDiv>Condition</SecDiv>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                className="flex-[2] border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12.5px] text-gray-800 outline-none focus:border-blue-500 bg-white cursor-pointer"
                onChange={updatePreview}
              >
                <option value="error_rate">Error rate</option>
                <option value="p95_latency">p95 Latency</option>
                <option value="p99_latency">p99 Latency</option>
                <option value="rps">Requests/min</option>
                <option value="cpu">CPU %</option>
                <option value="db_pool">DB Pool %</option>
              </select>
              <select className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12.5px] text-gray-800 outline-none focus:border-blue-500 bg-white cursor-pointer">
                <option>&gt; greater than</option>
                <option>&lt; less than</option>
                <option>≥ at least</option>
              </select>
              <input
                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12.5px] text-gray-800 outline-none focus:border-blue-500 bg-white"
                defaultValue="2"
              />
              <select className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12.5px] text-gray-800 outline-none focus:border-blue-500 bg-white cursor-pointer">
                <option>%</option>
                <option>ms</option>
                <option>rps</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-400 font-medium">for</span>
              <select className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12.5px] text-gray-800 outline-none focus:border-blue-500 bg-white cursor-pointer">
                <option>1 minute</option>
                <option selected>5 minutes</option>
                <option>10 minutes</option>
                <option>30 minutes</option>
              </select>
              <span className="text-[12px] text-gray-400 font-medium">
                consecutively
              </span>
            </div>
            <div>
              <div className="text-[11px] text-gray-400 mb-1.5">
                Condition preview
              </div>
              <div className="font-mono text-[12px] text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2 leading-relaxed">
                {condPreview}
              </div>
            </div>
          </div>

          <SecDiv>Scope</SecDiv>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="mb-3.5">
              <div className="text-[12.5px] text-gray-700 mb-1">Apply to</div>
              <select className={selectCls}>
                <option>All tenants</option>
                <option>By plan</option>
                <option>Specific tenant</option>
                <option>Specific endpoint</option>
              </select>
            </div>
            <div className="mb-3.5">
              <div className="text-[12.5px] text-gray-700 mb-1">
                Evaluation window
              </div>
              <select className={selectCls}>
                <option>Rolling 5 min</option>
                <option>Rolling 15 min</option>
                <option>Rolling 1 hour</option>
              </select>
            </div>
          </div>
          <div className="mb-3.5">
            <div className="text-[12.5px] text-gray-700 mb-1">
              Endpoints{" "}
              <span className="text-[11px] text-gray-400">(optional)</span>
            </div>
            <input
              className={inputCls}
              placeholder="e.g. /api/v2/deals, /api/v1/contacts or leave blank for all"
            />
          </div>

          <SecDiv>Notification channels</SecDiv>
          <div className="flex flex-col gap-2">
            {CHANNEL_OPTIONS.map((ch) => {
              const selected = channels.includes(ch.id);
              return (
                <div
                  key={ch.id}
                  onClick={() => toggleChannel(ch.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 border rounded-xl cursor-pointer transition-all ${selected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50/40"}`}
                >
                  <div
                    className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${selected ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}
                  >
                    {selected && (
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] text-gray-800">{ch.label}</div>
                    <div className="text-[11.5px] text-gray-400">{ch.sub}</div>
                  </div>
                  <Badge
                    value={ch.connected ? "Connected" : "Available"}
                    variant={ch.connected ? "active" : "default"}
                  />
                </div>
              );
            })}
          </div>

          <SecDiv>Behaviour</SecDiv>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="mb-3.5">
              <div className="text-[12.5px] text-gray-700 mb-1">
                Re-alert cooldown
              </div>
              <select className={selectCls}>
                <option>No cooldown</option>
                <option selected>15 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
              </select>
            </div>
            <div className="mb-3.5">
              <div className="text-[12.5px] text-gray-700 mb-1">
                Auto-resolve after
              </div>
              <select className={selectCls}>
                <option>Never (manual)</option>
                <option selected>Condition clears</option>
                <option>1 hour</option>
              </select>
            </div>
          </div>
          <div className="mb-3.5">
            <div className="text-[12.5px] text-gray-700 mb-1">
              Description{" "}
              <span className="text-[11px] text-gray-400">(optional)</span>
            </div>
            <textarea
              className={`${inputCls} resize-y leading-relaxed`}
              rows={2}
              placeholder="Add context for on-call engineers…"
            />
          </div>
        </div>

        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex gap-2 flex-shrink-0">
          <button
            onClick={onSave}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white text-[12.5px] rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Save rule
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 border border-gray-200 text-[12.5px] text-gray-500 rounded-lg hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
          {isEdit && (
            <button
              onClick={onClose}
              className="px-3 py-2 border border-red-200 text-[12.5px] text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="inline mr-1"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AlertRules() {
  const [rules, setRules] = useState(RULES_DATA.map((r) => ({ ...r })));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("new");
  const [activeRule, setActiveRule] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sigFilter, setSigFilter] = useState(null);
  const [sevFilter, setSevFilter] = useState(null);
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);

  const openNew = () => {
    setDrawerMode("new");
    setActiveRule(null);
    setDrawerOpen(true);
  };
  const openEdit = (row) => {
    setDrawerMode("edit");
    setActiveRule(row);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setActiveRule(null);
  };

  const toggleRule = (id, val) =>
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: val } : r)),
    );

  const filtered = useMemo(
    () =>
      rules.filter((r) => {
        if (statusFilter === "enabled" && !r.enabled) return false;
        if (statusFilter === "paused" && r.enabled) return false;
        if (sigFilter && r.signal !== sigFilter) return false;
        if (sevFilter && r.sev !== sevFilter) return false;
        if (
          query &&
          !r.name.toLowerCase().includes(query.toLowerCase()) &&
          !r.signal.toLowerCase().includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [rules, statusFilter, sigFilter, sevFilter, query],
  );

  const paginated = filtered.slice(
    pageIndex * pageLimit,
    (pageIndex + 1) * pageLimit,
  );

  const columns = [
    {
      id: "enabled",
      name: "On",
      width: 60,
      group: "Controls",
      disableSortBy: true,
      cell: (row) => (
        <Toggle checked={row.enabled} onChange={(v) => toggleRule(row.id, v)} />
      ),
    },
    {
      id: "name",
      name: "Rule Name",
      width: 220,
      group: "Rule Info",
      cell: (row) => (
        <div>
          <div className="text-[13px] text-gray-800 font-medium">
            {row.name}
          </div>
          <div className="font-mono text-[10.5px] text-gray-400 mt-0.5">
            {row.id}
          </div>
        </div>
      ),
    },
    {
      id: "signal",
      name: "Signal",
      width: 120,
      group: "Rule Info",
      cell: (row) => {
        const s = SIG_COLOR[row.signal] || {
          dot: "bg-gray-400",
          text: "text-gray-600",
        };
        return (
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
            <span className={`text-[12.5px] ${s.text}`}>{row.signal}</span>
          </div>
        );
      },
    },
    {
      id: "sev",
      name: "Severity",
      width: 100,
      group: "Criteria",
      cell: (row) => <SevBadge sev={row.sev} />,
    },
    {
      id: "cond",
      name: "Condition",
      width: 180,
      group: "Criteria",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-blue-600">
          {row.cond}
        </span>
      ),
    },
    {
      id: "scope",
      name: "Scope",
      width: 120,
      group: "Criteria",
      cell: (row) => (
        <span className="text-[12px] text-gray-500">{row.scope}</span>
      ),
    },
    {
      id: "channels",
      name: "Channels",
      width: 160,
      group: "Notifications",
      cell: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.channels.map((c) => (
            <Badge key={c} value={c} variant="default" />
          ))}
        </div>
      ),
    },
    {
      id: "fires",
      name: "Fires today",
      width: 90,
      group: "Activity",
      cell: (row) => (
        <span
          className={`font-mono text-[12.5px] ${row.fires > 0 ? "text-red-600" : "text-gray-400"}`}
        >
          {row.fires}×
        </span>
      ),
    },
    {
      id: "last",
      name: "Last fired",
      width: 100,
      group: "Activity",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-gray-400">
          {row.last}
        </span>
      ),
    },
    {
      id: "by",
      name: "Created by",
      width: 120,
      group: "Activity",
      cell: (row) => (
        <span className="text-[12px] text-gray-400">{row.by}</span>
      ),
    },
    {
      id: "actions",
      name: "Actions",
      width: 60,
      pinnedRight: true,
      disableSortBy: true,
      cell: (row) => (
        <ActionsCell
          row={row}
          actions={[
            {
              name: "View",
              icon: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ),
              onClick: (row) => console.log("View", row),
            },
            {
              name: "Edit",
              icon: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              ),
              onClick: (row) => console.log("Edit", row),
            },
            {
              name: "Delete",
              danger: true,
              icon: (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              ),
              onClick: (row) => console.log("Delete", row),
            },
          ]}
        />
      ),
    },
  ];

  const changeIcons = {
    add: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    edit: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    pause: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
      </svg>
    ),
    delete: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      </svg>
    ),
  };

  const stats = [
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M20 12h2M2 12h2M17.66 17.66l1.41 1.41M4.93 4.93l1.41 1.41" />
        </svg>
      ),
      count: "12",
      countColor: "",
      title: "Total Rules",
      badgeText: "▲ +2 this week",
      badgeBg: "bg-blue-50",
      badgeTextColor: "text-blue-600",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="1.8"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      count: "10",
      countColor: "text-green-600",
      title: "Enabled Rules",
      badgeText: "2 paused",
      badgeBg: "bg-green-50",
      badgeTextColor: "text-green-600",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#dc2626"
          strokeWidth="1.8"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        </svg>
      ),
      count: "25",
      countColor: "text-red-600",
      title: "Fired Today",
      badgeText: "▲ +7 vs yesterday",
      badgeBg: "bg-red-50",
      badgeTextColor: "text-red-600",
    },
    {
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0891b2"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      count: "14m",
      countColor: "text-cyan-600",
      title: "Avg Resolution",
      badgeText: "▼ −3m vs yesterday",
      badgeBg: "bg-cyan-50",
      badgeTextColor: "text-cyan-600",
    },
  ];

  const maxSig = Math.max(...SIG_COUNTS.map((x) => x.n));

  return (
    <div className="container-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <PageHeader
          icon={
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M20 12h2M2 12h2M17.66 17.66l1.41 1.41M4.93 4.93l1.41 1.41" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="Alert Rules"
          breadcrumbs={[
            { label: "Home", href: "#" },
            { label: "Operations", href: "#" },
            { label: "Alert Rules" },
          ]}
        />
        <div className="flex items-center gap-2">
          <ActionButton action="refresh" label="Refresh" icon={RefreshIcon} />
          <ActionButton action="export" label="Export" icon={ExportIcon} />
          <ActionButton
            action="search"
            onClick={openNew}
            label="New Rule"
            icon={AddIcon}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <Section>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <StatCard
                key={i}
                icon={s.icon}
                count={s.count}
                countColor={s.countColor}
                title={s.title}
                badgeText={s.badgeText}
                badgeBg={s.badgeBg}
                badgeTextColor={s.badgeTextColor}
              />
            ))}
          </div>
        </Section>

        <Section>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Firing history placeholder */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center gap-1.5 text-[13px] text-gray-700"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                </svg>
                Rule Firing History — Last 7 Days
              </div>
              <div className="px-5 py-4">
                {/* Simple bar chart */}
                {[
                  ["Mon", 3, 5],
                  ["Tue", 1, 6],
                  ["Wed", 2, 4],
                  ["Thu", 4, 3],
                  ["Fri", 3, 7],
                  ["Sat", 1, 2],
                  ["Sun", 2, 4],
                ].map(([day, crit, warn]) => (
                  <div key={day} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] text-gray-400 w-7 shrink-0">
                      {day}
                    </span>
                    <div className="flex-1 flex gap-0.5 h-4">
                      <div
                        className="bg-red-400/70 rounded-sm"
                        style={{ width: `${crit * 8}%` }}
                      />
                      <div
                        className="bg-amber-400/60 rounded-sm"
                        style={{ width: `${warn * 8}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-gray-400 w-6 text-right">
                      {crit + warn}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-[11px] text-gray-400">Critical</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[11px] text-gray-400">Warning</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules by signal */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div
                className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 text-[13px] text-gray-700"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Rules by Signal
              </div>
              <div className="px-5 py-4 flex flex-col gap-3.5">
                {SIG_COUNTS.map((s) => (
                  <div key={s.s} className="flex items-center gap-3">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: s.color }}
                    />
                    <span className="text-[13px] text-gray-700 min-w-[90px]">
                      {s.s}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full opacity-80 transition-all duration-700"
                        style={{
                          width: `${Math.round((s.n / maxSig) * 100)}%`,
                          background: s.color,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-gray-400 min-w-[18px] text-right">
                      {s.n}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section>
          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <Table
              columns={columns}
              group={ALERT_GROUPS}
              tableName="alert-rules"
              data={paginated}
              loading={false}
              enableSearch={true}
              searchInput={query}
              setSearchInput={(val) => {
                setQuery(val);
                setPageIndex(0);
              }}
              pageIndex={pageIndex}
              setPageIndex={setPageIndex}
              pageLimit={pageLimit}
              setPageLimit={setPageLimit}
              paginationData={{
                totalCount: filtered.length,
                totalPages: Math.ceil(filtered.length / pageLimit) || 1,
              }}
              onRowClick={openEdit}
              sortField={sortField}
              setSortField={setSortField}
              sortType={sortType}
              setSortType={setSortType}
              activeFilters={{}}
              setActiveFilters={() => {}}
              additionalControls={
                <div className="flex items-center gap-2">
                  {/* Status filter */}
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden shrink-0">
                    {[
                      { id: "all", label: "All" },
                      { id: "enabled", label: "Enabled" },
                      { id: "paused", label: "Paused" },
                    ].map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => {
                          setStatusFilter(id);
                          setPageIndex(0);
                        }}
                        className={`px-3 py-1 text-[12px] border-r last:border-r-0 border-gray-200 transition-colors ${statusFilter === id ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <SingleSelect
                    value={sigFilter}
                    onChange={(val) => {
                      setSigFilter(val);
                      setPageIndex(0);
                    }}
                    placeholder="All Signals"
                    options={[
                      { value: null, label: "All Signals" },
                      { value: "Errors", label: "Errors", dot: "#dc2626" },
                      { value: "Latency", label: "Latency", dot: "#d97706" },
                      { value: "Traffic", label: "Traffic", dot: "#2563eb" },
                      {
                        value: "Saturation",
                        label: "Saturation",
                        dot: "#7c3aed",
                      },
                    ]}
                    className="border-gray-200"
                  />
                  <SingleSelect
                    value={sevFilter}
                    onChange={(val) => {
                      setSevFilter(val);
                      setPageIndex(0);
                    }}
                    placeholder="All Severities"
                    options={[
                      { value: null, label: "All Severities" },
                      { value: "critical", label: "Critical", dot: "#dc2626" },
                      { value: "warning", label: "Warning", dot: "#d97706" },
                      { value: "info", label: "Info", dot: "#2563eb" },
                    ]}
                    className="border-gray-200 min-w-[140px]"
                  />
                </div>
              }
            />
          </div>
        </Section>

        <Section>
          {/* Change Log */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
              <div
                className="flex items-center gap-1.5 text-[13px] text-gray-700"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Rule Change Log
              </div>
              <button className="px-2.5 py-1 border border-gray-200 rounded-md text-[11.5px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                Full audit
              </button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-0">
              {CHANGE_LOG.map((e, i) => (
                <div key={i} className="flex gap-3 pb-3.5 relative">
                  {i < CHANGE_LOG.length - 1 && (
                    <div className="absolute left-[13px] top-6 bottom-0 w-[2px] bg-gray-100" />
                  )}
                  <div
                    className={`w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${e.bg} ${e.color}`}
                  >
                    {changeIcons[e.icon]}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="text-[12.5px] text-gray-800">{e.title}</div>
                    <div className="text-[11.5px] text-gray-400">{e.sub}</div>
                    <div className="text-[11px] text-gray-300 mt-0.5">
                      {e.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Drawer */}
      <RuleDrawer
        isOpen={drawerOpen}
        mode={drawerMode}
        rule={activeRule}
        onClose={closeDrawer}
        onSave={closeDrawer}
      />
    </div>
  );
}
