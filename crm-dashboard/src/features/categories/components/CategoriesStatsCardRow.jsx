import { StatCard } from "../../../components/ui/StatCard3.jsx";
import {
  BarsIcon,
  MenuLinesIcon,
  PulseWaveIcon,
  StatusDownIcon,
  SuccessCheckIcon,
  WarningTriangleIcon,
} from "../../../components/ui/AppIcons";

export function CategoriesStatsCardRow({
  totalCategories = 8,
  totalApis = 42,
  activeApis = 34,
  downApis = 3,
  critical = 2,
  avgApisPerCategory = "5.3",
  isLoading = false,
}) {
  const cards = [
    {
      icon: <MenuLinesIcon width={20} height={20} stroke="#2563eb" />,
      iconColor: "text-blue-500",
      count: isLoading ? "—" : totalCategories,
      countColor: "text-blue-600",
      title: "Categories",
      titleColor: "text-gray-600",
    },
    {
      icon: <PulseWaveIcon width={20} height={20} stroke="#2563eb" />,
      iconColor: "text-blue-500",
      count: isLoading ? "—" : totalApis,
      countColor: "text-blue-600",
      title: "Total APIs",
      titleColor: "text-gray-600",
    },
    {
      icon: <SuccessCheckIcon width={20} height={20} stroke="#22c55e" />,
      iconColor: "text-emerald-500",
      count: isLoading ? "—" : activeApis,
      countColor: "text-emerald-600",
      title: "Active APIs",
      titleColor: "text-gray-600",
    },
    {
      icon: <StatusDownIcon width={20} height={20} stroke="#ef4444" />,
      iconColor: "text-red-500",
      count: isLoading ? "—" : downApis,
      countColor: "text-red-600",
      title: "Down APIs",
      titleColor: "text-gray-600",
    },
    {
      icon: <WarningTriangleIcon width={20} height={20} stroke="#f59e0b" />,
      iconColor: "text-amber-500",
      count: isLoading ? "—" : critical,
      countColor: "text-amber-600",
      title: "Critical",
      titleColor: "text-gray-600",
    },
    {
      icon: <BarsIcon width={20} height={20} stroke="#06b6d4" />,
      iconColor: "text-cyan-500",
      count: isLoading ? "—" : avgApisPerCategory,
      countColor: "text-cyan-600",
      title: "APIs / Category",
      titleColor: "text-gray-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}

