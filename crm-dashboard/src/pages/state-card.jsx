import { Users } from "lucide-react"; // or any icon lib
import { StatCard } from "../components/ui/StatCard3";

export default function Dashboard() {
  return (
    <div style={{ display: "flex", gap: "16px" }}>
      <StatCard
        icon={<Users />}
        title="Total Clients"
        count="1,284"
        badgeText="↑ +38 this month"
        iconColor="text-blue-600"
        countColor="text-blue-600"
        badgeBg="bg-blue-100"
        badgeTextColor="text-blue-700"
      />

      <StatCard
        icon={<Users />}
        title="Trial Users"
        count="213"
        badgeText="↓ -3 from last month"
        iconColor="text-amber-500"
        countColor="text-amber-500"
        badgeBg="bg-amber-100"
        badgeTextColor="text-amber-700"
      />

      <StatCard
        icon={<Users />}
        title="Partners"
        count="94"
        iconColor="text-indigo-600"
        countColor="text-indigo-600"
      />
      
      <StatCard
        icon={<Users />}
        title="Trial Users"
        count="213"
        badgeText="↓ -3 from last month"
        iconColor="text-amber-500"
        countColor="text-amber-500"
        badgeBg="bg-amber-100"
        badgeTextColor="text-amber-700"
      />

<StatCard
        icon={<Users />}
        title="Trial Users"
        count="213"
        badgeText="↓ -3 from last month"
        iconColor="text-amber-500"
        countColor="text-amber-500"
        badgeBg="bg-amber-100"
        badgeTextColor="text-amber-700"
      />
      
    </div>
  );
}