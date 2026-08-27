// pages/CronMonitor/JobHistory.jsx
// Sources the job selector, run history, and charts from the already-real
// cron-job backend via the useJobHistory() composition hook (see
// ../hooks/useJobHistory.js). Layout matches the original mock:
//   PageHeader (full width) → [job sidebar] + [scrollable content]

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, CheckCircle, AlertTriangle, Activity,
  Zap, Play, Download, Copy, Pencil,
  Calendar,
} from "lucide-react";

// ─── Shared UI ────────────────────────────────────────────────────────────────
import PageHeader from "../../../components/ui/PageHeader";
import { InfoCard } from "../../../components/ui/InfoCard";
import { StatCard } from "../../../components/ui/StatCard3.jsx";
import Modal from "../../../components/ui/Modal";
import NewTableConfig from "../../../components/TableComponents/TableConfig";
import { Button } from "../../../components/ui/Button.jsx";

// ─── Columns ─────────────────────────────────────────────────────────────────
import { getJobHistoryColumns } from "./jobHistoryColumns.jsx";

// ─── Hook ─────────────────────────────────────────────────────────────────────
import { useJobHistory } from "../hooks/useJobHistory.js";
import { formatDuration } from "../../../utils/helpers.js";
import { exportPingRunsToCsv } from "../../../utils/exportCsv.js";

// ─── Status helpers — real CronJob.status enum ────────────────────────────────
const STATUS_CFG = {
  on_time: { color: "#16a34a", label: "On Time" },
  late: { color: "#d97706", label: "Late" },
  missing: { color: "#dc2626", label: "Missing" },
  paused: { color: "#6b7280", label: "Paused" },
  pending: { color: "#2563eb", label: "Pending" },
};

const STATUS_CLASSES = {
  on_time: "bg-emerald-50 text-emerald-700 border-emerald-200",
  late: "bg-amber-50 text-amber-700 border-amber-200",
  missing: "bg-red-50 text-red-700 border-red-200",
  paused: "bg-gray-100 text-gray-600 border-gray-200",
  pending: "bg-blue-50 text-blue-700 border-blue-200",
};

function StatusBadge({ status }) {
  const s = STATUS_CFG[status] ?? STATUS_CFG.paused;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_CLASSES[status] ?? STATUS_CLASSES.paused}`}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

// ─── Duration Chart — real ping durations (ms), p95 line from real stats ──────
function DurationChart({ runs, p95DurationMs }) {
  const canvasRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !runs.length) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth || 560;
    canvas.width = W;
    const H = canvas.height;
    const pts = Math.min(runs.length, 60);
    // runs arrives most-recent-first; reverse the slice for a left→right timeline.
    const slice = [...runs].slice(0, pts).reverse();
    const durs = slice.map((r) => r.durationMs);
    const p95 = p95DurationMs || Math.max(...durs, 1);
    const maxV = Math.max(...durs, p95) * 1.15 || 1;

    ctx.clearRect(0, 0, W, H);

    const p95y = H - (p95 / maxV) * (H - 20) - 10;
    ctx.setLineDash([4, 4]); ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, p95y); ctx.lineTo(W, p95y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#9ca3af"; ctx.font = "10px DM Mono, monospace";
    ctx.fillText("p95", W - 28, p95y - 3);

    [0.25, 0.5, 0.75, 1].forEach((r) => {
      const y = H - r * (H - 20) - 10;
      ctx.strokeStyle = "#f0f2f7"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.fillStyle = "#c2c8d4"; ctx.font = "10px DM Mono";
      ctx.fillText(formatDuration(maxV * r), 4, y - 2);
    });

    const bw = Math.max(2, W / pts - 2);
    slice.forEach((r, i) => {
      const x = (i / pts) * W;
      const h = Math.max(3, (r.durationMs / maxV) * (H - 20));
      const y = H - h - 10;
      const isUp = r.outcome === "success" || r.outcome === "late";
      const col = isUp ? (r.durationMs > p95 ? "#d97706" : "#16a34a") : "#dc2626";
      ctx.fillStyle = col; ctx.globalAlpha = 0.8;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, bw, h, 2); else ctx.rect(x, y, bw, h);
      ctx.fill(); ctx.globalAlpha = 1;
    });

    if (labelRef.current) {
      const labCount = 7;
      const labels = [];
      for (let i = 0; i < labCount; i++) {
        const idx = Math.floor((i / (labCount - 1)) * (pts - 1));
        const d = slice[idx]?.started;
        labels.push(d ? `${d.getMonth() + 1}/${d.getDate()}` : "");
      }
      labelRef.current.innerHTML = labels
        .map((l) => `<span style="font-size:11px;color:#6b7280">${l}</span>`)
        .join("");
    }
  }, [runs, p95DurationMs]);

  if (!runs.length) {
    return <div className="text-[12px] text-[#6b7280] py-8 text-center">No ping data in this range yet.</div>;
  }

  return (
    <div>
      <canvas ref={canvasRef} height={130} style={{ width: "100%", display: "block" }} />
      <div ref={labelRef} className="flex justify-between mt-1.5" />
    </div>
  );
}

// ─── Donut Chart — real outcome distribution ───────────────────────────────────
function DonutChart({ runs }) {
  const canvasRef = useRef(null);

  const segments = useMemo(() => {
    const total = runs.length || 1;
    const counts = { success: 0, late: 0, failed: 0, timeout: 0, running: 0 };
    runs.forEach((r) => { counts[r.outcome] = (counts[r.outcome] || 0) + 1; });
    return [
      { label: "Success", val: counts.success, col: "#16a34a" },
      { label: "Late", val: counts.late, col: "#d97706" },
      { label: "Failed", val: counts.failed, col: "#dc2626" },
      { label: "Timeout", val: counts.timeout, col: "#991b1b" },
      { label: "Running", val: counts.running, col: "#2563eb" },
    ].filter((s) => s.val > 0).map((s) => ({ ...s, pct: ((s.val / total) * 100).toFixed(1) }));
  }, [runs]);

  const successPct = useMemo(() => {
    const total = runs.length || 1;
    const success = runs.filter((r) => r.outcome === "success" || r.outcome === "late").length;
    return ((success / total) * 100).toFixed(1);
  }, [runs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !segments.length) return;
    const ctx = canvas.getContext("2d");
    const total = segments.reduce((a, s) => a + s.val, 0) || 1;
    const cx = 55, cy = 55, r = 44, inner = 28;
    ctx.clearRect(0, 0, 110, 110);
    let angle = -Math.PI / 2;
    segments.forEach((s) => {
      const sweep = (s.val / total) * 2 * Math.PI;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + sweep);
      ctx.closePath(); ctx.fillStyle = s.col; ctx.fill();
      angle += sweep;
    });
    ctx.beginPath(); ctx.arc(cx, cy, inner, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.fillStyle = "#1c1f2e";
    ctx.font = "bold 13px Outfit, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${successPct}%`, cx, cy + 3);
    ctx.font = "10px DM Sans, sans-serif";
    ctx.fillStyle = "#6b7280";
    ctx.fillText("arrived", cx, cy + 15);
  }, [segments, successPct]);

  if (!segments.length) {
    return <div className="text-[12px] text-[#6b7280] py-8 text-center">No ping data in this range yet.</div>;
  }

  return (
    <div className="flex items-center gap-5">
      <canvas ref={canvasRef} width={110} height={110} style={{ flexShrink: 0 }} />
      <div className="flex-1 flex flex-col gap-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-[10px] h-[10px] rounded-sm flex-shrink-0" style={{ background: s.col }} />
              <span className="text-[12px] text-[#6b7280]">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12.5px] font-medium text-[#1c1f2e]">{s.val}</span>
              <span className="text-[11px] text-[#6b7280]">{s.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Heatmap — real per-day outcome distribution ──────────────────────────────
function Heatmap({ runs }) {
  const WEEKS = 12;
  const days = useMemo(() => {
    return Array.from({ length: WEEKS * 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (WEEKS * 7 - 1 - i));
      const dayRuns = runs.filter((r) => {
        if (!r.started) return false;
        return r.started.getFullYear() === d.getFullYear() &&
               r.started.getMonth() === d.getMonth() &&
               r.started.getDate() === d.getDate();
      });
      const fails = dayRuns.filter((r) => r.outcome === "failed" || r.outcome === "timeout").length;
      const total = dayRuns.length;
      return { d, total, fails, rate: total ? (total - fails) / total : null };
    });
  }, [runs]);

  const cellColor = (rate) => {
    if (rate === null) return "#f0f2f7";
    if (rate === 1) return "#14532d";
    if (rate >= 0.9) return "#16a34a";
    if (rate >= 0.7) return "#4ade80";
    if (rate >= 0.5) return "#bbf7d0";
    return "#fecaca";
  };

  const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div style={{ overflowX: "auto" }}>
      <div className="flex gap-[3px] mb-1" style={{ marginLeft: 28 }}>
        {Array.from({ length: WEEKS }, (_, w) => {
          const d = days[w * 7].d;
          const label = (w === 0 || d.getDate() <= 7) ? MONTHS[d.getMonth()] : "";
          return <div key={w} style={{ width: 14, fontSize: 10, color: "#6b7280" }}>{label}</div>;
        })}
      </div>
      {DAYS.map((day, dow) => (
        <div key={dow} className="flex items-center gap-[3px] mb-[3px]">
          <span style={{ width: 24, fontSize: 10.5, color: "#6b7280", textAlign: "right", flexShrink: 0 }}>{day}</span>
          <div className="flex gap-[3px]">
            {Array.from({ length: WEEKS }, (_, w) => {
              const cell = days[w * 7 + dow];
              return (
                <div
                  key={w}
                  title={`${cell.d.toDateString()} · ${cell.total} runs · ${cell.fails} fails`}
                  style={{ width: 14, height: 14, borderRadius: 3, background: cellColor(cell.rate), cursor: "pointer", flexShrink: 0 }}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[11px] text-[#6b7280]">Less</span>
        {["#f0f2f7", "#bbf7d0", "#4ade80", "#16a34a", "#14532d"].map((c) => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
        ))}
        <span className="text-[11px] text-[#6b7280]">More</span>
      </div>
    </div>
  );
}

// ─── Run Detail Panel — real Ping fields only ─────────────────────────────────
// No fake stdout/stderr terminal here: Ping has no captured-output field, only
// a real `error` string (set when a run fails/times out). The old fabricated
// "Output Log" section is replaced with that real field, or dropped in favor
// of a plain success note when there's nothing to show.
function RunDetailPanel({ run, avgDurationMs }) {
  const drift = avgDurationMs ? run.durationMs - avgDurationMs : null;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-[#f8f9fc] border-t border-[#e9ebf0]">
      <div>
        <p className="text-[11px] uppercase tracking-[.08em] text-[#6b7280] mb-3">Run Details</p>
        <div className="flex flex-col gap-[6px]">
          {[
            ["Run ID", <span key="id" className="font-mono text-[11.5px]">{run.runId}</span>],
            ["Started", <span key="st" className="font-mono text-[11.5px]">{run.started ? run.started.toISOString().replace("T", " ").slice(0, 19) : "—"}</span>],
            ["Ended", <span key="en" className="font-mono text-[11.5px]">{run.ended ? run.ended.toISOString().replace("T", " ").slice(0, 19) : "—"}</span>],
            ["Duration", <span key="du" className="font-mono text-[11.5px]">{formatDuration(run.durationMs)}</span>],
            ["vs Avg", drift == null
              ? <span key="vs" className="text-[11.5px] text-[#6b7280]">—</span>
              : <span key="vs" className="font-mono text-[11.5px]" style={{ color: drift > 0 ? "#d97706" : "#16a34a" }}>{drift > 0 ? "+" : ""}{((drift / avgDurationMs) * 100).toFixed(0)}%</span>],
            ["Trigger", <span key="tr" className="text-[11px] px-1.5 py-0.5 rounded border bg-purple-50 text-purple-700 border-purple-200">{run.trigger}</span>],
            ["Retries", <span key="rt" className="font-mono text-[11.5px]">{run.retries}</span>],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between items-center text-[12.5px]">
              <span className="text-[11px] text-[#6b7280]">{l}</span>
              {v}
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[.08em] text-[#6b7280] mb-3">Error</p>
        {run.error ? (
          <div
            className="rounded-lg p-3"
            style={{ background: "#1c1f2e", fontFamily: "'DM Mono',monospace", fontSize: 11.5, lineHeight: 1.7, color: "#f87171" }}
          >
            {run.error}
          </div>
        ) : (
          <div className="rounded-lg p-3 text-[12px] text-[#6b7280]" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            No error recorded{run.outcome === "success" || run.outcome === "late" ? " — run completed." : "."}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Job Sidebar Item — real CronJob fields ────────────────────────────────────
function JobSidebarItem({ job, active, onClick }) {
  const col = STATUS_CFG[job.status]?.color ?? "#6b7280";
  const uptime = job.stats?.uptime30d ?? 100;
  const uptimeColor = uptime >= 99 ? "#16a34a" : uptime >= 95 ? "#d97706" : "#dc2626";
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 border-b border-[#f0f2f7] cursor-pointer transition-colors ${active ? "bg-[#eff4ff]" : "hover:bg-[#f4f6fa]"}`}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="text-[12.5px] font-medium text-[#1c1f2e] truncate">{job.name}</div>
        <div className="font-mono text-[10.5px] text-[#6b7280] mt-px">{job.cronExpression}</div>
      </div>
      <span className="font-mono text-[10.5px] flex-shrink-0" style={{ color: uptimeColor }}>{uptime}%</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function JobHistory() {
  const navigate = useNavigate();
  const {
    activeJobId, activeJob, jobsLoading,
    filteredJobs, jobSearch, setJobSearch, selectJob,
    rangeDays, changeRange,
    stats, statsLoading,
    chartRuns, chartLoading,
    runs, runPagination, tableLoading,
    runPage, setRunPage, runLimit, setRunLimit,
    sortField, sortType, handleServerSideSorting,
    runNow,
  } = useJobHistory();

  const [detailRun, setDetailRun] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef();
  const showToast = useCallback((msg) => {
    setToastMsg(msg); setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2400);
  }, []);

  const openRunDetail = useCallback((row) => {
    setDetailRun(row);
    setDetailOpen(true);
  }, []);

  const columns = useMemo(
    () => getJobHistoryColumns({
      onView: openRunDetail,
      avgDurationMs: stats?.avgDurationMs ?? 0,
      maxDurationMs: stats?.maxDurationMs || 1,
    }),
    [stats, openRunDetail],
  );

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <PageHeader
          icon={<Clock size={20} />}
          title="Job History"
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Cron Monitor", href: "/dashboard/cron-monitor" },
            { label: "Cron Inventory", href: "/cron-inventory" },
            { label: activeJob?.name ?? "—" },
          ]}
          actions={
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <select
                value={rangeDays}
                onChange={(e) => changeRange(e.target.value)}
                className="border border-[#e9ebf0] rounded-lg px-3 py-[6px] text-[12px] text-[#1c1f2e] bg-white outline-none focus:border-[#2563eb] cursor-pointer"
                style={{ fontFamily: "inherit" }}
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
              <Button
                variant="outline"
                size="lg"
                icon={<Download size={13} />}
                onClick={() => {
                  if (!runs.length) return showToast("Nothing to export yet");
                  exportPingRunsToCsv(runs, `job-history-${activeJob?.slug || activeJobId}-${new Date().toISOString().slice(0, 10)}.csv`);
                }}
              >
                Export Page
              </Button>
              <Button
                variant="primary"
                size="lg"
                icon={<Play size={13} />}
                onClick={() => { runNow(); showToast("▶ Manual run triggered"); }}
                disabled={!activeJobId}
              >
                Run Now
              </Button>
            </div>
          }
        />

        <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
          {/* ── JOB SELECTOR SIDEBAR ── */}
          <div style={{ width: 260, flexShrink: 0, borderRight: "1px solid #e9ebf0", background: "#fff", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #e9ebf0", background: "#fafbfc", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, border: "1px solid #e9ebf0", borderRadius: 8, padding: "5px 10px", background: "#fff" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c2c8d4" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  placeholder="Filter jobs…"
                  style={{ border: "none", outline: "none", fontFamily: "inherit", fontSize: 12, background: "transparent", color: "#1c1f2e", width: "100%" }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
              {jobsLoading ? (
                <div className="p-3 text-[12px] text-[#6b7280]">Loading jobs…</div>
              ) : filteredJobs.length === 0 ? (
                <div className="p-3 text-[12px] text-[#6b7280]">No jobs found</div>
              ) : (
                filteredJobs.map((job) => (
                  <JobSidebarItem
                    key={job._id}
                    job={job}
                    active={job._id === activeJobId}
                    onClick={() => selectJob(job._id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin", background: "#f4f6fa" }}>
            <div style={{ padding: "20px 28px 48px" }}>
              {!activeJob ? (
                <div className="text-[13px] text-[#6b7280] py-16 text-center">
                  {jobsLoading ? "Loading…" : "Select a cron job from the sidebar"}
                </div>
              ) : (
                <>
                  {/* ── HERO CARD ── */}
                  <div style={{ marginBottom: 18 }}>
                    <InfoCard showPadding={false}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "18px 22px" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: `${STATUS_CFG[activeJob?.status]?.color ?? "#6b7280"}18` }}>
                          <Calendar size={22} style={{ color: STATUS_CFG[activeJob?.status]?.color ?? "#6b7280" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5, flexWrap: "wrap" }}>
                            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 400, color: "#1c1f2e" }}>{activeJob?.name}</h2>
                            <StatusBadge status={activeJob?.status ?? "paused"} />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: 12.5, color: "#6b7280" }}>
                            <span>Schedule: <span style={{ fontFamily: "'DM Mono',monospace", color: "#1c1f2e" }}>{activeJob?.cronExpression}</span></span>
                            <span>·</span>
                            <span>30d Uptime: <span style={{ color: (activeJob?.stats?.uptime30d ?? 0) >= 99 ? "#16a34a" : (activeJob?.stats?.uptime30d ?? 0) >= 95 ? "#d97706" : "#dc2626" }}>{activeJob?.stats?.uptime30d ?? 100}%</span></span>
                            <span>·</span>
                            <span>{stats?.totalRuns ?? 0} runs in range</span>
                            {activeJob?.owner?.name && <><span>·</span><span>Owner: {activeJob.owner.name}</span></>}
                            {activeJob?.env && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border bg-[#eff4ff] text-[#2563eb] border-[#c7d9fb]">{activeJob.env}</span>}
                            {activeJob?.category && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border bg-gray-100 text-gray-600 border-gray-200">{activeJob.category}</span>}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <Button size="sm" variant="outline" icon={<Copy size={11} />} onClick={() => { navigator.clipboard?.writeText(activeJob?.pingUrl || ""); showToast("Ping URL copied"); }}>
                            Copy Ping URL
                          </Button>
                          <Button size="sm" variant="outline" icon={<Pencil size={11} />} onClick={() => navigate(`/dashboard/cron-monitor/${activeJobId}`)}>
                            Edit Config
                          </Button>
                        </div>
                      </div>
                    </InfoCard>
                  </div>

                  {/* ── STAT CARDS — all real, from /pings/summary?days= ── */}
                  <div style={{ marginBottom: 18 }}>
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                      <StatCard icon={<CheckCircle size={20} stroke="#16a34a" />} count={statsLoading ? "…" : `${stats?.successRate ?? 100}%`} title="Success Rate" countColor="text-emerald-600" />
                      <StatCard icon={<AlertTriangle size={20} stroke="#dc2626" />} count={statsLoading ? "…" : (stats?.failCount ?? 0)} title="Failures" countColor={stats?.failCount > 0 ? "text-red-600" : "text-[#1c1f2e]"} />
                      <StatCard icon={<Clock size={20} stroke="#2563eb" />} count={statsLoading ? "…" : formatDuration(stats?.avgDurationMs)} title="Avg Duration" countColor="text-[#1c1f2e]" />
                      <StatCard icon={<Activity size={20} stroke="#7c3aed" />} count={statsLoading ? "…" : formatDuration(stats?.p95DurationMs)} title="p95 Duration" countColor="text-[#1c1f2e]" />
                      <StatCard icon={<Zap size={20} stroke="#d97706" />} count={statsLoading ? "…" : formatDuration(stats?.maxDurationMs)} title="Slowest Run" countColor={stats?.maxDurationMs > stats?.p95DurationMs ? "text-red-600" : "text-[#1c1f2e]"} />
                      <StatCard icon={<Activity size={20} stroke="#0891b2" />} count={statsLoading ? "…" : (stats?.totalRuns ?? 0)} title="Total Runs" countColor="text-[#1c1f2e]" />
                    </div>
                  </div>

                  {/* ── DURATION TREND + DONUT ── */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 mb-[18px]">
                    <InfoCard
                      icon={<Activity size={16} className="text-[#6b7280]" />}
                      title="Duration Trend"
                      action={
                        <div className="flex items-center gap-3 text-[11.5px] text-[#6b7280]">
                          {[["#16a34a", "On time"], ["#dc2626", "Failed"], ["#e5e7eb", "p95 threshold"]].map(([c, l]) => (
                            <span key={l} className="flex items-center gap-1">
                              <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />
                              {l}
                            </span>
                          ))}
                        </div>
                      }
                    >
                      {chartLoading ? <div className="text-[12px] text-[#6b7280] py-8 text-center">Loading…</div> : <DurationChart runs={chartRuns} p95DurationMs={stats?.p95DurationMs} />}
                    </InfoCard>

                    <InfoCard icon={<Activity size={16} className="text-[#6b7280]" />} title="Run Outcome Breakdown">
                      {chartLoading ? <div className="text-[12px] text-[#6b7280] py-8 text-center">Loading…</div> : <DonutChart runs={chartRuns} />}
                    </InfoCard>
                  </div>

                  {/* ── HEATMAP ── */}
                  <div style={{ marginBottom: 18 }}>
                    <InfoCard icon={<Calendar size={16} className="text-[#6b7280]" />} title="Run Calendar — last 12 weeks">
                      {chartLoading ? <div className="text-[12px] text-[#6b7280] py-8 text-center">Loading…</div> : <Heatmap runs={chartRuns} />}
                    </InfoCard>
                  </div>

                  {/* ── RUN TABLE ── */}
                  <div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "#6b7280", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                      Individual Runs
                      <div style={{ flex: 1, height: 1, background: "#e9ebf0" }} />
                    </div>

                    <InfoCard title="Run Log" showPadding={false}>
                      <div className="-mx-5 -mt-4 -mb-5">
                        <NewTableConfig
                          module="job-history"
                          columns={columns}
                          data={runs}
                          isLoading={tableLoading}
                          onRowClick={openRunDetail}
                          currentPage={runPage}
                          setCurrentPage={setRunPage}
                          pageLimit={runLimit}
                          handlePageLimitChange={setRunLimit}
                          totalResults={runPagination?.total ?? runs.length}
                          totalPages={runPagination?.totalPages ?? 1}
                          showRowNumbers={false}
                          plain={true}
                          sortBy={sortField}
                          sortOrder={sortType}
                          handleServerSideSorting={handleServerSideSorting}
                        />
                      </div>
                    </InfoCard>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── RUN DETAIL MODAL ── */}
      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailRun ? `Run ${detailRun.runId}` : ""}
        footer={<Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>Close</Button>}
      >
        {detailRun && <RunDetailPanel run={detailRun} avgDurationMs={stats?.avgDurationMs} />}
      </Modal>

      {/* ── TOAST ── */}
      <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-2 bg-[#1c1f2e] text-white text-[13px] px-[18px] py-2.5 rounded-lg pointer-events-none transition-opacity duration-300 max-w-[360px] ${toastVisible ? "opacity-100" : "opacity-0"}`}>
        <CheckCircle size={12} className="text-emerald-300" />
        {toastMsg}
      </div>
    </>
  );
}
