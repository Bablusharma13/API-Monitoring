import { StatCard } from "../../../components/ui/StatCard3";
import {
  CheckCircleIcon,
  ClockIcon,
  PulseWaveIcon,
  StatusDownIcon,
  WarningTriangleIcon,
} from "../../../components/ui/AppIcons";
import { formatCount } from "../../../utils/helpers";

export function ChecksStatsCardRow({
  total = 0,
  successful = 0,
  failed = 0,
  slow = 0,
  timeouts = 0,
}) {
  const cards = [
    {
      icon: <PulseWaveIcon width={20} height={20} className="text-[#2563eb]" />,
      iconColor: "text-blue-500",
      count: formatCount(total),
      countColor: "text-blue-600",
      title: "Total Checks",
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
      count: formatCount(successful),
      countColor: "text-emerald-600",
      title: "Successful",
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
      count: formatCount(failed),
      countColor: "text-red-600",
      title: "Failed",
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
      count: formatCount(slow),
      countColor: "text-amber-600",
      title: "Slow",
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
      count: formatCount(timeouts),
      countColor: "text-purple-600",
      title: "Timeouts",
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
