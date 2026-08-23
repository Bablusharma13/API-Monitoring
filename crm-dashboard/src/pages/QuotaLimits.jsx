import { useState, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { Badge } from "../components/ui/Badge";
import { Table } from "../components/TableComponents/Table";
import SingleSelect from "../components/ui/SingleSelect";
import { ExportIcon, RefreshIcon, AddIcon } from "../components/ui/Icons";
import ActionsCell from "../components/TableComponents/ActionsCell";

// ── DATA ──────────────────────────────────────────────────────────────────────
const TENANTS_RAW = [
  {
    name: "Strata AI",
    color: "#0891b2",
    plan: "Pro",
    monthCap: 3000000,
    used: 2820000,
    rateLimit: 500,
    rps: 488,
    burst: 650,
    t429: 980,
    resetDays: 12,
  },
  {
    name: "Pulsar Labs",
    color: "#ea580c",
    plan: "Pro",
    monthCap: 3000000,
    used: 2640000,
    rateLimit: 500,
    rps: 387,
    burst: 650,
    t429: 420,
    resetDays: 12,
  },
  {
    name: "Velox Inc",
    color: "#16a34a",
    plan: "Pro",
    monthCap: 3000000,
    used: 2430000,
    rateLimit: 500,
    rps: 541,
    burst: 650,
    t429: 310,
    resetDays: 12,
  },
  {
    name: "Nexus Corp",
    color: "#2563eb",
    plan: "Enterprise",
    monthCap: 10000000,
    used: 3200000,
    rateLimit: 1200,
    rps: 820,
    burst: 1500,
    t429: 0,
    resetDays: 12,
  },
  {
    name: "Delphi Sys",
    color: "#d97706",
    plan: "Pro",
    monthCap: 3000000,
    used: 1980000,
    rateLimit: 500,
    rps: 334,
    burst: 650,
    t429: 80,
    resetDays: 12,
  },
  {
    name: "Orbis Tech",
    color: "#7c3aed",
    plan: "Enterprise",
    monthCap: 10000000,
    used: 4800000,
    rateLimit: 1200,
    rps: 614,
    burst: 1500,
    t429: 0,
    resetDays: 12,
  },
  {
    name: "Crest Digital",
    color: "#db2777",
    plan: "Pro",
    monthCap: 3000000,
    used: 1440000,
    rateLimit: 500,
    rps: 310,
    burst: 650,
    t429: 120,
    resetDays: 12,
  },
  {
    name: "Aether Co",
    color: "#4f46e5",
    plan: "Enterprise",
    monthCap: 10000000,
    used: 2800000,
    rateLimit: 1200,
    rps: 498,
    burst: 1500,
    t429: 0,
    resetDays: 12,
  },
  {
    name: "Solaris Tech",
    color: "#059669",
    plan: "Pro",
    monthCap: 3000000,
    used: 1200000,
    rateLimit: 500,
    rps: 290,
    burst: 650,
    t429: 0,
    resetDays: 12,
  },
  {
    name: "Apex Systems",
    color: "#64748b",
    plan: "Starter",
    monthCap: 500000,
    used: 422000,
    rateLimit: 120,
    rps: 88,
    burst: 150,
    t429: 220,
    resetDays: 12,
  },
  {
    name: "Nova Platforms",
    color: "#a855f7",
    plan: "Pro",
    monthCap: 3000000,
    used: 680000,
    rateLimit: 500,
    rps: 144,
    burst: 650,
    t429: 0,
    resetDays: 12,
  },
  {
    name: "Magna Cloud",
    color: "#dc2626",
    plan: "Enterprise",
    monthCap: 10000000,
    used: 1900000,
    rateLimit: 1200,
    rps: 890,
    burst: 1500,
    t429: 0,
    resetDays: 12,
  },
  {
    name: "Flux Systems",
    color: "#ef4444",
    plan: "Starter",
    monthCap: 500000,
    used: 188000,
    rateLimit: 120,
    rps: 22,
    burst: 150,
    t429: 0,
    resetDays: 12,
  },
  {
    name: "Indigo Labs",
    color: "#6366f1",
    plan: "Starter",
    monthCap: 500000,
    used: 210000,
    rateLimit: 120,
    rps: 44,
    burst: 150,
    t429: 0,
    resetDays: 12,
  },
].map((t) => {
  const pct = Math.round((t.used / t.monthCap) * 100);
  const rpsPct = Math.round((t.rps / t.rateLimit) * 100);
  const status = pct >= 95 ? "over" : pct >= 80 ? "warn" : "ok";
  return { ...t, pct, rpsPct, status };
});

const ENFORCE_LOG = [
  {
    t: "10:42:18",
    tenant: "Strata AI",
    event: "Rate limit hit",
    val: "512 rps",
    action: "429 returned",
  },
  {
    t: "10:38:44",
    tenant: "Apex Systems",
    event: "Quota warning 85%",
    val: "422k/500k",
    action: "Alert sent",
  },
  {
    t: "10:31:22",
    tenant: "Pulsar Labs",
    event: "Rate limit hit",
    val: "506 rps",
    action: "429 returned",
  },
  {
    t: "10:22:05",
    tenant: "Strata AI",
    event: "Burst limit hit",
    val: "660 rps",
    action: "Throttled",
  },
  {
    t: "10:18:33",
    tenant: "Velox Inc",
    event: "Rate limit hit",
    val: "508 rps",
    action: "429 returned",
  },
  {
    t: "09:55:12",
    tenant: "Apex Systems",
    event: "Quota warning 80%",
    val: "400k/500k",
    action: "Alert sent",
  },
  {
    t: "09:44:08",
    tenant: "Pulsar Labs",
    event: "Quota warning 80%",
    val: "2.4M/3M",
    action: "Alert sent",
  },
  {
    t: "09:30:01",
    tenant: "Crest Digital",
    event: "Rate limit hit",
    val: "502 rps",
    action: "429 returned",
  },
];

const CHANGE_LOG = [
  {
    icon: "edit",
    bg: "bg-amber-50",
    color: "text-amber-600",
    title: "Nexus Corp limit raised",
    sub: "Rate 1,000 → 1,200 rps · Arjun Kumar",
    time: "2h ago",
  },
  {
    icon: "add",
    bg: "bg-blue-50",
    color: "text-blue-600",
    title: "Apex Systems plan upgraded",
    sub: "Starter → Pro · auto-bump on billing",
    time: "1d ago",
  },
  {
    icon: "edit",
    bg: "bg-amber-50",
    color: "text-amber-600",
    title: "Strata AI burst increased",
    sub: "500 → 650 rps · Priya Mehta",
    time: "2d ago",
  },
  {
    icon: "edit",
    bg: "bg-amber-50",
    color: "text-amber-600",
    title: "Pulsar Labs quota raised",
    sub: "3M → 4M calls · contract renewal",
    time: "5d ago",
  },
  {
    icon: "alert",
    bg: "bg-red-50",
    color: "text-red-600",
    title: "Flux Systems hard limited",
    sub: "Over quota · automatic enforcement",
    time: "1w ago",
  },
];

const PLAN_DATA = [
  { label: "Enterprise", val: 3400000, color: "#7c3aed" },
  { label: "Pro", val: 1800000, color: "#2563eb" },
  { label: "Starter", val: 640000, color: "#6b7280" },
];
const planTotal = PLAN_DATA.reduce((s, p) => s + p.val, 0);

const QUOTA_TABLE_GROUPS = {
  Tenant: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Quota: { hex: "#16a34a", bg: "bg-green-50", text: "text-green-700" },
  Rate: { hex: "#0891b2", bg: "bg-cyan-50", text: "text-cyan-600" },
  Status: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function PlanBadge({ plan }) {
  const variantMap = {
    Enterprise: "category",
    Pro: "beta",
    Starter: "default",
  };
  return <Badge value={plan} variant={variantMap[plan] ?? "default"} />;
}

function StatusBadge({ status }) {
  const map = { over: "down", warn: "warning", ok: "active" };
  const label = { over: "Over", warn: "Near limit", ok: "OK" };
  return <Badge value={label[status]} variant={map[status] ?? "default"} />;
}

function QuotaBar({ pct, status }) {
  const color =
    status === "over"
      ? "bg-red-500"
      : status === "warn"
        ? "bg-amber-500"
        : "bg-green-500";
  const textColor =
    status === "over"
      ? "text-red-600"
      : status === "warn"
        ? "text-amber-600"
        : "text-green-600";
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className={`font-mono text-[12px] ${textColor}`}>{pct}%</span>
    </div>
  );
}

// ── DRAWER ────────────────────────────────────────────────────────────────────
function QuotaDrawer({ isOpen, tenant, onClose, onSave }) {
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

  const bars = tenant
    ? [
        {
          label: "Monthly calls",
          used: tenant.used,
          cap: tenant.monthCap,
          fmt: (v) => (v / 1000000).toFixed(2) + "M",
        },
        {
          label: "Rate limit",
          used: tenant.rps,
          cap: tenant.rateLimit,
          fmt: (v) => v + " rps",
        },
        {
          label: "Burst",
          used: tenant.rps,
          cap: tenant.burst,
          fmt: (v) => v + " rps",
        },
      ]
    : [];

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/30 z-[998] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 w-[440px] max-w-full h-full bg-white border-l border-gray-200 z-[999] flex flex-col shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {tenant && (
                <div
                  className="w-3.5 h-3.5 rounded-[3px] flex-shrink-0"
                  style={{ background: tenant.color }}
                />
              )}
              <span
                className="text-[15px] text-gray-800"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {tenant ? tenant.name : "New Limit Override"}
              </span>
              {tenant && <PlanBadge plan={tenant.plan} />}
            </div>
            <div className="text-[11.5px] text-gray-400">
              {tenant ? `${tenant.plan} · ap-south-1` : "Custom configuration"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors ml-2 flex-shrink-0"
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

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Current usage */}
          {tenant && (
            <>
              <SecDiv>Current Usage</SecDiv>
              <div className="flex flex-col gap-4">
                {bars.map((b) => {
                  const pct = Math.min(100, Math.round((b.used / b.cap) * 100));
                  const c =
                    pct >= 90
                      ? "text-red-600"
                      : pct >= 70
                        ? "text-amber-600"
                        : "text-green-600";
                  const barColor =
                    pct >= 90
                      ? "bg-red-500"
                      : pct >= 70
                        ? "bg-amber-500"
                        : "bg-green-500";
                  const health =
                    pct >= 90 ? "Critical" : pct >= 70 ? "Watch" : "Healthy";
                  return (
                    <div key={b.label}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[13px] text-gray-700">
                          {b.label}
                        </span>
                        <span className={`font-mono text-[12px] ${c}`}>
                          {b.fmt(b.used)} / {b.fmt(b.cap)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[11px] text-gray-400">
                          {pct}% used
                        </span>
                        <span className={`text-[11px] ${c}`}>{health}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Config */}
          <SecDiv>Limit Configuration</SecDiv>
          <div className="mb-3.5">
            <div className="text-[12.5px] text-gray-700 mb-1">Plan</div>
            <select className={selectCls} defaultValue={tenant?.plan || "Pro"}>
              <option>Enterprise</option>
              <option>Pro</option>
              <option>Starter</option>
              <option>Custom</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="mb-3.5">
              <div className="text-[12.5px] text-gray-700 mb-1">
                Monthly calls
              </div>
              <input
                className={inputCls}
                defaultValue={
                  tenant ? (tenant.monthCap / 1000000).toFixed(0) + "M" : "3M"
                }
              />
            </div>
            <div className="mb-3.5">
              <div className="text-[12.5px] text-gray-700 mb-1">
                Rate limit (rps)
              </div>
              <input
                className={inputCls}
                defaultValue={tenant?.rateLimit?.toLocaleString() || "500"}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="mb-3.5">
              <div className="text-[12.5px] text-gray-700 mb-1">
                Burst allowance
              </div>
              <input
                className={inputCls}
                defaultValue={tenant?.burst?.toLocaleString() || "650"}
              />
            </div>
            <div className="mb-3.5">
              <div className="text-[12.5px] text-gray-700 mb-1">Seats</div>
              <input className={inputCls} defaultValue="25" />
            </div>
          </div>
          <div className="mb-3.5">
            <div className="text-[12.5px] text-gray-700 mb-1">
              Enforcement mode
            </div>
            <select className={selectCls}>
              <option>Hard block (429)</option>
              <option>Throttle + warn</option>
              <option>Log only</option>
            </select>
          </div>
          <div className="mb-3.5">
            <div className="text-[12.5px] text-gray-700 mb-1">
              Quota reset window
            </div>
            <select className={selectCls}>
              <option>Monthly (1st of month)</option>
              <option>Rolling 30 days</option>
              <option>Weekly</option>
            </select>
          </div>

          <SecDiv>Overage settings</SecDiv>
          <div className="mb-3.5">
            <div className="text-[12.5px] text-gray-700 mb-1">
              On quota exceed
            </div>
            <select className={selectCls}>
              <option>Block all requests (429)</option>
              <option>Allow overage + charge</option>
              <option>Alert only</option>
            </select>
          </div>
          <div className="mb-3.5">
            <div className="text-[12.5px] text-gray-700 mb-1">Warn at</div>
            <select className={selectCls}>
              <option>50%</option>
              <option selected>80%</option>
              <option>90%</option>
              <option>95%</option>
            </select>
          </div>
        </div>

        {/* Footer */}
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
            Save changes
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 border border-gray-200 text-[12.5px] text-gray-500 rounded-lg hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function QuotaLimits() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTenant, setActiveTenant] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState(null);
  const [sortBy, setSortBy] = useState("usage");
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);

  const openDrawer = (tenant) => {
    setActiveTenant(tenant);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setActiveTenant(null);
  };

  const filtered = useMemo(() => {
    let list = TENANTS_RAW.filter((t) => {
      if (statusFilter === "ok" && t.status !== "ok") return false;
      if (statusFilter === "warn" && t.status !== "warn") return false;
      if (statusFilter === "over" && t.status !== "over") return false;
      if (planFilter && t.plan !== planFilter) return false;
      if (query && !t.name.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
    if (sortBy === "usage") list = [...list].sort((a, b) => b.pct - a.pct);
    else if (sortBy === "calls")
      list = [...list].sort((a, b) => b.used - a.used);
    else if (sortBy === "rps") list = [...list].sort((a, b) => b.rps - a.rps);
    else if (sortBy === "name")
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [statusFilter, planFilter, sortBy, query]);

  const paginated = filtered.slice(
    pageIndex * pageLimit,
    (pageIndex + 1) * pageLimit,
  );

  const columns = [
    {
      id: "name",
      name: "Tenant",
      width: 180,
      group: "Tenant",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-3.5 h-3.5 rounded-[3px] flex-shrink-0"
            style={{ background: row.color }}
          />
          <span className="text-[13px] text-gray-800">{row.name}</span>
        </div>
      ),
    },
    {
      id: "plan",
      name: "Plan",
      width: 110,
      group: "Tenant",
      cell: (row) => <PlanBadge plan={row.plan} />,
    },
    {
      id: "monthCap",
      name: "Monthly calls",
      width: 120,
      group: "Quota",
      cell: (row) => (
        <span className="font-mono text-[12px]">
          {(row.monthCap / 1000000).toFixed(1)}M
        </span>
      ),
    },
    {
      id: "pct",
      name: "Quota used",
      width: 180,
      group: "Quota",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <QuotaBar pct={row.pct} status={row.status} />
          <span className="text-[11px] text-gray-400">
            {(row.used / 1000000).toFixed(2)}M
          </span>
        </div>
      ),
    },
    {
      id: "rateLimit",
      name: "Rate limit",
      width: 110,
      group: "Rate",
      cell: (row) => (
        <span className="font-mono text-[12px]">{row.rateLimit} rps</span>
      ),
    },
    {
      id: "rps",
      name: "Current RPS",
      width: 110,
      group: "Rate",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.rpsPct >= 90 ? "text-red-600" : row.rpsPct >= 70 ? "text-amber-600" : "text-gray-700"}`}
        >
          {row.rps} rps
        </span>
      ),
    },
    {
      id: "t429",
      name: "429s today",
      width: 100,
      group: "Rate",
      cell: (row) => (
        <span
          className={`font-mono text-[12px] ${row.t429 > 0 ? "text-red-600" : "text-gray-400"}`}
        >
          {row.t429.toLocaleString()}
        </span>
      ),
    },
    {
      id: "burst",
      name: "Burst",
      width: 100,
      group: "Rate",
      cell: (row) => (
        <span className="font-mono text-[12px]">{row.burst} rps</span>
      ),
    },
    {
      id: "resetDays",
      name: "Resets in",
      width: 90,
      group: "Status",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-gray-400">
          {row.resetDays}d
        </span>
      ),
    },
    {
      id: "status",
      name: "Status",
      width: 110,
      group: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
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
    alert: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
      </svg>
    ),
  };

  const ACTION_COLOR = {
    "429 returned": "text-red-600",
    "Alert sent": "text-amber-600",
    Throttled: "text-amber-600",
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
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      count: "5.84M",
      title: "Total API Calls",
      badgeText: "▲ +12% vs yesterday",
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
          stroke="#d97706"
          strokeWidth="1.8"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        </svg>
      ),
      count: "3",
      countColor: "text-amber-600",
      title: "Near Limit Tenants",
      badgeText: "≥ 80% quota used",
      badgeBg: "bg-amber-50",
      badgeTextColor: "text-amber-600",
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
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
      count: "1.2k",
      countColor: "text-red-600",
      title: "429 Responses",
      badgeText: "▲ +340 this hour",
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
          stroke="#16a34a"
          strokeWidth="1.8"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      count: "20",
      countColor: "text-green-600",
      title: "Within Quota",
      badgeText: "83% of tenants",
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
          stroke="#0891b2"
          strokeWidth="1.8"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      count: "12d",
      countColor: "text-cyan-600",
      title: "Until Quota Reset",
      badgeText: "Resets 1st of month",
      badgeBg: "bg-cyan-50",
      badgeTextColor: "text-cyan-600",
    },
  ];

  const PLAN_CARDS = [
    {
      name: "Starter",
      variant: "default",
      tenants: "4 tenants",
      sub: "Entry-level plan for small teams",
      border: "border-gray-200",
      bg: "bg-white",
      rows: [
        ["Monthly calls", "500k"],
        ["Rate limit", "120 rps"],
        ["Burst", "150 rps"],
        ["Seats", "10"],
      ],
    },
    {
      name: "Pro",
      variant: "beta",
      tenants: "11 tenants",
      sub: "Growing teams with higher throughput",
      border: "border-gray-200",
      bg: "bg-white",
      rows: [
        ["Monthly calls", "3M"],
        ["Rate limit", "500 rps"],
        ["Burst", "650 rps"],
        ["Seats", "25"],
      ],
    },
    {
      name: "Enterprise",
      variant: "category",
      tenants: "9 tenants",
      sub: "Full platform access · custom limits",
      border: "border-purple-200",
      bg: "bg-purple-50/30",
      rows: [
        ["Monthly calls", "10M+"],
        ["Rate limit", "1,200 rps"],
        ["Burst", "1,500 rps"],
        ["Seats", "50"],
      ],
    },
  ];

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
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="12" y1="8" x2="12" y2="16" />
            </svg>
          }
          iconGradient="bg-transparent"
          title="Quota & Rate Limits"
          breadcrumbs={[
            { label: "Home", href: "#" },
            { label: "Settings", href: "#" },
            { label: "Quota & Rate Limits" },
          ]}
        />
        <div className="flex items-center gap-2">
          <ActionButton action="refresh" label="Refresh" icon={RefreshIcon} />
          <ActionButton action="export" label="Export" icon={ExportIcon} />
          <ActionButton
            action="search"
            onClick={() => {
              setActiveTenant(null);
              setDrawerOpen(true);
            }}
            label="Set Limits"
            icon={AddIcon}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 429 rate chart */}
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
                  stroke="#dc2626"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                Rate Limit Events — Last 24h
              </div>
              <div className="flex items-center gap-4 text-[11.5px] text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 rounded-full bg-red-500 inline-block" />
                  429 blocks
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 rounded-full bg-amber-500 inline-block" />
                  Near-limit
                </span>
              </div>
            </div>
            <div className="px-5 py-4">
              {Array.from({ length: 8 }, (_, i) => {
                const hour = (i * 3).toString().padStart(2, "0") + ":00";
                const blocks = Math.round(Math.random() * 80 + 10);
                const near = Math.round(Math.random() * 400 + 100);
                const maxBlocks = 120;
                return (
                  <div key={i} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] text-gray-400 w-10 shrink-0">
                      {hour}
                    </span>
                    <div className="flex-1 flex items-center gap-1 h-5">
                      <div
                        className="bg-red-400/70 rounded-sm h-3"
                        style={{ width: `${(blocks / maxBlocks) * 60}%` }}
                      />
                      <div
                        className="bg-amber-400/40 rounded-sm h-3"
                        style={{ width: `${(near / 500) * 40}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-gray-400 w-8 text-right">
                      {blocks + Math.round(near / 10)}
                    </span>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-[11px] text-gray-400">429 blocks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[11px] text-gray-400">Near-limit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan donut */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 text-[13px] text-gray-700"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              API Calls by Plan
            </div>
            <div className="px-5 py-4 flex items-center gap-6">
              {/* Simple donut viz */}
              <div className="relative w-[140px] h-[140px] flex-shrink-0">
                <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                  {(() => {
                    let offset = 0;
                    const r = 54;
                    const circ = 2 * Math.PI * r;
                    return PLAN_DATA.map((p) => {
                      const dash = (p.val / planTotal) * circ;
                      const gap = circ - dash;
                      const el = (
                        <circle
                          key={p.label}
                          cx="70"
                          cy="70"
                          r={r}
                          fill="none"
                          stroke={p.color}
                          strokeWidth="18"
                          strokeDasharray={`${dash} ${gap}`}
                          strokeDashoffset={-offset}
                          strokeLinecap="butt"
                        />
                      );
                      offset += dash;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div
                    className="text-[18px] text-gray-800"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    5.84M
                  </div>
                  <div className="text-[10px] text-gray-400">calls today</div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-2.5">
                {PLAN_DATA.map((p) => (
                  <div
                    key={p.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: p.color }}
                      />
                      <span className="text-[12.5px] text-gray-700">
                        {p.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.round((p.val / planTotal) * 100)}%`,
                            background: p.color,
                          }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-gray-400">
                        {(p.val / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLAN_CARDS.map((p) => (
            <div
              key={p.name}
              className={`border rounded-xl p-5 ${p.border} ${p.bg}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div
                  className="text-[15px] text-gray-800"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {p.name}
                </div>
                <Badge value={p.tenants} variant={p.variant} />
              </div>
              <div className="text-[11.5px] text-gray-400 mb-4">{p.sub}</div>
              <div className="flex flex-col gap-1.5">
                {p.rows.map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-1.5 border-b border-gray-100 last:border-b-0 text-[12.5px]"
                  >
                    <span className="text-gray-400">{k}</span>
                    <span className="font-mono text-gray-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <Table
            columns={columns}
            group={QUOTA_TABLE_GROUPS}
            tableName="quota-limits"
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
            onRowClick={openDrawer}
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
                    { id: "ok", label: "OK", dot: "bg-green-500" },
                    { id: "warn", label: "Near limit", dot: "bg-amber-500" },
                    { id: "over", label: "Over", dot: "bg-red-500" },
                  ].map(({ id, label, dot }) => (
                    <button
                      key={id}
                      onClick={() => {
                        setStatusFilter(id);
                        setPageIndex(0);
                      }}
                      className={`px-3 py-1 text-[12px] flex items-center gap-1.5 border-r last:border-r-0 border-gray-200 transition-colors ${statusFilter === id ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                    >
                      {dot && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusFilter === id ? "bg-white/70" : dot}`}
                        />
                      )}
                      {label}
                    </button>
                  ))}
                </div>
                <SingleSelect
                  value={planFilter}
                  onChange={(val) => {
                    setPlanFilter(val);
                    setPageIndex(0);
                  }}
                  placeholder="All Plans"
                  options={[
                    { value: null, label: "All Plans" },
                    {
                      value: "Enterprise",
                      label: "Enterprise",
                      dot: "#7c3aed",
                    },
                    { value: "Pro", label: "Pro", dot: "#2563eb" },
                    { value: "Starter", label: "Starter", dot: "#6b7280" },
                  ]}
                  className="border-gray-200"
                />
                <SingleSelect
                  value={sortBy}
                  onChange={(val) => setSortBy(val)}
                  placeholder="Sort: Usage %"
                  options={[
                    { value: "usage", label: "Sort: Usage % ↓" },
                    { value: "calls", label: "Sort: Calls ↓" },
                    { value: "rps", label: "Sort: RPS ↓" },
                    { value: "name", label: "Sort: Name A–Z" },
                  ]}
                  className="border-gray-200 min-w-[150px]"
                />
              </div>
            }
          />
        </div>

        {/* Enforcement log + Change log */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Enforcement log */}
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Enforcement Log
              </div>
              <button className="px-2.5 py-1 border border-gray-200 rounded-md text-[11.5px] text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
                Full log
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Time", "Tenant", "Event", "Value", "Action"].map((h) => (
                      <th
                        key={h}
                        className="px-4 h-8 text-[10.5px] font-normal text-gray-400 text-left tracking-widest uppercase border-r border-gray-100 last:border-r-0 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ENFORCE_LOG.map((e, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-4 h-10">
                        <span className="font-mono text-[11.5px] text-gray-400">
                          {e.t}
                        </span>
                      </td>
                      <td className="px-4 h-10 text-[12.5px] text-gray-700">
                        {e.tenant}
                      </td>
                      <td className="px-4 h-10 text-[12px] text-gray-500">
                        {e.event}
                      </td>
                      <td className="px-4 h-10">
                        <span className="font-mono text-[12px]">{e.val}</span>
                      </td>
                      <td
                        className={`px-4 h-10 text-[12px] ${ACTION_COLOR[e.action] || "text-gray-400"}`}
                      >
                        {e.action}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Change log */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="px-5 py-3 border-b border-gray-100 bg-gray-50/60 text-[13px] text-gray-700"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Limit Change History
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
        </div>
      </div>

      {/* Drawer */}
      <QuotaDrawer
        isOpen={drawerOpen}
        tenant={activeTenant}
        onClose={closeDrawer}
        onSave={closeDrawer}
      />
    </div>
  );
}
