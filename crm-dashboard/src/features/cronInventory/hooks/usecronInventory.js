// hooks/useCronInventory.js
// Static seed data hook — same pattern as useHeartBeat.js
// Provides JOBS_SEED, filterOptions, and the useCronInventory() hook

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
    "Pipeline", "Storage", "Monitoring", "Security",
    "Data", "Billing", "Notifications", "Infra", "Cleanup",
  ];
  const ENVS   = ["Production", "Production", "Production", "Staging", "Dev", "CI/CD", "Data", "Infra"];
  const OWNERS = ["Alex M.", "Sara R.", "James L.", "Priya K.", "DevOps", "Platform"];
  const TAG_POOL = [
    "critical","pipeline","storage","hot-tier","cold-tier","compliance",
    "api-health","billing","security","cleanup","nightly","hourly",
    "weekly","data-sync","backup","ssl","dlq","retry","archive","report",
  ];
  const CRONS = [
    ["*/1 * * * *",  "Every 1 min"],
    ["*/5 * * * *",  "Every 5 min"],
    ["*/15 * * * *", "Every 15 min"],
    ["*/30 * * * *", "Every 30 min"],
    ["0 * * * *",    "Every hour"],
    ["0 */2 * * *",  "Every 2h"],
    ["0 */4 * * *",  "Every 4h"],
    ["0 */6 * * *",  "Every 6h"],
    ["0 */12 * * *", "Every 12h"],
    ["0 0 * * *",    "Daily midnight"],
    ["0 2 * * *",    "Daily 02:00"],
    ["0 4 * * *",    "Daily 04:00"],
    ["0 6 * * *",    "Daily 06:00"],
    ["0 0 * * 0",    "Weekly Sun"],
    ["0 0 1 * *",    "Monthly 1st"],
  ];
  const TASK_NAMES = [
    "Log Rotation — Hot to Cold","API Health Check — All Endpoints","Retention Cleanup — Hot Tier",
    "SSL Certificate Verification","Buffer Flush — All Queues","Cold → Archive Migration",
    "Risk Score Recalculation","Dead-Letter Queue Retry","Backup Integrity Verification",
    "Usage Report Generator","Database Index Rebuild","Cache Warm-up — API Responses",
    "Metrics Aggregation — Hourly","Alert Rule Evaluation","Billing Invoice Generation",
    "Webhook Delivery Retry","User Session Cleanup","Storage Quota Alert Check",
    "Pipeline Health Snapshot","Geo Lookup Cache Refresh","API Uptime Summary Export",
    "Cold Store Compaction","Token Rotation — Service Accounts","Data Export — Analytics",
    "Compliance Audit Log Flush","Rate Limit Counter Reset","CDN Purge — Expired Assets",
    "Email Bounce Cleanup","Slack Notification Digest","Archive Index Rebuild",
    "Cost Attribution Rollup","Dependency Vulnerability Scan","Log Sampling — Debug Tier",
    "WAF Rule Sync","DNS Health Check","Schema Migration Check",
    "Replica Lag Monitor","Hot Node Disk Trim","Queue Depth Report",
    "Canary API Ping — All Regions","SLA Breach Pre-check","Feature Flag Audit",
    "Error Budget Recalc","Trace Retention Cleanup","Synthetic Monitor — Payment Flow",
    "Database Vacuum — Analytics","Config Drift Detector","Expired Token Cleanup",
    "Notification Throttle Reset","API Key Rotation Reminder","Cold Tier Spot Check",
    "Heartbeat Timeout Audit","Pipeline Restart on Failure","ML Anomaly Batch Inference",
    "Deployment Drift Checker","Archive Restore Queue Drain","On-call Schedule Sync",
    "Incident Auto-close — Resolved","Slack Channel Archive","Data Masking Job",
    "GDPR Delete Batch","Certificate Pinning Update","Healthcheck — External Partners",
    "Monthly Cost Forecast","Test Data Cleanup — Staging","Canary Deploy Rollback Check",
    "API Deprecation Notice","Webhook Secret Rotation","Report Email Dispatch",
    "Trend Analysis — Error Rates","High-Risk API Scan","IP Allowlist Sync",
    "Session Token Purge","AWS Cost Anomaly Fetch","Kafka Consumer Lag Check",
    "Object Store Lifecycle Trigger","Runbook Auto-update","Alert Dedup Window Reset",
    "Performance Regression Detect","Cold Boot Health Probe","API Version Sunset Check",
    "Privacy Policy Audit","Disk Usage Alert Check","Network Latency Baseline",
    "DDoS Pattern Evaluation","SAML Cert Check","OAuth Token Audit",
    "CloudWatch Metric Sync","CI Pipeline Success Rate","Load Test Scheduler",
    "Cold Read Test — Archive","Storage Tier Cost Diff","Replication Health Check",
    "DNS TTL Verification","API Doc Auto-publish","Team Standby Rotation Sync",
    "Audit Trail Digest","Chaos Test Scheduler","Deployment Metadata Sync",
    "Regional Failover Test","Partner Webhook Health","Log Level Reset",
    "Search Index Warm-up","Tier Migration Dry-run","Error Budget Email",
    "Scheduled Backup — Config","Hot Store Bloom Filter Rebuild","Lambda Timeout Audit",
    "API Gateway Quota Sync","Cron Self-health Check","Queue Priority Rebalance",
    "Feature Usage Rollup","Contract Test Runner","Service Mesh Cert Rotation",
    "Maintenance Window Opener","Data Lake Partition Check","Ingest Rate Baseline",
    "Weekly SLA Report","AI Flagged Anomaly Review","Tier Policy Enforcement",
    "Token Usage Report","Active Session Cleanup","Security Header Audit",
    "User Audit Log Export","Cost Centre Tagging Sync","Cold Archive Verify",
  ];
  
  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const _rand        = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const _randBetween = (a, b) => Math.floor(Math.random() * (b - a + 1) + a);
  const _randTags    = (n = 2) => {
    const t = new Set();
    while (t.size < n) t.add(_rand(TAG_POOL));
    return [...t];
  };
  
  export function fmtDuration(secs) {
    if (!secs && secs !== 0) return "—";
    if (secs < 60)   return `${secs}s`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ${String(secs % 60).padStart(2, "0")}s`;
    return `${Math.floor(secs / 3600)}h ${String(Math.floor((secs % 3600) / 60)).padStart(2, "0")}m`;
  }
  
  export function fmtAgo(s) {
    if (!s) return "—";
    if (s < 60)    return `${s}s ago`;
    if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }
  
  export function fmtNext(s) {
    if (!s) return "—";
    if (s < 60)    return `${s}s`;
    if (s < 3600)  return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
    return `${Math.floor(s / 86400)}d`;
  }
  
  // ─── Seed data (generated once, stable reference) ────────────────────────────
  export const JOBS_SEED = TASK_NAMES.slice(0, 124).map((name, i) => {
    const [cron, cronHuman] = _rand(CRONS);
    const status =
      i < 98  ? "ok" :
      i < 102 ? "late" :
      i < 105 ? "fail" : "paused";
  
    return {
      id:         `task-${String(i + 1).padStart(3, "0")}`,
      name,
      cron,
      cronHuman,
      status,
      env:        _rand(ENVS),
      category:   _rand(CATEGORIES),
      owner:      _rand(OWNERS),
      lastRunSecs: _randBetween(1, 3600),
      nextRunSecs: status === "paused" ? null : _randBetween(30, 86400),
      durationSecs: _randBetween(5, 3000),
      uptime30:   status === "fail"   ? _randBetween(820, 930) / 10
                : status === "late"   ? _randBetween(940, 979) / 10
                :                       _randBetween(980, 1000) / 10,
      tags:       _randTags(_randBetween(1, 3)),
      enabled:    status !== "paused",
      runs30:     _randBetween(24, 8640),
      pingId:     "t" + Math.random().toString(36).slice(2, 10),
      pingUrl:    `https://hb.syberfort.io/ping/t${Math.random().toString(36).slice(2, 10)}`,
    };
  });
  
  // ─── Filter option lists (for toolbar dropdowns) ──────────────────────────────
  export const FILTER_OPTIONS = {
    environments: ["Production", "Staging", "Dev", "CI/CD", "Data", "Infra"],
    categories:   CATEGORIES,
    owners:       OWNERS,
    schedules: [
      { value: "min",   label: "Every minute" },
      { value: "hour",  label: "Hourly"       },
      { value: "day",   label: "Daily"        },
      { value: "week",  label: "Weekly"       },
      { value: "month", label: "Monthly"      },
    ],
  };
  
  // ─── Hook ─────────────────────────────────────────────────────────────────────
  import { useState, useCallback } from "react";
  
  export function useCronInventory() {
    const [jobs, setJobs] = useState(() => JOBS_SEED);
    const [runsToday, setRunsToday] = useState(1284);
  
    // Toggle enabled / disabled
    const toggleJob = useCallback((id, enabled) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id ? { ...j, enabled, status: enabled ? "ok" : "paused" } : j
        )
      );
    }, []);
  
    // Run a job now (reset lastRunSecs)
    const runNow = useCallback((id) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, lastRunSecs: 0, status: "ok" } : j))
      );
    }, []);
  
    // Update cron expression inline
    const updateCron = useCallback((id, newCron) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === id ? { ...j, cron: newCron } : j))
      );
    }, []);
  
    // Bulk actions
    const bulkEnable = useCallback((ids) => {
      setJobs((prev) =>
        prev.map((j) => ids.has(j.id) ? { ...j, enabled: true, status: "ok" } : j)
      );
    }, []);
  
    const bulkDisable = useCallback((ids) => {
      setJobs((prev) =>
        prev.map((j) => ids.has(j.id) ? { ...j, enabled: false, status: "paused" } : j)
      );
    }, []);
  
    const bulkDelete = useCallback((ids) => {
      setJobs((prev) => prev.filter((j) => !ids.has(j.id)));
    }, []);
  
    // Simulate live tick (call from a setInterval in the page)
    const tick = useCallback(() => {
      setJobs((prev) =>
        prev.map((j) => {
          if (!j.enabled || j.status === "missing") return j;
          if (Math.random() > 0.95) return { ...j, lastRunSecs: Math.round(Math.random() * 10) };
          return j;
        })
      );
      setRunsToday((r) => r + Math.floor(Math.random() * 6));
    }, []);
  
    // Derived KPI counts
    const kpi = {
      ok:     jobs.filter((j) => j.status === "ok").length,
      late:   jobs.filter((j) => j.status === "late").length,
      fail:   jobs.filter((j) => j.status === "fail").length,
      paused: jobs.filter((j) => j.status === "paused").length,
      total:  jobs.length,
    };
  
    return {
      jobs,
      runsToday,
      kpi,
      toggleJob,
      runNow,
      updateCron,
      bulkEnable,
      bulkDisable,
      bulkDelete,
      tick,
    };
  }