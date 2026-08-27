// runHistoryColumns.jsx
// Column definitions for one transaction's "Individual Runs" table — fed real
// TransactionRun records (see toRunRow in TransactionRunHistory.jsx). Mirrors
// the sibling cronJobHistory/jobHistoryColumns.jsx pattern exactly:
//   export function getRunHistoryColumns({ onView })
//
// TransactionRun.status is a real two-value enum ("success" | "failed") — no
// "late"/"timeout"/"running" states exist on this model, unlike Ping.

import { formatDateTime } from "../../../utils/helpers.js";

export function RunOutcomeBadge({ status }) {
  const map = {
    success: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "#16a34a",
      label: "Success",
    },
    failed: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "#dc2626",
      label: "Failed",
    },
  };
  const s = map[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
    dot: "#6b7280",
    label: status || "Unknown",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${s.bg} ${s.text} ${s.border}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: s.dot }}
      />
      {s.label}
    </span>
  );
}

function StepsSummary({ steps }) {
  const list = steps || [];
  const total = list.length;
  const passed = list.filter((s) => s.passed).length;
  if (!total) return <span className="text-[11px] text-gray-400">—</span>;
  const allPassed = passed === total;
  return (
    <span
      className={`font-mono text-[12px] ${allPassed ? "text-emerald-600" : "text-red-600"}`}
    >
      {passed}/{total} passed
    </span>
  );
}

function FailedStepCell({ steps }) {
  const failed = (steps || []).find((s) => !s.passed);
  if (!failed) return <span className="text-[11px] text-gray-300">—</span>;
  return (
    <span
      className="text-[11.5px] text-red-600 truncate block max-w-[240px]"
      title={failed.error || failed.name}
    >
      {failed.name}
      {failed.error ? `: ${failed.error}` : ""}
    </span>
  );
}

export function getRunHistoryColumns({ onView } = {}) {
  return [
    {
      id: "startedAt",
      Header: "STARTED",
      accessor: "startedAt",
      cell: (row) => (
        <span className="font-mono text-[11.5px] text-[#6b7280]">
          {row.startedAt ? formatDateTime(row.startedAt) : "—"}
        </span>
      ),
    },
    {
      id: "status",
      Header: "OUTCOME",
      accessor: "status",
      cell: (row) => <RunOutcomeBadge status={row.status} />,
    },
    {
      id: "duration",
      Header: "DURATION",
      accessor: "duration",
      disableSortBy: true,
      cell: (row) => (
        <span className="font-mono text-[12px] text-[#1c1f2e]">
          {row.startedAt && row.completedAt
            ? `${(
                (new Date(row.completedAt) - new Date(row.startedAt)) /
                1000
              ).toFixed(2)} s`
            : "—"}
        </span>
      ),
    },
    {
      id: "steps",
      Header: "STEPS",
      accessor: "steps",
      disableSortBy: true,
      cell: (row) => <StepsSummary steps={row.steps} />,
    },
    {
      id: "failedStep",
      Header: "FAILED STEP",
      accessor: "failedStep",
      disableSortBy: true,
      cell: (row) => <FailedStepCell steps={row.steps} />,
    },
    {
      id: "rowActions",
      Header: "",
      accessor: "rowActions",
      width: 60,
      disableSortBy: true,
      cell: (row) => (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            title="View step breakdown"
            onClick={() => onView?.(row)}
            className="w-[26px] h-[26px] flex items-center justify-center rounded border border-[#e9ebf0] bg-white text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb] hover:bg-blue-50 transition-colors flex-shrink-0"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      ),
    },
  ];
}
