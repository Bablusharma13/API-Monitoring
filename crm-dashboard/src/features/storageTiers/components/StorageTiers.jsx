import { useState } from "react";
import { Database } from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { formatDateTime } from "../../../utils/helpers";
import { useStorageStatsQuery } from "../hooks/query/useStorageStatsQuery";
import { StorageStatsCardRow } from "./StorageStatsCardRow";
import { collectionColumns } from "./columns";
import { STORAGE_GROUP } from "../constants";

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 mb-3">
      {children}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

export const StorageTiers = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);

  const { data, isLoading, dataUpdatedAt } = useStorageStatsQuery();

  const db = data?.db || {};
  const collections = data?.collections || [];

  const totalResults = collections.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageLimit));
  const pageData = collections.slice(
    (pageIndex - 1) * pageLimit,
    pageIndex * pageLimit,
  );

  return (
    <div className="container-page">
      <PageHeader
        icon={<Database size={20} stroke="#2563eb" strokeWidth={1.8} />}
        title="Database Storage"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Storage Tiers" },
        ]}
        actions={
          dataUpdatedAt ? (
            <span className="flex items-center gap-1.5 text-[11.5px] text-gray-500 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse inline-block" />
              Updated {formatDateTime(dataUpdatedAt)}
            </span>
          ) : null
        }
      />

      <Section>
        <StorageStatsCardRow
          dataSize={db.dataSize}
          storageSize={db.storageSize}
          indexSize={db.indexSize}
          collectionsCount={db.collectionsCount}
        />
      </Section>

      <Section>
        <SectionLabel>Collections</SectionLabel>
        <NewTableConfig
          module="storage-collections"
          columns={collectionColumns}
          data={pageData}
          isLoading={isLoading}
          group={STORAGE_GROUP}
          currentPage={pageIndex}
          setCurrentPage={setPageIndex}
          pageLimit={pageLimit}
          handlePageLimitChange={(limit) => {
            setPageLimit(limit);
            setPageIndex(1);
          }}
          totalResults={totalResults}
          totalPages={totalPages}
          showRowNumbers={false}
        />
      </Section>
    </div>
  );
};
