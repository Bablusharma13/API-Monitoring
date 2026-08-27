import { formatCount } from "../../../utils/helpers";
import { formatBytes } from "../utils";

export const collectionColumns = [
  {
    id: "name",
    accessor: "name",
    name: "Collection",
    Header: "COLLECTION",
    group: "Identity",
    cell: (row) => (
      <span className="font-mono text-[12.5px] text-gray-800">
        {row.name}
      </span>
    ),
  },
  {
    id: "count",
    accessor: "count",
    name: "Documents",
    Header: "DOCUMENTS",
    group: "Size",
    cell: (row) => <span>{formatCount(row.count ?? 0)}</span>,
  },
  {
    id: "storageSize",
    accessor: "storageSize",
    name: "Storage Size",
    Header: "STORAGE SIZE",
    group: "Size",
    cell: (row) => (
      <span className="font-mono text-[12px]">
        {formatBytes(row.storageSize)}
      </span>
    ),
  },
  {
    id: "avgObjSize",
    accessor: "avgObjSize",
    name: "Avg Object Size",
    Header: "AVG OBJECT SIZE",
    group: "Size",
    cell: (row) => (
      <span className="font-mono text-[12px]">
        {formatBytes(row.avgObjSize)}
      </span>
    ),
  },
  {
    id: "totalIndexSize",
    accessor: "totalIndexSize",
    name: "Index Size",
    Header: "INDEX SIZE",
    group: "Size",
    cell: (row) => (
      <span className="font-mono text-[12px]">
        {formatBytes(row.totalIndexSize)}
      </span>
    ),
  },
];
