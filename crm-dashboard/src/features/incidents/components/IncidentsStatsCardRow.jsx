import { StatCard } from "../../../components/ui/StatCard3.jsx";
import {
  CheckCircleIcon,
  ClockIcon,
  StatusDownIcon,
  WarningTriangleIcon,
} from "../../../components/ui/AppIcons";

export function IncidentsStatsCardRow({
  total = 0,
  active = 0,
  critical = 0,
  resolvedToday = 0,
  avgResolution = "—",
  slaBreaches = 0,
  isLoading = false,
}) {
  const cards = [
    {
      icon: (
        <ClockIcon
          width={20}
          height={20}
          stroke="#2563eb"
          strokeWidth={1.5}
          className="text-[#2563eb]"
        />
      ),
      iconColor: "text-blue-500",
      count: isLoading ? "—" : total,
      countColor: "text-blue-600",
      title: "Total Incidents",
    },
    {
      icon: (
        <WarningTriangleIcon
          width={20}
          height={20}
          stroke="#dc2626"
          strokeWidth={2}
          className="text-[#dc2626]"
        />
      ),
      iconColor: "text-red-500",
      count: isLoading ? "—" : active,
      countColor: "text-red-600",
      title: "Active",
    },
    {
      icon: (
        <StatusDownIcon
          width={20}
          height={20}
          stroke="#dc2626"
          strokeWidth={2.5}
          className="text-[#dc2626]"
        />
      ),
      iconColor: "text-red-500",
      count: isLoading ? "—" : critical,
      countColor: "text-red-600",
      title: "Critical",
    },
    {
      icon: (
        <CheckCircleIcon
          width={20}
          height={20}
          stroke="#16a34a"
          strokeWidth={2}
          className="text-[#16a34a]"
        />
      ),
      iconColor: "text-emerald-500",
      count: isLoading ? "—" : resolvedToday,
      countColor: "text-emerald-600",
      title: "Resolved Today",
    },
    {
      icon: (
        <ClockIcon
          width={20}
          height={20}
          stroke="#7c3aed"
          strokeWidth={2}
          className="text-[#7c3aed]"
        />
      ),
      iconColor: "text-purple-500",
      count: isLoading
        ? "—"
        : avgResolution === "—"
          ? "—"
          : `${avgResolution}m`,
      countColor: "text-purple-600",
      title: "Avg Resolution",
    },
    {
      icon: (
        <WarningTriangleIcon
          width={20}
          height={20}
          stroke="#d97706"
          strokeWidth={2}
          className="text-[#d97706]"
        />
      ),
      iconColor: "text-amber-500",
      count: isLoading ? "—" : slaBreaches,
      countColor: "text-amber-600",
      title: "SLA Breaches",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}

