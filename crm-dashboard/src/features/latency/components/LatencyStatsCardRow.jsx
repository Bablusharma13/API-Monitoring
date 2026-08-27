import { StatCard } from "../../../components/ui/StatCard3";

const ZapIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const CheckIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export function LatencyStatsCardRow({
  avgP50 = 0,
  avgP95 = 0,
  avgP99 = 0,
  sloMet = 0,
  sloBreached = 0,
}) {
  const cards = [
    {
      icon: <ZapIcon />,
      iconColor: "text-blue-600",
      count: `${avgP50}ms`,
      countColor: "text-blue-600",
      title: "Avg Latency (p50)",
      badgeText: "p50",
      badgeBg: "bg-blue-50",
      badgeTextColor: "text-blue-600",
    },
    {
      icon: <ZapIcon />,
      iconColor: "text-amber-500",
      count: `${avgP95}ms`,
      countColor: "text-amber-600",
      title: "p95 Latency",
      badgeText: "p95",
      badgeBg: "bg-amber-50",
      badgeTextColor: "text-amber-600",
    },
    {
      icon: <ZapIcon />,
      iconColor: "text-red-500",
      count: `${avgP99}ms`,
      countColor: "text-red-600",
      title: "p99 Latency",
      badgeText: "p99",
      badgeBg: "bg-red-50",
      badgeTextColor: "text-red-600",
    },
    {
      icon: <CheckIcon />,
      iconColor: "text-green-600",
      count: sloMet,
      countColor: "text-green-600",
      title: "SLO Met Tenants",
      badgeText: "Met",
      badgeBg: "bg-green-50",
      badgeTextColor: "text-green-600",
    },
    {
      icon: <AlertIcon />,
      iconColor: "text-red-500",
      count: sloBreached,
      countColor: "text-red-600",
      title: "SLO Breached",
      badgeText: "Breached",
      badgeBg: "bg-red-50",
      badgeTextColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => (
        <StatCard key={i} {...c} />
      ))}
    </div>
  );
}
