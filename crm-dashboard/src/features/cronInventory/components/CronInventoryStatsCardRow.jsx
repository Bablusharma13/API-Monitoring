import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Pause,
  Loader2,
  Activity,
  Shield,
} from "lucide-react";
import { StatCard } from "../../../components/ui/StatCard3";
import { formatCount } from "../../../utils/helpers";

// All seven tiles map 1:1 onto real fields from useCronJobSummaryQuery() —
// no globally-aggregated "avg duration" / hardcoded "30d success" tiles
// (the old mock hardcoded both; neither has a real aggregate endpoint
// backing it, so they were dropped rather than faked).
export function CronInventoryStatsCardRow({
  onTime = 0,
  late = 0,
  missing = 0,
  paused = 0,
  pending = 0,
  pingsToday = 0,
  reliability30d = 100,
}) {
  const cards = [
    { icon: <CheckCircle stroke="#16a34a" />, count: onTime, countColor: "text-emerald-600", title: "On Time" },
    { icon: <Clock stroke="#d97706" />, count: late, countColor: "text-amber-600", title: "Late" },
    { icon: <AlertTriangle stroke="#dc2626" />, count: missing, countColor: "text-red-600", title: "Missing" },
    { icon: <Pause stroke="#6b7280" />, count: paused, countColor: "text-[#6b7280]", title: "Paused" },
    { icon: <Loader2 stroke="#2563eb" />, count: pending, countColor: "text-blue-600", title: "Pending" },
    { icon: <Activity stroke="#2563eb" />, count: formatCount(pingsToday), countColor: "text-blue-600", title: "Pings Today" },
    { icon: <Shield stroke="#0891b2" />, count: `${reliability30d}%`, countColor: "text-emerald-600", title: "30d Reliability" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3 sm:gap-3.5">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
