import { useMemo, useState } from "react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import DateRange from "../../../components/ui/DateRange";
import { Badge } from "../../../components/ui/Badge";
import {
  Drawer as DrawerPanel,
  DrawerSection,
  DrawerRow as DRow,
} from "../../../components/ui/Drawer";
import { formatDateTime } from "../../../utils/helpers";
import { AUDIT_LOG_GROUP, AUDIT_LOG_FILTERS } from "../constants";
import { auditLogColumns, ActionBadge, EntityTypeBadge } from "./columns";
import { useGetAuditLogQuery } from "../hooks/query/useGetAuditLogQuery";

// ── RAW JSON SYNTAX HIGHLIGHT ────────────────────────────────────────────────
function syntaxHighlight(json) {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (m) => {
        let cls = "text-yellow-300";
        if (/^"/.test(m))
          cls = /:$/.test(m) ? "text-blue-300" : "text-green-300";
        else if (/true|false/.test(m)) cls = "text-pink-300";
        else if (/null/.test(m)) cls = "text-slate-400";
        return `<span class="${cls}">${m}</span>`;
      },
    );
}

const toStartOfDayIso = (d) => {
  if (!d) return undefined;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.toISOString();
};

const toEndOfDayIso = (d) => {
  if (!d) return undefined;
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.toISOString();
};

const AuditLogIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="13" y2="17" />
  </svg>
);

// ── ROW DETAIL DRAWER ─────────────────────────────────────────────────────
// Fed directly from the already-fetched row (list endpoint payload) — no
// extra request is made just to populate the drawer.
function AuditLogDrawer({ log, onClose }) {
  if (!log) return null;

  return (
    <DrawerPanel
      isOpen={!!log}
      onClose={onClose}
      size="md"
      direction="right"
      title="Audit Log Entry"
      subtitle={
        <div className="flex items-center gap-2 flex-wrap">
          <ActionBadge action={log.action} />
          <EntityTypeBadge entityType={log.entityType} />
        </div>
      }
    >
      <DrawerSection label="Actor">
        <DRow label="Actor Email" value={log.actorEmail || "System"} />
        <DRow label="Actor ID" value={log.actorId} mono noBorder />
      </DrawerSection>

      <DrawerSection label="Action">
        <DRow label="Action" value={<ActionBadge action={log.action} />} />
        <DRow
          label="Entity Type"
          value={<EntityTypeBadge entityType={log.entityType} />}
        />
        <DRow label="Entity ID" value={log.entityId} mono />
        <DRow
          label="HTTP Method"
          value={log.method ? <Badge value={log.method} /> : "—"}
          noBorder
        />
      </DrawerSection>

      <DrawerSection label="Summary">
        <p className="text-[12.5px] text-gray-600 leading-relaxed py-2">
          {log.summary || "—"}
        </p>
      </DrawerSection>

      <DrawerSection label="Timeline">
        <DRow
          label="Created At"
          value={formatDateTime(log.createdAt)}
          mono
          noBorder
        />
      </DrawerSection>

      <DrawerSection label="Raw Record">
        <div
          className="bg-slate-800 rounded-lg p-3.5 font-mono text-[11.5px] leading-relaxed overflow-x-auto max-h-64 overflow-y-auto"
          dangerouslySetInnerHTML={{
            __html: syntaxHighlight(JSON.stringify(log, null, 2)),
          }}
        />
      </DrawerSection>
    </DrawerPanel>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────
export default function AuditLog() {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortType, setSortType] = useState("desc");
  const [activeFilters, setActiveFilters] = useState({});
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [drawerLog, setDrawerLog] = useState(null);

  const filters = useMemo(() => {
    const f = { ...activeFilters };
    const dateFrom = toStartOfDayIso(dateRange.startDate);
    const dateTo = toEndOfDayIso(dateRange.endDate);
    if (dateFrom) f.dateFrom = dateFrom;
    if (dateTo) f.dateTo = dateTo;
    return f;
  }, [activeFilters, dateRange]);

  const { data: auditResponse, isFetching } = useGetAuditLogQuery({
    page: pageIndex,
    limit: pageLimit,
    search: searchTerm,
    sortBy: sortField,
    sortOrder: sortType,
    filters,
  });

  const tableData = auditResponse?.data || [];

  return (
    <div className="container-page">
      <PageHeader
        icon={<AuditLogIcon />}
        iconGradient=""
        title="Audit Log"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Audit Log" },
        ]}
      />

      <Section>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <DateRange
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            placeholder="Filter by date range"
            onChange={({ startDate, endDate }) => {
              setDateRange({ startDate, endDate });
              setPageIndex(1);
            }}
          />
          <div className="text-[11.5px] text-gray-500">
            {(auditResponse?.pagination?.total ?? 0).toLocaleString()}{" "}
            matching entries
          </div>
        </div>
      </Section>

      <Section>
        <NewTableConfig
          module="audit-log"
          columns={auditLogColumns}
          data={tableData}
          isLoading={isFetching}
          group={AUDIT_LOG_GROUP}
          currentPage={pageIndex}
          setCurrentPage={setPageIndex}
          pageLimit={pageLimit}
          handlePageLimitChange={setPageLimit}
          totalResults={auditResponse?.pagination?.total || tableData.length}
          totalPages={auditResponse?.pagination?.totalPages || 1}
          searchQuery={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setPageIndex(1);
          }}
          sortBy={sortField}
          sortOrder={sortType}
          handleServerSideSorting={({ sortBy, sortDirection }) => {
            setSortField(sortBy);
            setSortType(sortDirection);
          }}
          availableAdditionalFilters={AUDIT_LOG_FILTERS}
          onFiltersChange={(f) => {
            setActiveFilters(f);
            setPageIndex(1);
          }}
          onRowClick={(row) => setDrawerLog(row)}
          showRowNumbers={false}
        />
      </Section>

      <AuditLogDrawer log={drawerLog} onClose={() => setDrawerLog(null)} />
    </div>
  );
}
