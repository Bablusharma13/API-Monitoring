import { StatCard } from "../../../components/ui/StatCard3.jsx";
import {
  CheckCircleIcon,
  ClockIcon,
  PulseWaveIcon,
  ShieldIcon,
  StatusDownIcon,
  WarningTriangleIcon,
} from "../../../components/ui/AppIcons";

export function StatCardRow({
  total = 0,
  active = 0,
  down = 0,
  warning = 0,
  avgResponse = "—",
  avgUptime = "—",
}) {
  const cards = [
    {
      icon: <PulseWaveIcon width={20} height={20} className="text-[#2563eb]" />,
      iconColor: "text-blue-500",
      count: total,
      countColor: "text-blue-600",
      title: "Total APIs",
      // badgeText: "All",
      // badgeBg: "bg-blue-50",
      // badgeTextColor: "text-blue-500",
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
      count: active,
      countColor: "text-emerald-600",
      title: "Active APIs",
      // badgeText: "OK",
      // badgeBg: "bg-emerald-50",
      // badgeTextColor: "text-emerald-500",
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
      count: down,
      countColor: "text-red-600",
      title: "Down Now",
      // badgeText: "Live",
      // badgeBg: "bg-red-50",
      // badgeTextColor: "text-red-500",
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
      count: warning,
      countColor: "text-amber-600",
      title: "Warning",
      // badgeText: "Alert",
      // badgeBg: "bg-amber-50",
      // badgeTextColor: "text-amber-500",
    },
    {
      icon: (
        <ClockIcon
          width={20}
          height={20}
          stroke="#7c3aed"
          strokeWidth={1.8}
          className="text-[#7c3aed]"
        />
      ),
      iconColor: "text-purple-500",
      count: avgResponse,
      countColor: "text-purple-600",
      title: "Avg Response",
      // badgeText: "Avg",
      // badgeBg: "bg-purple-50",
      // badgeTextColor: "text-purple-500",
    },
    {
      icon: (
        <ShieldIcon
          width={20}
          height={20}
          stroke="#0891b2"
          strokeWidth={1.8}
          className="text-[#0891b2]"
        />
      ),
      iconColor: "text-cyan-500",
      count: avgUptime,
      countColor: "text-cyan-600",
      title: "Avg Uptime",
      // badgeText: "SLA",
      // badgeBg: "bg-cyan-50",
      // badgeTextColor: "text-cyan-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}

