import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import SingleSelect from "../../../components/ui/SingleSelect";
import { ActionButton } from "../../../components/ui/ActionButton";
import {
  Drawer as DrawerPanel,
  DrawerSection,
  DrawerRow as DRow,
} from "../../../components/ui/Drawer";
import { CopyIcon } from "../../../components/ui/Icons";
import { formatDateTime } from "../../../utils/helpers";
import { exportLogsToCsv } from "../../../utils/exportCsv";
import { LOGS_GROUP, LOGS_FILTERS, LOG_RANGE_OPTIONS } from "../constants";
import { logColumns, LogStatusBadge, SourceBadge } from "./columns";
import { useGetLogsQuery } from "../hooks/query/useGetLogsQuery";

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
        return `<span class="${cls}">${m}</span>`;
      },
    );
}

// ── ROW DETAIL DRAWER ─────────────────────────────────────────────────────
// Fed directly from the already-fetched row (list endpoint payload) — no
// extra request is made just to populate the drawer.
function LogDrawer({ log, onClose }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleViewTrace = () => {
    navigate(
      `/log-detail-trace?source=${encodeURIComponent(log.source)}&id=${encodeURIComponent(log.id)}`,
      { state: { log } },
    );
  };

  return (
    <DrawerPanel
      isOpen={!!log}
      onClose={onClose}
      size="lg"
      direction="right"
      title={`${log.target || log.source} · ${log.id}`}
      subtitle={
        <div className="flex items-center gap-2">
          <ActionButton
            action="export"
            onClick={handleViewTrace}
            label="View Trace"
            icon={ArrowUpRight}
          />
          <ActionButton
            action="export"
            onClick={handleCopy}
            label={copied ? "Copied" : "Copy"}
            icon={CopyIcon}
          />
        </div>
      }
    >
      <DrawerSection label="Overview">
        <DRow label="Log ID" value={log.id} mono />
        <DRow label="Source" value={<SourceBadge source={log.source} />} />
        <DRow label="Timestamp" value={formatDateTime(log.timestamp)} mono />
        <DRow label="Target / Endpoint" value={log.target} mono />
        <DRow label="Method" value={log.method || "—"} />
        <DRow label="Status" value={<LogStatusBadge status={log.status} />} />
        <DRow label="Status Code" value={log.statusCode ?? "—"} mono />
        <DRow
          label="Latency"
          value={log.latencyMs != null ? `${log.latencyMs} ms` : "—"}
          mono
        />
        <DRow label="Message" value={log.message ?? "—"} noBorder />
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
export default function LogExplorer() {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageLimit, setPageLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("timestamp");
  const [sortType, setSortType] = useState("desc");
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [range, setRange] = useState("all");
  const [drawerLog, setDrawerLog] = useState(null);

  const filters = useMemo(() => {
    const f = { ...activeFilters };
    if (range !== "all") {
      f.dateFrom = new Date(Date.now() - Number(range)).toISOString();
    }
    return f;
  }, [activeFilters, range]);

  const { data: logsResponse, isFetching } = useGetLogsQuery({
    page: pageIndex,
    limit: pageLimit,
    search: searchTerm,
    sortBy: sortField,
    sortOrder: sortType,
    filters,
  });

  const tableData = logsResponse?.data || [];

  return (
    <div className="container-page">
      <PageHeader
        icon={
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563eb"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        }
        iconGradient=""
        title="Log Explorer"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Logs" },
          { label: "Log Explorer" },
        ]}
      />

      <Section>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="w-full sm:w-[220px]">
            <SingleSelect
              value={range}
              onChange={(e) => {
                setRange(e.target.value);
                setPageIndex(1);
              }}
              placeholder="Time range"
              options={LOG_RANGE_OPTIONS}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            Auto-refreshing every 15s ·{" "}
            {(logsResponse?.pagination?.total ?? 0).toLocaleString()} matching
            logs
          </div>
        </div>
      </Section>

      <Section>
        <NewTableConfig
          module="log-explorer"
          columns={logColumns}
          data={tableData}
          isLoading={isFetching}
          group={LOGS_GROUP}
          currentPage={pageIndex}
          setCurrentPage={setPageIndex}
          pageLimit={pageLimit}
          handlePageLimitChange={setPageLimit}
          totalResults={logsResponse?.pagination?.total || tableData.length}
          totalPages={logsResponse?.pagination?.totalPages || 1}
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
          availableAdditionalFilters={LOGS_FILTERS}
          onFiltersChange={(f) => {
            setActiveFilters(f);
            setPageIndex(1);
          }}
          updateSelectedRows={setSelectedRows}
          bulkActions={[
            {
              action: "export",
              onClick: () =>
                exportLogsToCsv(
                  selectedRows,
                  `logs-${new Date().toISOString().slice(0, 10)}.csv`,
                ),
            },
          ]}
          onRowClick={(row) => setDrawerLog(row)}
          showRowNumbers={false}
        />
      </Section>

      <LogDrawer log={drawerLog} onClose={() => setDrawerLog(null)} />
    </div>
  );
}
