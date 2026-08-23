import { useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { CHECKS_GROUP, CHECKS_FILTERS } from "../constants";
import { checksColumns } from "./columns";
import { ChecksStatsCardRow } from "./ChecksStatsCardRow";
import { useGetChecksQuery } from "../hooks/query/useGetChecksQuery";
import { useGetChecksSummaryQuery } from "../hooks/query/useGetChecksSummaryQuery";
import { PulseWaveIcon } from "../../../components/ui/AppIcons";
import { exportChecksToCsv } from "../../../utils/exportCsv";

export const Checks = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("checkedAt");
  const [sortType, setSortType] = useState("desc");
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);

  const { data: summaryData, isLoading: summaryLoading } =
    useGetChecksSummaryQuery();

  const { data: checksResponse, isFetching } = useGetChecksQuery({
    page: pageIndex,
    limit: pageLimit,
    search: searchTerm,
    sortBy: sortField,
    sortOrder: sortType,
    filters: activeFilters,
  });

  const tableData = checksResponse?.data || [];

  return (
    <div className="container-page">
      <PageHeader
        icon={<PulseWaveIcon />}
        iconGradient=""
        title="Checks"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Checks" },
        ]}
      />

      <Section>
        <ChecksStatsCardRow
          isLoading={summaryLoading}
          total={summaryData?.total ?? 0}
          successful={summaryData?.successful ?? 0}
          failed={summaryData?.failed ?? 0}
          slow={summaryData?.slow ?? 0}
          timeouts={summaryData?.timeouts ?? 0}
        />
      </Section>

      <Section>
        <NewTableConfig
          module="checks"
          columns={checksColumns}
          data={tableData}
          isLoading={isFetching}
          group={CHECKS_GROUP}
          currentPage={pageIndex}
          setCurrentPage={setPageIndex}
          pageLimit={pageLimit}
          handlePageLimitChange={setPageLimit}
          totalResults={checksResponse?.pagination?.total || tableData.length}
          totalPages={checksResponse?.pagination?.totalPages || 1}
          searchQuery={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortField}
          sortOrder={sortType}
          handleServerSideSorting={({ sortBy, sortDirection }) => {
            setSortField(sortBy);
            setSortType(sortDirection);
          }}
          availableAdditionalFilters={CHECKS_FILTERS}
          onFiltersChange={(f) => {
            setActiveFilters(f);
            setPageIndex(1);
          }}
          updateSelectedRows={setSelectedRows}
          bulkActions={[
            {
              action: "export",
              onClick: () =>
                exportChecksToCsv(
                  selectedRows,
                  `checks-${new Date().toISOString().slice(0, 10)}.csv`,
                ),
            },
          ]}
          showRowNumbers={false}
        />
      </Section>
    </div>
  );
};
