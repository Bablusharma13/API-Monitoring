import { StatCard } from "../../../components/ui/StatCard3";
import { formatCount } from "../../../utils/helpers";

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const BarsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20v-6" />
  </svg>
);
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function TrafficStatsCardRow({
  reqPerMin = 0,
  peakReqPerMin = 0,
  peakTimeLabel = "—",
  totalRequests = 0,
  windowLabel = "24h",
  activeTenants = 0,
  successRatePct = 100,
}) {
  const successColor =
    successRatePct >= 99 ? "text-green-600" : successRatePct >= 95 ? "text-amber-600" : "text-red-600";

  const cards = [
    {
      icon: <ArrowIcon />,
      count: `${formatCount(Math.round(reqPerMin))}`,
      countColor: "text-green-600",
      title: "Requests / min",
      badgeText: "Live",
      badgeBg: "bg-green-50",
      badgeTextColor: "text-green-600",
    },
    {
      icon: <BarsIcon />,
      count: `${formatCount(Math.round(peakReqPerMin))}`,
      countColor: "text-blue-600",
      title: `Peak req/min (${peakTimeLabel})`,
      badgeText: windowLabel,
      badgeBg: "bg-blue-50",
      badgeTextColor: "text-blue-600",
    },
    {
      icon: <ClockIcon />,
      count: formatCount(totalRequests),
      countColor: "text-purple-600",
      title: `Total Requests (${windowLabel})`,
      badgeText: windowLabel,
      badgeBg: "bg-purple-50",
      badgeTextColor: "text-purple-600",
    },
    {
      icon: <UsersIcon />,
      count: activeTenants,
      countColor: "text-cyan-600",
      title: "Active Tenants",
      badgeText: "Now",
      badgeBg: "bg-cyan-50",
      badgeTextColor: "text-cyan-600",
    },
    {
      icon: <CheckIcon />,
      count: `${successRatePct}%`,
      countColor: successColor,
      title: "Success Rate",
      badgeText: windowLabel,
      badgeBg: "bg-green-50",
      badgeTextColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
