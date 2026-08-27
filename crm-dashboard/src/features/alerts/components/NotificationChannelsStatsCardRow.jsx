import { StatCard } from "../../../components/ui/StatCard3";
import {
  BellIcon,
  CheckCircleIcon,
  StatusDownIcon,
} from "../../../components/ui/AppIcons";
import { formatCount } from "../../../utils/helpers";

export function NotificationChannelsStatsCardRow({
  total = 0,
  enabled = 0,
  totalSent = 0,
  totalFailed = 0,
  isLoading = false,
}) {
  const dash = (n) => (isLoading ? "—" : formatCount(n));

  const cards = [
    {
      icon: <BellIcon width={20} height={20} className="text-[#2563eb]" />,
      iconColor: "text-blue-500",
      count: dash(total),
      countColor: "text-blue-600",
      title: "Total Channels",
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
      count: dash(enabled),
      countColor: "text-emerald-600",
      title: "Enabled",
    },
    {
      icon: (
        <CheckCircleIcon
          width={20}
          height={20}
          stroke="#0891b2"
          className="text-[#0891b2]"
        />
      ),
      iconColor: "text-cyan-600",
      count: dash(totalSent),
      countColor: "text-cyan-600",
      title: "Notifications Sent",
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
      count: dash(totalFailed),
      countColor: "text-red-600",
      title: "Delivery Failures",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-3.5">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
