import { Database, HardDrive, Layers, Boxes } from "lucide-react";
import { StatCard } from "../../../components/ui/StatCard3";
import { formatBytes } from "../utils";

export function StorageStatsCardRow({
  dataSize = 0,
  storageSize = 0,
  indexSize = 0,
  collectionsCount = 0,
}) {
  const cards = [
    {
      icon: <Database size={20} stroke="#2563eb" />,
      count: formatBytes(dataSize),
      countColor: "text-blue-600",
      title: "Data Size",
    },
    {
      icon: <HardDrive size={20} stroke="#0891b2" />,
      count: formatBytes(storageSize),
      countColor: "text-cyan-600",
      title: "Storage Size",
    },
    {
      icon: <Layers size={20} stroke="#7c3aed" />,
      count: formatBytes(indexSize),
      countColor: "text-purple-600",
      title: "Index Size",
    },
    {
      icon: <Boxes size={20} stroke="#16a34a" />,
      count: collectionsCount,
      countColor: "text-emerald-600",
      title: "Collections",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
