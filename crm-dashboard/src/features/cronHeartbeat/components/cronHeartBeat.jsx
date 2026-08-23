import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Calendar,
  Copy,
  Download,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Pause,
  Activity,
  Shield,
  Bell,
  RefreshCw,
  Eye,
  VolumeX,
  AlertCircle,
  XCircle,
  Check,
  X,
  Tag,
  Timer,
  Link,
  AlignLeft,
  User,
} from "lucide-react";

// ─── Shared UI — identical imports to apiDashboard.jsx ────────────────────────
import PageHeader from "../../../components/ui/PageHeader";
import { Section } from "../../../components/ui/Section";
import { InfoCard } from "../../../components/ui/InfoCard";
import { StatCard } from "../../../components/ui/StatCard3.jsx";
import Modal from "../../../components/ui/Modal";
import FormModal from "../../../components/ui/FormModal";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { Button } from "../../../components/ui/Button.jsx";

// ─── Column definitions — same pattern as getDownApisColumns ─────────────────
import { getCronHistoryColumns } from "./cronhistorycolumns.jsx";

// ─── Data hook ────────────────────────────────────────────────────────────────
import {
  useCronHeartbeat,
  fmtSecs as fmtSecsHook,
} from "../hooks/useHeartBeat.js";

import { useCreateCronJobMutation } from "../hooks/query/useCreateCronJobMutation.js";
import { useToggleCronJobMutation } from "../hooks/query/useToggleCronJobMutation.js";
import { useCronJobSummaryQuery } from "../hooks/query/useCronJobSummaryQuery.js";
import { useCronJobsQuery } from "../hooks/query/useCronJobsQuery.js";

import UiInput from "../../../components/ui/Input";
import SingleSelect from "../../../components/ui/SingleSelect";
import { TextareaField } from "../../../components/ui/TextArea";
import AvatarSelect from "../../../components/ui/AvatarSelect";
import { useTeamMembersQuery } from "../../categories/hooks/query/useTeamMembersQuery";
import { useNavigate } from "react-router-dom";
import { isValidUrl } from "../../../utils/helpers";

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

// ─── Alias ───────────────────────────────────────────────────────────────────
const fmtSecs = fmtSecsHook;

// ─── Status config (shared across sub-components) ────────────────────────────
const STATUS_CFG = {
  ok: {
    color: "#16a34a",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    label: "On Time",
  },
  late: {
    color: "#d97706",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    label: "Late",
  },
  missing: {
    color: "#dc2626",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    label: "Missing",
  },
  paused: {
    color: "#6b7280",
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
    label: "Paused",
  },
};

// ─── Micro-components (same pattern as apiDashboard's LiveDot, ApiBadge) ──────
const LiveDot = () => (
  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
);

function StatusBadge({ status }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.paused;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${s.bg} ${s.text} ${s.border}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: s.color }}
      />
      {s.label}
    </span>
  );
}

// ─── Countdown Arc SVG ────────────────────────────────────────────────────────
function CountdownArc({ pct, color, nextIn, status, nextInDisplay }) {
  const r = 22,
    cx = 28,
    cy = 28,
    circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const val = nextInDisplay ?? nextIn;
  const display =
    status === "missing"
      ? { val: "!", unit: "" }
      : status === "paused"
        ? { val: "⏸", unit: "" }
        : val > 3600
          ? { val: Math.floor(val / 3600), unit: "hr" }
          : val > 60
            ? { val: Math.floor(val / 60), unit: "min" }
            : { val: val, unit: "sec" };
  return (
    <div className="relative w-[56px] h-[56px] flex-shrink-0">
      <svg
        viewBox="0 0 56 56"
        className="absolute inset-0 w-full h-full"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#f0f2f7"
          strokeWidth="5"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ color }}
      >
        <span className="font-mono text-[12px] font-medium leading-none">
          {display.val}
        </span>
        {display.unit && (
          <span className="text-[9px] text-[#6b7280] mt-px">
            {display.unit}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Ping Strip ───────────────────────────────────────────────────────────────
function PingStrip({ job }) {
  const bars = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => {
        if (job.status === "missing" && i >= 28) return "#dc2626";
        if (job.status === "late" && i === 29) return "#d97706";
        const r = Math.random();
        if (r < 0.01 && job.uptime30 < 99) return "#dc2626";
        if (r < 0.03 && job.uptime30 < 99) return "#d97706";
        return "#16a34a";
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [job.id],
  );
  return (
    <div className="flex gap-[2.5px] items-end h-[22px]">
      {bars.map((color, i) => {
        const h = Math.max(4, Math.round(Math.random() * 16) + 4);
        return (
          <div
            key={i}
            className="w-[7px] rounded-t-sm flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
            style={{ height: h, background: color, opacity: 0.8 }}
          />
        );
      })}
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onToggle, onDrill }) {
  const [copied, setCopied] = useState(false);
  const s = STATUS_CFG[job.status] ?? STATUS_CFG.paused;
  const pct =
    job.enabled && job.interval > 0
      ? Math.min(
          100,
          Math.max(0, ((job.interval - job.nextIn) / job.interval) * 100),
        )
      : 0;
  const borderColor =
    job.status === "ok"
      ? "#16a34a"
      : job.status === "late"
        ? "#d97706"
        : job.status === "missing"
          ? "#dc2626"
          : "#d1d5db";

  console.log("job", job);
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/dashboard/cron-monitor/${job.id}`)}
      className={`bg-white border border-[#e9ebf0] rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${s.bg}`}
      style={{
        borderLeft: `4px solid ${borderColor}`,
        opacity: job.status === "paused" ? 0.8 : 1,
        background: "white",
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div
          className={`w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0 ${s.bg}`}
        >
          <Calendar size={17} style={{ color: s.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-medium text-[#1c1f2e] truncate">
            {job.name}
          </div>
          <div className="text-[11px] text-[#6b7280] font-mono mt-0.5">
            {job.cronHuman} · {job.cron}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge status={job.status} />
          <label
            className="relative w-[34px] h-[18px] cursor-pointer flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={job.enabled}
              onChange={(e) => onToggle?.(job.id, e.target.checked)}
            />
            <div
              className={`absolute inset-0 rounded-full transition-colors ${job.enabled ? "bg-emerald-500" : "bg-gray-200"}`}
            />
            <div
              className={`absolute top-[3px] w-3 h-3 bg-white rounded-full shadow transition-transform ${job.enabled ? "left-[19px]" : "left-[3px]"}`}
            />
          </label>
        </div>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-3">
        {job.status === "missing" && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-[12px] text-red-600">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
            No ping received
          </div>
        )}

        <div className="flex items-center gap-3">
          <CountdownArc
            pct={pct}
            color={s.color}
            nextIn={job.nextIn}
            status={job.status}
            nextInDisplay={job.nextInDisplay}
          />
          <div className="flex-1">
            <div className="text-[11.5px] text-[#6b7280] mb-1">
              {job.status === "ok"
                ? "Next ping in"
                : job.status === "late"
                  ? "Overdue by"
                  : job.status === "missing"
                    ? "Alert triggered -CS-"
                    : "Paused"}
            </div>
            <div
              className="text-[12.5px] font-mono font-medium"
              style={{ color: s.color }}
            >
              {job.status === "ok"
                ? fmtSecs(job.nextIn)
                : job.status === "late"
                  ? `+${fmtSecs(job.overdueBy)}`
                  : job.status === "missing"
                    ? job.missingSince
                    : "—"}
            </div>
            <div className="text-[11px] text-[#6b7280] mt-1">
              Last ping:{" "}
              <span className="text-[#1c1f2e]">
                {fmtSecs(job.lastPing)} ago
              </span>
            </div>
            <div className="text-[11px] text-[#6b7280]">
              Grace: <span className="text-[#1c1f2e]">{job.grace}s</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] text-[#6b7280] mb-1.5">Last 30 pings</div>
          <PingStrip job={job} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {[
            {
              val: `${job.uptime30}%`,
              label: "30d uptime",
              color: job.uptime30 < 99 ? "text-amber-600" : "text-emerald-600",
            },
            { val: "-CS-", label: "Avg duration", color: "text-[#1c1f2e]" },
            {
              val: job.totalPings.toLocaleString(),
              label: "Total pings",
              color: "text-[#1c1f2e]",
            },
          ].map(({ val, label, color }) => (
            <div
              key={label}
              className="px-2 py-1.5 bg-[#f8f9fc] border border-[#e9ebf0] rounded-lg"
            >
              <div className={`font-mono text-[13px] mb-0.5 ${color}`}>
                {val}
              </div>
              <div className="text-[10px] text-[#6b7280]">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-[#f8f9fc] border border-[#e9ebf0] rounded-lg">
          <span className="font-mono text-[10.5px] text-[#6b7280] flex-1 truncate">
            {job.pingUrl}
          </span>
          <button
            className={`w-[22px] h-[22px] flex items-center justify-center rounded border transition-colors flex-shrink-0 ${copied ? "bg-green-500 border-green-500 text-white" : "border-[#e9ebf0] bg-white text-[#6b7280] hover:border-[#2563eb] hover:text-[#2563eb]"}`}
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard?.writeText(job.pingUrl).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ping Activity Canvas Chart ───────────────────────────────────────────────
function PingActivityChart() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || 700;
    canvas.width = W;
    const H = canvas.height;
    const pts = 72;
    const ok = Array.from({ length: pts }, () =>
      Math.round(Math.random() * 8 + 4),
    );
    const late = Array.from({ length: pts }, (_, i) =>
      i > 60 ? Math.round(Math.random() * 3) : Math.round(Math.random() * 1),
    );
    const miss = Array.from({ length: pts }, (_, i) => (i >= 68 ? 1 : 0));
    ctx.clearRect(0, 0, W, H);
    [2, 4, 6, 8, 10].forEach((v) => {
      const y = H - (v / 12) * (H - 16) - 8;
      ctx.strokeStyle = "#f0f2f7";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.fillStyle = "#c2c8d4";
      ctx.font = "10px DM Mono,monospace";
      ctx.fillText(v, 4, y - 2);
    });
    const barW = Math.max(2, Math.floor(W / pts) - 1);
    ok.forEach((v, i) => {
      const x = (i / pts) * W;
      const hOk = (v / 12) * (H - 16);
      const hLate = (late[i] / 12) * (H - 16);
      const hMiss = (miss[i] / 12) * (H - 16) + (miss[i] ? 8 : 0);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(x, H - 8 - hOk, barW, hOk);
      if (late[i]) {
        ctx.fillStyle = "#d97706";
        ctx.fillRect(x, H - 8 - hOk - hLate, barW, hLate);
      }
      if (miss[i]) {
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(x, H - 8 - hOk - hLate - hMiss, barW, hMiss);
      }
      ctx.globalAlpha = 1;
    });
  }, []);
  return (
    <div>
      <canvas
        ref={canvasRef}
        height={100}
        style={{ width: "100%", display: "block" }}
      />
      <div className="flex justify-between mt-1.5">
        {["6h ago", "5h", "4h", "3h", "2h", "1h", "Now"].map((l) => (
          <span key={l} className="text-[11px] text-[#6b7280]">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Job Drill-down Modal (same pattern as apiDashboard's drillOpen modal) ────
function JobDrillModal({ job, open, onClose, onAlert, onRestart, onActions }) {
  const [copied, setCopied] = useState(false);
  const drillBars = useRef(
    Array.from({ length: 30 }, () => {
      const r = Math.random();
      return r < 0.05 ? "missing" : r < 0.1 ? "late" : "ok";
    }),
  ).current;
  if (!job) return null;
  const s = STATUS_CFG[job.status] ?? STATUS_CFG.paused;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={job.name}
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            icon={<Bell size={12} />}
            onClick={() => {
              onAlert?.(job);
              onClose();
            }}
          >
            Alert
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw size={12} />}
            onClick={() => {
              onRestart?.(job);
              onClose();
            }}
          >
            Restart
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onActions?.(job);
              onClose();
            }}
          >
            Actions
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              l: "Uptime",
              v: `${job.uptime30}%`,
              cls: job.uptime30 < 99 ? "text-amber-600" : "text-emerald-600",
            },
            { l: "Avg Dur", v: job.avgDur, cls: "text-[#1c1f2e]" },
            {
              l: "Pings",
              v: job.totalPings.toLocaleString(),
              cls: "text-blue-600",
            },
            { l: "Grace", v: `${job.grace}s`, cls: "text-[#6b7280]" },
          ].map((x) => (
            <div
              key={x.l}
              className="p-3 bg-[#f8f9fc] rounded-lg border border-[#e9ebf0] text-center"
            >
              <p
                className={`text-[18px] font-light ${x.cls}`}
                style={{ fontFamily: "'Outfit',sans-serif" }}
              >
                {x.v}
              </p>
              <p className="text-[11px] text-[#6b7280] mt-1">{x.l}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={job.status} />
          <span className="font-mono text-[12px] text-[#6b7280]">
            {job.cron}
          </span>
          <span className="text-[12px] text-[#6b7280]">· {job.cronHuman}</span>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#6b7280] mb-2">
            Ping Timeline (last 30)
          </p>
          <div className="flex gap-[2px] h-[18px]">
            {drillBars.map((b, i) => (
              <div
                key={i}
                className="flex-1 min-w-[5px] rounded-sm"
                style={{
                  background:
                    b === "ok"
                      ? "#16a34a"
                      : b === "late"
                        ? "#d97706"
                        : "#dc2626",
                }}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#6b7280] mb-2">
            Ping URL
          </p>
          <div className="flex items-center gap-3 bg-[#1c1f2e] rounded-lg px-3 py-2.5">
            <span className="font-mono text-[12px] text-emerald-300 flex-1 truncate">
              {job.pingUrl}
            </span>
            <button
              className={`transition-colors ${copied ? "text-green-400" : "text-emerald-400 hover:text-emerald-300"}`}
              onClick={() => {
                navigator.clipboard?.writeText(job.pingUrl).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        </div>
        {job.status === "missing" && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
            <XCircle size={14} className="text-red-500 flex-shrink-0" />
            <span className="text-[12.5px] text-red-600">
              No ping for <strong>{job.missingSince}</strong> — incident
              triggered
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Job Actions Modal (same pattern as apiDashboard's actionsOpen modal) ─────
function JobActionsModal({ job, open, onClose, onShowToast }) {
  if (!job) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Actions — ${job.name}`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onShowToast?.("Saved");
            }}
          >
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: <RefreshCw size={17} className="text-emerald-600" />,
              label: "Restart Check",
              msg: "Check restarted",
            },
            {
              icon: <Bell size={17} className="text-blue-600" />,
              label: "Send Alert",
              msg: "Alert sent",
            },
            {
              icon: <AlertCircle size={17} className="text-red-600" />,
              label: "Open Incident",
              msg: "Incident opened",
            },
            {
              icon: <Eye size={17} className="text-cyan-600" />,
              label: "View Logs",
              msg: "Opening logs…",
            },
            {
              icon: <Copy size={17} className="text-[#6b7280]" />,
              label: "Copy Ping URL",
              msg: "Ping URL copied",
            },
            {
              icon: <VolumeX size={17} className="text-[#6b7280]" />,
              label: "Mute Alerts",
              msg: "Alerts muted",
            },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => {
                onShowToast?.(a.msg);
                onClose();
              }}
              className="flex flex-col items-center gap-1.5 p-3 bg-white border border-[#e9ebf0] rounded-lg cursor-pointer text-[12.5px] text-[#1c1f2e] hover:bg-blue-50 hover:border-blue-300 transition-colors font-[inherit]"
            >
              {a.icon}
              <span>{a.label}</span>
            </button>
          ))}
        </div>
        <div>
          <p className="text-[12px] text-[#6b7280] mb-1">Assign Owner</p>
          <select
            className="w-full border border-[#e9ebf0] rounded-lg px-3 py-2 text-[13px] text-[#1c1f2e] bg-white outline-none"
            style={{ fontFamily: "inherit" }}
          >
            <option>Pipeline Team</option>
            <option>Storage Team</option>
            <option>Monitoring Team</option>
            <option>Security Team</option>
          </select>
        </div>
        <div>
          <p className="text-[12px] text-[#6b7280] mb-1">Notes</p>
          <textarea
            className="w-full border border-[#e9ebf0] rounded-lg px-3 py-2 text-[13px] text-[#1c1f2e] bg-white outline-none resize-y"
            rows={2}
            placeholder="Add notes…"
          />
        </div>
      </div>
    </Modal>
  );
}

// ─── New Cron Job Modal ───────────────────────────────────────────────────────
function NewJobModal({ open, onClose, onSave }) {
  const createCronJob = useCreateCronJobMutation();
  const { data: teamMembers = [], isLoading: loadingMembers } =
    useTeamMembersQuery();

  const [name, setName] = useState("");
  const [cronExpression, setCronExpression] = useState("0 * * * *");
  const [frequencyLabel, setFrequencyLabel] = useState("Hourly");
  const [grace, setGrace] = useState("60");
  const [targetUrl, setTargetUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");

  const [cronPreset, setCronPreset] = useState("Every hour");
  const [nameErr, setNameErr] = useState(false);
  const [cronErr, setCronErr] = useState(false);
  const [graceErr, setGraceErr] = useState(false);
  const [freqErr, setFreqErr] = useState(false);
  const [urlErr, setUrlErr] = useState(false);
  const [ownerErr, setOwnerErr] = useState(false);

  const memberOptions = useMemo(
    () =>
      teamMembers.map((m) => ({
        value: m._id,
        label: m.name,
        sub: m.email,
        image: m.image_url || m.avatar,
      })),
    [teamMembers],
  );

  const handlePresetChange = (label) => {
    setCronPreset(label);
    if (label) {
      const preset = CRON_PRESETS.find((p) => p.label === label);
      if (preset) {
        setCronExpression(preset.cron);
        setFrequencyLabel(preset.freq);
        setCronErr(false);
      }
    }
  };

  const handleSubmit = () => {
    const nameOk = name.trim().length > 0;
    const cronOk = cronExpression.trim().length > 0;
    const graceOk = grace.trim().length > 0 && parseInt(grace, 10) > 0;
    const freqOk = frequencyLabel.trim().length > 0;
    const urlOk =
      targetUrl.trim().length > 0 &&
      isValidUrl(
        targetUrl.trim().startsWith("http")
          ? targetUrl.trim()
          : `https://${targetUrl.trim()}`,
      );
    const ownerOk = !!owner;
    setNameErr(!nameOk);
    setCronErr(!cronOk);
    setGraceErr(!graceOk);
    setFreqErr(!freqOk);
    setUrlErr(!urlOk);
    setOwnerErr(!ownerOk);
    if (!nameOk || !cronOk || !graceOk || !freqOk || !urlOk || !ownerOk) return;

    const payload = {
      name: name.trim(),
      cronExpression: cronExpression.trim(),
      ...(frequencyLabel.trim() && { frequencyLabel: frequencyLabel.trim() }),
      grace: parseInt(grace, 10),
      ...(targetUrl.trim() && { targetUrl: targetUrl.trim() }),
      ...(notes.trim() && { notes: notes.trim() }),
      ...(description.trim() && { description: description.trim() }),
      ...(owner && { owner }),
      ...(tags.trim() && {
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    };

    createCronJob.mutate(payload, {
      onSuccess: (job) => {
        onSave?.(job);
        onClose();
      },
      onError: () => {
        setNameErr(true);
      },
    });
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="New Cron / Heartbeat Job"
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={createCronJob.isPending}
            className="form-modal-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createCronJob.isPending}
            className="form-modal-btn form-modal-btn-primary"
          >
            {createCronJob.isPending ? "Creating…" : "Register Job"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
          <UiInput
            label="Job Name"
            required
            icon={<Tag />}
            error={nameErr ? "Job name is required" : ""}
            value={name}
            placeholder="e.g. Log Rotation — Hot to Cold"
            onChange={(e) => {
              setName(e.target.value);
              setNameErr(false);
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SingleSelect
              label="Cron Preset"
              icon={<Clock />}
              options={CRON_PRESETS.map((p) => ({
                value: p.label,
                label: p.label,
              }))}
              value={cronPreset}
              placeholder="Select preset…"
              onChange={(e) => handlePresetChange(e.target.value)}
            />

            <UiInput
              label="Grace Period (seconds)"
              icon={<Timer />}
              type="number"
              value={grace}
              minValue={0}
              placeholder="60"
              required
              error={graceErr ? "Grace period is required" : ""}
              onChange={(e) => {
                setGrace(e.target.value);
                setGraceErr(false);
              }}
            />

            <UiInput
              label="Cron Expression"
              required
              icon={<Clock />}
              error={cronErr ? "Cron expression is required" : ""}
              value={cronExpression}
              placeholder="0 * * * *"
              onChange={(e) => {
                setCronExpression(e.target.value);
                setCronErr(false);
              }}
            />

            <AvatarSelect
              label="Responsible Person"
              required
              icon={<User />}
              placeholder={loadingMembers ? "Loading…" : "Select owner…"}
              options={memberOptions}
              value={owner}
              onChange={(val) => {
                setOwner(val);
                setOwnerErr(false);
              }}
              disabled={loadingMembers}
              error={ownerErr ? "Responsible person is required" : ""}
            />
          </div>
          <UiInput
            label="Frequency Label"
            icon={<Calendar />}
            value={frequencyLabel}
            placeholder="e.g. Every hour"
            required
            error={freqErr ? "Frequency label is required" : ""}
            onChange={(e) => {
              setFrequencyLabel(e.target.value);
              setFreqErr(false);
            }}
          />
          <UiInput
            label="Target URL"
            icon={<Link />}
            value={targetUrl}
            placeholder="https://example.com/healthcheck"
            required
            error={
              urlErr
                ? "A valid URL starting with http:// or https:// is required"
                : ""
            }
            onChange={(e) => {
              setTargetUrl(e.target.value);
              setUrlErr(false);
            }}
          />
          <TextareaField
            label="Description"
            icon={<AlignLeft />}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of what this job does…"
            rows={2}
          />
          <div className="grid grid-cols-1 gap-3">
            <UiInput
              label="Tags"
              icon={<Tag />}
              value={tags}
              placeholder="pipeline, storage, critical"
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>
    </FormModal>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getIntervalFromCron(cron) {
  const parts = (cron || "").split(/\s+/);
  if (parts.length < 5) return 3600;
  const [min, hour, dom, mon, dow] = parts;
  if (min.startsWith("*/")) return parseInt(min.slice(2), 10) * 60;
  if (hour.startsWith("*/")) return parseInt(hour.slice(2), 10) * 3600;
  if (min === "*" && hour === "*" && dom === "*" && mon === "*" && dow === "*")
    return 60;
  if (hour === "*" && dom === "*" && mon === "*" && dow === "*") return 3600;
  if (dom === "*" && mon === "*" && dow !== "*") return 604800;
  if (dom === "*" && mon === "*") return 86400;
  if (mon === "*") return 2592000;
  return 3600;
}

function toJobCard(job) {
  const now = Date.now();
  const lastPingAt = job.lastPingAt ? new Date(job.lastPingAt).getTime() : null;
  const nextExpectedAt = job.nextExpectedAt
    ? new Date(job.nextExpectedAt).getTime()
    : null;
  const overdueAt = job.overdueAt ? new Date(job.overdueAt).getTime() : null;

  const lastPing = lastPingAt ? Math.floor((now - lastPingAt) / 1000) : 0;
  const nextIn = nextExpectedAt
    ? Math.max(0, Math.floor((nextExpectedAt - now) / 1000))
    : 0;
  const interval = getIntervalFromCron(job.cronExpression);

  let nextInDisplay = nextIn;
  if (job.status === "late" && nextExpectedAt && interval > 0) {
    const elapsed = now - nextExpectedAt;
    const intervalsMissed = Math.ceil(elapsed / (interval * 1000));
    const nextExpectedTime = nextExpectedAt + intervalsMissed * interval * 1000;
    nextInDisplay = Math.max(0, Math.floor((nextExpectedTime - now) / 1000));
  }

  const statusMap = {
    on_time: "ok",
    late: "late",
    missing: "missing",
    paused: "paused",
    pending: "ok",
  };
  const avgDur =
    job.stats?.avgDuration30d != null ? fmtSecs(job.stats.avgDuration30d) : "—";

  return {
    id: job._id,
    name: job.name,
    desc: job.notes || "",
    cron: job.cronExpression,
    cronHuman: job.frequencyLabel || job.cronExpression,
    interval,
    grace: job.grace ?? 60,
    status: statusMap[job.status] || "ok",
    lastPing,
    nextIn,
    nextInDisplay,
    enabled: !job.isPaused,
    uptime30: job.stats?.uptime30d ?? 100,
    avgDur,
    totalPings: job.totalPings ?? 0,
    pingUrl: job.pingUrl || "",
    missingSince:
      overdueAt && job.status === "missing"
        ? fmtSecs(Math.floor((now - overdueAt) / 1000))
        : undefined,
    overdueBy: overdueAt
      ? Math.floor((now - overdueAt) / 1000)
      : Math.max(0, lastPing - interval),
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CronHeartbeatMonitor() {
  // ── Data from hooks ─────────────────────────────────────────────────────────
  // const { jobsSeed, feedPool, historyData, stats } = useCronHeartbeat();
  const { data: summary } = useCronJobSummaryQuery();
  const { data: jobsRaw, isLoading: jobsLoading } = useCronJobsQuery();
  const toggleCronJob = useToggleCronJobMutation();

  // ── State ───────────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState([]);
  const [feed, setFeed] = useState([]);
  const [pingsToday, setPingsToday] = useState(summary?.pingsToday || 0);
  const feedIdxRef = useRef(0);

  useEffect(() => {
    const arr = Array.isArray(jobsRaw) ? jobsRaw : [];
    if (arr.length) setJobs(arr.map(toJobCard));
  }, [jobsRaw]);

  const [searchQuery, setSearchQuery] = useState("");

  // Modals — same pattern as apiDashboard
  const [newJobOpen, setNewJobOpen] = useState(false);
  const [drillJob, setDrillJob] = useState(null);
  const [drillOpen, setDrillOpen] = useState(false);
  const [actionsJob, setActionsJob] = useState(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [selectedHistRow, setSelectedHistRow] = useState(null);
  const [histDetailOpen, setHistDetailOpen] = useState(false);

  // Toast — identical to apiDashboard
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef();
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400);
  }, []);

  // Sync pingsToday when summary refreshes
  useEffect(() => {
    if (summary?.pingsToday !== undefined) {
      setPingsToday(summary.pingsToday);
    }
  }, [summary?.pingsToday]);

  // Seed feed
  // useEffect(() => {
  //   const now = new Date();
  //   const pad = (n) => String(n).padStart(2, "0");
  //   const ts = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  //   setFeed(
  //     feedPool
  //       .slice(0, 5)
  //       .reverse()
  //       .map((ev) => ({ ...ev, ts })),
  //   );
  // }, []); // eslint-disable-line

  // Live feed — same as apiDashboard's addFeedItem interval
  // const addFeedItem = useCallback(() => {
  //   const ev = feedPool[feedIdxRef.current % feedPool.length];
  //   feedIdxRef.current++;
  //   const now = new Date();
  //   const pad = (n) => String(n).padStart(2, "0");
  //   const ts = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  //   setFeed((prev) => [{ ...ev, ts }, ...prev.slice(0, 19)]);
  // }, [feedPool]);
  //
  // useEffect(() => {
  //   const t = setInterval(addFeedItem, 8000);
  //   return () => clearInterval(t);
  // }, [addFeedItem]);

  // Watchdog tick
  useEffect(() => {
    const t = setInterval(() => {
      setJobs((prev) =>
        prev.map((j) => {
          if (!j.enabled || j.status === "missing") return j;
          const nextIn = Math.max(0, j.nextIn - 5);
          const nextInDisplay = Math.max(0, (j.nextInDisplay ?? j.nextIn) - 5);
          const lastPing = (j.lastPing || 0) + 5;
          if (nextIn === 0 && j.status === "ok") {
            const reset = j.interval + (Math.random() - 0.5) * 10;
            return {
              ...j,
              lastPing: Math.round(Math.random() * 4),
              nextIn: reset,
              nextInDisplay: reset,
            };
          }
          return { ...j, nextIn, nextInDisplay, lastPing };
        }),
      );
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // Handlers
  const handleToggle = useCallback(
    (id, enabled) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id
            ? { ...j, enabled, status: enabled ? "ok" : "paused" }
            : j,
        ),
      );
      toggleCronJob.mutate(id);
      showToast(
        `${jobs.find((j) => j.id === id)?.name} ${enabled ? "enabled" : "paused"}`,
      );
    },
    [jobs, showToast, toggleCronJob],
  );

  // KPI counts
  const kpi = useMemo(
    () => ({
      ok: summary?.onTime ?? jobs.filter((j) => j.status === "ok").length,
      late: summary?.late ?? jobs.filter((j) => j.status === "late").length,
      missing:
        summary?.missing ?? jobs.filter((j) => j.status === "missing").length,
      paused:
        summary?.paused ?? jobs.filter((j) => j.status === "paused").length,
    }),
    [summary, jobs],
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div
        className="flex flex-col"
        style={{ height: "100vh", overflow: "hidden" }}
      >
        {/* ── 1. PAGE HEADER ── */}
        <PageHeader
          icon={<Calendar size={20} />}
          iconGradient=""
          title="Cron / Heartbeat Monitor"
          breadcrumbs={[
            { label: "dashboard", href: "/dashboard" },
            { label: "Cron Monitor", href: "/cron-monitor" },
          ]}
          actions={
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <div className="flex items-center gap-2 text-[12px] text-[#6b7280] bg-white border border-[#e9ebf0] rounded-lg px-3 py-[5px]">
                <LiveDot />
                Watchdog active · tick every{" "}
                <span className="font-mono text-[#1c1f2e] ml-0.5">5s</span>
              </div>
              <Button
                variant="primary"
                size="lg"
                icon={<Plus size={13} />}
                onClick={() => setNewJobOpen(true)}
              >
                New Cron Job
              </Button>
            </div>
          }
          extra={
            <div className="flex items-center gap-3 text-[11.5px]">
              <span className="flex items-center gap-1.5 text-red-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {kpi.missing} job{kpi.missing !== 1 ? "s" : ""} missing
              </span>
              <span className="text-[#e9ebf0]">·</span>
              <span className="text-[#6b7280]">
                {summary?.total ?? jobs.length} jobs tracked
              </span>
            </div>
          }
        />

        {/* ── Body ── */}
        <div className="flex mt-4 flex-1 overflow-hidden min-h-0">
          {/* ── Scrollable content ── */}
          <div
            className="flex-1 overflow-y-auto min-h-0"
            style={{ scrollbarWidth: "thin" }}
          >
            <div className="container-page pb-8">
              {/* ── 2. KPI STAT CARDS ── */}
              <Section>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                  <StatCard
                    icon={<CheckCircle size={20} stroke="#16a34a" />}
                    count={kpi.ok}
                    title="On Time"
                    countColor="text-emerald-600"
                  />
                  <StatCard
                    icon={<Clock size={20} stroke="#d97706" />}
                    count={kpi.late}
                    title="Late"
                    countColor="text-amber-600"
                  />
                  <StatCard
                    icon={<AlertTriangle size={20} stroke="#dc2626" />}
                    count={kpi.missing}
                    title="Missing"
                    countColor="text-red-600"
                  />
                  <StatCard
                    icon={<Pause size={20} stroke="#6b7280" />}
                    count={kpi.paused}
                    title="Paused"
                    countColor="text-[#6b7280]"
                  />
                  <StatCard
                    icon={<Activity size={20} stroke="#2563eb" />}
                    count={pingsToday.toLocaleString()}
                    title="Pings Today"
                    countColor="text-blue-600"
                  />
                  <StatCard
                    icon={<Shield size={20} stroke="#0891b2" />}
                    count={summary?.reliability30d}
                    title="30d Reliability"
                    countColor="text-emerald-600"
                  />
                </div>
              </Section>

              {/* ── 3. JOB CARDS ── */}
              <Section>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-[11px] uppercase tracking-[.1em] text-[#6b7280] flex items-center gap-2 flex-shrink-0">
                    Monitored Cron Jobs
                  </div>
                  <div className="flex-1 h-px bg-[#e9ebf0]" />
                  <div className="relative flex-shrink-0">
                    <Search
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b7280] pointer-events-none"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search cron jobs…"
                      className="pl-7 pr-3 py-[5px] text-[12.5px] border border-[#e9ebf0] rounded-lg bg-white text-[#1c1f2e] placeholder-[#a0aab4] outline-none focus:border-[#2563eb] transition-colors w-[200px]"
                    />
                  </div>
                </div>
                {jobsLoading ? (
                  <div
                    className="grid gap-[14px]"
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(340px, 1fr))",
                    }}
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white border border-[#e9ebf0] rounded-xl overflow-hidden animate-pulse"
                      >
                        <div className="flex items-start gap-3 px-4 py-3.5">
                          <div className="w-9 h-9 rounded-[9px] bg-gray-200 flex-shrink-0" />
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                            <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div className="h-4 w-12 bg-gray-200 rounded-full" />
                            <div className="h-[18px] w-[34px] bg-gray-200 rounded-full" />
                          </div>
                        </div>
                        <div className="px-4 pb-4 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-[56px] h-[56px] rounded-full bg-gray-200 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                              <div className="h-3 bg-gray-200 rounded w-1/3" />
                              <div className="h-2 bg-gray-100 rounded w-2/3" />
                              <div className="h-2 bg-gray-100 rounded w-1/4" />
                            </div>
                          </div>
                          <div className="h-[22px] bg-gray-100 rounded" />
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                            {Array.from({ length: 3 }).map((_, j) => (
                              <div
                                key={j}
                                className="h-12 bg-gray-100 rounded-lg"
                              />
                            ))}
                          </div>
                          <div className="h-8 bg-gray-100 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="grid gap-[14px]"
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(340px, 1fr))",
                    }}
                  >
                    {jobs
                      .filter((job) =>
                        job.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                      )
                      .map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onToggle={handleToggle}
                          onDrill={(j) => {
                            setDrillJob(j);
                            setDrillOpen(true);
                          }}
                        />
                      ))}
                  </div>
                )}
              </Section>

              {/* ── 4. PING ACTIVITY CHART ── */}
              {/* <Section> */}
              {/*   <InfoCard */}
              {/*     icon={<Activity size={16} className="text-[#6b7280]" />} */}
              {/*     title="Ping Activity — Last 6 hours" */}
              {/*     action={ */}
              {/*       <div className="flex items-center gap-3 text-[11.5px]"> */}
              {/*         {[ */}
              {/*           ["#16a34a", "On time"], */}
              {/*           ["#d97706", "Late"], */}
              {/*           ["#dc2626", "Missing"], */}
              {/*         ].map(([c, l]) => ( */}
              {/*           <span key={l} className="flex items-center gap-1"> */}
              {/*             <span */}
              {/*               className="w-2 h-2 rounded-sm" */}
              {/*               style={{ background: c }} */}
              {/*             /> */}
              {/*             {l} */}
              {/*           </span> */}
              {/*         ))} */}
              {/*       </div> */}
              {/*     } */}
              {/*   > */}
              {/*     <PingActivityChart /> */}
              {/*   </InfoCard> */}
              {/* </Section> */}

              {/* ── 5. PING HISTORY — NewTableConfig same as apiDashboard ── */}
            </div>
          </div>
          {/* /scrollable */}

          {/* ── LIVE FEED SIDE PANEL ── */}
          {/* <div className="w-[264px] flex-shrink-0 border-l border-[#e9ebf0] bg-white flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#e9ebf0] bg-[#fafbfc] flex-shrink-0">
              <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-[#1c1f2e]">
                <LiveDot />Live Ping Feed
              </div>
              <Button variant="outline" size="sm" onClick={() => { addFeedItem(); showToast("Ping simulated"); }}>
                Simulate
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-[#e9ebf0]" style={{ scrollbarWidth: "thin" }}>
              {feed.map((item, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2.5 hover:bg-[#f5f7ff] cursor-pointer transition-colors">
                  <div className="w-[7px] h-[7px] rounded-full flex-shrink-0 mt-1" style={{ background: item.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium text-[#1c1f2e] truncate">{item.job}</div>
                    <div className="text-[11.5px] text-[#6b7280] mt-px leading-snug">{item.msg}</div>
                    <div className="text-[10.5px] text-[#c2c8d4] mt-1">{item.ts}</div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>

      {/* ── MODALS ── */}
      <NewJobModal
        open={newJobOpen}
        onClose={() => setNewJobOpen(false)}
        onSave={(job) =>
          showToast(
            job
              ? `"${job.name}" created`
              : "Cron job registered — ping URL ready",
          )
        }
      />

      <JobDrillModal
        job={drillJob}
        open={drillOpen}
        onClose={() => setDrillOpen(false)}
        onAlert={(j) => showToast(`Alert sent for ${j.name}`)}
        onRestart={(j) => showToast(`Restarting ${j.name}…`)}
        onActions={(j) => {
          setActionsJob(j);
          setActionsOpen(true);
        }}
      />

      <JobActionsModal
        job={actionsJob}
        open={actionsOpen}
        onClose={() => setActionsOpen(false)}
        onShowToast={showToast}
      />

      <Modal
        open={histDetailOpen}
        onClose={() => setHistDetailOpen(false)}
        title="Ping Detail"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<Copy size={12} />}
              onClick={() => {
                showToast("Copied");
                setHistDetailOpen(false);
              }}
            >
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistDetailOpen(false)}
            >
              Close
            </Button>
          </>
        }
      >
        {selectedHistRow && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                { l: "Time", v: selectedHistRow.time },
                { l: "Job", v: selectedHistRow.job },
                { l: "Duration", v: selectedHistRow.dur },
                { l: "Latency", v: selectedHistRow.latency },
                { l: "IP", v: selectedHistRow.ip },
                { l: "Exit Code", v: selectedHistRow.exit },
              ].map((x) => (
                <div key={x.l}>
                  <p className="text-[12px] text-[#6b7280] mb-1">{x.l}</p>
                  <p className="text-[12.5px] text-[#1c1f2e] font-mono">
                    {x.v}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[12px] text-[#6b7280] mb-1">Status</p>
              <StatusBadge status={selectedHistRow.status} />
            </div>
          </div>
        )}
      </Modal>

      {/* ── TOAST ── */}
      <div
        className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-[#1c1f2e] text-white text-[13px] px-[18px] py-2.5 rounded-lg pointer-events-none transition-opacity duration-300 max-w-[360px] ${toastVisible ? "opacity-100" : "opacity-0"}`}
      >
        <CheckCircle size={12} className="text-emerald-300" />
        {toastMsg}
      </div>
    </>
  );
}
