import { useState, useEffect, useRef, useCallback } from "react";
import PageHeader from "../components/ui/PageHeader";
import { ConfigureIcon, MigrateIcon } from "../components/ui/Icons";
import { ActionButton } from "../components/ui/ActionButton";
import { StatCard } from "../components/ui/StatCard3";
import { SaveIcon } from "lucide-react";
import { Section } from "../components/ui/Section";
import { Badge } from "../components/ui/Badge";

// ── DATA ──────────────────────────────────────────────────────────────────────
const INITIAL_MIG_JOBS = [
  {
    id: "mig-001",
    from: "Hot",
    to: "Cold",
    size: "38.2 GB",
    pct: 72,
    eta: "4m",
    status: "running",
  },
  {
    id: "mig-002",
    from: "Hot",
    to: "Cold",
    size: "12.8 GB",
    pct: 41,
    eta: "9m",
    status: "running",
  },
  {
    id: "mig-003",
    from: "Cold",
    to: "Archive",
    size: "8.4 GB",
    pct: 88,
    eta: "1m",
    status: "running",
  },
  {
    id: "mig-004",
    from: "Hot",
    to: "Cold",
    size: "24.0 GB",
    pct: 19,
    eta: "18m",
    status: "running",
  },
  {
    id: "mig-005",
    from: "Cold",
    to: "Archive",
    size: "3.2 GB",
    pct: 100,
    eta: "Done",
    status: "done",
  },
  {
    id: "mig-006",
    from: "Hot",
    to: "Cold",
    size: "6.6 GB",
    pct: 0,
    eta: "—",
    status: "queued",
  },
];

const BREAKDOWN = [
  { name: "Payments", hot: 487, cold: 1240, arch: 88 },
  { name: "Platform", hot: 218, cold: 680, arch: 44 },
  { name: "Auth", hot: 104, cold: 290, arch: 18 },
  { name: "Data", hot: 89, cold: 420, arch: 24 },
  { name: "CRM / ERP", hot: 62, cold: 190, arch: 10 },
];

const TIERS = [
  {
    emoji: "🔥",
    name: "Hot Store",
    sub: "Recent · Fast · Expensive",
    nameCls: "text-blue-600",
    subCls: "text-blue-500",
    hdBg: "bg-blue-50",
    cardBorder: "border-blue-200",
    color: "#2563eb",
    statBg: "rgba(37,99,235,.1)",
    statCls: "text-blue-600",
    badgeCls: "bg-blue-50 text-blue-600 border-blue-200",
    badgeVariant: "beta",
    usageLabel: "text-blue-600",
    usageBar: "#2563eb",
    used: "142 GB",
    capacity: "500 GB",
    usedPct: 28,
    free: "358 GB",
    stats: [
      { v: "17.6k/s", l: "Write rate" },
      { v: "4ms", l: "Avg latency" },
      { v: "48h", l: "Retention" },
    ],
    details: [
      ["Engine", "SSD · NVMe"],
      ["Compression", "None"],
      ["Replication", "3× replica"],
      ["Cost", "$0.12 / GB·mo"],
      ["Monthly cost", "$17.04"],
    ],
    monthlyCost: "$17.04",
    btnBorder: "border-blue-200",
    btnColor: "text-blue-600",
    btnBg: "rgba(37,99,235,.06)",
  },
  {
    emoji: "❄️",
    name: "Cold Store",
    sub: "Aged · Compressed · Cheap",
    nameCls: "text-cyan-600",
    subCls: "text-cyan-500",
    hdBg: "bg-cyan-50",
    cardBorder: "border-cyan-200",
    color: "#0891b2",
    statBg: "rgba(8,145,178,.1)",
    statCls: "text-cyan-600",
    badgeCls: "bg-cyan-50 text-cyan-600 border-cyan-200",
    badgeVariant: "Go",
    usageLabel: "text-cyan-600",
    usageBar: "#0891b2",
    used: "2.8 TB",
    capacity: "10 TB",
    usedPct: 28,
    free: "7.2 TB",
    stats: [
      { v: "4.4k/s", l: "Write rate" },
      { v: "220ms", l: "Avg latency" },
      { v: "90d", l: "Retention" },
    ],
    details: [
      ["Engine", "HDD · Object store"],
      ["Compression", "gzip · 4.2× ratio"],
      ["Replication", "2× replica"],
      ["Cost", "$0.023 / GB·mo"],
      ["Monthly cost", "$64.40"],
    ],
    monthlyCost: "$64.40",
    btnBorder: "border-cyan-200",
    btnColor: "text-cyan-600",
    btnBg: "rgba(8,145,178,.06)",
  },
  {
    emoji: "📦",
    name: "Archive",
    sub: "Long-term · Compliance · Slowest",
    nameCls: "text-purple-700",
    subCls: "text-purple-500",
    hdBg: "bg-purple-50",
    cardBorder: "border-purple-200",
    color: "#7c3aed",
    statBg: "rgba(124,58,237,.1)",
    statCls: "text-purple-700",
    badgeCls: "bg-purple-50 text-purple-700 border-purple-200",
    badgeVariant: "category",
    usageLabel: "text-purple-700",
    usageBar: "#7c3aed",
    used: "184 GB",
    capacity: "1 TB",
    usedPct: 18,
    free: "840 GB",
    stats: [
      { v: "Batch", l: "Write mode" },
      { v: "4–12h", l: "Restore time" },
      { v: "7yr", l: "Retention" },
    ],
    details: [
      ["Engine", "Glacier · Tape"],
      ["Compression", "zstd · 8.1× ratio"],
      ["Compliance", "SOC2 · GDPR"],
      ["Cost", "$0.0015 / GB·mo"],
      ["Monthly cost", "$2.76"],
    ],
    monthlyCost: "$2.76",
    btnBorder: "border-purple-200",
    btnColor: "text-purple-700",
    btnBg: "rgba(124,58,237,.06)",
  },
];

const COST_ROWS = [
  {
    tier: "Hot",
    badgeVariant: "beta",
    badgeCls: "bg-blue-50 text-blue-600 border-blue-200",
    used: "142 GB",
    rate: "$0.12/GB",
    cost: "$17.04",
    costCls: "text-blue-600",
    delta: "↓ $1.20",
    deltaCls: "text-green-600",
  },
  {
    tier: "Cold",
    badgeVariant: "Go",
    badgeCls: "bg-cyan-50 text-cyan-600 border-cyan-200",
    used: "2,800 GB",
    rate: "$0.023/GB",
    cost: "$64.40",
    costCls: "text-cyan-600",
    delta: "↑ $4.60",
    deltaCls: "text-red-600",
  },
  {
    tier: "Archive",
    badgeVariant: "category",
    badgeCls: "bg-purple-50 text-purple-700 border-purple-200",
    used: "184 GB",
    rate: "$0.0015/GB",
    cost: "$2.76",
    costCls: "text-purple-700",
    delta: "↑ $0.32",
    deltaCls: "text-red-600",
  },
  {
    tier: "Egress",
    badgeVariant: null,
    badgeCls: "",
    used: "—",
    rate: "variable",
    cost: "$0.40",
    costCls: "",
    delta: "—",
    deltaCls: "text-gray-400",
    isPlain: true,
  },
];

// ── WRITE RATE CANVAS CHART ───────────────────────────────────────────────────
function WriteChart() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || 500;
    canvas.width = W;
    const H = canvas.height,
      pts = 48;
    const hotData = Array.from(
      { length: pts },
      (_, i) => 17600 + (Math.random() - 0.5) * 2000 + (i > 36 ? -1800 : 0),
    );
    const coldData = Array.from(
      { length: pts },
      () => 4400 + (Math.random() - 0.5) * 600,
    );
    const maxV = Math.max(...hotData) * 1.15;
    ctx.clearRect(0, 0, W, H);
    [5000, 10000, 15000, 20000].forEach((v) => {
      const y = H - (v / maxV) * (H - 20) - 10;
      ctx.strokeStyle = "#f0f2f7";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.fillStyle = "#c2c8d4";
      ctx.font = "10px DM Mono,monospace";
      ctx.textAlign = "left";
      ctx.fillText(v / 1000 + "k", 4, y - 3);
    });
    [
      [hotData, "#2563eb"],
      [coldData, "#0891b2"],
    ].forEach(([data, col]) => {
      const points = data.map((v, i) => ({
        x: (i / (pts - 1)) * W,
        y: H - (v / maxV) * (H - 20) - 10,
      }));
      ctx.beginPath();
      ctx.moveTo(points[0].x, H - 10);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[pts - 1].x, H - 10);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, col + "30");
      g.addColorStop(1, col + "04");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      points.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
      );
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.8;
      ctx.lineJoin = "round";
      ctx.stroke();
    });
  }, []);
  return <canvas ref={ref} height={150} className="w-full" />;
}

// ── TIER BADGE ────────────────────────────────────────────────────────────────
function TierBadge({ tier }) {
  const variantMap = {
    Hot: "beta",
    Cold: "Go",
    Archive: "category",
  };

  return <Badge value={`${tier}`} variant={variantMap[tier]} />;
}

// ── STATUS BADGE ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const variantMap = {
    running: "warning",
    done: "active",
    queued: "default",
  };

  const labelMap = {
    running: "Running",
    done: "Done",
    queued: "Queued",
  };

  return (
    <Badge
      value={labelMap[status] ?? status}
      variant={variantMap[status] ?? "default"}
    />
  );
}

// ── MODAL ─────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, maxW = "max-w-xl", children, footer }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div
      className={`fixed inset-0 z-[600] flex items-center justify-center transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      style={{ background: "rgba(28,31,46,.4)", backdropFilter: "blur(2px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-[90%] ${maxW} max-h-[90vh] overflow-y-auto transition-all duration-200 ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
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

// ── INPUT / SELECT HELPERS ────────────────────────────────────────────────────
const Inp = ({ label, children }) => (
  <div>
    <div className="text-[12px] text-gray-400 mb-1.5">{label}</div>
    {children}
  </div>
);
const Sel = ({ defaultValue, children, ...props }) => (
  <select
    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-800 outline-none focus:border-blue-500 bg-white"
    defaultValue={defaultValue}
    {...props}
  >
    {children}
  </select>
);
const Field = ({ label, value, type = "text", ...props }) => (
  <Inp label={label}>
    <input
      type={type}
      defaultValue={value}
      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-800 outline-none focus:border-blue-500"
      {...props}
    />
  </Inp>
);

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function StorageTiers() {
  const [migJobs, setMigJobs] = useState(
    INITIAL_MIG_JOBS.map((j) => ({ ...j })),
  );
  const [toast, setToast] = useState("");
  const [toastTimer, setToastTimer] = useState(null);
  const [tierModal, setTierModal] = useState(false);
  const [migrateModal, setMigrateModal] = useState(false);

  const showToast = useCallback(
    (msg) => {
      setToast(msg);
      if (toastTimer) clearTimeout(toastTimer);
      const t = setTimeout(() => setToast(""), 2600);
      setToastTimer(t);
    },
    [toastTimer],
  );

  // Live tick — advance migration progress
  useEffect(() => {
    const id = setInterval(() => {
      setMigJobs((prev) =>
        prev.map((j) => {
          if (j.status === "running" && j.pct < 100) {
            const pct = Math.min(100, j.pct + Math.round(Math.random() * 6));
            return {
              ...j,
              pct,
              ...(pct === 100 ? { status: "done", eta: "Done" } : {}),
            };
          }
          return j;
        }),
      );
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const runningCount = migJobs.filter((j) => j.status === "running").length;
  const maxBreakdown = Math.max(
    ...BREAKDOWN.map((b) => b.hot + b.cold + b.arch),
  );

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#f4f6fa] text-gray-800 container-page"
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
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              }
              title="Storage Tiers"
              breadcrumbs={[
                { label: "Dashboard", href: "#" },
                { label: "Pipeline", href: "#" },
                { label: "Storage Tiers" },
              ]}
            />

            <div>
              <div className="flex items-center gap-2">
                <ActionButton
                  action="save"
                  onClick={() => setMigrateModal(true)}
                  label={"Migrate Data"}
                  icon={MigrateIcon}
                />

                <ActionButton
                  action="export"
                  onClick={() => showToast("Storage report exported")}
                  label={"Export Report"}
                />

                <ActionButton
                  action="search"
                  onClick={() => setTierModal(true)}
                  label={"Configure Tiers"}
                  icon={ConfigureIcon}
                />
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1.5 text-[11.5px]">
                <span className="ml-auto flex items-center gap-1.5 text-[11.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse inline-block" />
                  Total:{" "}
                  <span className="font-mono text-gray-800 ml-0.5">
                    3.1 TB used
                  </span>
                  <span className="text-gray-200">·</span>
                  <span className="text-gray-400">of 11.5 TB allocated</span>
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
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                }
                iconColor="text-blue-600"
                count="142 GB"
                countColor="text-blue-600"
                title="Hot Store Used"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0891b2"
                    strokeWidth="2"
                  >
                    <path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07l14.14-14.14" />
                  </svg>
                }
                iconColor="text-cyan-600"
                count="2.8 TB"
                countColor="text-cyan-600"
                title="Cold Store Used"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2"
                  >
                    <path d="M5 8h14M5 8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v.01" />
                    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
                  </svg>
                }
                iconColor="text-purple-700"
                count="184 GB"
                countColor="text-purple-700"
                title="Archive Used"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                }
                iconColor="text-green-600"
                count="22k/s"
                countColor="text-green-600"
                title="Write Rate"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="2"
                  >
                    <polyline points="17 1 21 5 17 9" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  </svg>
                }
                iconColor="text-amber-600"
                count={`${runningCount}`}
                countColor="text-amber-600"
                title="Migrating Now"
              />
              <StatCard
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#7c3aed"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
                iconColor="text-purple-700"
                count="$84"
                countColor="text-purple-700"
                title="Cost / Month"
              />
            </div>
          </Section>

          <Section>
            {/* Tier Hero Cards */}
            <SectionLabel>Storage Tiers Overview</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {TIERS.map((t) => (
                <div
                  key={t.name}
                  className={`rounded-xl border overflow-hidden ${t.cardBorder}`}
                  style={{ background: t.hdBg.replace("bg-", "") }}
                >
                  <div
                    className={`${t.hdBg} px-5 pt-4 pb-3.5 flex items-start justify-between`}
                  >
                    <div>
                      <div
                        className="text-[20px] font-medium mb-0.5"
                        style={{
                          fontFamily: "'Outfit',sans-serif",
                          color: t.color,
                        }}
                      >
                        {t.name}
                      </div>
                      <div
                        className="text-[12px]"
                        style={{ color: t.color, opacity: 0.75 }}
                      >
                        {t.sub}
                      </div>
                    </div>
                    <Badge value="Active" variant={t.badgeVariant} />
                  </div>
                  <div className="px-5 pb-5 flex flex-col gap-3.5">
                    {/* Usage bar */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span
                          className="text-[12px]"
                          style={{ color: t.color }}
                        >
                          Storage usage
                        </span>
                        <span
                          className="font-mono text-[12px]"
                          style={{ color: t.color }}
                        >
                          {t.used} / {t.capacity}
                        </span>
                      </div>
                      <div
                        className="h-2.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(0,0,0,.08)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${t.usedPct}%`,
                            background: t.color,
                          }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <span
                          className="text-[11px]"
                          style={{ color: t.color }}
                        >
                          {t.usedPct}% used
                        </span>
                        <span
                          className="text-[11px]"
                          style={{ color: t.color }}
                        >
                          {t.free} free
                        </span>
                      </div>
                    </div>
                    {/* Stats grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {t.stats.map(({ v, l }) => (
                        <div
                          key={l}
                          className="px-2.5 py-2 rounded-lg"
                          style={{ background: t.statBg }}
                        >
                          <div
                            className="text-[16px] font-normal mb-0.5"
                            style={{
                              fontFamily: "'Outfit',sans-serif",
                              color: t.color,
                            }}
                          >
                            {v}
                          </div>
                          <div
                            className="text-[10.5px]"
                            style={{ color: t.color, opacity: 0.7 }}
                          >
                            {l}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Detail rows */}
                    <div className="flex flex-col gap-1.5">
                      {t.details.map(([k, v]) => (
                        <div
                          key={k}
                          className="flex justify-between text-[12px]"
                        >
                          <span style={{ color: t.color }}>{k}</span>
                          <span
                            className="font-mono text-gray-700"
                            style={
                              k === "Monthly cost"
                                ? { color: t.color, fontWeight: 500 }
                                : {}
                            }
                          >
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setTierModal(true)}
                      className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] border transition-all cursor-pointer"
                      style={{
                        borderColor: t.btnBorder.replace("border-", ""),
                        color: t.color,
                        background: t.btnBg,
                      }}
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                      </svg>
                      Configure {t.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section>
            {/* Data Flow Diagram */}
            <SectionLabel>Data Flow &amp; Migration Rules</SectionLabel>
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 overflow-x-auto">
              <div className="flex items-center justify-center min-w-[860px] gap-0">
                {/* Ingest */}
                <FlowNode
                  color="#16a34a"
                  bg="#f0fdf4"
                  border="#bbf7d0"
                  name="Ingest"
                  sub="22k logs/s"
                  badge="Live"
                  badgeCls="bg-green-50 text-green-600 border-green-200"
                />
                <FlowArrow color="#9ca3af" />
                {/* Router */}
                <FlowNode
                  color="#2563eb"
                  bg="#eff4ff"
                  border="#c7d9fb"
                  name="Router"
                  sub="Rule-based split"
                  badge="8 rules"
                  badgeCls="bg-blue-50 text-blue-600 border-blue-200"
                />
                {/* Branch */}
                <div className="flex flex-col gap-7 px-2 flex-shrink-0">
                  <div className="flex items-center">
                    <div className="w-10 h-0.5 bg-blue-500" />
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="#2563eb">
                      <polygon points="0,0 8,4 0,8" />
                    </svg>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-0.5 bg-cyan-500" />
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="#0891b2">
                      <polygon points="0,0 8,4 0,8" />
                    </svg>
                  </div>
                </div>
                {/* Hot + Cold */}
                <div className="flex flex-col gap-4 flex-shrink-0">
                  <FlowNode
                    color="#2563eb"
                    bg="#eff4ff"
                    border="#c7d9fb"
                    name="Hot"
                    sub="80% · 17.6k/s"
                  />
                  <FlowNode
                    color="#0891b2"
                    bg="#ecfeff"
                    border="#a5f3fc"
                    name="Cold"
                    sub="20% · 4.4k/s"
                  />
                </div>
                {/* Time rules */}
                <div className="flex flex-col gap-8 px-2 flex-shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10.5px] text-gray-400 px-2 py-0.5 border border-gray-200 rounded-full bg-gray-50 whitespace-nowrap">
                      after 48h
                    </span>
                    <div className="flex items-center">
                      <div className="w-7 h-0.5 bg-gray-300" />
                      <svg
                        width="7"
                        height="7"
                        viewBox="0 0 8 8"
                        fill="#9ca3af"
                      >
                        <polygon points="0,0 8,4 0,8" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10.5px] text-gray-400 px-2 py-0.5 border border-gray-200 rounded-full bg-gray-50 whitespace-nowrap">
                      after 90d
                    </span>
                    <div className="flex items-center">
                      <div className="w-7 h-0.5 bg-gray-300" />
                      <svg
                        width="7"
                        height="7"
                        viewBox="0 0 8 8"
                        fill="#9ca3af"
                      >
                        <polygon points="0,0 8,4 0,8" />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* Archive x2 */}
                <div className="flex flex-col gap-4 flex-shrink-0">
                  <FlowNode
                    color="#7c3aed"
                    bg="#f5f3ff"
                    border="#c4b5fd"
                    name="Archive"
                    sub="Compliance · 7yr"
                  />
                  <FlowNode
                    color="#7c3aed"
                    bg="#f5f3ff"
                    border="#c4b5fd"
                    name="Archive"
                    sub="Audit · 7yr"
                  />
                </div>
                {/* TTL delete rules */}
                <div className="flex flex-col gap-8 px-2 flex-shrink-0">
                  {["after 7yr", "after 7yr"].map((label, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[10.5px] text-red-500 px-2 py-0.5 border border-red-200 rounded-full bg-red-50 whitespace-nowrap">
                        {label}
                      </span>
                      <div className="flex items-center">
                        <div className="w-6 h-0.5 bg-red-200" />
                        <svg
                          width="7"
                          height="7"
                          viewBox="0 0 8 8"
                          fill="#dc2626"
                        >
                          <polygon points="0,0 8,4 0,8" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Deleted x2 */}
                <div className="flex flex-col gap-4 flex-shrink-0">
                  <FlowNode
                    color="#dc2626"
                    bg="#fef2f2"
                    border="#fecaca"
                    name="Deleted"
                    sub="TTL expired"
                  />
                  <FlowNode
                    color="#dc2626"
                    bg="#fef2f2"
                    border="#fecaca"
                    name="Deleted"
                    sub="TTL expired"
                  />
                </div>
              </div>
              {/* Legend */}
              <div className="flex gap-5 mt-5 pt-3.5 border-t border-gray-200 flex-wrap">
                {[
                  ["#2563eb", "Hot path (80%)"],
                  ["#0891b2", "Cold path (20%)"],
                  ["#e9ebf0", "Time-based migration"],
                  ["#fecaca", "TTL deletion"],
                ].map(([c, l]) => (
                  <div
                    key={l}
                    className="flex items-center gap-1.5 text-[12px] text-gray-400"
                  >
                    <div className="w-7 h-0.5" style={{ background: c }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section>
            {/* Migration Queue + Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 mb-5">
              {/* Migration Queue */}
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
                      <polyline points="17 1 21 5 17 9" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <polyline points="7 23 3 19 7 15" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                    Migration Queue
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="warning"
                      value={`${runningCount} in progress`}
                    />
                    <ActionButton
                      action="save"
                      onClick={() => showToast("Queue paused")}
                      label={"Pause"}
                      icon={null}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        {[
                          "Job ID",
                          "Source",
                          "Destination",
                          "Size",
                          "Progress",
                          "ETA",
                          "Status",
                        ].map((h) => (
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
                      {migJobs.map((j) => {
                        const pctColor =
                          j.pct === 100
                            ? "#16a34a"
                            : j.pct > 50
                              ? "#2563eb"
                              : "#d97706";
                        return (
                          <tr
                            key={j.id}
                            className="border-b border-gray-100 last:border-b-0 hover:bg-blue-50/40 cursor-pointer transition-colors"
                            onClick={() =>
                              showToast(`Job ${j.id} · ${j.size} · ${j.pct}%`)
                            }
                          >
                            <td className="px-4 h-11 font-mono text-[12px] text-gray-400">
                              {j.id}
                            </td>
                            <td className="px-4 h-11">
                              <TierBadge tier={j.from} />
                            </td>
                            <td className="px-4 h-11">
                              <TierBadge tier={j.to} />
                            </td>
                            <td className="px-4 h-11 font-mono text-[12px]">
                              {j.size}
                            </td>
                            <td className="px-4 h-11">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                      width: `${j.pct}%`,
                                      background: pctColor,
                                    }}
                                  />
                                </div>
                                <span
                                  className="font-mono text-[11.5px] w-8 flex-shrink-0"
                                  style={{ color: pctColor }}
                                >
                                  {j.pct}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 h-11 text-[12px] text-gray-400">
                              {j.eta}
                            </td>
                            <td className="px-4 h-11">
                              <StatusBadge status={j.status} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Breakdown by Category */}
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
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    Breakdown by Category
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Hot · Cold · Archive
                  </span>
                </div>
                <div className="px-5 py-4">
                  {BREAKDOWN.map((b) => {
                    const total = b.hot + b.cold + b.arch;
                    const scale = total / maxBreakdown;
                    return (
                      <div
                        key={b.name}
                        className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="w-[100px] flex-shrink-0 text-[13px] font-medium text-gray-800">
                          {b.name}
                        </div>
                        <div
                          className="flex-1 flex gap-0.5 h-4 rounded overflow-hidden"
                          style={{ flex: scale }}
                        >
                          {[
                            { val: b.hot, color: "#2563eb" },
                            { val: b.cold, color: "#0891b2" },
                            { val: b.arch, color: "#7c3aed" },
                          ].map(({ val, color }, i) => (
                            <div
                              key={i}
                              className="h-full flex items-center justify-center text-[9.5px] text-white font-semibold overflow-hidden transition-all duration-500"
                              style={{ flex: val, background: color }}
                            >
                              {val > 200 ? val + "GB" : ""}
                            </div>
                          ))}
                        </div>
                        <div className="font-mono text-[12px] text-gray-400 w-12 text-right flex-shrink-0">
                          {(total / 1000).toFixed(1)}TB
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Section>

          <Section>
            {/* Cost Analysis + Write Rate Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Cost Analysis */}
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
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    Cost Analysis
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Current month
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        {["Tier", "Used", "Rate", "Cost/mo", "vs Last Mo"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-4 h-8 text-[10.5px] font-normal text-gray-400 text-left tracking-widest uppercase border-r border-gray-100 last:border-r-0"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {COST_ROWS.map((r) => (
                        <tr
                          key={r.tier}
                          className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 h-11">
                            {r.badgeVariant ? (
                              <Badge value={r.tier} variant={r.badgeVariant} />
                            ) : (
                              <span className="text-[12px] text-gray-400">
                                {r.tier}
                              </span>
                            )}
                          </td>
                          <td className="px-4 h-11 font-mono text-[12px]">
                            {r.used}
                          </td>
                          <td className="px-4 h-11 font-mono text-[12px]">
                            {r.rate}
                          </td>
                          <td
                            className="px-4 h-11 font-mono text-[12px]"
                            style={{ color: r.costCls ? undefined : undefined }}
                          >
                            <span
                              className={`font-mono text-[12px] ${r.costCls}`}
                            >
                              {r.cost}
                            </span>
                          </td>
                          <td className="px-4 h-11 text-[12px]">
                            <span className={r.deltaCls}>{r.delta}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200 bg-gray-50">
                        <td
                          colSpan={3}
                          className="px-4 py-2.5 text-[13px] font-medium text-gray-700"
                        >
                          Total
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className="text-[18px] font-normal text-gray-800"
                            style={{ fontFamily: "'Outfit',sans-serif" }}
                          >
                            $84.60
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[12px] text-red-600">
                          ↑ $3.72
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div className="mx-4 my-3 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2"
                    className="mt-0.5 flex-shrink-0"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span className="text-[12px] text-green-700">
                    💡 Moving Hot logs older than 36h (instead of 48h) would
                    save ~$4.20/mo and free 38 GB.
                  </span>
                </div>
              </div>

              {/* Write Rate Chart */}
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
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    Write Rate History — 6h
                  </div>
                  <div className="flex gap-3 text-[11.5px]">
                    {[
                      ["#2563eb", "Hot"],
                      ["#0891b2", "Cold"],
                    ].map(([c, l]) => (
                      <span key={l} className="flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-sm inline-block"
                          style={{ background: c }}
                        />
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="px-5 pt-4 pb-3">
                  <WriteChart />
                  <div className="flex justify-between mt-1.5">
                    {["6h ago", "4h", "2h", "Now"].map((t) => (
                      <span key={t} className="text-[11px] text-gray-400">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Modal: Configure Tier */}
      <Modal
        open={tierModal}
        onClose={() => setTierModal(false)}
        title="Configure Storage Tier"
        footer={
          <>
            <ActionButton
              action="export"
              onClick={() => setTierModal(false)}
              label="Cancel"
              icon={null}
            />
            <ActionButton
              action="search"
              onClick={() => {
                setTierModal(false);
                showToast("Tier configuration saved");
              }}
              label="Save Configuration"
              icon={SaveIcon}
            />
          </>
        }
      >
        <Inp label="Tier">
          <Sel>
            <option>Hot Store</option>
            <option>Cold Store</option>
            <option>Archive</option>
          </Sel>
        </Inp>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Capacity (GB)" value="500" type="number" />
          <Inp label="Retention">
            <Sel defaultValue="48h">
              <option>24h</option>
              <option>48h</option>
              <option>72h</option>
              <option>7d</option>
              <option>30d</option>
              <option>90d</option>
              <option>1yr</option>
              <option>7yr</option>
            </Sel>
          </Inp>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Inp label="Compression">
            <Sel>
              <option>None</option>
              <option>gzip</option>
              <option>zstd</option>
              <option>lz4</option>
            </Sel>
          </Inp>
          <Inp label="Replication Factor">
            <Sel defaultValue="3×">
              <option>1×</option>
              <option>2×</option>
              <option>3×</option>
            </Sel>
          </Inp>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Inp label="Migrate to next tier after">
            <Sel defaultValue="48h">
              <option>24h</option>
              <option>48h</option>
              <option>72h</option>
              <option>7d</option>
              <option>30d</option>
              <option>90d</option>
            </Sel>
          </Inp>
          <Inp label="Overflow policy">
            <Sel defaultValue="DLQ fallback">
              <option>Block writes</option>
              <option>DLQ fallback</option>
              <option>Drop oldest</option>
            </Sel>
          </Inp>
        </div>
        <Field label="Alert when usage exceeds (%)" value="80" type="number" />
        <Inp label="Engine / Backend">
          <Sel>
            <option>NVMe SSD</option>
            <option>HDD Object Store</option>
            <option>AWS S3</option>
            <option>GCS</option>
            <option>Glacier</option>
          </Sel>
        </Inp>
      </Modal>

      {/* Modal: Migrate Data */}
      <Modal
        open={migrateModal}
        onClose={() => setMigrateModal(false)}
        title="Migrate Data"
        maxW="max-w-md"
        footer={
          <>
            <ActionButton
              action="export"
              onClick={() => setMigrateModal(false)}
              label="Cancel"
              icon={null}
            />
            <ActionButton
              action="search"
              onClick={() => {
                setMigrateModal(false);
                showToast("Migration job queued — 142 GB · Hot → Cold");
              }}
              label="Start Migration"
              icon={MigrateIcon}
            />
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Inp label="From Tier">
            <Sel>
              <option>Hot Store</option>
              <option>Cold Store</option>
            </Sel>
          </Inp>
          <Inp label="To Tier">
            <Sel defaultValue="❄️ Cold Store">
              <option>Hot Store</option>
              <option>Cold Store</option>
              <option>Archive</option>
            </Sel>
          </Inp>
        </div>
        <Inp label="Filter (optional)">
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-800 outline-none focus:border-blue-500"
            placeholder="e.g. category:Payments OR api:payment-api"
          />
        </Inp>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Date range from" value="2024-03-01" type="date" />
          <Field label="Date range to" value="2024-03-27" type="date" />
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[12.5px] text-amber-700">
          ⚠️ Estimated data: <strong>142 GB</strong> · Migration will take
          approx. <strong>18 minutes</strong>. Reads will remain available
          during migration.
        </div>
      </Modal>

      <Toast message={toast} />
    </div>
  );
}

// ── FLOW NODE ─────────────────────────────────────────────────────────────────
function FlowNode({ color, bg, border, name, sub, badge, badgeCls }) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[110px] flex-shrink-0">
      <div
        className="rounded-xl px-4 py-3 text-center border-2 min-w-[110px]"
        style={{ background: bg, borderColor: border }}
      >
        <div
          className="text-[14px] font-medium mb-0.5"
          style={{ fontFamily: "'Outfit',sans-serif", color }}
        >
          {name}
        </div>
        {sub && (
          <div className="text-[11px]" style={{ color, opacity: 0.75 }}>
            {sub}
          </div>
        )}
      </div>
      {badge && (
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full border ${badgeCls}`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function FlowArrow({ color = "#9ca3af" }) {
  return (
    <div className="flex items-center px-1 flex-shrink-0">
      <div className="w-6 h-0.5" style={{ background: color }} />
      <svg width="7" height="7" viewBox="0 0 8 8" fill={color}>
        <polygon points="0,0 8,4 0,8" />
      </svg>
    </div>
  );
}
