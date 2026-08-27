import { StatCard } from "../../../components/ui/StatCard3";
import {
  PulseWaveIcon,
  WarningTriangleIcon,
  StatusDownIcon,
  CheckCircleIcon,
} from "../../../components/ui/AppIcons";
import { formatCount } from "../../../utils/helpers";

export function QuotaLimitsStatsCardRow({
  totalCallsThisMonth = 0,
  nearLimitCount = 0,
  overLimitCount = 0,
  withinQuotaCount = 0,
  isLoading = false,
}) {
  const dash = (n) => (isLoading ? "—" : formatCount(n));

  const cards = [
    {
      icon: <PulseWaveIcon width={20} height={20} className="text-[#2563eb]" />,
      iconColor: "text-blue-500",
      count: dash(totalCallsThisMonth),
      countColor: "text-blue-600",
      title: "Total Calls This Month",
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
      count: dash(nearLimitCount),
      countColor: "text-amber-600",
      title: "Near Limit (≥80%)",
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
      count: dash(overLimitCount),
      countColor: "text-red-600",
      title: "Over Limit (≥95%)",
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
      count: dash(withinQuotaCount),
      countColor: "text-emerald-600",
      title: "Within Quota",
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
