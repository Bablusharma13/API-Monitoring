// hooks/useJobHistory.js
// Static seed data hook — same pattern as useCronInventory.js
// Provides JOBS_LIST, genRuns(), fmtDur(), and useJobHistory() hook

import { useState, useCallback, useMemo } from "react";

// ─── Jobs list ────────────────────────────────────────────────────────────────
export const JOBS_LIST = [
  {
    id: "log-rotation",
    name: "Log Rotation — Hot to Cold",
    cron: "0 * * * *",
    status: "ok",
    uptime: 99.8,
  },
  {
    id: "api-health",
    name: "API Health Check",
    cron: "*/1 * * * *",
    status: "ok",
    uptime: 100,
  },
  {
    id: "retention",
    name: "Retention Cleanup",
    cron: "0 2 * * *",
    status: "ok",
    uptime: 100,
  },
  {
    id: "ssl-check",
    name: "SSL Certificate Verification",
    cron: "0 6 * * *",
    status: "ok",
    uptime: 100,
  },
  {
    id: "buffer-flush",
    name: "Buffer Flush — All Queues",
    cron: "*/5 * * * *",
    status: "late",
    uptime: 97.4,
  },
  {
    id: "cold-archive",
    name: "Cold → Archive Migration",
    cron: "0 3 * * 0",
    status: "fail",
    uptime: 92.3,
  },
  {
    id: "risk-score",
    name: "Risk Score Recalculation",
    cron: "0 */4 * * *",
    status: "ok",
    uptime: 99.6,
  },
  {
    id: "dlq-retry",
    name: "DLQ Retry Worker",
    cron: "*/15 * * * *",
    status: "ok",
    uptime: 99.1,
  },
  {
    id: "backup-verify",
    name: "Backup Integrity Verification",
    cron: "0 4 * * *",
    status: "ok",
    uptime: 100,
  },
  {
    id: "usage-report",
    name: "Usage Report Generator",
    cron: "0 0 * * *",
    status: "paused",
    uptime: 95,
  },
  {
    id: "metrics-agg",
    name: "Metrics Aggregation — Hourly",
    cron: "0 * * * *",
    status: "ok",
    uptime: 99.9,
  },
  {
    id: "billing-inv",
    name: "Billing Invoice Generation",
    cron: "0 0 1 * *",
    status: "ok",
    uptime: 100,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function fmtDur(s) {
  if (!s && s !== 0) return "—";
  if (s < 60) return `${s}s`;
  if (s < 3600)
    return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`;
}

export function fmtAgo(s) {
  if (!s) return "—";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ─── Run generator — mirrors HTML's genRuns() ─────────────────────────────────
export function genRuns(jobId, days) {
  const intervalMap = {
    "api-health": 60,
    "buffer-flush": 300,
    "dlq-retry": 900,
    "log-rotation": 3600,
    "metrics-agg": 3600,
    "cold-archive": 604800,
  };
  const avgDurMap = {
    "cold-archive": 1694,
    "billing-inv": 2400,
    "usage-report": 1122,
    "api-health": 8,
    "buffer-flush": 2,
    "log-rotation": 262,
    retention: 728,
    "ssl-check": 104,
  };

  const interval = intervalMap[jobId] ?? 86400;
  const avgDur = avgDurMap[jobId] ?? 200;
  const job = JOBS_LIST.find((j) => j.id === jobId);

  const totalRuns = Math.floor((days * 86400) / interval);
  const count = Math.min(totalRuns, 200);

  return Array.from({ length: count }, (_, i) => {
    const started = new Date(
      Date.now() - i * interval * 1000 - Math.random() * 30000,
    );
    const failChance =
      job?.status === "fail" ? 0.15 : job?.status === "late" ? 0.04 : 0.01;
    const toChance = job?.status === "fail" ? 0.05 : 0.005;
    const skipChance = 0.01;
    const r = Math.random();

    let outcome = "success";
    if (r < skipChance) outcome = "skipped";
    else if (r < skipChance + toChance) outcome = "timeout";
    else if (r < skipChance + toChance + failChance) outcome = "failed";

    const isFail = outcome !== "success" && outcome !== "skipped";
    const dur = isFail
      ? Math.round(avgDur * (0.1 + Math.random() * 0.5))
      : Math.round(avgDur * (0.7 + Math.random() * 0.6));
    const drift = dur - avgDur;

    return {
      id: `run-${String(count - i).padStart(4, "0")}`,
      num: count - i,
      started,
      outcome,
      duration: dur,
      avgDur,
      drift,
      exit:
        outcome === "success"
          ? 0
          : outcome === "timeout"
            ? 124
            : outcome === "skipped"
              ? -1
              : 1,
      trigger: i % 20 === 0 ? "manual" : i % 5 === 0 ? "retry" : "schedule",
      server: `worker-${(i % 4) + 1}`,
      anomaly: Math.abs(drift) > avgDur * 0.4 && outcome === "success",
    };
  });
}

// ─── Log line generator ───────────────────────────────────────────────────────
export function genLogLines(run, jobId) {
  const ts = (i) => {
    const d = new Date(run.started.getTime() + i * 1000);
    return d.toTimeString().slice(0, 8);
  };
  const lines = [
    `[${ts(0)}] INFO  Job started — ${jobId}`,
    `[${ts(1)}] INFO  Environment: Production · Server: ${run.server}`,
    `[${ts(2)}] INFO  Connecting to hot store…`,
    run.outcome === "success"
      ? `[${ts(4)}] INFO  Processing batch — 24,800 records`
      : `[${ts(4)}] ERROR Connection refused — hot-node-01`,
    run.outcome === "success"
      ? `[${ts(run.duration - 2)}] INFO  Migrated 2.1 GB · checksum OK`
      : `[${ts(6)}] ERROR Retry 1/3 — failed again`,
    run.outcome === "success"
      ? `[${ts(run.duration)}] INFO  Job complete — exit 0`
      : `[${ts(10)}] FATAL Job failed — exit 1`,
  ];
  if (run.anomaly) {
    lines.splice(
      3,
      0,
      `[${ts(3)}] WARN  High duration detected — ${fmtDur(run.duration)} vs avg ${fmtDur(run.avgDur)}`,
    );
  }
  return lines;
}

// ─── Derived KPI stats ────────────────────────────────────────────────────────
export function calcStats(runs) {
  const success = runs.filter((r) => r.outcome === "success");
  const failed = runs.filter(
    (r) => r.outcome === "failed" || r.outcome === "timeout",
  );
  const total = runs.length;

  const durs = success.map((r) => r.duration);
  const avgDur = durs.length
    ? Math.round(durs.reduce((a, b) => a + b, 0) / durs.length)
    : 0;
  const maxDur = durs.length ? Math.max(...durs) : 0;
  const sorted = [...durs].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;

  const successRate = total
    ? ((success.length / total) * 100).toFixed(1)
    : "100.0";

  return { successRate, failCount: failed.length, avgDur, maxDur, p95, total };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useJobHistory() {
  const [activeJobId, setActiveJobId] = useState("cold-archive");
  const [rangeDays, setRangeDays] = useState(30);
  const [jobSearch, setJobSearch] = useState("");

  const runs = useMemo(
    () => genRuns(activeJobId, rangeDays),
    [activeJobId, rangeDays],
  );

  const stats = useMemo(() => calcStats(runs), [runs]);

  const activeJob = useMemo(
    () => JOBS_LIST.find((j) => j.id === activeJobId),
    [activeJobId],
  );

  const filteredJobs = useMemo(
    () =>
      JOBS_LIST.filter((j) =>
        j.name.toLowerCase().includes(jobSearch.toLowerCase()),
      ),
    [jobSearch],
  );

  const selectJob = useCallback((id) => setActiveJobId(id), []);
  const changeRange = useCallback((days) => setRangeDays(+days), []);

  return {
    activeJobId,
    activeJob,
    runs,
    stats,
    rangeDays,
    changeRange,
    jobSearch,
    setJobSearch,
    filteredJobs,
    selectJob,
  };
}

