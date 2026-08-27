import { StatCard } from "../../../components/ui/StatCard3";
import {
  BarsIcon,
  WarningTriangleIcon,
  StatusDownIcon,
  CheckCircleIcon,
} from "../../../components/ui/AppIcons";
import { formatCount } from "../../../utils/helpers";

export function SaturationStatsCardRow({
  totalTenants = 0,
  avgUsedPct = null,
  nearCap = 0,
  overCap = 0,
  totalRequestsThisMonth = 0,
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
      count: isLoading ? "—" : formatCount(totalTenants),
      countColor: "text-blue-600",
      title: "Tenants",
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
      count: isLoading || avgUsedPct == null ? "—" : `${avgUsedPct}%`,
      countColor: "text-emerald-600",
      title: "Avg Capacity Used",
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
      count: isLoading ? "—" : formatCount(nearCap),
      countColor: "text-amber-600",
      title: "Near Cap (≥80%)",
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
      count: isLoading ? "—" : formatCount(overCap),
      countColor: "text-red-600",
      title: "Over Cap",
    },
    {
      icon: (
        <BarsIcon
          width={20}
          height={20}
          stroke="#0891b2"
          strokeWidth={1.8}
          className="text-[#0891b2]"
        />
      ),
      iconColor: "text-cyan-500",
      count: isLoading ? "—" : formatCount(totalRequestsThisMonth),
      countColor: "text-cyan-600",
      title: "Requests This Month",
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
