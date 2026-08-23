// hooks/useCronHeartbeat.js
// Static data hook for the Cron / Heartbeat Monitor page.
// All data that was previously inline in CronHeartbeatMonitor.jsx lives here.
// The hook also exposes the fmtSecs helper so the page never duplicates it.

// ─── Helper ───────────────────────────────────────────────────────────────────
export function fmtSecs(s) {
  s = Math.floor(s);
  if (s <= 0) return "—";
  if (s < 60) return s + "s";
  if (s < 3600)
    return Math.floor(s / 60) + "m " + String(s % 60).padStart(2, "0") + "s";
  return (
    Math.floor(s / 3600) +
    "h " +
    String(Math.floor((s % 3600) / 60)).padStart(2, "0") +
    "m"
  );
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export const JOBS_SEED = [
  {
    id: "log-rotation",
    name: "Log Rotation",
    desc: "Hot → Cold tier migration",
    cron: "0 * * * *",
    cronHuman: "Every hour",
    interval: 3600,
    grace: 60,
    status: "ok",
    lastPing: 55,
    nextIn: 3545,
    enabled: true,
    uptime30: 99.8,
    successRate: 99.9,
    avgDur: "4m 22s",
    totalPings: 720,
    category: "Pipeline",
    pingUrl: "https://hb.syberfort.io/ping/lr_8f3k9x",
  },
  {
    id: "api-health",
    name: "API Health Check",
    desc: "Full suite health check — all 42 APIs",
    cron: "*/1 * * * *",
    cronHuman: "Every 1 min",
    interval: 60,
    grace: 15,
    status: "ok",
    lastPing: 12,
    nextIn: 48,
    enabled: true,
    uptime30: 99.9,
    successRate: 100,
    avgDur: "8s",
    totalPings: 43200,
    category: "Monitoring",
    pingUrl: "https://hb.syberfort.io/ping/ah_4m2np1",
  },
  {
    id: "retention",
    name: "Retention Cleanup",
    desc: "Delete expired logs from all tiers",
    cron: "0 2 * * *",
    cronHuman: "Daily at 02:00",
    interval: 86400,
    grace: 300,
    status: "ok",
    lastPing: 7200,
    nextIn: 79200,
    enabled: true,
    uptime30: 100,
    successRate: 100,
    avgDur: "12m 08s",
    totalPings: 30,
    category: "Storage",
    pingUrl: "https://hb.syberfort.io/ping/rc_7kx2mq",
  },
  {
    id: "ssl-check",
    name: "SSL Cert Check",
    desc: "Verify TLS certs for all external APIs",
    cron: "0 6 * * *",
    cronHuman: "Daily at 06:00",
    interval: 86400,
    grace: 600,
    status: "ok",
    lastPing: 3600,
    nextIn: 82800,
    enabled: true,
    uptime30: 100,
    successRate: 100,
    avgDur: "1m 44s",
    totalPings: 30,
    category: "Security",
    pingUrl: "https://hb.syberfort.io/ping/ssl_9c3xr2",
  },
  {
    id: "buffer-flush",
    name: "Buffer Flush",
    desc: "Force-flush all pipeline buffers",
    cron: "*/5 * * * *",
    cronHuman: "Every 5 min",
    interval: 300,
    grace: 30,
    status: "late",
    lastPing: 380,
    nextIn: 0,
    enabled: true,
    uptime30: 97.4,
    successRate: 98.2,
    avgDur: "2s",
    totalPings: 8640,
    category: "Pipeline",
    pingUrl: "https://hb.syberfort.io/ping/bf_2wq8tz",
  },
  {
    id: "cold-archive",
    name: "Cold → Archive Job",
    desc: "Move cold logs older than 90d to archive",
    cron: "0 3 * * 0",
    cronHuman: "Every Sunday 03:00",
    interval: 604800,
    grace: 1800,
    status: "missing",
    lastPing: 90000,
    nextIn: 0,
    enabled: true,
    uptime30: 92.3,
    successRate: 94.1,
    avgDur: "28m 14s",
    totalPings: 4,
    category: "Storage",
    pingUrl: "https://hb.syberfort.io/ping/ca_5xm7py",
    missingSince: "25h 00m",
  },
  {
    id: "risk-score",
    name: "Risk Score Recalc",
    desc: "Recompute risk scores for all APIs",
    cron: "0 */4 * * *",
    cronHuman: "Every 4 hours",
    interval: 14400,
    grace: 120,
    status: "ok",
    lastPing: 900,
    nextIn: 13500,
    enabled: true,
    uptime30: 99.6,
    successRate: 99.6,
    avgDur: "3m 10s",
    totalPings: 180,
    category: "Monitoring",
    pingUrl: "https://hb.syberfort.io/ping/rs_1hn9qk",
  },
  {
    id: "dlq-retry",
    name: "DLQ Retry Worker",
    desc: "Retry failed messages in dead-letter queues",
    cron: "*/15 * * * *",
    cronHuman: "Every 15 min",
    interval: 900,
    grace: 60,
    status: "ok",
    lastPing: 240,
    nextIn: 660,
    enabled: true,
    uptime30: 99.1,
    successRate: 99.3,
    avgDur: "45s",
    totalPings: 2880,
    category: "Pipeline",
    pingUrl: "https://hb.syberfort.io/ping/dq_3vx4nm",
  },
  {
    id: "backup-verify",
    name: "Backup Integrity Check",
    desc: "Verify checksums on archive files",
    cron: "0 4 * * *",
    cronHuman: "Daily at 04:00",
    interval: 86400,
    grace: 900,
    status: "ok",
    lastPing: 18000,
    nextIn: 68400,
    enabled: true,
    uptime30: 100,
    successRate: 100,
    avgDur: "6m 55s",
    totalPings: 30,
    category: "Storage",
    pingUrl: "https://hb.syberfort.io/ping/bv_8kp2cx",
  },
  {
    id: "usage-report",
    name: "Usage Report Generator",
    desc: "Build daily usage report for billing",
    cron: "0 0 * * *",
    cronHuman: "Daily at midnight",
    interval: 86400,
    grace: 600,
    status: "paused",
    lastPing: 86400,
    nextIn: 0,
    enabled: false,
    uptime30: 95.0,
    successRate: 95.0,
    avgDur: "18m 42s",
    totalPings: 30,
    category: "Data",
    pingUrl: "https://hb.syberfort.io/ping/ur_6lm5wx",
  },
];

// ─── Live feed event pool ─────────────────────────────────────────────────────
export const FEED_POOL = [
  {
    color: "#16a34a",
    job: "Log Rotation",
    msg: "✓ Ping received — 4m 22s duration",
  },
  {
    color: "#16a34a",
    job: "API Health Check",
    msg: "✓ 42 APIs checked — all passed",
  },
  {
    color: "#16a34a",
    job: "DLQ Retry Worker",
    msg: "✓ Processed 12 dead-letter messages",
  },
  {
    color: "#d97706",
    job: "Buffer Flush",
    msg: "⚠ Late by 80s — still within grace",
  },
  {
    color: "#dc2626",
    job: "Cold → Archive",
    msg: "✗ No ping — alert sent to Slack",
  },
  {
    color: "#16a34a",
    job: "Risk Score Recalc",
    msg: "✓ 42 APIs rescored — avg 34 pts",
  },
  {
    color: "#16a34a",
    job: "Backup Integrity",
    msg: "✓ 184 GB verified — all checksums OK",
  },
];

// ─── Ping history generator ───────────────────────────────────────────────────
function buildHistory(jobs) {
  const pad = (n) => String(n).padStart(2, "0");
  return Array.from({ length: 40 }, (_, i) => {
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const ok = Math.random() > 0.08;
    const late = !ok && Math.random() > 0.5;
    const missing = !ok && !late;
    const d = new Date(Date.now() - i * 180000);
    const dur = Math.round(Math.random() * 1200 + 2);
    return {
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
      job: job.name,
      jobId: job.id,
      status: missing ? "missing" : late ? "late" : "ok",
      dur: fmtSecs(dur),
      durRaw: dur,
      latency: Math.round(Math.random() * 180 + 10) + "ms",
      ip: `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.1`,
      exit: missing ? "—" : late ? "0 (late)" : "0",
    };
  });
}

// ─── Summary stats ────────────────────────────────────────────────────────────
export const CRON_STATS = {
  pingsToday: 2841,
  reliability30d: "99.1%",
};

// ─── React hook ───────────────────────────────────────────────────────────────
export function useCronHeartbeat() {
  // History is generated once (stable reference across re-renders)
  const historyData = [];

  return {
    /** Initial job list — deep-cloned so the page can mutate state freely */
    jobsSeed: JOBS_SEED.map((j) => ({ ...j })),

    /** Live-feed event pool for the side panel */
    feedPool: FEED_POOL,

    /** Pre-generated ping history rows (40 rows) */
    historyData,

    /** Summary KPI defaults */
    stats: CRON_STATS,

    /** Exported so callers never need to re-implement it */
    fmtSecs,
  };
}

