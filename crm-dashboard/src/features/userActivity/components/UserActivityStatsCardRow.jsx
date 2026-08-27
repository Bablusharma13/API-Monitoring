import { StatCard } from "../../../components/ui/StatCard3";
import {
  UsersIcon,
  BarsIcon,
  WarningTriangleIcon,
  ClockIcon,
} from "../../../components/ui/AppIcons";
import { formatCount } from "../../../utils/helpers";

export function UserActivityStatsCardRow({
  totalUsers = 0,
  totalRequests = 0,
  totalErrors = 0,
  avgLatency = null,
  errorRatePct = 0,
  isLoading = false,
}) {
  const cards = [
    {
      icon: (
        <UsersIcon
          width={20}
          height={20}
          stroke="#7c3aed"
          strokeWidth={1.8}
          className="text-[#7c3aed]"
        />
      ),
      iconColor: "text-purple-500",
      count: isLoading ? "—" : formatCount(totalUsers),
      countColor: "text-purple-700",
      title: "Active Users",
    },
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
      count: isLoading ? "—" : formatCount(totalRequests),
      countColor: "text-blue-600",
      title: "Total Requests",
    },
    {
      icon: (
        <WarningTriangleIcon
          width={20}
          height={20}
          stroke="#dc2626"
          className="text-[#dc2626]"
        />
      ),
      iconColor: "text-red-500",
      count: isLoading ? "—" : formatCount(totalErrors),
      countColor: "text-red-600",
      title: "Total Errors",
    },
    {
      icon: (
        <ClockIcon
          width={20}
          height={20}
          stroke="#0891b2"
          strokeWidth={1.8}
          className="text-[#0891b2]"
        />
      ),
      iconColor: "text-cyan-500",
      count: isLoading || avgLatency == null ? "—" : `${avgLatency}ms`,
      countColor: "text-cyan-600",
      title: "Avg Latency",
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
      count: isLoading ? "—" : `${errorRatePct}%`,
      countColor: "text-amber-600",
      title: "Error Rate",
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
