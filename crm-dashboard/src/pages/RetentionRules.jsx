import { useState, useEffect, useCallback } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ActionButton } from "../components/ui/ActionButton";
import { AddIcon, RunIcon } from "../components/ui/Icons";
import { StatCard } from "../components/ui/StatCard3";
import { SaveIcon } from "lucide-react";
import { Table } from "../components/TableComponents/Table";
import { Badge } from "../components/ui/Badge";
import SingleSelect from "../components/ui/SingleSelect";
import ActionsCell from "../components/TableComponents/ActionsCell";
import { Section } from "../components/ui/Section";

// ── DATA ──────────────────────────────────────────────────────────────────────
const OVERRIDES = [
  {
    scope: "API",
    target: "payment-api",
    hot: "48h",
    cold: "1yr",
    arch: "7yr",
    reason: "SOC2 + PCI compliance",
    comp: "SOC2 · PCI",
    enabled: true,
  },
  {
    scope: "API",
    target: "legacy-v1-api",
    hot: "12h",
    cold: "30d",
    arch: "1yr",
    reason: "Legacy — reduce cost",
    comp: "—",
    enabled: true,
  },
  {
    scope: "Category",
    target: "Payments",
    hot: "48h",
    cold: "1yr",
    arch: "7yr",
    reason: "Financial regulations",
    comp: "PCI · SOC2",
    enabled: true,
  },
  {
    scope: "Category",
    target: "Auth",
    hot: "72h",
    cold: "180d",
    arch: "7yr",
    reason: "Security audit trail",
    comp: "ISO 27001",
    enabled: true,
  },
  {
    scope: "API",
    target: "auth-service",
    hot: "72h",
    cold: "180d",
    arch: "7yr",
    reason: "JWT audit trail",
    comp: "ISO 27001",
    enabled: true,
  },
  {
    scope: "Category",
    target: "Legacy",
    hot: "12h",
    cold: "30d",
    arch: "1yr",
    reason: "Deprecated — cut cost",
    comp: "—",
    enabled: true,
  },
  {
    scope: "API",
    target: "email-gateway",
    hot: "36h",
    cold: "90d",
    arch: "3yr",
    reason: "Email delivery records",
    comp: "GDPR",
    enabled: true,
  },
  {
    scope: "Tag",
    target: "critical",
    hot: "72h",
    cold: "1yr",
    arch: "7yr",
    reason: "Critical APIs keep longer",
    comp: "SOC2",
    enabled: true,
  },
  {
    scope: "Tag",
    target: "deprecated",
    hot: "6h",
    cold: "14d",
    arch: "90d",
    reason: "Fast-expire deprecated",
    comp: "—",
    enabled: false,
  },
  {
    scope: "Compliance",
    target: "GDPR subject",
    hot: "Global",
    cold: "Global",
    arch: "Max 7yr",
    reason: "GDPR right to erasure",
    comp: "GDPR",
    enabled: true,
  },
];

const EXPIRY_HOT = [
  {
    api: "cdn-api",
    tier: "hot",
    amount: "4.2 GB",
    pct: 85,
    when: "2h",
    urgency: "red",
  },
  {
    api: "report-api",
    tier: "hot",
    amount: "1.8 GB",
    pct: 72,
    when: "6h",
    urgency: "amber",
  },
  {
    api: "analytics-api",
    tier: "hot",
    amount: "3.1 GB",
    pct: 60,
    when: "12h",
    urgency: "amber",
  },
  {
    api: "email-gateway",
    tier: "hot",
    amount: "0.9 GB",
    pct: 45,
    when: "1d",
    urgency: "blue",
  },
  {
    api: "ml-api",
    tier: "hot",
    amount: "2.4 GB",
    pct: 30,
    when: "3d",
    urgency: "blue",
  },
];

const EXPIRY_COLD = [
  {
    api: "payment-api",
    tier: "cold",
    amount: "28.4 GB",
    pct: 90,
    when: "5d",
    urgency: "red",
  },
  {
    api: "auth-service",
    tier: "cold",
    amount: "12.1 GB",
    pct: 65,
    when: "14d",
    urgency: "amber",
  },
  {
    api: "legacy-v1-api",
    tier: "cold",
    amount: "6.8 GB",
    pct: 40,
    when: "22d",
    urgency: "blue",
  },
];

const AUDIT = [
  {
    type: "delete",
    icon: "🗑",
    bg: "#fef2f2",
    action: "Deleted 1,247,392 logs from Hot store",
    detail: "payment-api · Hot TTL expired · 38.2 GB freed",
    time: "14:00:01",
    by: "System",
  },
  {
    type: "migrate",
    icon: "→",
    bg: "#ecfeff",
    action: "Migrated 840,000 logs Hot → Cold",
    detail: "cdn-api · aged >48h · compressed 4.2×",
    time: "14:00:00",
    by: "System",
  },
  {
    type: "edit",
    icon: "✏️",
    bg: "#eff4ff",
    action: "Rule updated: auth-service Cold TTL → 180d",
    detail: "Changed from 90d · reason: ISO 27001 audit trail",
    time: "13:42:18",
    by: "Alex M.",
  },
  {
    type: "create",
    icon: "＋",
    bg: "#f0fdf4",
    action: "New rule created: critical tag → 72h Hot",
    detail: "Applies to 8 APIs tagged critical",
    time: "13:41:05",
    by: "Alex M.",
  },
  {
    type: "migrate",
    icon: "→",
    bg: "#f5f3ff",
    action: "Migrated 220,000 logs Cold → Archive",
    detail: "Payments category · aged >90d · zstd compressed",
    time: "12:00:01",
    by: "System",
  },
  {
    type: "delete",
    icon: "🗑",
    bg: "#fef2f2",
    action: "Deleted 88,000 logs from Archive",
    detail: "legacy-v1-api · 1yr TTL expired (override rule)",
    time: "12:00:00",
    by: "System",
  },
  {
    type: "edit",
    icon: "✏️",
    bg: "#eff4ff",
    action: "Global Hot TTL changed: 36h → 48h",
    detail: "Changed by Sara R. · reason: Payment compliance review",
    time: "09:15:33",
    by: "Sara R.",
  },
  {
    type: "simulate",
    icon: "▶",
    bg: "#fffbeb",
    action: "Simulation run: 2.4M Hot → Cold preview",
    detail: "Read-only · no data affected · 94 GB projected freed",
    time: "08:30:00",
    by: "Alex M.",
  },
];

const COMPLIANCE = [
  {
    name: "SOC2 Type II",
    req: "Min. 1 year retention",
    icon: "✅",
    status: "Compliant · 7yr set",
    ok: true,
  },
  {
    name: "GDPR",
    req: "Delete on request + max 7yr",
    icon: "✅",
    status: "Compliant · Right-to-erase enabled",
    ok: true,
  },
  {
    name: "ISO 27001",
    req: "Log integrity + 3yr minimum",
    icon: "✅",
    status: "Compliant · Immutable archive",
    ok: true,
  },
  {
    name: "PCI DSS",
    req: "12-month minimum retention",
    icon: "✅",
    status: "Compliant · Payments scoped",
    ok: true,
  },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
const urgencyColor = { red: "#dc2626", amber: "#d97706", blue: "#2563eb" };

function scopeBadgeCls(s) {
  return (
    {
      API: "bg-blue-50 text-blue-600 border-blue-200",
      Category: "bg-purple-50 text-purple-700 border-purple-200",
      Tag: "bg-gray-100 text-gray-500 border-gray-200",
      Compliance: "bg-green-50 text-green-600 border-green-200",
    }[s] || "bg-gray-100 text-gray-500 border-gray-200"
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar() {
  const groups = [
    {
      label: "Monitor",
      items: [
        { label: "Dashboard" },
        { label: "All APIs", badge: "42" },
        { label: "Incidents", badge: "7", red: true },
        { label: "Alerts", badge: "3", red: true },
        { label: "Logs" },
      ],
    },
    {
      label: "Pipeline",
      items: [
        { label: "Pipeline Monitor" },
        { label: "Buffer Dashboard" },
        { label: "Log Explorer" },
        { label: "Storage Tiers" },
        { label: "Retention Rules", active: true },
        { label: "Archive Browser" },
      ],
    },
    { label: "Groups", items: [{ label: "By Project" }, { label: "By Team" }] },
  ];
  return (
    <aside
      className="w-[220px] bg-white border-r border-gray-200 fixed top-0 left-0 bottom-0 overflow-y-auto z-50 flex flex-col flex-shrink-0"
      style={{ scrollbarWidth: "thin" }}
    >
      <div className="px-4 py-3.5 border-b border-gray-200 flex items-center gap-2.5">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <div
            className="text-[13px] font-medium text-gray-800"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            SyberFort
          </div>
          <div className="text-[10px] text-gray-400">API Monitor</div>
        </div>
      </div>
      {groups.map((g) => (
        <div key={g.label} className="py-2">
          <div className="text-[9.5px] tracking-widest uppercase text-gray-400 px-4 py-1.5">
            {g.label}
          </div>
          {g.items.map((item) => (
            <a
              key={item.label}
              href="#"
              onClick={(e) => e.preventDefault()}
              className={`flex items-center gap-2.5 px-4 py-1.5 text-[12.5px] border-l-2 transition-all ${item.active ? "text-blue-600 bg-blue-50 border-blue-600" : "text-gray-700 border-transparent hover:text-blue-600 hover:bg-blue-50"}`}
            >
              {item.label}
              {item.badge && (
                <span
                  className={`ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full ${item.red ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"}`}
                >
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </div>
      ))}
      <div className="mt-auto flex items-center gap-2 px-4 py-2.5 border-t border-gray-200">
        <div className="w-[26px] h-[26px] rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-medium text-white flex-shrink-0">
          AM
        </div>
        <div>
          <div className="text-[12px] text-gray-800">Alex Morgan</div>
          <div className="text-[10.5px] text-gray-400">Admin</div>
        </div>
      </div>
    </aside>
  );
}

// ── TOGGLE ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <div
      className="relative w-9 h-5 flex-shrink-0 cursor-pointer"
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

// ── MODAL ─────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div
      className={`fixed inset-0 z-[600] flex items-center justify-center transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      style={{ background: "rgba(28,31,46,.4)", backdropFilter: "blur(2px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-[90%] max-w-xl max-h-[90vh] overflow-y-auto transition-all duration-200 ${open ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-2 opacity-0"}`}
      >
        <div className="sticky top-0 bg-white px-5 py-3.5 border-b border-gray-200 flex items-center justify-between z-10">
          <div
            className="text-[15px] text-gray-800"
            style={{ fontFamily: "'Outfit',sans-serif" }}
          >
            {title}
          </div>
          <button
            onClick={onClose}
            className="w-[26px] h-[26px] flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-gray-300 transition-colors"
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
        <div className="px-5 py-5 flex flex-col gap-3.5">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ── SECTION LABEL ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 mb-3.5">
      {children}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

// ── POLICY CARD ───────────────────────────────────────────────────────────────
function PolicyCard({
  emoji,
  name,
  nameCls,
  hdBg,
  iconBg,
  iconStroke,
  badgeCls,
  badgeTxt,
  timeline,
  rows,
  onEdit,
}) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onEdit}
    >
      <div
        className={`px-4 py-3.5 border-b border-gray-200 flex items-center gap-2.5 ${hdBg}`}
      >
        <div
          className={`w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 ${iconBg}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={iconStroke}
            strokeWidth="2"
          >
            {timeline.icon}
          </svg>
        </div>
        <div>
          <div className={`text-[13px] font-medium ${nameCls}`}>
            {emoji} {name}
          </div>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeCls}`}
          >
            {badgeTxt}
          </span>
        </div>

        <ActionButton
          action="export"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          label="Edit"
          icon={null}
          className="ml-auto"
        />
      </div>
      <div className="px-4 py-4 flex flex-col gap-2.5">
        {/* Mini timeline */}
        <div className="flex items-center gap-0 my-1">
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-[9px] font-semibold ${timeline.fromCls}`}
            >
              {timeline.fromLabel}
            </div>
            <div className="text-[9.5px] text-gray-400 whitespace-nowrap">
              {timeline.fromName}
            </div>
          </div>
          <div className="flex-1 relative mx-1">
            <div
              className="h-0.5 w-full"
              style={{ background: timeline.lineColor }}
            />
            <div className="text-[10px] text-gray-400 text-center mt-0.5 -translate-y-0.5 whitespace-nowrap">
              {timeline.dur}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-[9px] font-semibold ${timeline.toCls}`}
            >
              {timeline.toLabel}
            </div>
            <div className="text-[9.5px] text-gray-400 whitespace-nowrap">
              {timeline.toName}
            </div>
          </div>
        </div>
        {rows.map(({ k, v }) => (
          <div
            key={k}
            className="flex justify-between text-[12px] py-0.5 border-b border-gray-100 last:border-b-0"
          >
            <span className="text-gray-400">{k}</span>
            <span className="font-mono text-gray-700">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── EXPIRY ROW ────────────────────────────────────────────────────────────────
function ExpiryRow({ item }) {
  const col = urgencyColor[item.urgency];
  return (
    <div className="flex items-center gap-3.5 px-4 py-2.5 border-b border-gray-100 last:border-b-0">
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ background: col }}
      />
      <div className="text-[13px] font-medium text-gray-800 flex-1">
        {item.api}
      </div>
      <Badge
        value={item.tier === "hot" ? "Hot" : "Cold"}
        variant={item.tier === "hot" ? "beta" : "Go"}
      />
      <div className="font-mono text-[12px] text-gray-400 w-14 text-right">
        {item.amount}
      </div>
      <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
        <div
          className="h-full rounded-full opacity-70"
          style={{ width: `${item.pct}%`, background: col }}
        />
      </div>
      <div
        className="text-[12px] font-medium w-14 text-right flex-shrink-0"
        style={{ color: col }}
      >
        in {item.when}
      </div>
    </div>
  );
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ message }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#1c1f2e] text-white px-4 py-2.5 rounded-lg text-[13px] shadow-xl transition-opacity duration-300"
      style={{
        opacity: message ? 1 : 0,
        pointerEvents: message ? "auto" : "none",
        maxWidth: 360,
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6ee7b7"
        strokeWidth="2.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function RetentionRules() {
  const [activeTab, setActiveTab] = useState("overrides");
  const [toast, setToast] = useState("");
  const [toastTimer, setToastTimer] = useState(null);
  const [ruleModal, setRuleModal] = useState(false);
  const [simModal, setSimModal] = useState(false);
  const [countdown, setCountdown] = useState("14:32");
  const [overrides, setOverrides] = useState(OVERRIDES.map((o) => ({ ...o })));
  const [scopeType, setScopeType] = useState("api");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageLimit, setPageLimit] = useState(25);
  const [sortField, setSortField] = useState(null);
  const [sortType, setSortType] = useState(null);
  const [sevFilter, setSevFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("Last 7 days");

  const showToast = useCallback(
    (msg) => {
      setToast(msg);
      if (toastTimer) clearTimeout(toastTimer);
      const t = setTimeout(() => setToast(""), 2600);
      setToastTimer(t);
    },
    [toastTimer],
  );

  // Countdown timer
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const m = String(59 - now.getMinutes()).padStart(2, "0");
      const s = String(59 - now.getSeconds()).padStart(2, "0");
      setCountdown(`${m}:${s}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const scopeTargets = {
    api: [
      "payment-api",
      "auth-service",
      "email-gateway",
      "billing-api",
      "legacy-v1-api",
    ],
    category: ["Payments", "Auth", "Platform", "Data", "Legacy"],
    tag: ["critical", "deprecated", "billing", "production"],
    compliance: ["GDPR", "SOC2", "PCI DSS", "ISO 27001"],
  };

  const POLICIES = [
    {
      emoji: "🔥",
      name: "Hot Store",
      nameCls: "text-blue-600",
      hdBg: "bg-blue-50",
      iconBg: "bg-blue-100/60",
      iconStroke: "#2563eb",
      badgeCls: "bg-blue-50 text-blue-600 border-blue-200",
      badgeTxt: "Default policy",
      timeline: {
        icon: (
          <>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </>
        ),
        fromLabel: "IN",
        fromName: "Ingest",
        fromCls: "bg-blue-50 border-blue-400 text-blue-600",
        toCls: "bg-cyan-50 border-cyan-400 text-cyan-600",
        toLabel: "❄",
        toName: "→ Cold",
        lineColor: "#2563eb",
        dur: "48h",
      },
      rows: [
        { k: "Retention in Hot", v: "48 hours" },
        { k: "After 48h", v: "→ Migrate to Cold" },
        { k: "On overflow", v: "Migrate early" },
        { k: "Affects", v: "42 APIs · all logs" },
        { k: "Override rules", v: "6 active" },
      ],
    },
    {
      emoji: "❄️",
      name: "Cold Store",
      nameCls: "text-cyan-600",
      hdBg: "bg-cyan-50",
      iconBg: "bg-cyan-100/60",
      iconStroke: "#0891b2",
      badgeCls: "bg-cyan-50 text-cyan-600 border-cyan-200",
      badgeTxt: "Default policy",
      timeline: {
        icon: (
          <>
            <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07l14.14-14.14" />
          </>
        ),
        fromLabel: "❄",
        fromName: "Cold",
        fromCls: "bg-cyan-50 border-cyan-400 text-cyan-600",
        toCls: "bg-purple-50 border-purple-400 text-purple-700",
        toLabel: "📦",
        toName: "→ Archive",
        lineColor: "#0891b2",
        dur: "90d",
      },
      rows: [
        { k: "Retention in Cold", v: "90 days" },
        { k: "After 90d", v: "→ Migrate to Archive" },
        { k: "Compression", v: "gzip · 4.2×" },
        { k: "Affects", v: "42 APIs · all logs" },
        { k: "Override rules", v: "9 active" },
      ],
    },
    {
      emoji: "📦",
      name: "Archive",
      nameCls: "text-purple-700",
      hdBg: "bg-purple-50",
      iconBg: "bg-purple-100/60",
      iconStroke: "#7c3aed",
      badgeCls: "bg-purple-50 text-purple-700 border-purple-200",
      badgeTxt: "Default policy",
      timeline: {
        icon: (
          <>
            <path d="M5 8h14M5 8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v.01" />
            <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
          </>
        ),
        fromLabel: "📦",
        fromName: "Archive",
        fromCls: "bg-purple-50 border-purple-400 text-purple-700",
        toCls: "bg-red-50 border-red-400 text-red-600",
        toLabel: "🗑",
        toName: "Delete",
        lineColor: "#7c3aed",
        dur: "7yr",
      },
      rows: [
        { k: "Retention in Archive", v: "7 years" },
        { k: "After 7yr", v: "Permanent delete" },
        { k: "Compression", v: "zstd · 8.1×" },
        { k: "Compliance", v: "SOC2 · GDPR · ISO" },
        { k: "Override rules", v: "4 active" },
      ],
    },
  ];

  const tabs = [
    { id: "overrides", label: "Override Rules", count: "19", countCls: "" },
    {
      id: "expiring",
      label: "Expiring Soon",
      count: "8",
      countCls: "bg-amber-50 text-amber-600",
    },
    { id: "audit", label: "Audit Log", count: "247", countCls: "" },
  ];

  function scopeBadgeVariant(s) {
    return (
      {
        API: "beta",
        Category: "category",
        Tag: "default",
        Compliance: "active",
      }[s] || "default"
    );
  }

  return (
    <div
      className="flex overflow-hidden text-gray-800 container-page"
      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}
    >
      <div className=" flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className=" border-b border-gray-200 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <PageHeader
              className="flex flex-col gap-1.5"
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
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
              title="Retention Rules"
              breadcrumbs={[
                { label: "Dashboard", href: "#" },
                { label: "Pipeline", href: "#" },
                { label: "Retention Rules" },
              ]}
            />

            <div>
              <div className="flex items-center gap-2">
                <ActionButton
                  action="export"
                  onClick={() => showToast("Retention report exported")}
                  label={"Export"}
                />

                <ActionButton
                  action="save"
                  onClick={() => setSimModal(true)}
                  label={"Simulate Run"}
                  icon={RunIcon}
                />

                <ActionButton
                  action="search"
                  onClick={() => setRuleModal(true)}
                  label={"New Rule"}
                  icon={AddIcon}
                />
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1.5 text-[11.5px]">
                <span className="ml-auto flex items-center gap-1.5 text-[11.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                  <span className="text-gray-400">Next cleanup run in</span>
                  <span className="font-mono text-gray-800">{countdown}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto py-5 pb-12 min-h-0"
          style={{ scrollbarWidth: "thin" }}
        >
          <Section>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                }
                iconColor="text-blue-600"
                count="28"
                countColor="text-blue-600"
                title="Total Rules"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                }
                iconColor="text-green-600"
                count="24"
                countColor="text-green-600"
                title="Rules Active"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                }
                iconColor="text-red-600"
                count="1.2M"
                countColor="text-red-600"
                title="Deleted Today"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                }
                iconColor="text-amber-600"
                count="8"
                countColor="text-amber-600"
                title="Expiring in 7d"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                }
                iconColor="text-green-600"
                count="142 GB"
                countColor="text-green-600"
                title="Freed This Month"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                }
                iconColor="text-purple-700"
                count="4/4"
                countColor="text-purple-700"
                title="Compliance Met"
              />
            </div>
          </Section>

          <Section>
            {/* Global Policies */}
            <SectionLabel>
              Global Default Policies — per Storage Tier
            </SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
              {POLICIES.map((p) => (
                <PolicyCard
                  key={p.name}
                  {...p}
                  onEdit={() => setRuleModal(true)}
                />
              ))}
            </div>
          </Section>

          <Section>
            {/* Compliance */}
            <SectionLabel>Compliance Status</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {COMPLIANCE.map((c) => (
                <div
                  key={c.name}
                  className={`border rounded-xl px-4 py-3.5 text-center ${c.ok ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}
                >
                  <div
                    className={`text-[13px] font-medium mb-1 ${c.ok ? "text-green-700" : "text-amber-700"}`}
                  >
                    {c.name}
                  </div>
                  <div className="text-[11px] text-gray-400 mb-2.5">
                    {c.req}
                  </div>
                  <div className="text-[22px] mb-1.5">{c.icon}</div>
                  <div
                    className={`text-[12px] font-medium ${c.ok ? "text-green-600" : "text-amber-600"}`}
                  >
                    {c.status}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section>
            {/* Tabs */}
            <div className="flex border-b-2 border-gray-200 mb-5">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] border-b-2 -mb-0.5 transition-all whitespace-nowrap cursor-pointer ${activeTab === t.id ? "text-blue-600 border-blue-600" : "text-gray-400 border-transparent hover:text-gray-700"}`}
                >
                  {t.label}
                  <span
                    className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded-full ${activeTab === t.id ? "bg-blue-50 text-blue-600" : t.countCls || "bg-gray-100 text-gray-400"}`}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab: Override Rules */}
            {activeTab === "overrides" && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <Table
                  group={{
                    Scope: {
                      hex: "#2563eb",
                      bg: "bg-blue-50",
                      text: "text-blue-600",
                    },
                    "TTL Config": {
                      hex: "#0891b2",
                      bg: "bg-cyan-50",
                      text: "text-cyan-600",
                    },
                    Policy: {
                      hex: "#7c3aed",
                      bg: "bg-purple-50",
                      text: "text-purple-700",
                    },
                    Controls: {
                      hex: "#06a844ff",
                      bg: "bg-green-50",
                      text: "text-green-600",
                    },
                  }}
                  columns={[
                    {
                      id: "scope",
                      name: "Scope",
                      group: "Scope",
                      width: 110,
                      cell: (row) => (
                        <Badge
                          value={row.scope}
                          variant={scopeBadgeVariant(row.scope)}
                        />
                      ),
                    },
                    {
                      id: "target",
                      name: "Target",
                      group: "Scope",
                      width: 140,
                      cell: (row) => (
                        <span className="font-medium text-[12.5px]">
                          {row.target}
                        </span>
                      ),
                    },
                    {
                      id: "hot",
                      name: "Hot TTL",
                      group: "TTL Config",
                      width: 90,
                      cell: (row) => (
                        <span className="font-mono text-[12px] text-blue-600">
                          {row.hot}
                        </span>
                      ),
                    },
                    {
                      id: "cold",
                      name: "Cold TTL",
                      group: "TTL Config",
                      width: 90,
                      cell: (row) => (
                        <span className="font-mono text-[12px] text-cyan-600">
                          {row.cold}
                        </span>
                      ),
                    },
                    {
                      id: "arch",
                      name: "Archive TTL",
                      group: "TTL Config",
                      width: 100,
                      cell: (row) => (
                        <span className="font-mono text-[12px] text-purple-700">
                          {row.arch}
                        </span>
                      ),
                    },
                    {
                      id: "reason",
                      name: "Reason",
                      group: "Policy",
                      width: 180,
                      cell: (row) => (
                        <span className="text-[12px] text-gray-400">
                          {row.reason}
                        </span>
                      ),
                    },
                    {
                      id: "comp",
                      name: "Compliance",
                      group: "Policy",
                      width: 120,
                      cell: (row) => (
                        <span className="text-[11px] text-purple-700">
                          {row.comp}
                        </span>
                      ),
                    },
                    {
                      id: "enabled",
                      name: "Enabled",
                      group: "Controls",
                      width: 80,
                      disableSortBy: true,
                      cell: (row) => (
                        <Toggle
                          checked={row.enabled}
                          onChange={(v) => {
                            setOverrides((prev) =>
                              prev.map((o) =>
                                o.target === row.target
                                  ? { ...o, enabled: v }
                                  : o,
                              ),
                            );
                            showToast(
                              `${row.target} rule ${v ? "enabled" : "disabled"}`,
                            );
                          }}
                        />
                      ),
                    },
                    {
                      id: "actions",
                      name: "Actions",
                      description: "Row actions",
                      visible: true,
                      pinnedRight: true,
                      width: 60,
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
                  ]}
                  tableName="retention-overrides"
                  data={overrides.slice(
                    pageIndex * pageLimit,
                    (pageIndex + 1) * pageLimit,
                  )}
                  loading={false}
                  enableSearch={false}
                  pageIndex={pageIndex}
                  setPageIndex={setPageIndex}
                  pageLimit={pageLimit}
                  setPageLimit={setPageLimit}
                  paginationData={{
                    totalCount: overrides.length,
                    totalPages: Math.ceil(overrides.length / pageLimit) || 1,
                  }}
                  onRowClick={() => setRuleModal(true)}
                  sortField={sortField}
                  setSortField={setSortField}
                  sortType={sortType}
                  setSortType={setSortType}
                  activeFilters={{}}
                  setActiveFilters={() => {}}
                  additionalControls={
                    <div className="flex items-center gap-2">
                      <SingleSelect
                        value={sevFilter}
                        onChange={(val) => {
                          setSevFilter(val);
                          showToast("Filtered: " + val);
                        }}
                        placeholder="All Severities"
                        options={[
                          { value: "all", label: "All Scopes" },
                          {
                            value: "Per API",
                            label: "Per API",
                            dot: "#2563eb",
                          },
                          {
                            value: "Per Category",
                            label: "Per Category",
                            dot: "#7c3aed",
                          },
                          {
                            value: "Compliance",
                            label: "Compliance",
                            dot: "#16a34a",
                          },
                        ]}
                        className="border-gray-200"
                      />

                      {/* <ActionButton
                      action="search"
                      onClick={() => setRuleModal(true)}
                      label="New Override"
                      icon={AddIcon}
                    /> */}
                    </div>
                  }
                />
              </div>
            )}

            {/* Tab: Expiring Soon */}
            {activeTab === "expiring" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  {
                    title: "Expiring from Hot (next 7d)",
                    badge: "5 batches",
                    badgeVariant: "warning",
                    data: EXPIRY_HOT,
                    iconStroke: "#d97706",
                  },
                  {
                    title: "Expiring from Cold (next 30d)",
                    badge: "3 batches",
                    badgeVariant: "beta",
                    data: EXPIRY_COLD,
                    iconStroke: "#0891b2",
                  },
                ].map(({ title, badge, badgeVariant, data, iconStroke }) => (
                  <div
                    key={title}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
                      <div className="text-[13px] font-medium text-gray-700 flex items-center gap-1.5">
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={iconStroke}
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {title}
                      </div>
                      <Badge value={badge} variant={badgeVariant} />
                    </div>
                    <div className="py-1">
                      {data.map((item) => (
                        <ExpiryRow key={item.api} item={item} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Audit Log */}
            {activeTab === "audit" && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 bg-gray-50/60 flex items-center justify-between">
                  <div className="text-[13px] font-medium text-gray-700 flex items-center gap-1.5">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M9 11l3 3L22 4" />
                    </svg>
                    Audit Log — Retention Events
                  </div>
                  <div className="flex gap-2">
                    <SingleSelect
                      value={timeRange}
                      onChange={(val) => {
                        setTimeRange(val);
                        showToast("Time Range: " + val);
                      }}
                      placeholder="Time Range"
                      options={[
                        { value: "Last 7 days", label: "Last 7 days" },
                        {
                          value: "Last 30 days",
                          label: "Last 30 days",
                        },
                        { value: "All time", label: "All time" },
                      ]}
                      className="border-gray-200"
                    />

                    <ActionButton
                      action="export"
                      onClick={() => showToast("Audit log exported")}
                      label="Export CSV"
                    />
                  </div>
                </div>
                <div className="px-5 py-2">
                  {AUDIT.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-b-0"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[14px] flex-shrink-0"
                        style={{ background: e.bg }}
                      >
                        {e.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] text-gray-800 mb-0.5">
                          {e.action}
                        </div>
                        <div className="text-[11.5px] text-gray-400">
                          {e.detail} · by {e.by}
                        </div>
                      </div>
                      <div className="font-mono text-[11px] text-gray-400 whitespace-nowrap mt-0.5">
                        {e.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* Modal: New Rule */}
      <Modal
        open={ruleModal}
        onClose={() => setRuleModal(false)}
        title="New Retention Rule"
        footer={
          <>
            <ActionButton
              action="export"
              onClick={() => setRuleModal(false)}
              label="Cancel"
              icon={null}
            />

            <ActionButton
              action="search"
              onClick={() => {
                setRuleModal(false);
                showToast("Retention rule saved");
              }}
              label="Save Rule"
              icon={SaveIcon}
            />
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[12px] text-gray-400 mb-1.5">Scope</div>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white"
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value)}
            >
              <option value="api">Per API</option>
              <option value="category">Per Category</option>
              <option value="tag">Per Tag</option>
              <option value="compliance">Compliance Override</option>
            </select>
          </div>
          <div>
            <div className="text-[12px] text-gray-400 mb-1.5">Target</div>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white">
              {(scopeTargets[scopeType] || []).map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-[11px] uppercase tracking-wide text-gray-400 mb-2.5">
            Retention per tier — leave blank to use global default
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ["🔥 Hot TTL", "#2563eb"],
              ["❄️ Cold TTL", "#0891b2"],
              ["📦 Archive TTL", "#7c3aed"],
            ].map(([label, col]) => (
              <div key={label}>
                <div className="text-[12px] text-gray-400 mb-1.5">{label}</div>
                <select
                  className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12.5px] outline-none focus:border-blue-500 bg-white"
                  style={{ color: col }}
                >
                  <option>— Global default</option>
                  <option>12h</option>
                  <option>24h</option>
                  <option>48h</option>
                  <option>7d</option>
                  <option>30d</option>
                  <option>90d</option>
                  <option>1yr</option>
                  <option>7yr</option>
                </select>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[12px] text-gray-400 mb-1.5">
              On expiry action
            </div>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white">
              <option>Delete permanently</option>
              <option>Migrate to next tier</option>
              <option>Archive (override)</option>
              <option>Flag for manual review</option>
            </select>
          </div>
          <div>
            <div className="text-[12px] text-gray-400 mb-1.5">
              Priority (lower = higher)
            </div>
            <input
              type="number"
              defaultValue="10"
              min="1"
              max="100"
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-800 outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <div className="text-[12px] text-gray-400 mb-1.5">Compliance tag</div>
          <div className="flex gap-4 flex-wrap">
            {["SOC2", "GDPR", "ISO 27001", "PCI DSS"].map((c) => (
              <label
                key={c}
                className="flex items-center gap-1.5 text-[13px] cursor-pointer"
              >
                <input
                  type="checkbox"
                  defaultChecked={c === "GDPR"}
                  className="accent-blue-600"
                />
                {c}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[12px] text-gray-400 mb-1.5">Reason / Notes</div>
          <textarea
            rows={2}
            placeholder="Why is this override needed?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[12.5px] text-gray-800 outline-none focus:border-blue-500 resize-none"
          />
        </div>
        <div>
          <div className="text-[12px] text-gray-400 mb-1.5">Effective from</div>
          <input
            type="date"
            defaultValue="2024-03-28"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-800 outline-none focus:border-blue-500"
          />
        </div>
      </Modal>

      {/* Modal: Simulate Run */}
      <Modal
        open={simModal}
        onClose={() => setSimModal(false)}
        title="Simulate Retention Run"
        footer={
          <>
            <ActionButton
              action="export"
              onClick={() => setSimModal(false)}
              label="Close"
              icon={null}
            />

            <ActionButton
              action="search"
              onClick={() => {
                setSimModal(false);
                showToast("Simulation complete — no data deleted");
              }}
              label="Run Simulation"
              icon={RunIcon}
            />
          </>
        }
      >
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-[12.5px] text-blue-700">
          ℹ️ Simulation is <strong>read-only</strong> — no data will be deleted.
          Results show what <em>would</em> be affected by running rules now.
        </div>
        <div>
          <div className="text-[12px] text-gray-400 mb-1.5">
            Simulate as of date
          </div>
          <input
            type="date"
            defaultValue="2024-03-28"
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-800 outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <div className="text-[12px] text-gray-400 mb-1.5">Scope</div>
          <select className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white">
            <option>All rules</option>
            <option>Hot → Cold migrations</option>
            <option>Cold → Archive migrations</option>
            <option>Archive deletions</option>
          </select>
        </div>
        <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-[11.5px] font-medium text-gray-700 mb-2.5">
            Simulation Preview
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              {
                val: "2.4M",
                lbl: "Hot → Cold",
                bg: "bg-blue-50",
                col: "#2563eb",
              },
              {
                val: "840k",
                lbl: "Cold → Archive",
                bg: "bg-cyan-50",
                col: "#0891b2",
              },
              { val: "12k", lbl: "Deleted", bg: "bg-red-50", col: "#dc2626" },
            ].map(({ val, lbl, bg, col }) => (
              <div key={lbl} className={`text-center p-2 rounded-lg ${bg}`}>
                <div
                  className="text-[18px] font-normal"
                  style={{ fontFamily: "'Outfit',sans-serif", color: col }}
                >
                  {val}
                </div>
                <div className="text-[10.5px] text-gray-400">{lbl}</div>
              </div>
            ))}
          </div>
          <div className="mt-2.5 text-[12px] text-gray-400">
            ~94 GB would be freed · estimated runtime: 4 min 22 sec
          </div>
        </div>
      </Modal>

      <Toast message={toast} />
    </div>
  );
}
