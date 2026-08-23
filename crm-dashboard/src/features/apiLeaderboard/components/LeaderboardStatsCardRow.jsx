// LeaderboardStatsCardRow.jsx
// Six stat-pill cards for the API Leaderboard page header
// Mirrors the HTML reference stat pills exactly
// Reuses StatCard3 — same pattern as CategoriesStatsCardRow

import { StatCard } from "../../../components/ui/StatCard3.jsx";
import {
  PulseWaveIcon,
  SuccessCheckIcon,
  WarningTriangleIcon,
  StatusDownIcon,
  BarsIcon,
  ShieldIcon,
} from "../../../components/ui/AppIcons";

/**
 * Props
 *   rankedApis       – e.g. 42
 *   bestUptime       – e.g. "99.9%"
 *   fastestResponse  – e.g. "18ms"
 *   mostIncidents    – e.g. 22
 *   mostImproved     – e.g. 3
 *   topScore         – e.g. 96
 *   isLoading
 */
export function LeaderboardStatsCardRow({
  rankedApis      = 42,
  bestUptime      = "99.9%",
  fastestResponse = "18ms",
  mostIncidents   = 22,
  mostImproved    = 3,
  topScore        = 96,
  isLoading       = false,
}) {
  const dash = "—";

  const cards = [
    {
      icon:       <BarsIcon width={20} height={20} stroke="#f59e0b" />,
      iconColor:  "text-amber-500",
      count:      isLoading ? dash : rankedApis,
      countColor: "text-[#1c1f2e]",
      title:      "Ranked APIs",
      titleColor: "text-gray-500",
    },
    {
      icon:       <SuccessCheckIcon width={20} height={20} stroke="#16a34a" />,
      iconColor:  "text-emerald-600",
      count:      isLoading ? dash : bestUptime,
      countColor: "text-emerald-600",
      title:      "Best Uptime",
      titleColor: "text-gray-500",
    },
    {
      icon:       <PulseWaveIcon width={20} height={20} stroke="#2563eb" />,
      iconColor:  "text-blue-500",
      count:      isLoading ? dash : fastestResponse,
      countColor: "text-blue-600",
      title:      "Fastest Response",
      titleColor: "text-gray-500",
    },
    {
      icon:       <WarningTriangleIcon width={20} height={20} stroke="#dc2626" />,
      iconColor:  "text-red-500",
      count:      isLoading ? dash : mostIncidents,
      countColor: "text-red-600",
      title:      "Most Incidents",
      titleColor: "text-gray-500",
    },
    {
      icon:       <StatusDownIcon width={20} height={20} stroke="#7c3aed" />,
      iconColor:  "text-violet-500",
      count:      isLoading ? dash : `↑ ${mostImproved}`,
      countColor: "text-emerald-600",
      title:      "Most Improved",
      titleColor: "text-gray-500",
    },
    {
      icon:       <ShieldIcon width={20} height={20} stroke="#0891b2" />,
      iconColor:  "text-cyan-500",
      count:      isLoading ? dash : topScore,
      countColor: "text-cyan-600",
      title:      "Top Score",
      titleColor: "text-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}