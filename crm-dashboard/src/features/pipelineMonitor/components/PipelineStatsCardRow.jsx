import {
  Clock,
  Activity,
  CheckCircle2,
  XCircle,
  Hourglass,
  AlertOctagon,
} from "lucide-react";
import { StatCard } from "../../../components/ui/StatCard3";
import { formatCount } from "../../../utils/helpers";

export function PipelineStatsCardRow({
  waiting = 0,
  active = 0,
  completed = 0,
  failed = 0,
  delayed = 0,
  deadLetter = 0,
}) {
  const cards = [
    {
      icon: <Clock size={20} stroke="#d97706" />,
      count: formatCount(waiting),
      countColor: "text-amber-600",
      title: "Waiting",
    },
    {
      icon: <Activity size={20} stroke="#2563eb" />,
      count: formatCount(active),
      countColor: "text-blue-600",
      title: "Active",
    },
    {
      icon: <CheckCircle2 size={20} stroke="#16a34a" />,
      count: formatCount(completed),
      countColor: "text-emerald-600",
      title: "Completed",
    },
    {
      icon: <XCircle size={20} stroke="#dc2626" />,
      count: formatCount(failed),
      countColor: "text-red-600",
      title: "Failed",
    },
    {
      icon: <Hourglass size={20} stroke="#7c3aed" />,
      count: formatCount(delayed),
      countColor: "text-purple-600",
      title: "Delayed",
    },
    {
      icon: <AlertOctagon size={20} stroke="#be123c" />,
      count: formatCount(deadLetter),
      countColor: "text-rose-700",
      title: "Dead Letter",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
