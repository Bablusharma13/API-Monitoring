import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Activity,
  Shield,
  Clock,
  AlertTriangle,
  Timer,
  AlertCircle,
  Plus,
  Download,
  Minus,
  Copy,
  Check,
  Pencil,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Tag,
  AlignLeft,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import FormModal from "../../../components/ui/FormModal";
import PageHeader from "../../../components/ui/PageHeader";
import { StatCard } from "../../../components/ui/StatCard3.jsx";
import { Section } from "../../../components/ui/Section";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { useGetCronJobByIdQuery } from "../hooks/query/useGetCronJobByIdQuery.js";
import { useCronJobPingsQuery } from "../hooks/query/useCronJobPingsQuery.js";
import { useToggleCronJobMutation } from "../hooks/query/useToggleCronJobMutation.js";
import { useRunCronJobMutation } from "../hooks/query/useRunCronJobMutation.js";
import { useDeleteCronJobMutation } from "../hooks/query/useDeleteCronJobMutation.js";
import { useUpdateCronJobMutation } from "../hooks/query/useUpdateCronJobMutation.js";
import { AlertDialog } from "../../../components/ui/AlertDialog";
import UiInput from "../../../components/ui/Input";
import SingleSelect from "../../../components/ui/SingleSelect";
import AvatarSelect from "../../../components/ui/AvatarSelect";
import { useTeamMembersQuery } from "../../categories/hooks/query/useTeamMembersQuery";
import { useParams, useNavigate } from "react-router-dom";
import { formatDateTime, formatDuration } from "../../../utils/helpers.js";

const INIT_ERRORS = [
  {
    id: "e1",
    msg: "S3_403: AccessDenied — PutObject on s3://sf-cold-logs-eu",
    first: "2026-06-13 18:00",
    last: "2026-06-14 00:00",
    count: 2,
    server: "prod-eu-west-3b",
    alertTo: "#ops-storage (Slack)",
    status: "sent",
    resolved: false,
  },
  {
    id: "e2",
    msg: "ETIMEDOUT: rotation exceeded 300s timeout limit",
    first: "2026-06-14 18:05",
    last: "2026-06-14 18:05",
    count: 1,
    server: "prod-eu-west-3b",
    alertTo: "devops@syberfort.io",
    status: "sent",
    resolved: false,
  },
  {
    id: "e3",
    msg: "EWORKER: rotation-worker-02 lost connection mid-batch",
    first: "2026-06-09 12:01",
    last: "2026-06-09 12:01",
    count: 1,
    server: "prod-eu-west-3b",
    alertTo: "#ops-storage (Slack)",
    status: "resolved",
    resolved: true,
  },
];

const ACT_POOL = [
  {
    col: "#16a34a",
    job: "Cron completed",
    msg: "Finished in 2m 11s — 842 objects moved",
  },
  {
    col: "#2563eb",
    job: "Cron started",
    msg: "Scheduled run dispatched to worker-01",
  },
  {
    col: "#dc2626",
    job: "Cron failed",
    msg: "S3_403 AccessDenied on cold bucket",
  },
  { col: "#d97706", job: "Alert sent", msg: "#ops-storage notified via Slack" },
  {
    col: "#0891b2",
    job: "Retry attempted",
    msg: "Retry 1/3 scheduled after failure",
  },
  { col: "#2563eb", job: "Config updated", msg: "Timeout raised to 300s" },
  { col: "#6b7280", job: "Job paused", msg: "Paused by Alex Morgan" },
  { col: "#16a34a", job: "Job resumed", msg: "Resumed by Alex Morgan" },
];

function fmtDur(s) {
  if (!s) return "—";
  if (s < 60) return s + "s";
  const m = Math.floor(s / 60),
    r = s % 60;
  return m + "m " + (r ? r + "s" : "0s");
}

function genLog(r) {
  if (r.status === "success")
    return `[${r.start}] INFO  starting rotation job ${r.id}\n[+0.4s] INFO  scanning hot tier — 1,284 candidate objects\n[+12s] INFO  moving 842 objects (7+ days old) → cold tier\n[+${r.dur - 30}s] WARN  3 objects skipped (locked by reader)\n[+${r.dur}s] INFO  ✓ rotation complete — 842 moved, 184 GB, exit 0`;
  if (r.status === "timeout")
    return `[${r.start}] INFO  starting rotation job ${r.id}\n[+0.5s] INFO  scanning hot tier — 9,902 candidate objects\n[+180s] WARN  batch slower than usual — throttled by S3\n[+300s] ERROR ETIMEDOUT — exceeded 300s timeout\n[+300s] ERROR killing worker, scheduling retry (2/3)`;
  return `[${r.start}] INFO  starting rotation job ${r.id}\n[+0.3s] INFO  authenticating to s3://sf-cold-logs-eu\n[+0.6s] ERROR S3_403 AccessDenied: PutObject denied\n[+0.6s] ERROR bucket policy rejected role rotation-worker\n[+${r.dur}s] ERROR job failed after ${r.retries} retries, exit 1`;
}

function genStack(r) {
  if (r.status === "success")
    return "No error stack — run completed successfully.";
  if (r.status === "timeout")
    return `TimeoutError: job exceeded 300000ms\n    at RotationWorker.run (/svc/rotation/worker.js:142:11)\n    at async Scheduler.dispatch (/svc/core/scheduler.js:88:7)`;
  return `S3AccessDeniedError: 403 AccessDenied\n    at S3Client.putObject (/svc/aws/s3.js:210:13)\n    at RotationWorker.moveObject (/svc/rotation/worker.js:96:22)`;
}

// ── Shared primitives ──────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    success: "bg-green-50 text-green-700 border border-green-200",
    failed: "bg-red-50 text-red-700 border border-red-200",
    timeout: "bg-red-50 text-red-700 border border-red-200",
    late: "bg-amber-50 text-amber-700 border border-amber-200",
    running: "bg-blue-50 text-blue-700 border border-blue-200",
  };
  const labels = {
    success: "Success",
    failed: "Failed",
    timeout: "Missing",
    running: "Running",
    late: "Late",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${map[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status === "running" && <LiveDot />}
      {labels[status] || status}
    </span>
  );
}

function TriggerBadge({ t }) {
  const map = {
    Scheduled: "bg-gray-100 text-gray-600 border border-gray-200",
    Manual: "bg-purple-50 text-purple-700 border border-purple-200",
    Retry: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${map[t] || "bg-gray-100 text-gray-500"}`}
    >
      {t}
    </span>
  );
}

function LiveDot() {
  return (
    <span
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: "#16a34a",
        display: "inline-block",
        flexShrink: 0,
        animation: "pulse 1.5s infinite",
      }}
    />
  );
}

function Toggle({ on, onChange }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        position: "relative",
        width: 34,
        height: 18,
        borderRadius: 9,
        background: on ? "#16a34a" : "#e5e7eb",
        cursor: "pointer",
        transition: "background .2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "#fff",
          top: 3,
          left: 3,
          transform: on ? "translateX(16px)" : "translateX(0)",
          transition: "transform .2s",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
        }}
      />
    </div>
  );
}

function KvRow({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400">{k}</span>
      <span className="text-xs text-right">{v}</span>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function CardHd({ children }) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80 text-sm font-medium text-gray-700">
      {children}
    </div>
  );
}

function CardBd({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

function SecLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-3 first:mt-0 text-xs uppercase tracking-widest text-gray-400">
      <span>{children}</span>
      <span className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function Btn({ children, className = "", onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-gray-200 bg-white text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}

function BtnPrimary({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-blue-600 text-white border border-blue-600 hover:bg-blue-700 transition-all cursor-pointer"
    >
      {children}
    </button>
  );
}

function BtnRed({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
    >
      {children}
    </button>
  );
}

function BtnAmber({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-600 hover:text-white transition-all cursor-pointer"
    >
      {children}
    </button>
  );
}

function BtnGreen({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-green-50 text-green-700 border border-green-200 hover:bg-green-600 hover:text-white transition-all cursor-pointer"
    >
      {children}
    </button>
  );
}

function InpField({ label, children }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      {children}
    </div>
  );
}

function Inp(props) {
  return (
    <input
      {...props}
      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 bg-white"
    />
  );
}

function Sel({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 outline-none focus:border-blue-500 bg-white cursor-pointer"
    >
      {children}
    </select>
  );
}

const CRON_PRESETS = [
  { label: "Every minute", cron: "* * * * *", freq: "Every 1 min" },
  { label: "Every 2 minutes", cron: "*/2 * * * *", freq: "Every 2 min" },
  { label: "Every 5 minutes", cron: "*/5 * * * *", freq: "Every 5 min" },
  { label: "Every 10 minutes", cron: "*/10 * * * *", freq: "Every 10 min" },
  { label: "Every 30 minutes", cron: "*/30 * * * *", freq: "Every 30 min" },
  { label: "Every hour", cron: "0 * * * *", freq: "Hourly" },
  { label: "Every 2 hours", cron: "0 */2 * * *", freq: "Every 2 hours" },
  { label: "Every 6 hours", cron: "0 */6 * * *", freq: "Every 6 hours" },
  { label: "Daily at midnight", cron: "0 0 * * *", freq: "Daily" },
  { label: "Daily at 9 AM", cron: "0 9 * * *", freq: "Daily at 9 AM" },
  { label: "Weekly on Monday", cron: "0 0 * * 1", freq: "Weekly" },
  { label: "Monthly on 1st", cron: "0 0 1 * *", freq: "Monthly" },
];

// ── Toast ──────────────────────────────────────────────────────────────────────

function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        background: "#1c1f2e",
        color: "#fff",
        padding: "10px 18px",
        borderRadius: 8,
        fontSize: 13,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 8,
        maxWidth: 380,
        pointerEvents: "none",
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6ee7b7"
        strokeWidth="2.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
    </div>
  );
}

function useToast() {
  const [message, setMessage] = useState(null);
  const timerRef = useRef(null);
  const show = useCallback((msg) => {
    setMessage(msg);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(null), 2600);
  }, []);
  return [message, show];
}

// ── Modal (FormModal wrapper for legacy props) ───────────────────────────────

function DetailFormModal({ open, onClose, title, children, footer, wide }) {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={title}
      footer={footer}
      size={wide ? "wide" : "lg"}
    >
      {children}
    </FormModal>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar() {
  const nav = [
    {
      lbl: "Monitor",
      items: [
        { label: "Dashboard" },
        { label: "All APIs", badge: "42" },
        { label: "Incidents", badge: "7", red: true },
        { label: "Alerts", badge: "3", red: true },
      ],
    },
    {
      lbl: "Pipeline",
      items: [
        { label: "Pipeline Monitor" },
        { label: "Buffer Dashboard" },
        { label: "Storage Tiers" },
        { label: "Retention Rules" },
      ],
    },
    {
      lbl: "Cron",
      items: [
        { label: "Heartbeat Monitor", badge: "1", red: true },
        { label: "Cron Inventory", badge: "124", act: true },
        { label: "Job History" },
      ],
    },
    { lbl: "Groups", items: [{ label: "By Project" }, { label: "By Team" }] },
  ];

  return (
    <aside
      style={{
        width: 220,
        background: "#fff",
        borderRight: "1px solid #e9ebf0",
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        overflowY: "auto",
        zIndex: 99,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #e9ebf0",
          display: "flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: "#2563eb",
            borderRadius: 7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Outfit',sans-serif",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            SyberFort
          </div>
          <div style={{ fontSize: 10, color: "#6b7280" }}>API Monitor</div>
        </div>
      </div>

      {nav.map((sec) => (
        <div key={sec.lbl} style={{ padding: "8px 0 2px" }}>
          <div
            style={{
              fontSize: "9.5px",
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "#9ca3af",
              padding: "6px 16px 4px",
            }}
          >
            {sec.lbl}
          </div>
          {sec.items.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "7px 16px",
                fontSize: 12.5,
                cursor: "pointer",
                borderLeft: `2px solid ${item.act ? "#2563eb" : "transparent"}`,
                background: item.act ? "#eff4ff" : "transparent",
                color: item.act ? "#2563eb" : "#1c1f2e",
              }}
            >
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "'DM Mono',monospace",
                    padding: "1px 6px",
                    borderRadius: 20,
                    background: item.red ? "#fef2f2" : "#f0f2f7",
                    color: item.red ? "#dc2626" : "#6b7280",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderTop: "1px solid #e9ebf0",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 500,
            color: "#fff",
          }}
        >
          AM
        </div>
        <div>
          <div style={{ fontSize: 12 }}>Alex Morgan</div>
          <div style={{ fontSize: 10.5, color: "#6b7280" }}>Admin</div>
        </div>
      </div>
    </aside>
  );
}

// ── Ping Strip ────────────────────────────────────────────────────────────────

function PingStrip({ runs, onToast }) {
  const STATUS_COLORS = {
    success: "#16a34a",
    late: "#d97706",
    failed: "#dc2626",
    timeout: "#d97706",
    missing: "#dc2626",
  };

  const last40 = useMemo(() => {
    const sorted = [...(runs || [])].sort(
      (a, b) => new Date(b.start) - new Date(a.start),
    );
    return sorted.slice(0, 40).reverse();
  }, [runs]);

  const maxDur = useMemo(
    () => Math.max(...last40.map((r) => r.dur || 0), 1),
    [last40],
  );

  const bars = useMemo(
    () =>
      last40.map((r) => ({
        col: STATUS_COLORS[r.status] || "#9ca3af",
        h: Math.max(4, Math.round((r.dur / maxDur) * 26)),
        tooltip: `${r.status} — ${fmtDur(r.dur)}`,
        id: r.id,
      })),
    [last40, maxDur],
  );

  return (
    <div
      style={{
        display: "flex",
        gap: 2.5,
        alignItems: "flex-end",
        height: 30,
        overflow: "hidden",
      }}
    >
      {bars.length === 0 ? (
        <span className="text-xs text-gray-400">No ping data</span>
      ) : (
        bars.map(({ col, h, tooltip, id }) => (
          <div
            key={id}
            style={{
              width: 7,
              height: h,
              background: col,
              borderRadius: "2px 2px 0 0",
              cursor: "pointer",
              flexShrink: 0,
            }}
            onClick={() => onToast(tooltip)}
          />
        ))
      )}
    </div>
  );
}

// ── Run Row ───────────────────────────────────────────────────────────────────

function RunRow({ run, expanded, onToggle, onOpenLog, onToast }) {
  return (
    <>
      <tr
        style={{
          borderBottom: "1px solid #f3f5f9",
          cursor: "pointer",
          background: expanded ? "#eff4ff" : "transparent",
        }}
        onClick={() => onToggle(run.id)}
      >
        <td className="px-3 py-2.5 text-xs">
          <span style={{ fontFamily: "'DM Mono',monospace", color: "#2563eb" }}>
            {run.id}
          </span>
        </td>
        <td
          className="px-3 py-2.5 text-xs"
          style={{ fontFamily: "'DM Mono',monospace", color: "#9ca3af" }}
        >
          {run.start}
        </td>
        <td
          className="px-3 py-2.5 text-xs"
          style={{ fontFamily: "'DM Mono',monospace", color: "#9ca3af" }}
        >
          {run.end || "—"}
        </td>
        <td
          className="px-3 py-2.5 text-xs"
          style={{ fontFamily: "'DM Mono',monospace" }}
        >
          {fmtDur(run.dur)}
        </td>
        <td className="px-3 py-2.5">
          <StatusBadge status={run.status} />
        </td>
        <td className="px-3 py-2.5">
          <TriggerBadge t={run.trigger} />
        </td>
        <td
          className="px-3 py-2.5 text-xs"
          style={{
            fontFamily: "'DM Mono',monospace",
            color: run.retries ? "#d97706" : "#9ca3af",
          }}
        >
          {run.retries}
        </td>
        <td
          className="px-3 py-2.5 text-xs"
          style={{
            fontFamily: "'DM Mono',monospace",
            color: run.err === "—" ? "#9ca3af" : "#dc2626",
          }}
        >
          {run.err}
        </td>
        <td className="px-3 py-2.5 text-gray-400" style={{ width: 36 }}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transition: "transform .15s",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: "#f8f9fc", borderTop: "1px solid #e9ebf0" }}>
          <td colSpan="9" className="px-5 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                  Run Details
                </div>
                {[
                  ["Run ID", run.id],
                  ["Server", run.server],
                  ["Worker", run.worker],
                  ["Retries", run.retries],
                  ["Error", run.err],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-1.5 border-b border-gray-100 last:border-0 text-xs"
                  >
                    <span className="text-gray-400">{k}</span>
                    <span
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        color:
                          k === "Error" && run.err !== "—"
                            ? "#dc2626"
                            : "inherit",
                      }}
                    >
                      {v}
                    </span>
                  </div>
                ))}
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-2 mt-3">
                  Request Payload
                </div>
                <LogBlock
                  style={{ maxHeight: 100 }}
                >{`{\n  "tier_from": "hot",\n  "tier_to": "cold",\n  "older_than_days": 7,\n  "dry_run": false\n}`}</LogBlock>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                  Full Logs
                </div>
                <LogBlock>{genLog(run)}</LogBlock>
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-2 mt-3">
                  Error Stack
                </div>
                <LogBlock style={{ maxHeight: 100 }}>{genStack(run)}</LogBlock>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLog(run);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-blue-600 text-white cursor-pointer"
                  >
                    Open full log
                  </button>
                  {run.status !== "success" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToast("Incident opened from " + run.id);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-50 text-red-600 border border-red-200 cursor-pointer"
                    >
                      Open incident
                    </button>
                  )}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function LogBlock({ children, style = {} }) {
  return (
    <pre
      style={{
        background: "#1c1f2e",
        borderRadius: 8,
        padding: "12px 14px",
        fontFamily: "'DM Mono',monospace",
        fontSize: 11,
        lineHeight: 1.7,
        color: "#cbd5e1",
        whiteSpace: "pre-wrap",
        maxHeight: 180,
        overflow: "auto",
        margin: 0,
        ...style,
      }}
    >
      {children}
    </pre>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function CronDetail() {
  const [errors, setErrors] = useState(INIT_ERRORS);
  const [feed, setFeed] = useState([]);
  const [modal, setModal] = useState(null);
  const [logRun, setLogRun] = useState(null);
  const [runPage, setRunPage] = useState(1);
  const [runLimit, setRunLimit] = useState(15);
  const [runSearch, setRunSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortType, setSortType] = useState("asc");
  const handleRunSearchChange = useCallback((val) => {
    setRunSearch(val);
    setRunPage(1);
  }, []);
  const { id } = useParams();
  const { data, isLoading } = useGetCronJobByIdQuery(id);
  const toggleCronJob = useToggleCronJobMutation();
  const runCronJob = useRunCronJobMutation();
  const deleteCronJob = useDeleteCronJobMutation();
  const updateCronJob = useUpdateCronJobMutation();
  const navigate = useNavigate();
  const { data: teamMembers = [], isLoading: loadingMembers } =
    useTeamMembersQuery();
  const memberOptions = useMemo(
    () =>
      teamMembers.map((m) => ({
        value: m._id,
        label: m.name,
        sub: m.email,
        image: m.image_url,
      })),
    [teamMembers],
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isPaused = data?.isPaused ?? false;

  useEffect(() => {
    if (data) {
      setJobName(data.name || "");
      setCronExpr(data.cronExpression || "");
      setEditForm({
        name: data.name || "",
        desc: data.notes || "",
        cron: data.cronExpression || "",
        frequencyLabel: data.frequencyLabel || "",
        grace: data.grace != null ? String(data.grace) : "60",
        tz: data.tz || "UTC (Etc/UTC)",
        env: data.env || "Production",
        priority: data.priority || "High",
        owner: data.owner?._id || "",
      });
      const preset = CRON_PRESETS.find((p) => p.cron === data.cronExpression);
      setEditCronPreset(preset ? preset.label : "");
    }
  }, [data]);
  const isActive = !isPaused;

  const pingsParams = useMemo(
    () => ({
      page: runPage,
      limit: runLimit,
      ...(runSearch ? { search: runSearch } : {}),
      ...(sortField ? { sortBy: sortField, sortOrder: sortType } : {}),
    }),
    [runPage, runLimit, runSearch, sortField, sortType],
  );
  const { data: pingsData, isLoading: pingsLoading } = useCronJobPingsQuery(
    id,
    pingsParams,
  );

  const runHistoryData = useMemo(() => {
    if (!pingsData?.data) return [];
    return pingsData.data.map((r) => ({
      id: r._id,
      start: r.pingedAt,
      end: r.expectedAt,
      dur: Math.round((r.duration || 0) / 1000),
      status: r.status,
      trigger: "Scheduled",
      retries: 0,
      err: r.status === "late" ? "Late" : "—",
    }));
  }, [pingsData]);

  const runHistoryPagination = pingsData?.pagination;
  const [urlCopied, setUrlCopied] = useState(false);
  const [targetCopied, setTargetCopied] = useState(false);
  const [hbUrl, setHbUrl] = useState(
    "https://hb.syberfort.io/ping/cron_8f3a91?s=k29fA7",
  );
  const [sinceMins, setSinceMins] = useState(102);
  const [jobName, setJobName] = useState("");
  const [cronExpr, setCronExpr] = useState("");
  const [cfg, setCfg] = useState({
    cron: "0 */6 * * *",
    timeout: 300,
    retries: 3,
    webhook: "https://hooks.slack.com/services/T0/B1/xyz",
    emails: "devops@syberfort.io, platform@syberfort.io",
    alerts: true,
    autoretry: true,
  });
  const [editForm, setEditForm] = useState({
    name: "",
    desc: "",
    cron: "",
    frequencyLabel: "",
    grace: "60",
    tz: "",
    env: "",
    priority: "",
    owner: "",
  });
  const [editCronPreset, setEditCronPreset] = useState("");
  const actIdxRef = useRef(0);
  const [toastMsg, showToast] = useToast();

  const addActivity = useCallback((col, job, msg) => {
    const n = new Date();
    const ts = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}:${String(n.getSeconds()).padStart(2, "0")}`;
    setFeed((f) => [{ col, job, msg, ts }, ...f].slice(0, 24));
  }, []);

  useEffect(() => {
    [
      ["#16a34a", "Cron completed", "Finished in 2m 08s — 842 objects moved"],
      ["#0891b2", "Retry attempted", "Retry 1/3 succeeded"],
      ["#d97706", "Alert sent", "#ops-storage notified via Slack"],
      ["#dc2626", "Cron failed", "S3_403 AccessDenied"],
      ["#2563eb", "Cron started", "Scheduled run dispatched"],
    ]
      .reverse()
      .forEach(([col, job, msg]) => addActivity(col, job, msg));
  }, []);

  useEffect(() => {
    const t1 = setInterval(() => setSinceMins((m) => m + 1), 60000);
    const t2 = setInterval(() => {
      if (Math.random() > 0.6) {
        const e = ACT_POOL[actIdxRef.current++ % ACT_POOL.length];
        addActivity(e.col, e.job, e.msg);
      }
    }, 9000);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, [addActivity]);

  const sinceStr = () => {
    const h = Math.floor(sinceMins / 60),
      m = sinceMins % 60;
    return (h ? h + "h " : "") + m + "m ago";
  };

  const runColumns = useMemo(
    () => [
      { id: "id", accessor: "id", name: "Run ID", Header: "Run ID" },
      {
        id: "start",
        accessor: "start",
        name: "Start Time",
        Header: "Start Time",
        cell: (row) => formatDateTime(row.start),
      },
      {
        id: "end",
        accessor: "end",
        name: "End Time",
        Header: "End Time",
        cell: (row) => formatDateTime(row.end),
      },
      {
        id: "dur",
        accessor: "dur",
        name: "Duration",
        Header: "Duration",
        cell: (row) => fmtDur(row.dur),
      },
      {
        id: "status",
        accessor: "status",
        name: "Status",
        Header: "Status",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        id: "trigger",
        accessor: "trigger",
        name: "Trigger",
        Header: "Trigger",
        cell: (row) => <TriggerBadge t={row.trigger} />,
      },
    ],
    [],
  );

  const toggleActive = (v) => {
    setIsActive(v);
    setIsPaused(!v);
    showToast(
      v
        ? "Cron resumed — scheduled runs active"
        : "Cron paused — scheduled runs skipped",
    );
    addActivity(
      v ? "#16a34a" : "#6b7280",
      v ? "Job resumed" : "Job paused",
      jobName,
    );
  };

  const confirmPause = () => {
    setModal(null);
    toggleCronJob.mutate(id, {
      onSuccess: () => {
        showToast(isPaused ? "Cron resumed" : "Cron paused");
        addActivity(
          isPaused ? "#16a34a" : "#6b7280",
          isPaused ? "Job resumed" : "Job paused",
          jobName,
        );
      },
    });
  };

  const confirmRunNow = () => {
    setModal(null);
    runCronJob.mutate(id, {
      onSuccess: () => {
        showToast("▶ Manual run triggered — " + jobName);
        addActivity("#2563eb", "Cron started", "Manual run triggered");
      },
      onError: () => {
        showToast("Failed to trigger manual run");
      },
    });
  };

  const handleEditPresetChange = (label) => {
    setEditCronPreset(label);
    const preset = CRON_PRESETS.find((p) => p.label === label);
    if (preset)
      setEditForm((f) => ({
        ...f,
        cron: preset.cron,
        frequencyLabel: preset.freq,
      }));
  };

  const saveEdit = () => {
    updateCronJob.mutate(
      {
        id,
        name: editForm.name,
        notes: editForm.desc,
        cronExpression: editForm.cron,
        frequencyLabel: editForm.frequencyLabel,
        grace: parseInt(editForm.grace, 10) || 60,
        ...(editForm.owner && { owner: editForm.owner }),
      },
      {
        onSuccess: () => {
          setJobName(editForm.name);
          setCronExpr(editForm.cron);
          setCfg((c) => ({ ...c, cron: editForm.cron }));
          setModal(null);
          showToast("Cron updated — " + editForm.name);
          addActivity(
            "#2563eb",
            "Config updated",
            "Cron expression & details edited",
          );
        },
        onError: () => {
          showToast("Failed to update cron job");
        },
      },
    );
  };

  const saveConfig = () => {
    setCronExpr(cfg.cron);
    setModal(null);
    showToast("Configuration saved");
    addActivity("#2563eb", "Config updated", "Timeout, retries & alerts saved");
  };

  const regenSecret = () => {
    const s = Math.random().toString(36).slice(2, 8);
    setHbUrl("https://hb.syberfort.io/ping/cron_8f3a91?s=" + s);
    setModal(null);
    showToast("✓ New heartbeat secret generated");
    addActivity("#d97706", "Config updated", "Heartbeat secret regenerated");
  };

  const resolveError = (id) => {
    const e = errors.find((x) => x.id === id);
    setErrors((errs) =>
      errs.map((er) =>
        er.id === id ? { ...er, resolved: true, status: "resolved" } : er,
      ),
    );
    if (e) {
      showToast("Error resolved — " + e.msg.split(":")[0]);
      addActivity("#16a34a", "Error resolved", e.msg.split(":")[0]);
    }
  };

  const simulateActivity = () => {
    const e = ACT_POOL[actIdxRef.current++ % ACT_POOL.length];
    addActivity(e.col, e.job, e.msg);
    showToast(e.job + " — " + e.msg.slice(0, 40));
  };

  const copyUrl = () => {
    navigator.clipboard?.writeText(data?.pingUrl || hbUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const statusBadgeLg = isActive ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">
      <LiveDot /> Healthy
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-500 border border-gray-200">
      Paused
    </span>
  );

  if (isLoading) {
    return (
      <div className="page-scroll animate-pulse">
        {/* header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-1 mb-2">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-3 w-2 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-2 bg-gray-200 rounded" />
              <div className="h-3 w-28 bg-gray-200 rounded" />
            </div>
            <div className="h-6 w-56 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-2">
            {[80, 72, 60, 68].map((w, i) => (
              <div
                key={i}
                className="h-8 rounded bg-gray-200"
                style={{ width: w }}
              />
            ))}
          </div>
        </div>

        {/* stat cards */}
        <div className="wrapper-card p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
              >
                <div className="h-9 w-9 rounded-lg bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-5 w-16 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* overview label */}
        <div className="h-3.5 w-20 bg-gray-200 rounded mb-3" />

        {/* overview cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {[...Array(2)].map((_, ci) => (
            <div key={ci} className="wrapper-card p-4">
              <div className="h-4 w-32 bg-gray-200 rounded mb-3" />
              <div className="space-y-3">
                {[...Array(7)].map((_, ri) => (
                  <div
                    key={ri}
                    className="flex items-center justify-between py-1.5 border-b border-gray-100"
                  >
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                    <div
                      className="h-3 bg-gray-200 rounded"
                      style={{ width: ri % 2 === 0 ? 80 : 120 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* live heartbeat label */}
        <div className="h-3.5 w-28 bg-gray-200 rounded mb-3" />

        {/* heartbeat card */}
        <div className="wrapper-card p-4 mb-4">
          <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-2.5 space-y-1.5"
                  >
                    <div className="h-3.5 w-24 bg-gray-200 rounded" />
                    <div className="h-2.5 w-20 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
              <div className="h-2.5 w-20 bg-gray-200 rounded mb-1.5" />
              <div className="h-9 w-full rounded-lg bg-gray-200" />
            </div>
            <div>
              <div className="h-2.5 w-40 bg-gray-200 rounded mb-2" />
              <div className="flex gap-1.5">
                {[...Array(30)].map((_, i) => (
                  <div key={i} className="flex-1 h-8 rounded bg-gray-200" />
                ))}
              </div>
              <div className="flex gap-4 mt-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-2.5 w-14 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* run history label */}
        <div className="h-3.5 w-24 bg-gray-200 rounded mb-3" />

        {/* run history table */}
        <div className="wrapper-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-8 w-24 bg-gray-200 rounded" />
          </div>
          <div className="space-y-0">
            <div className="flex gap-4 py-2.5 border-b border-gray-100">
              {[40, 120, 120, 80, 60, 80].map((w, i) => (
                <div
                  key={i}
                  className="h-3 bg-gray-200 rounded"
                  style={{ width: w }}
                />
              ))}
            </div>
            {[...Array(8)].map((_, ri) => (
              <div
                key={ri}
                className="flex gap-4 py-3 border-b border-gray-100"
              >
                {[40, 120, 120, 80, 60, 80].map((w, ci) => (
                  <div
                    key={ci}
                    className="h-3 bg-gray-200 rounded"
                    style={{ width: w, opacity: 1 - ri * 0.07 }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <div>
          {/* PAGE HEADER */}
          {/* <div */}
          {/*   style={{ */}
          {/*     background: "#fff", */}
          {/*     borderBottom: "1px solid #e9ebf0", */}
          {/*     padding: "18px 28px 16px", */}
          {/*     flexShrink: 0, */}
          {/*   }} */}
          {/* > */}
          {/*   <div className="flex items-center gap-1 text-xs text-gray-400 mb-3 flex-wrap"> */}
          {/*     {["Dashboard", "Cron", "Cron Inventory"].map((c) => ( */}
          {/*       <span key={c}> */}
          {/*         <span className="cursor-pointer hover:text-blue-600"> */}
          {/*           {c} */}
          {/*         </span> */}
          {/*         <span className="opacity-40 mx-1">/</span> */}
          {/*       </span> */}
          {/*     ))} */}
          {/*     <span className="text-gray-700">Cron Detail</span> */}
          {/*   </div> */}
          {/*   <div className="flex items-center gap-3 flex-wrap"> */}
          {/*     <div */}
          {/*       style={{ */}
          {/*         width: 42, */}
          {/*         height: 42, */}
          {/*         borderRadius: 11, */}
          {/*         background: "#eff4ff", */}
          {/*         display: "flex", */}
          {/*         alignItems: "center", */}
          {/*         justifyContent: "center", */}
          {/*       }} */}
          {/*     > */}
          {/*       <svg */}
          {/*         width="22" */}
          {/*         height="22" */}
          {/*         viewBox="0 0 24 24" */}
          {/*         fill="none" */}
          {/*         stroke="#2563eb" */}
          {/*         strokeWidth="1.8" */}
          {/*       > */}
          {/*         <circle cx="12" cy="12" r="10" /> */}
          {/*         <polyline points="12 6 12 12 16 14" /> */}
          {/*       </svg> */}
          {/*     </div> */}
          {/*     <div> */}
          {/*       <div */}
          {/*         style={{ */}
          {/*           fontFamily: "'Outfit',sans-serif", */}
          {/*           fontSize: 22, */}
          {/*           fontWeight: 400, */}
          {/*           letterSpacing: "-.02em", */}
          {/*           display: "flex", */}
          {/*           alignItems: "center", */}
          {/*           gap: 10, */}
          {/*         }} */}
          {/*       > */}
          {/*         {jobName} {statusBadgeLg} */}
          {/*       </div> */}
          {/*       <div */}
          {/*         style={{ */}
          {/*           fontFamily: "'DM Mono',monospace", */}
          {/*           fontSize: 11.5, */}
          {/*           color: "#6b7280", */}
          {/*           marginTop: 2, */}
          {/*         }} */}
          {/*       > */}
          {/*         cron_8f3a91 · {cronExpr} */}
          {/*       </div> */}
          {/*     </div> */}
          {/*     <div className="flex items-center gap-2 ml-auto flex-wrap"> */}
          {/*       <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50"> */}
          {/*         <span className="text-xs text-gray-500"> */}
          {/*           {isActive ? "Active" : "Paused"} */}
          {/*         </span> */}
          {/*         <Toggle on={isActive} onChange={toggleActive} /> */}
          {/*       </div> */}
          {/*       <BtnPrimary onClick={() => setModal("run")}> */}
          {/*         ▶ Run Now */}
          {/*       </BtnPrimary> */}
          {/*       {isPaused ? ( */}
          {/*         <BtnGreen onClick={() => setModal("pause")}> */}
          {/*           ▶ Resume */}
          {/*         </BtnGreen> */}
          {/*       ) : ( */}
          {/*         <BtnAmber onClick={() => setModal("pause")}> */}
          {/*           ⏸ Pause */}
          {/*         </BtnAmber> */}
          {/*       )} */}
          {/*       <Btn onClick={() => setModal("edit")}>✏ Edit Cron</Btn> */}
          {/*       <Btn */}
          {/*         onClick={() => { */}
          {/*           setLogRun(RUNS[0]); */}
          {/*           setModal("log"); */}
          {/*         }} */}
          {/*       > */}
          {/*         📄 View Logs */}
          {/*       </Btn> */}
          {/*       <Btn onClick={() => showToast("Exporting run history to CSV…")}> */}
          {/*         ↓ Export History */}
          {/*       </Btn> */}
          {/*     </div> */}
          {/*   </div> */}
          {/* </div> */}

          {/* BODY */}
          <div>
            <div className="page-scroll">
              <div className="flex items-start justify-between mb-4">
                <PageHeader
                  icon={<Clock size={20} />}
                  title={data.name}
                  breadcrumbs={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Cron Monitor", href: "/dashboard/cron-monitor" },
                    { label: data.name },
                  ]}
                />
                <div className="flex items-center gap-2">
                  <Btn onClick={() => setModal("run")}>▶ Run Now</Btn>
                  <Btn onClick={() => setModal("pause")}>
                    {isPaused ? <Play size={12} /> : <Pause size={12} />}
                    {isPaused ? "Resume" : "Pause"}
                  </Btn>
                  <Button
                    icon={<Pencil size={14} />}
                    size="sm"
                    onClick={() => setModal("edit")}
                  >
                    Edit
                  </Button>
                  <BtnRed onClick={() => setDeleteDialogOpen(true)}>
                    <Trash2 size={14} />
                    Delete
                  </BtnRed>
                </div>
              </div>
              <Section>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  <StatCard
                    icon={<Shield size={20} stroke="#16a34a" />}
                    count={
                      data?.stats?.uptime30d != null
                        ? `${data.stats.uptime30d}%`
                        : "-"
                    }
                    title="Uptime (30d)"
                    countColor="text-emerald-600"
                  />

                  <StatCard
                    icon={<Activity size={20} stroke="#2563eb" />}
                    count={
                      data?.stats?.successRate30d != null
                        ? `${data.stats.successRate30d}%`
                        : "-"
                    }
                    title="Success Rate"
                    countColor="text-blue-600"
                  />

                  <StatCard
                    icon={<Clock size={20} stroke="#d97706" />}
                    count={data?.stats?.missedRuns30d ?? "-"}
                    title="Missed Runs (30d)"
                    countColor="text-amber-600"
                  />

                  <StatCard
                    icon={<Timer size={20} stroke="#0891b2" />}
                    count={
                      data?.stats?.avgDuration30d != null
                        ? formatDuration(data.stats.avgDuration30d)
                        : "-"
                    }
                    title="Avg Duration"
                    countColor="text-cyan-600"
                  />
                </div>
              </Section>
              {/* OVERVIEW */}
              <SecLabel>Overview</SecLabel>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHd>Cron Summary</CardHd>
                  <CardBd>
                    {[
                      [
                        "Cron Job ID",
                        <span
                          style={{
                            fontFamily: "'DM Mono',monospace",
                            fontSize: 12,
                          }}
                        >
                          {id}
                        </span>,
                      ],
                      ["Job Name", data?.name],
                      ["Description", data?.notes || <Minus />],
                      [
                        "Target URL",
                        <span className="flex items-center gap-1 max-w-[250px]">
                          <span className="font-mono text-[10px] text-gray-500 truncate">
                            {data?.targetUrl || "-"}
                          </span>
                          {data?.targetUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard?.writeText(data.targetUrl);
                                setTargetCopied(true);
                                setTimeout(() => setTargetCopied(false), 2000);
                              }}
                              className={`flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center rounded border transition-colors ${targetCopied ? "bg-green-500 border-green-500 text-white" : "border-gray-200 bg-white text-gray-400 hover:text-blue-600 hover:border-blue-400"}`}
                            >
                              {targetCopied ? (
                                <Check size={9} strokeWidth={3} />
                              ) : (
                                <Copy size={9} />
                              )}
                            </button>
                          )}
                        </span>,
                      ],
                      [
                        "Owner",
                        data?.owner ? (
                          <span className="flex items-center gap-2">
                            <img
                              src={data.owner.image_url || `https://ui-avatars.com/api/?background=2563eb&color=fff&name=${encodeURIComponent(data.owner.name || "")}`}
                              alt={data.owner.name}
                              className="w-6 h-6 rounded-full object-cover border border-gray-200 flex-shrink-0"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?background=2563eb&color=fff&name=${encodeURIComponent(data.owner.name || "")}`;
                              }}
                            />
                            <span className="flex flex-col items-start">
                              <span className="text-xs text-gray-800 leading-none">
                                {data.owner.name}
                              </span>
                              {/* <span className="text-[10px] text-gray-400 leading-none mt-0.5"> */}
                              {/*   {data.owner.email} */}
                              {/* </span> */}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        ),
                      ],
                      [
                        "Environment",
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                          Production
                        </span>,
                      ],
                      [
                        "Current Status",
                        (() => {
                          const status = data?.status;

                          const statusConfig = {
                            on_time: {
                              label: "On Time",
                              className:
                                "bg-green-50 text-green-700 border border-green-200",
                            },
                            late: {
                              label: "Late",
                              className:
                                "bg-yellow-50 text-yellow-700 border border-yellow-200",
                            },
                            missing: {
                              label: "Missing",
                              className:
                                "bg-red-50 text-red-700 border border-red-200",
                            },
                            paused: {
                              label: "Paused",
                              className:
                                "bg-gray-100 text-gray-600 border border-gray-200",
                            },
                            pending: {
                              label: "Pending",
                              className:
                                "bg-blue-50 text-blue-700 border border-blue-200",
                            },
                          };

                          const config = statusConfig[status] || {
                            label: "Unknown",
                            className:
                              "bg-gray-100 text-gray-600 border border-gray-200",
                          };

                          return (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${config.className}`}
                            >
                              {config.label}
                            </span>
                          );
                        })(),
                      ],
                      [
                        "Created Date",
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 12,
                          }}
                        >
                          {data?.createdAt
                            ? new Intl.DateTimeFormat("sv-SE", {
                                timeZone: "Asia/Kolkata",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(new Date(data.createdAt))
                            : "-"}
                        </span>,
                      ],
                      [
                        "Last Updated",
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 12,
                          }}
                        >
                          {data?.updatedAt
                            ? new Intl.DateTimeFormat("sv-SE", {
                                timeZone: "Asia/Kolkata",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              }).format(new Date(data.updatedAt))
                            : "-"}
                        </span>,
                      ],
                    ].map(([k, v]) => (
                      <KvRow key={k} k={k} v={v} />
                    ))}
                  </CardBd>
                </Card>
                <Card>
                  <CardHd>Schedule Details</CardHd>
                  <CardBd>
                    {[
                      [
                        "Cron Expression",
                        <span
                          style={{
                            fontFamily: "'DM Mono',monospace",
                            fontSize: 12,
                          }}
                        >
                          {data?.cronExpression}
                        </span>,
                      ],
                      ["Human Readable", `${data?.frequencyLabel}`],
                      [
                        "Last Run Time",
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 12,
                          }}
                        >
                          {data?.lastCalledAt
                            ? new Date(data.lastCalledAt)
                                .toISOString()
                                .replace("T", " ")
                                .slice(0, 19)
                            : "-"}
                        </span>,
                      ],
                      [
                        "Next Expected At",
                        <span
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: 12,
                          }}
                        >
                          {data?.nextExpectedAt
                            ? new Date(data.nextExpectedAt)
                                .toISOString()
                                .replace("T", " ")
                                .slice(0, 19)
                            : "-"}
                        </span>,
                      ],

                      [
                        "Average Run Time",
                        <span
                          style={{
                            fontFamily: "'DM Mono',monospace",
                            fontSize: 12,
                          }}
                        >
                          {formatDuration(data?.stats?.avgDuration30d)}
                        </span>,
                      ],
                      [
                        "Timeout Limit",
                        <span
                          style={{
                            fontFamily: "'DM Mono',monospace",
                            fontSize: 12,
                          }}
                        >
                          -CS-
                        </span>,
                      ],
                      [
                        "Grace Threshold",
                        <span
                          style={{
                            fontFamily: "'DM Mono',monospace",
                            fontSize: 12,
                          }}
                        >
                          {data?.graceLabel}
                        </span>,
                      ],
                    ].map(([k, v]) => (
                      <KvRow key={k} k={k} v={v} />
                    ))}
                  </CardBd>
                </Card>
              </div>

              {/* HEALTH KPIs */}

              {/* HEARTBEAT */}
              <SecLabel>Live Heartbeat</SecLabel>
              <Card>
                <CardHd>
                  <span className="flex items-center gap-2">
                    <LiveDot /> Heartbeat Monitor
                  </span>
                </CardHd>
                <CardBd>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        {[
                          [
                            data?.lastCalledAt
                              ? new Intl.DateTimeFormat("sv-SE", {
                                  timeZone: "Asia/Kolkata",
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                }).format(new Date(data.lastCalledAt))
                              : "-",
                            "Last heartbeat received",
                          ],
                          [data?.lastCalledAgoHuman, "Time since last ping"],
                          [data?.frequencyLabel, "Expected interval"],
                          [data?.status, "Heartbeat status"],
                        ].map(([v, l]) => (
                          <div
                            key={l}
                            style={{
                              padding: "10px 12px",
                              background: "#f8f9fc",
                              border: "1px solid #e9ebf0",
                              borderRadius: 8,
                            }}
                          >
                            <div
                              style={{
                                fontFamily: "'DM Mono',monospace",
                                fontSize: 13,
                                color:
                                  l === "Time since last ping"
                                    ? "#16a34a"
                                    : "#1c1f2e",
                                marginBottom: 2,
                              }}
                            >
                              {v}
                            </div>
                            <div style={{ fontSize: 10.5, color: "#6b7280" }}>
                              {l}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        Heartbeat URL
                      </div>
                      <div
                        style={{
                          background: "#1c1f2e",
                          borderRadius: 8,
                          padding: "9px 12px",
                          fontFamily: "'DM Mono',monospace",
                          fontSize: 11.5,
                          color: "#86efac",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {data?.pingUrl}
                        </span>
                        <button
                          onClick={copyUrl}
                          style={{
                            background: urlCopied ? "#16a34a" : "transparent",
                            border: urlCopied
                              ? "1px solid #16a34a"
                              : "1px solid #374151",
                            color: urlCopied ? "#fff" : "#9ca3af",
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {urlCopied ? (
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="9" y="9" width="13" height="13" rx="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-2">
                        Status timeline — last 30 pings
                      </div>
                      <PingStrip runs={runHistoryData} onToast={showToast} />
                      <div className="flex gap-4 mt-2 text-xs text-gray-400">
                        {[
                          ["#16a34a", "On time"],
                          ["#d97706", "Late"],
                          ["#dc2626", "Missed"],
                        ].map(([c, l]) => (
                          <span key={l} className="flex items-center gap-1">
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 2,
                                background: c,
                                display: "inline-block",
                              }}
                            />
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardBd>
              </Card>

              {/* RUN HISTORY */}
              <div className="flex items-center justify-between mt-4">
                <SecLabel>Run History</SecLabel>
              </div>
              <Section>
                <NewTableConfig
                  module="cron-run-history"
                  columns={runColumns}
                  data={runHistoryData}
                  isLoading={isLoading || pingsLoading}
                  currentPage={runPage}
                  setCurrentPage={setRunPage}
                  pageLimit={runLimit}
                  handlePageLimitChange={setRunLimit}
                  totalResults={
                    runHistoryPagination?.total ?? runHistoryData.length
                  }
                  totalPages={Math.ceil(
                    (runHistoryPagination?.total ?? runHistoryData.length) /
                      runLimit,
                  )}
                  // searchQuery={runSearch}
                  // onSearchChange={handleRunSearchChange}
                  onRowClick={(row) => {
                    setLogRun(row);
                    setModal("log");
                  }}
                  showRowNumbers={false}
                  sortBy={sortField}
                  sortOrder={sortType}
                  handleServerSideSorting={({ sortBy, sortDirection }) => {
                    setSortField(sortBy);
                    setSortType(sortDirection);
                    setRunPage(1);
                  }}
                />
              </Section>
            </div>

            {/* ACTIVITY FEED */}
            {/* <div */}
            {/*   style={{ */}
            {/*     width: 280, */}
            {/*     flexShrink: 0, */}
            {/*     borderLeft: "1px solid #e9ebf0", */}
            {/*     background: "#fff", */}
            {/*     display: "flex", */}
            {/*     flexDirection: "column", */}
            {/*     overflow: "hidden", */}
            {/*   }} */}
            {/* > */}
            {/*   <div */}
            {/*     style={{ */}
            {/*       display: "flex", */}
            {/*       alignItems: "center", */}
            {/*       justifyContent: "space-between", */}
            {/*       padding: "12px 14px", */}
            {/*       borderBottom: "1px solid #e9ebf0", */}
            {/*       background: "#fafbfc", */}
            {/*       flexShrink: 0, */}
            {/*     }} */}
            {/*   > */}
            {/*     <span */}
            {/*       style={{ */}
            {/*         fontSize: 12.5, */}
            {/*         fontWeight: 500, */}
            {/*         color: "#1c1f2e", */}
            {/*         display: "flex", */}
            {/*         alignItems: "center", */}
            {/*         gap: 6, */}
            {/*       }} */}
            {/*     > */}
            {/*       <LiveDot /> Activity */}
            {/*     </span> */}
            {/*     <Btn onClick={simulateActivity}>Simulate</Btn> */}
            {/*   </div> */}
            {/*   <div className="feed-scroll"> */}
            {/*     {feed.map((f, i) => ( */}
            {/*       <div */}
            {/*         key={i} */}
            {/*         style={{ */}
            {/*           display: "flex", */}
            {/*           alignItems: "flex-start", */}
            {/*           gap: 8, */}
            {/*           padding: "10px 13px", */}
            {/*           borderBottom: "1px solid #f3f5f9", */}
            {/*         }} */}
            {/*       > */}
            {/*         <div */}
            {/*           style={{ */}
            {/*             width: 7, */}
            {/*             height: 7, */}
            {/*             borderRadius: "50%", */}
            {/*             background: f.col, */}
            {/*             flexShrink: 0, */}
            {/*             marginTop: 4, */}
            {/*           }} */}
            {/*         /> */}
            {/*         <div style={{ flex: 1, minWidth: 0 }}> */}
            {/*           <div */}
            {/*             style={{ */}
            {/*               fontSize: 12, */}
            {/*               fontWeight: 500, */}
            {/*               color: "#1c1f2e", */}
            {/*             }} */}
            {/*           > */}
            {/*             {f.job} */}
            {/*           </div> */}
            {/*           <div */}
            {/*             style={{ */}
            {/*               fontSize: 11.5, */}
            {/*               color: "#6b7280", */}
            {/*               marginTop: 1, */}
            {/*               lineHeight: 1.4, */}
            {/*             }} */}
            {/*           > */}
            {/*             {f.msg} */}
            {/*           </div> */}
            {/*           <div */}
            {/*             style={{ */}
            {/*               fontSize: 10.5, */}
            {/*               color: "#c2c8d4", */}
            {/*               marginTop: 3, */}
            {/*             }} */}
            {/*           > */}
            {/*             {f.ts} */}
            {/*           </div> */}
            {/*         </div> */}
            {/*       </div> */}
            {/*     ))} */}
            {/*   </div> */}
            {/* </div> */}
          </div>
        </div>
      </div>

      {/* MODALS */}
      <DetailFormModal
        open={modal === "edit"}
        onClose={() => setModal(null)}
        title="Edit Cron"
        footer={
          <>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <BtnPrimary onClick={saveEdit}>Save changes</BtnPrimary>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UiInput
            label="Job Name"
            icon={<Tag />}
            value={editForm.name}
            placeholder="e.g. Log Rotation — Hot to Cold"
            onChange={(e) =>
              setEditForm((f) => ({ ...f, name: e.target.value }))
            }
          />

          <UiInput
            label="Grace Period (seconds)"
            icon={<Timer />}
            type="number"
            value={editForm.grace}
            minValue={0}
            placeholder="60"
            onChange={(e) =>
              setEditForm((f) => ({ ...f, grace: e.target.value }))
            }
          />

          <SingleSelect
            label="Cron Preset"
            icon={<Clock />}
            options={CRON_PRESETS.map((p) => ({
              value: p.label,
              label: p.label,
            }))}
            value={editCronPreset}
            placeholder="Select preset…"
            onChange={(e) => handleEditPresetChange(e.target.value)}
          />

          <UiInput
            label="Cron Expression"
            icon={<Clock />}
            value={editForm.cron}
            placeholder="0 * * * *"
            onChange={(e) => {
              setEditForm((f) => ({ ...f, cron: e.target.value }));
              setEditCronPreset("");
            }}
          />

          <UiInput
            className="md:col-span-2"
            label="Description"
            icon={<AlignLeft />}
            value={editForm.desc}
            placeholder="Brief description of what this job does…"
            onChange={(e) =>
              setEditForm((f) => ({ ...f, desc: e.target.value }))
            }
          />

          <UiInput
            label="Frequency Label"
            icon={<Calendar />}
            value={editForm.frequencyLabel}
            placeholder="e.g. Every hour"
            onChange={(e) =>
              setEditForm((f) => ({
                ...f,
                frequencyLabel: e.target.value,
              }))
            }
          />

          <AvatarSelect
            label="Responsible Person"
            icon={<User />}
            placeholder={loadingMembers ? "Loading…" : "Select owner…"}
            options={memberOptions}
            value={editForm.owner}
            onChange={(val) => setEditForm((f) => ({ ...f, owner: val }))}
            disabled={loadingMembers}
          />
        </div>
      </DetailFormModal>

      <DetailFormModal
        open={modal === "run"}
        onClose={() => setModal(null)}
        title="Run Now"
        footer={
          <>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <BtnPrimary onClick={confirmRunNow}>Run now</BtnPrimary>
          </>
        }
      >
        <div className="flex gap-4 items-start">
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: "#eff4ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <RefreshCw size={20} stroke="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: 14, color: "#1c1f2e", marginBottom: 4 }}>
              Trigger a manual run?
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
              This runs <b style={{ color: "#1c1f2e" }}>{jobName}</b>{" "}
              immediately, outside its schedule. The next scheduled run is
              unaffected.
            </div>
          </div>
        </div>
      </DetailFormModal>

      <DetailFormModal
        open={modal === "pause"}
        onClose={() => setModal(null)}
        title={isPaused ? "Resume Cron" : "Pause Cron"}
        footer={
          <>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            {isPaused ? (
              <BtnGreen onClick={confirmPause}>Resume</BtnGreen>
            ) : (
              <BtnAmber onClick={confirmPause}>Pause</BtnAmber>
            )}
          </>
        }
      >
        <div className="flex gap-4 items-start">
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: isPaused ? "#f0fdf4" : "#fffbeb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {isPaused ? (
              <Play size={20} stroke="#16a34a" />
            ) : (
              <Pause size={20} stroke="#d97706" />
            )}
          </div>
          <div>
            <div style={{ fontSize: 14, color: "#1c1f2e", marginBottom: 4 }}>
              {isPaused ? "Resume this cron?" : "Pause this cron?"}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
              {isPaused
                ? "Scheduled runs and alerts resume immediately. The next run fires at the next matching schedule time."
                : "While paused, scheduled runs are skipped and no alerts are sent. You can resume it at any time."}
            </div>
          </div>
        </div>
      </DetailFormModal>

      <DetailFormModal
        open={modal === "secret"}
        onClose={() => setModal(null)}
        title="Regenerate Heartbeat Secret"
        footer={
          <>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <BtnRed onClick={regenSecret}>Regenerate secret</BtnRed>
          </>
        }
      >
        <div className="flex gap-4 items-start">
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 12,
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, color: "#1c1f2e", marginBottom: 4 }}>
              Regenerate the secret token?
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
              The current heartbeat URL stops working immediately. Update any
              service that pings this cron with the new URL, or runs will be
              flagged as missed.
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
            New heartbeat URL (preview)
          </div>
          <div
            style={{
              background: "#1c1f2e",
              borderRadius: 8,
              padding: "9px 12px",
              fontFamily: "'DM Mono',monospace",
              fontSize: 11.5,
              color: "#86efac",
            }}
          >
            https://hb.syberfort.io/ping/cron_8f3a91?s=••••••
          </div>
        </div>
      </DetailFormModal>

      <Toast message={toastMsg} />

      <AlertDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        type="danger"
        title={`Delete "${data?.name ?? "this cron job"}"?`}
        description="This action is permanent and cannot be undone."
        itemName="Delete"
        isLoading={deleteCronJob.isPending}
        handleOnClick={async () => {
          await deleteCronJob.mutateAsync(id);
          setDeleteDialogOpen(false);
          navigate("/dashboard/cron-monitor");
        }}
      />
    </>
  );
}
