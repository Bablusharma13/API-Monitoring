// columns/slowApisColumns.jsx
// Column definitions for Top 10 Slow APIs table
// • No "rank" column — NewTableConfig adds its own # index automatically
// • Actions as last column so they render at the end of the table

import { Link } from "react-router-dom";

export const getSlowApisColumns = ({ onActions } = {}) => [
  {
    accessor: "name",
    header: "API Name",
    cell: (row) => (
      <Link className="text-blue-500" to={`/dashboard/apis/${row.id}`}>
        {row.name}
      </Link>
    ),
  },
  {
    accessor: "avgResp",
    header: "Avg Resp",
    cell: (row) => (
      <span
        className={`font-mono text-[12px] ${
          parseInt(row.avgResp) > 1000
            ? "text-red-600"
            : parseInt(row.avgResp) > 500
              ? "text-amber-600"
              : "text-[#1c1f2e]"
        }`}
      >
        {row.avgResp}
      </span>
    ),
  },
  {
    accessor: "peakResp",
    header: "Peak Resp",
    cell: (row) => (
      <span
        className={`font-mono text-[12px] ${parseInt(row.peakResp) > 2000 ? "text-red-600" : "text-amber-600"}`}
      >
        {row.peakResp}
      </span>
    ),
  },
  {
    accessor: "lastChecked",
    header: "Last Checked",
    cell: (row) => (
      <span className="text-[12px] text-[#6b7280]">{row.lastChecked}</span>
    ),
  },
];
