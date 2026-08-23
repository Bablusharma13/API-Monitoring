// columns/logsColumns.jsx
// Column definitions for Logs & Debug table
// • No rank/# column — NewTableConfig adds its own # index automatically
// • Actions as last column so they render at the end of the table

import { MoreVertical } from "lucide-react";
import { NewBadge } from "../../../components/ui/NewBadge";

const codeClass = (code) => {
  if (code === "200" || code === "201") return "text-emerald-600";
  if (parseInt(code) >= 500) return "text-red-600";
  if (parseInt(code) >= 400) return "text-amber-600";
  return "text-[#6b7280]";
};

const durClass = (dur) => {
  if (dur === "—") return "text-[#6b7280]";
  const n = parseInt(dur);
  if (n > 1000) return "text-red-600";
  if (n > 500) return "text-amber-600";
  return "text-emerald-600";
};

const logTypeMap = {
  error: "bg-red-50 text-red-600",
  warn: "bg-amber-50 text-amber-600",
  info: "bg-emerald-50 text-emerald-600",
  security: "bg-purple-50 text-purple-600",
};

export const getLogsColumns = ({ onView }) => [
  {
    accessor: "ts",
    header: "Time",
    cell: (row) => <span>{row.ts}</span>,
  },
  {
    accessor: "type",
    header: "Type",
    cell: (row) => <NewBadge status={row.type} type={"status"} />,
  },
  {
    accessor: "api",
    header: "API Name",
    cell: (row) => <span className=" ">{row.api}</span>,
  },
  {
    accessor: "msg",
    header: "Message",
    cell: (row) => <span className=" ">{row.msg}</span>,
  },
  {
    accessor: "code",
    header: "Code",
    cell: (row) => (
      <span className={`  ${codeClass(row.code)}`}>{row.code}</span>
    ),
  },
  {
    accessor: "dur",
    header: "Duration",
    cell: (row) => <span className={`${durClass(row.dur)}`}>{row.dur}</span>,
  },
];

