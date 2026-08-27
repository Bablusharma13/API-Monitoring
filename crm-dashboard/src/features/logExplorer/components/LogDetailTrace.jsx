import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { Badge } from "../../../components/ui/Badge";
import { ActionButton } from "../../../components/ui/ActionButton";
import { BackIcon, CopyIcon } from "../../../components/ui/Icons";
import { formatDateTime } from "../../../utils/helpers";
import { LOGS_GROUP } from "../constants";
import {
  logColumns,
  LogStatusBadge,
  SourceBadge,
  StatusCodeText,
  LatencyText,
} from "./columns";
import { useGetLogByIdQuery } from "../hooks/query/useGetLogByIdQuery";
import { useGetLogsQuery } from "../hooks/query/useGetLogsQuery";

// ── RAW JSON SYNTAX HIGHLIGHT ────────────────────────────────────────────────
function syntaxHL(obj) {
  return JSON.stringify(obj, null, 2)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (m) => {
        if (/^"/.test(m))
          return `<span class="${/:$/.test(m) ? "text-blue-300" : "text-green-300"}">${m}</span>`;
        if (/true|false/.test(m))
          return `<span class="text-pink-300">${m}</span>`;
        if (/null/.test(m)) return `<span class="text-slate-400">${m}</span>`;
        return `<span class="text-yellow-300">${m}</span>`;
      },
    );
}

// ── CARD PRIMITIVES ──────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl overflow-hidden mb-4 ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({ children, className = "" }) => (
  <div
    className={`flex items-center justify-between px-[18px] py-3 border-b border-gray-100 bg-[#fafbfc] ${className}`}
  >
    {children}
  </div>
);
const CardTitle = ({ children }) => (
  <div className="flex items-center gap-2 text-[13px] font-medium text-gray-800">
    {children}
  </div>
);
const CardBody = ({ children, className = "" }) => (
  <div className={`p-[18px] ${className}`}>{children}</div>
);

const FieldRow = ({ label, value }) => (
  <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0 gap-3 text-[12.5px]">
    <span className="text-gray-400 shrink-0 w-[150px]">{label}</span>
    <span className="text-gray-800 font-mono text-[12px] text-right break-all">
      {value ?? "—"}
    </span>
  </div>
);

const BREADCRUMBS_BASE = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Logs" },
  { label: "Log Explorer", href: "/log-explorer" },
];

const TraceIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2563eb"
    strokeWidth="2"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    <circle cx="5" cy="12" r="2" />
  </svg>
);

// ── EMPTY / LOADING STATES ────────────────────────────────────────────────
function StatusScreen({ navigate, title, body }) {
  return (
    <div className="container-page">
      <PageHeader
        icon={<TraceIcon />}
        iconGradient=""
        title="Log Detail / Trace"
        breadcrumbs={[...BREADCRUMBS_BASE, { label: "Detail" }]}
      />
      <Section>
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <div className="text-[15px] text-gray-700 mb-1.5">{title}</div>
          <div className="text-[12.5px] text-gray-400 mb-4">{body}</div>
          <button
            onClick={() => navigate("/log-explorer")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Back to Log Explorer
          </button>
        </div>
      </Section>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function LogDetailTrace() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [copied, setCopied] = useState(false);

  const stateLog = location.state?.log ?? null;
  const paramSource = searchParams.get("source");
  const paramId = searchParams.get("id");

  // Only fall back to the network when the row wasn't handed over via
  // router state (e.g. hard refresh / direct link with ?source=&id=).
  const canFetch = !stateLog && Boolean(paramSource && paramId);
  const {
    data: fetchedLog,
    isLoading,
    isError,
  } = useGetLogByIdQuery(canFetch ? paramSource : undefined, canFetch ? paramId : undefined);

  const log = stateLog ?? fetchedLog ?? null;

  // Related logs — a real query against the same target/endpoint.
  const { data: relatedResponse, isFetching: relatedFetching } =
    useGetLogsQuery(
      log
        ? {
            search: log.target,
            limit: 10,
            sortBy: "timestamp",
            sortOrder: "desc",
          }
        : { limit: 0 },
      { enabled: !!log },
    );

  const relatedRows = useMemo(() => {
    const rows = relatedResponse?.data || [];
    if (!log) return rows;
    return rows.filter((r) => !(r.id === log.id && r.source === log.source));
  }, [relatedResponse, log]);

  // No live sorting/pagination against this fixed slice — the related
  // table just mirrors the last 10 matches, so column-header sorting is
  // disabled rather than pretending to reorder a static list.
  const relatedColumns = useMemo(
    () => logColumns.map((c) => ({ ...c, disableSortBy: true })),
    [],
  );

  const handleCopyRaw = () => {
    navigator.clipboard?.writeText(JSON.stringify(log?.raw ?? log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // No way to identify a log at all.
  if (!stateLog && !paramSource && !paramId) {
    return (
      <StatusScreen
        navigate={navigate}
        title="No log selected"
        body="Open a log from Log Explorer to view its trace."
      />
    );
  }

  // Fetching the fallback lookup.
  if (!log && canFetch && isLoading) {
    return (
      <div className="container-page">
        <PageHeader
          icon={<TraceIcon />}
          iconGradient=""
          title="Log Detail / Trace"
          breadcrumbs={[...BREADCRUMBS_BASE, { label: "Detail" }]}
        />
        <Section>
          <div className="text-[13px] text-gray-400 py-14 text-center">
            Loading log…
          </div>
        </Section>
      </div>
    );
  }

  // Fallback lookup failed, or came back empty.
  if (!log) {
    return (
      <StatusScreen
        navigate={navigate}
        title="Log not found"
        body={
          isError
            ? "This log could not be loaded. It may have expired or been removed."
            : "No log selected. Go back to Log Explorer and open one from the list."
        }
      />
    );
  }

  return (
    <div className="container-page">
      <PageHeader
        icon={<TraceIcon />}
        iconGradient=""
        title="Log Detail / Trace"
        breadcrumbs={[...BREADCRUMBS_BASE, { label: log.id }]}
        actions={
          <div className="flex items-center gap-2">
            <ActionButton
              action="save"
              onClick={() => navigate("/log-explorer")}
              label="Back to Explorer"
              icon={BackIcon}
            />
            <ActionButton
              action="save"
              onClick={handleCopyRaw}
              label={copied ? "Copied" : "Copy"}
              icon={CopyIcon}
            />
          </div>
        }
      />

      <Section>
        {/* HERO */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 font-mono text-[12px] text-gray-400 mb-2 flex-wrap">
            <LogStatusBadge status={log.status} />
            <SourceBadge source={log.source} />
            <span>{log.id}</span>
            <span className="text-gray-300">·</span>
            <span>{formatDateTime(log.timestamp)}</span>
          </div>

          <div className="text-[19px] font-light text-gray-800 mb-3.5 leading-snug tracking-tight break-all">
            {log.target || "—"}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <StatusCodeText code={log.statusCode} />
            {log.method && <Badge value={log.method} />}
            <span className="text-gray-300 text-[12px]">·</span>
            <span className="text-[12.5px] text-gray-400">Latency:</span>
            <LatencyText ms={log.latencyMs} />
          </div>

          {log.message && (
            <div className="mt-3.5 pt-3.5 border-t border-gray-100 text-[13px] text-gray-600 break-words">
              {log.message}
            </div>
          )}
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* FIELD LIST */}
          <Card className="mb-0">
            <CardHeader>
              <CardTitle>Log Fields</CardTitle>
            </CardHeader>
            <CardBody className="p-0 px-[18px]">
              <FieldRow label="Log ID" value={log.id} />
              <FieldRow label="Source" value={log.source} />
              <FieldRow label="Target / Endpoint" value={log.target} />
              <FieldRow label="Method" value={log.method} />
              <FieldRow label="Status" value={log.status} />
              <FieldRow label="Status Code" value={log.statusCode} />
              <FieldRow
                label="Latency"
                value={log.latencyMs != null ? `${log.latencyMs} ms` : null}
              />
              <FieldRow label="Timestamp" value={formatDateTime(log.timestamp)} />
              <FieldRow label="Message / Error" value={log.message} />
            </CardBody>
          </Card>

          {/* HEADERS — only rendered when the underlying document actually
              carries them; neither the Check nor RequestLog schema does
              today, so this stays hidden rather than showing fake data. */}
          {log.raw?.headers && typeof log.raw.headers === "object" && (
            <Card className="mb-0">
              <CardHeader>
                <CardTitle>Headers</CardTitle>
              </CardHeader>
              <CardBody className="p-0">
                <table className="w-full border-collapse">
                  <tbody>
                    {Object.entries(log.raw.headers).map(([k, v]) => (
                      <tr key={k} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-2 w-[180px] font-mono text-[11.5px] text-blue-600 font-medium whitespace-nowrap">
                          {k}
                        </td>
                        <td className="px-4 py-2 font-mono text-[11.5px] text-gray-500 break-all">
                          {String(v)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          )}

          {/* RAW RECORD */}
          <Card className={log.raw?.headers ? "lg:col-span-2 mb-0" : "mb-0"}>
            <CardHeader>
              <CardTitle>Raw Record</CardTitle>
              <ActionButton
                action="export"
                onClick={handleCopyRaw}
                label={copied ? "Copied" : "Copy"}
                icon={CopyIcon}
              />
            </CardHeader>
            <CardBody className="p-3">
              <div
                className="bg-slate-800 rounded-lg p-3.5 font-mono text-[12px] leading-[1.85] max-h-[360px] overflow-auto"
                dangerouslySetInnerHTML={{ __html: syntaxHL(log.raw ?? log) }}
              />
            </CardBody>
          </Card>
        </div>
      </Section>

      <Section>
        {/* RELATED LOGS */}
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-400 mb-2.5">
          Related Logs — same target
          <span className="flex-1 h-px bg-gray-200" />
        </div>
        <NewTableConfig
          module="log-detail-related"
          columns={relatedColumns}
          data={relatedRows}
          isLoading={relatedFetching}
          group={LOGS_GROUP}
          currentPage={1}
          setCurrentPage={() => {}}
          pageLimit={relatedRows.length || 10}
          handlePageLimitChange={() => {}}
          totalResults={relatedRows.length}
          totalPages={1}
          onRowClick={(row) =>
            navigate(
              `/log-detail-trace?source=${encodeURIComponent(row.source)}&id=${encodeURIComponent(row.id)}`,
              { state: { log: row } },
            )
          }
          showRowNumbers={false}
          showPagination={false}
          showSelectColumn={false}
          showPaginationSelect={false}
        />
      </Section>
    </div>
  );
}
