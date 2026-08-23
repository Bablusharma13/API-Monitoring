import { useState, useRef, useCallback, useMemo } from "react";
import { CheckCircle } from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { InfoCard } from "../../../components/ui/InfoCard";
import { StatCard } from "../../../components/ui/StatCard3.jsx";
import Modal from "../../../components/ui/Modal";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { Button } from "../../../components/ui/Button.jsx";
import {
  PulseWaveIcon,
  SuccessCheckIcon,
  WarningTriangleIcon,
  StatusDownIcon,
  BarsIcon,
  ShieldIcon,
} from "../../../components/ui/AppIcons";
import { getLeaderboardColumns } from "./LeaderboardColumns.jsx";
import { useApiLeaderboard, getTabData } from "../hooks/useApiLeaderboard.js";
import { href, Link, useNavigate } from "react-router-dom";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_FILTERS = ["All", "Payments", "Auth", "Data", "Platform"];
const TIME_OPTIONS = ["Today", "7 days", "30 days", "Custom"];

const LEADERBOARD_GROUP = {
  Identity: { hex: "#2563eb", bg: "bg-blue-50", text: "text-blue-600" },
  Performance: { hex: "#0891b2", bg: "bg-cyan-50", text: "text-cyan-600" },
  Reliability: { hex: "#d97706", bg: "bg-amber-50", text: "text-amber-600" },
  Trends: { hex: "#7c3aed", bg: "bg-violet-50", text: "text-violet-600" },
  Meta: { hex: "#f97316", bg: "bg-orange-50", text: "text-orange-500" },
  Actions: { hex: "#6b7280", bg: "bg-gray-50", text: "text-gray-500" },
};

const TABS = [
  { key: "best", label: "Top APIs", icon: "★" },
  { key: "worst", label: "Worst APIs", icon: "↘" },
  { key: "slow", label: "Slowest APIs", icon: "⏱" },
  { key: "down", label: "Most Down", icon: "⊘" },
  { key: "risk", label: "High Risk", icon: "△" },
  { key: "improved", label: "Most Improved", icon: "↑" },
];

const TAB_TABLE_TITLES = {
  best: "Top 10 Best APIs — Full Ranking",
  worst: "Top 10 Worst APIs — Needs Attention",
  slow: "Top 10 Slowest APIs — Response Time",
  down: "Most Down APIs — Highest Incidents",
  risk: "High Risk APIs — Critical Risk Score",
  improved: "Most Improved APIs — Trending Up",
};

// ─── LiveDot (same micro-component as apiDashboard.jsx) ──────────────────────
const LiveDot = () => (
  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
);

// ─── Medal bubble ─────────────────────────────────────────────────────────────
function Medal({ rank }) {
  const cls =
    rank === 1
      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_2px_8px_rgba(245,158,11,0.4)]"
      : rank === 2
        ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-[0_2px_8px_rgba(107,114,128,0.3)]"
        : "bg-gradient-to-br from-amber-600 to-amber-900 text-white shadow-[0_2px_8px_rgba(217,119,6,0.3)]";
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-[15px] font-semibold flex-shrink-0 ${cls}`}
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {rank}
    </div>
  );
}

// ─── Podium card badge map ────────────────────────────────────────────────────
const PODIUM_BADGE_STYLES = {
  "Most Stable": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    icon: "🏆",
  },
  Fastest: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    icon: "⚡",
  },
  Critical: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
    icon: "🔴",
  },
  Rising: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-100",
    icon: "📈",
  },
  Streak: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    icon: "🔥",
  },
};

// ─── Podium Card — all ranks use the same plain white card, no color tinting ──
function PodiumCard({ api, rank }) {
  const badges = api.badges ?? [];
  const scoreColor =
    api.score >= 80 ? "#16a34a" : api.score >= 60 ? "#d97706" : "#dc2626";
  const scoreText =
    api.score >= 80
      ? "text-emerald-600"
      : api.score >= 60
        ? "text-amber-600"
        : "text-red-600";

  return (
    <Link
      to={`/dashboard/apis/${api.id}`}
      className="rounded-xl border border-[#e9ebf0] bg-white overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f0f2f7]">
        <Medal rank={rank} />
        <div className="flex-1 min-w-0">
          <div
            className="text-[15px] font-medium text-[#1c1f2e] truncate"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {api.name}
          </div>
          <div className="text-[11px] text-[#6b7280]">
            {api.cat} · {api.owner}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div
            className={`text-[22px] font-medium leading-none ${scoreText}`}
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {api.score}
          </div>
          <div className="text-[11px] text-[#6b7280]">Score</div>
        </div>
      </div>

      {/* stats */}
      <div className="px-4 py-3 space-y-[5px]">
        {[
          {
            label: "Uptime",
            val: `${api.uptime}%`,
            color: "text-emerald-600",
          },
          {
            label: "Response",
            val: api.resp > 0 ? `${api.resp}ms` : "Down",
            color:
              api.resp === 0
                ? "text-red-600"
                : api.resp > 1000
                  ? "text-red-600"
                  : api.resp > 500
                    ? "text-amber-600"
                    : "",
          },
          {
            label: "Incidents",
            val: api.inc,
            color:
              api.inc > 5
                ? "text-red-600"
                : api.inc > 0
                  ? "text-amber-600"
                  : "text-emerald-600",
          },
          {
            label: "Risk Score",
            val: api.risk,
            color:
              api.risk >= 70
                ? "text-red-600"
                : api.risk >= 40
                  ? "text-amber-600"
                  : "text-emerald-600",
          },
        ].map(({ label, val, color }) => (
          <div
            key={label}
            className="flex items-center justify-between border-b border-[#f3f5f9] pb-[5px] last:border-0 last:pb-0"
          >
            <span className="text-[12px] text-[#6b7280]">{label}</span>
            <span className={`text-[12.5px] ${color}`}>{val}</span>
          </div>
        ))}

        {api.streak > 0 && (
          <div className="flex items-center justify-between border-b border-[#f3f5f9] pb-[5px]">
            <span className="text-[12px] text-[#6b7280]">Streak</span>
            <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-px rounded-full">
              🔥 {api.streak}d clean
            </span>
          </div>
        )}

        {/* score bar */}
        <div className="h-[4px] rounded-full bg-[#f0f2f7] overflow-hidden mt-2">
          <div
            className="h-full rounded-full"
            style={{ width: `${api.score}%`, background: scoreColor }}
          />
        </div>

        {/* badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2">
            {badges.map((b) => {
              const s = PODIUM_BADGE_STYLES[b] ?? {
                bg: "bg-gray-100",
                text: "text-gray-500",
                border: "border-gray-200",
                icon: "",
              };
              return (
                <span
                  key={b}
                  className={`inline-flex items-center gap-0.5 px-2 py-px rounded-full text-[10.5px] font-medium border ${s.bg} ${s.text} ${s.border}`}
                >
                  {s.icon} {b}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Insight item — plain white InfoCard style, SVG icon, no colored borders ──
const INSIGHT_ICON_MAP = {
  down: {
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    svg: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      </svg>
    ),
  },
  up: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    svg: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="15 7 22 7 22 14" />
      </svg>
    ),
  },
  warning: {
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    svg: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  star: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-400",
    svg: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  trend: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    svg: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="15 7 22 7 22 14" />
      </svg>
    ),
  },
};

function InsightItem({ type, title, sub }) {
  const s = INSIGHT_ICON_MAP[type] ?? INSIGHT_ICON_MAP.warning;
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 bg-white rounded-xl border border-[#e9ebf0] shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-[32px] h-[32px] rounded-lg flex items-center justify-center flex-shrink-0 ${s.iconBg} ${s.iconColor}`}
      >
        {s.svg}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1c1f2e] leading-snug">
          {title}
        </p>
        <p className="text-[12px] text-[#6b7280] mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── Empty chart box ──────────────────────────────────────────────────────────
function ChartBox({ title, iconEl }) {
  return (
    <div className="bg-white border border-[#e9ebf0] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-[11px] border-b border-[#e9ebf0] bg-[#fafbfc] text-[13px] text-[#1c1f2e]">
        <span className="opacity-60">{iconEl}</span>
        {title}
      </div>
      <div className="h-[148px] flex items-center justify-center">
        <span className="text-[12px] text-[#9ca3af] select-none">
          Chart coming soon
        </span>
      </div>
    </div>
  );
}

// ─── Compare banner ───────────────────────────────────────────────────────────
function CompareBanner({ selected, onRemove, onClear, onCompare }) {
  if (!selected.length) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2563eb"
        strokeWidth="2"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
      <span className="text-[12.5px] font-medium text-blue-700">
        Compare Mode
      </span>
      <div className="flex gap-2 flex-wrap flex-1">
        {selected.map((name) => (
          <span
            key={name}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] bg-white border border-blue-200 text-blue-700"
          >
            {name}
            <button
              onClick={() => onRemove(name)}
              className="opacity-60 hover:opacity-100 text-[11px] leading-none"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      {selected.length >= 2 && (
        <Button variant="primary" size="sm" onClick={onCompare}>
          Compare Now
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}

// ─── Badge helper (shared between table + podium) ─────────────────────────────
function computeBadges(a) {
  const b = [];
  if (a.uptime >= 99.8 && a.inc === 0) b.push("Most Stable");
  if (a.resp <= 80 && a.resp > 0) b.push("Fastest");
  if (a.risk >= 70) b.push("Critical");
  if (a.trend > 3) b.push("Rising");
  if (a.streak >= 30) b.push("Streak");
  return b;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ApiLeaderboard() {
  const { apis, stats, insights, isLoading } = useApiLeaderboard();

  const [activeTab, setActiveTab] = useState("best");
  const [catFilter, setCatFilter] = useState("All");
  const [timeRange, setTimeRange] = useState("7 days");
  const [compareSet, setCompareSet] = useState(new Set());
  const [compareOpen, setCompareOpen] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // toast — same pattern as apiDashboard
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef();
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400);
  }, []);

  const handleSortChange = useCallback(({ sortBy: field, sortDirection }) => {
    setSortBy(field);
    setSortOrder(sortDirection);
  }, []);

  // ── Tab data ──
  const catKey = catFilter === "All" ? "all" : catFilter;
  const tabData = getTabData(activeTab, catKey, apis);

  // ── Podium — silver · gold · bronze display order ──
  const podiumOrder = [tabData[1], tabData[0], tabData[2]].filter(Boolean);
  const podiumWithBadges = podiumOrder.map((a) => ({
    ...a,
    badges: computeBadges(a),
  }));

  // ── Table rows ──
  const baseRows = tabData.map((a) => ({
    ...a,
    badges: computeBadges(a),
    _selected: compareSet.has(a.name),
  }));

  const tableRows = useMemo(() => {
    if (!sortBy) return baseRows;
    return [...baseRows].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const aNum = typeof aVal === "number" ? aVal : parseFloat(aVal);
      const bNum = typeof bVal === "number" ? bVal : parseFloat(bVal);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      }
      const aStr = String(aVal ?? "");
      const bStr = String(bVal ?? "");
      return sortOrder === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseRows, sortBy, sortOrder]);

  // ── Compare apis for modal ──
  const compareApis = [...compareSet]
    .map((n) => apis.find((a) => a.name === n))
    .filter(Boolean);

  // ── Compare handlers ──
  const handleRowClick = (row) => {
    setCompareSet((prev) => {
      const next = new Set(prev);
      if (next.has(row.name)) {
        next.delete(row.name);
      } else if (next.size < 4) {
        next.add(row.name);
      } else {
        showToast("Max 4 APIs for comparison");
      }
      return next;
    });
  };
  const removeFromCompare = (name) =>
    setCompareSet((prev) => {
      const n = new Set(prev);
      n.delete(name);
      return n;
    });
  const clearCompare = () => setCompareSet(new Set());

  // ── Columns ──
  const columns = getLeaderboardColumns({
    onView: (row) => showToast(`Opening ${row.name}…`),
    onIncident: (row) => showToast(`Incident: ${row.name}`),
    onRestart: (row) => showToast(`Restart: ${row.name}`),
    onAlert: (row) => showToast(`Alert sent for ${row.name}`),
  });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="container-page pb-8">
        {/* ── 1. PAGE HEADER — same component as apiDashboard ── */}
        <PageHeader
          icon={<PulseWaveIcon />}
          iconGradient=""
          title="API Leaderboard"
          subtitle="Compare API performance, reliability, and risk across your entire fleet"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "All APIs", href: "/dashboard/apis" },
            { label: "Leaderboard", href: "/dashboard/apis/leaderboard" },
          ]}
        />

        {/* ── 2. KPI STAT CARDS ── */}
        <Section>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              icon={<BarsIcon width={20} height={20} stroke="#f59e0b" />}
              count={isLoading ? "…" : stats.rankedApis}
              title="Ranked APIs"
              countColor="text-[#1c1f2e]"
            />
            <StatCard
              icon={
                <SuccessCheckIcon width={20} height={20} stroke="#16a34a" />
              }
              count={isLoading ? "…" : stats.bestUptime}
              title="Best Uptime"
              countColor="text-emerald-600"
            />
            <StatCard
              icon={<PulseWaveIcon width={20} height={20} stroke="#2563eb" />}
              count={isLoading ? "…" : stats.fastestResponse}
              title="Fastest Response"
              countColor="text-blue-600"
            />
            <StatCard
              icon={
                <WarningTriangleIcon width={20} height={20} stroke="#dc2626" />
              }
              count={isLoading ? "…" : stats.mostIncidents}
              title="Most Incidents"
              countColor="text-red-600"
            />
            <StatCard
              icon={<StatusDownIcon width={20} height={20} stroke="#7c3aed" />}
              count={
                isLoading ? (
                  "…"
                ) : stats.mostImproved === "—" ? (
                  "—"
                ) : (
                  <p className="line-clamp-1 text-[22px]">
                    {stats.mostImproved}
                  </p>
                )
              }
              title="Most Improved"
              countColor="text-emerald-600"
            />
            <StatCard
              icon={<ShieldIcon width={20} height={20} stroke="#0891b2" />}
              count={isLoading ? "…" : stats.topScore}
              title="Top Score"
              countColor="text-cyan-600"
            />
          </div>
        </Section>

        {/* ── 5. COMPARE BANNER ── */}
        {/* {compareSet.size > 0 && ( */}
        {/*   <div className="pt-2"> */}
        {/*     <CompareBanner */}
        {/*       selected={[...compareSet]} */}
        {/*       onRemove={removeFromCompare} */}
        {/*       onClear={clearCompare} */}
        {/*       onCompare={() => setCompareOpen(true)} */}
        {/*     /> */}
        {/*   </div> */}
        {/* )} */}

        {/* ── 6. TOP 3 PODIUM ── */}
        <Section>
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px]">
              {/* Silver (rank 2) */}
              {podiumWithBadges[0] && (
                <PodiumCard api={podiumWithBadges[0]} rank={2} />
              )}
              {/* Gold (rank 1) */}
              {podiumWithBadges[1] && (
                <PodiumCard api={podiumWithBadges[1]} rank={1} />
              )}
              {/* Bronze (rank 3) */}
              {podiumWithBadges[2] && (
                <PodiumCard api={podiumWithBadges[2]} rank={3} />
              )}
            </div>
          </div>
        </Section>

        {/* ── 7. AUTO INSIGHTS — 6 plain white cards, grid-cols-2 ── */}
        <Section>
          {/* section title row */}
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#1c1f2e] mb-3">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-55"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Auto Insights
          </div>
          {/* 6 cards — 2 per row, 3 rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insights.map((ins, i) => (
              <InsightItem key={i} {...ins} />
            ))}
          </div>
        </Section>

        {/* ── 9. FULL RANKING TABLE ── */}
        <Section>
          <div className="bg-white border border-[#e9ebf0] rounded-xl overflow-hidden">
            <NewTableConfig
              module="api-leaderboard"
              columns={columns}
              data={tableRows}
              rowKey="name"
              onRowClick={handleRowClick}
              rowClassName={(row) => (row._selected ? "bg-[#eff4ff]" : "")}
              showRowNumbers={false}
              showPagination={false}
              group={LEADERBOARD_GROUP}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleServerSideSorting={handleSortChange}
            />
          </div>
        </Section>
      </div>

      {/* ── COMPARE MODAL — same Modal component as apiDashboard ── */}
      <Modal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        title="API Comparison"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompareOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                showToast("Comparison exported");
                setCompareOpen(false);
              }}
            >
              Export Comparison
            </Button>
          </>
        }
      >
        {compareApis.length >= 2 &&
          (() => {
            const metrics = [
              {
                label: "Score",
                vals: compareApis.map((a) => ({
                  v: `${a.score}`,
                  num: a.score,
                  good: "high",
                })),
              },
              {
                label: "Uptime %",
                vals: compareApis.map((a) => ({
                  v: `${a.uptime}%`,
                  num: a.uptime,
                  good: "high",
                })),
              },
              {
                label: "Avg Response",
                vals: compareApis.map((a) => ({
                  v: a.resp > 0 ? `${a.resp}ms` : "Down",
                  num: a.resp || 9999,
                  good: "low",
                })),
              },
              {
                label: "Incidents",
                vals: compareApis.map((a) => ({
                  v: `${a.inc}`,
                  num: a.inc,
                  good: "low",
                })),
              },
              {
                label: "Risk Score",
                vals: compareApis.map((a) => ({
                  v: `${a.risk}`,
                  num: a.risk,
                  good: "low",
                })),
              },
              {
                label: "Downtime",
                vals: compareApis.map((a) => ({ v: a.downtime })),
              },
              {
                label: "Streak (d)",
                vals: compareApis.map((a) => ({
                  v: `${a.streak}d`,
                  num: a.streak,
                  good: "high",
                })),
              },
            ];
            const winner = [...compareApis].sort(
              (a, b) => b.score - a.score,
            )[0];

            return (
              <div className="flex flex-col gap-3 chart-scroll-x">
                {/* API header row */}
                <div
                  className="grid gap-2 min-w-[480px]"
                  style={{
                    gridTemplateColumns: `120px repeat(${compareApis.length}, 1fr)`,
                  }}
                >
                  <div />
                  {compareApis.map((a) => (
                    <div
                      key={a.name}
                      className="p-2.5 bg-[#f8f9fc] border border-[#e9ebf0] rounded-lg text-center"
                    >
                      <div className="text-[13px] font-medium text-[#1c1f2e]">
                        {a.name}
                      </div>
                      <div className="text-[11px] text-[#6b7280] mt-0.5">
                        {a.cat}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Metric rows */}
                {metrics.map((m) => {
                  let bestIdx = -1;
                  let bestNum =
                    m.vals[0]?.good === "high" ? -Infinity : Infinity;
                  m.vals.forEach((v, i) => {
                    if (v.num !== undefined) {
                      if (m.vals[0].good === "high" && v.num > bestNum) {
                        bestNum = v.num;
                        bestIdx = i;
                      }
                      if (m.vals[0].good === "low" && v.num < bestNum) {
                        bestNum = v.num;
                        bestIdx = i;
                      }
                    }
                  });
                  return (
                    <div
                      key={m.label}
                      className="flex items-center rounded-lg border border-[#e9ebf0] overflow-hidden min-w-[480px]"
                    >
                      <div className="w-[120px] px-3 py-2 text-[12px] text-[#6b7280] bg-[#fafbfc] border-r border-[#e9ebf0] flex-shrink-0">
                        {m.label}
                      </div>
                      <div className="flex flex-1">
                        {m.vals.map((v, i) => (
                          <div
                            key={i}
                            className={`flex-1 text-center px-2 py-2 text-[13px] ${
                              i === bestIdx
                                ? "bg-emerald-50 text-emerald-700 font-semibold"
                                : "text-[#1c1f2e]"
                            }`}
                          >
                            {v.v}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Winner */}
                <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50">
                  <span className="text-[12.5px] text-emerald-700">
                    🏆 Winner: <strong>{winner.name}</strong> — highest
                    composite score
                  </span>
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* ── TOAST — identical to apiDashboard ── */}
      <div
        className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-[#1c1f2e] text-white text-[13px] px-[18px] py-2.5 rounded-lg pointer-events-none transition-opacity duration-300 max-w-[360px] ${
          toastVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <CheckCircle size={12} className="text-emerald-300" />
        {toastMsg}
      </div>
    </>
  );
}
