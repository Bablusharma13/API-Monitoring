import { StatCard } from "../../../components/ui/StatCard3";
import {
  BellIcon,
  CheckCircleIcon,
  StatusDownIcon,
  WarningTriangleIcon,
} from "../../../components/ui/AppIcons";
import { formatCount } from "../../../utils/helpers";

export function ActiveAlertsStatsCardRow({
  total = 0,
  firing = 0,
  acknowledged = 0,
  resolved = 0,
  critical = 0,
  isLoading = false,
}) {
  const dash = (n) => (isLoading ? "—" : formatCount(n));

  const cards = [
    {
      icon: <BellIcon width={20} height={20} className="text-[#2563eb]" />,
      iconColor: "text-blue-500",
      count: dash(total),
      countColor: "text-blue-600",
      title: "Total Alerts",
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
      count: dash(firing),
      countColor: "text-red-600",
      title: "Firing Now",
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
      count: dash(acknowledged),
      countColor: "text-amber-600",
      title: "Acknowledged",
    },
    {
      icon: (
        <CheckCircleIcon
          width={20}
          height={20}
          stroke="#16a34a"
          className="text-[#16a34a]"
        />
      ),
      iconColor: "text-emerald-500",
      count: dash(resolved),
      countColor: "text-emerald-600",
      title: "Resolved",
    },
    {
      icon: (
        <StatusDownIcon
          width={20}
          height={20}
          stroke="#b91c1c"
          className="text-[#b91c1c]"
        />
      ),
      iconColor: "text-red-700",
      count: dash(critical),
      countColor: "text-red-700",
      title: "Critical Severity",
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
