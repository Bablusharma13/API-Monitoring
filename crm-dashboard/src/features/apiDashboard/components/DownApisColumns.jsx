import { Link } from "react-router-dom";

export const getDownApisColumns = ({ onActions } = {}) => [
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
    accessor: "lastChecked",
    header: "Last Checked",
    cell: (row) => <span className="">{row.lastChecked}</span>,
  },
  {
    accessor: "downtime",
    header: "Downtime",
    cell: (row) => <span className="] text-red-600">{row.downtime}</span>,
  },
  {
    accessor: "incidents",
    header: "Incidents",
    cell: (row) => (
      <span
        className={` ${row.incidents > 5 ? "text-red-600" : "text-amber-600"}`}
      >
        {row.incidents}
      </span>
    ),
  },
];
