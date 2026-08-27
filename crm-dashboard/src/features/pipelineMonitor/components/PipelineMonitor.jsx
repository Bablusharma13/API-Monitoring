import { useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { PulseWaveIcon } from "../../../components/ui/AppIcons";
import { formatDateTime } from "../../../utils/helpers";
import { usePipelineStatsQuery } from "../hooks/query/usePipelineStatsQuery";
import { PipelineStatsCardRow } from "./PipelineStatsCardRow";
import { QueueCard } from "./QueueCard";
import { deadLetterColumns } from "./columns";
import { PIPELINE_GROUP } from "../constants";

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 mb-3">
      {children}
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

export const PipelineMonitor = () => {
  const [dlPage, setDlPage] = useState(1);
  const [dlLimit, setDlLimit] = useState(10);

  const { data, isLoading } = usePipelineStatsQuery();

  const queues = data?.queues || [];
  const deadLetter = data?.deadLetter || [];

  const totals = queues.reduce(
    (acc, q) => ({
      waiting: acc.waiting + (q.waiting || 0),
      active: acc.active + (q.active || 0),
      completed: acc.completed + (q.completed || 0),
      failed: acc.failed + (q.failed || 0),
      delayed: acc.delayed + (q.delayed || 0),
    }),
    { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
  );

  const dlTotal = deadLetter.length;
  const dlTotalPages = Math.max(1, Math.ceil(dlTotal / dlLimit));
  const dlPageData = deadLetter.slice(
    (dlPage - 1) * dlLimit,
    dlPage * dlLimit,
  );

  return (
    <div className="container-page">
      <PageHeader
        icon={<PulseWaveIcon />}
        title="Pipeline Monitor"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Pipeline Monitor" },
        ]}
        actions={
          data?.fetchedAt ? (
            <span className="flex items-center gap-1.5 text-[11.5px] text-gray-500 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse inline-block" />
              Updated {formatDateTime(data.fetchedAt)}
            </span>
          ) : null
        }
      />

      <Section>
        <PipelineStatsCardRow
          waiting={totals.waiting}
          active={totals.active}
          completed={totals.completed}
          failed={totals.failed}
          delayed={totals.delayed}
          deadLetter={dlTotal}
        />
      </Section>

      <Section>
        <SectionLabel>Queues</SectionLabel>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {queues.map((q) => (
            <QueueCard key={q.name} queue={q} />
          ))}
          {!isLoading && queues.length === 0 && (
            <div className="col-span-full text-center text-[13px] text-gray-400 py-8 bg-white border border-gray-200 rounded-xl">
              No queues reported.
            </div>
          )}
        </div>
      </Section>

      <Section>
        <SectionLabel>Dead Letter Queue — Failed Jobs</SectionLabel>
        <NewTableConfig
          module="pipeline-dead-letter"
          columns={deadLetterColumns}
          data={dlPageData}
          isLoading={isLoading}
          group={PIPELINE_GROUP}
          currentPage={dlPage}
          setCurrentPage={setDlPage}
          pageLimit={dlLimit}
          handlePageLimitChange={(limit) => {
            setDlLimit(limit);
            setDlPage(1);
          }}
          totalResults={dlTotal}
          totalPages={dlTotalPages}
          showRowNumbers={false}
        />
      </Section>
    </div>
  );
};
