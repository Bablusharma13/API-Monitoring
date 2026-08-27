import { StatCard } from "../../../components/ui/StatCard3";
import {
  CheckCircleIcon,
  WarningTriangleIcon,
  StatusDownIcon,
  BarsIcon,
} from "../../../components/ui/AppIcons";
import { formatCount } from "../../../utils/helpers";

export function SloDashboardStatsCardRow({
  total = 0,
  met = 0,
  risk = 0,
  breached = 0,
  avgUptime = null,
  isLoading = false,
}) {
  const cards = [
    {
      icon: (
        <BarsIcon
          width={20}
          height={20}
          stroke="#2563eb"
          strokeWidth={1.8}
          className="text-[#2563eb]"
        />
      ),
      iconColor: "text-blue-500",
      count: isLoading ? "—" : formatCount(total),
      countColor: "text-blue-600",
      title: "APIs Tracked",
    },
    {
      icon: (
        <CheckCircleIcon
          width={20}
          height={20}
          stroke="#16a34a"
          strokeWidth={1.8}
          className="text-[#16a34a]"
        />
      ),
      iconColor: "text-emerald-500",
      count: isLoading ? "—" : formatCount(met),
      countColor: "text-emerald-600",
      title: "Met",
    },
    {
      icon: (
        <WarningTriangleIcon
          width={20}
          height={20}
          stroke="#d97706"
          className="text-[#d97706]"
        />
      ),
      iconColor: "text-amber-500",
      count: isLoading ? "—" : formatCount(risk),
      countColor: "text-amber-600",
      title: "At Risk",
    },
    {
      icon: (
        <StatusDownIcon
          width={20}
          height={20}
          stroke="#dc2626"
          className="text-[#dc2626]"
        />
      ),
      iconColor: "text-red-500",
      count: isLoading ? "—" : formatCount(breached),
      countColor: "text-red-600",
      title: "Breached",
    },
    {
      icon: (
        <CheckCircleIcon
          width={20}
          height={20}
          stroke="#0891b2"
          strokeWidth={1.8}
          className="text-[#0891b2]"
        />
      ),
      iconColor: "text-cyan-500",
      count: isLoading || avgUptime == null ? "—" : `${avgUptime}%`,
      countColor: "text-cyan-600",
      title: "Avg Uptime",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-3.5">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
