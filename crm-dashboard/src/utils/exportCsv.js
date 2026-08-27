const get = (obj, path) =>
  path.split(".").reduce((acc, key) => acc?.[key], obj);

const CATEGORY_CSV_COLUMNS = [
  { header: "Name", path: "name" },
  { header: "Color", path: "color" },
  { header: "Active", path: "isActive", format: (v) => (v ? "Yes" : "No") },
  { header: "Health Score", path: "stats.healthScore" },
  { header: "Total APIs", path: "stats.totalApis" },
  { header: "Active APIs", path: "stats.activeApis" },
  { header: "Down APIs", path: "stats.downApis" },
  { header: "Avg Uptime (%)", path: "stats.avgUptime" },
  { header: "Avg Response (ms)", path: "stats.avgResponse" },
  { header: "Total Incidents", path: "stats.totalIncidents" },
  {
    header: "Last Incident",
    path: "stats.lastIncidentAt",
    format: (v) => (v ? new Date(v).toLocaleString() : ""),
  },
  {
    header: "Owner",
    path: "owner",
    format: (v) => (typeof v === "object" ? v?.name ?? "" : v ?? ""),
  },
  {
    header: "Compliance",
    path: "compliance",
    format: (v) => (Array.isArray(v) ? v.join(", ") : ""),
  },
  {
    header: "Updated",
    path: "updatedAt",
    format: (v) => (v ? new Date(v).toLocaleString() : ""),
  },
];

const CSV_COLUMNS = [
  { header: "ID", path: "apiId" },
  { header: "Name", path: "name" },
  { header: "URL", path: "request.url" },
  { header: "Method", path: "request.method" },
  { header: "Status", path: "status.current" },
  { header: "Type", path: "type" },
  { header: "Mode", path: "mode" },
  { header: "Tech", path: "tech" },
  { header: "Version", path: "version" },
  { header: "Avg Response (ms)", path: "stats.avgResponse30d" },
  { header: "Uptime (%)", path: "stats.uptime30d" },
  { header: "Incidents", path: "stats.totalIncidents" },
  { header: "Risk Score", path: "stats.riskScore" },
  { header: "Frequency", path: "monitoring.frequencyLabel" },
  {
    header: "Owner",
    path: "owner",
    format: (v) => (typeof v === "object" ? v?.name ?? "" : v ?? ""),
  },
  {
    header: "Category",
    path: "category",
    format: (v) => (typeof v === "object" ? v?.name ?? "" : v ?? ""),
  },
  {
    header: "Tags",
    path: "tags",
    format: (v) => (Array.isArray(v) ? v.join(", ") : ""),
  },
  {
    header: "Compliance",
    path: "compliance",
    format: (v) => (Array.isArray(v) ? v.join(", ") : ""),
  },
];

const escape = (val) => {
  const str = val == null ? "" : String(val);
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
};

export const exportCategoriesToCsv = (rows, filename = "categories-export.csv") => {
  const header = CATEGORY_CSV_COLUMNS.map((c) => escape(c.header)).join(",");
  const body = rows.map((row) =>
    CATEGORY_CSV_COLUMNS.map((col) => {
      const raw = get(row, col.path);
      return escape(col.format ? col.format(raw) : raw);
    }).join(",")
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const CHECKS_CSV_COLUMNS = [
  {
    header: "API Name",
    path: "api",
    format: (v) => (typeof v === "object" ? v?.name ?? "" : v ?? ""),
  },
  { header: "Status", path: "status" },
  { header: "HTTP Code", path: "statusCode" },
  { header: "Response Time (ms)", path: "responseTime" },
  {
    header: "Checked At",
    path: "checkedAt",
    format: (v) => (v ? new Date(v).toLocaleString() : ""),
  },
  { header: "Error", path: "error" },
];

export const exportChecksToCsv = (rows, filename = "checks-export.csv") => {
  const header = CHECKS_CSV_COLUMNS.map((c) => escape(c.header)).join(",");
  const body = rows.map((row) =>
    CHECKS_CSV_COLUMNS.map((col) => {
      const raw = get(row, col.path);
      return escape(col.format ? col.format(raw) : raw);
    }).join(",")
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const INCIDENT_CSV_COLUMNS = [
  { header: "Incident ID", path: "_id" },
  { header: "Title", path: "title" },
  { header: "Status", path: "status" },
  { header: "Severity", path: "severity" },
  {
    header: "API Name",
    path: "api",
    format: (v) => (typeof v === "object" ? v?.name ?? "" : v ?? ""),
  },
  { header: "Triggered By", path: "triggeredBy" },
  { header: "Duration (min)", path: "duration" },
  {
    header: "Started At",
    path: "startedAt",
    format: (v) => (v ? new Date(v).toLocaleString() : ""),
  },
  {
    header: "Resolved At",
    path: "resolvedAt",
    format: (v) => (v ? new Date(v).toLocaleString() : ""),
  },
];

export const exportIncidentsToCsv = (rows, filename = "incidents-export.csv") => {
  const header = INCIDENT_CSV_COLUMNS.map((c) => escape(c.header)).join(",");
  const body = rows.map((row) =>
    INCIDENT_CSV_COLUMNS.map((col) => {
      const raw = get(row, col.path);
      return escape(col.format ? col.format(raw) : raw);
    }).join(",")
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const TENANT_CSV_COLUMNS = [
  { header: "ID", path: "id" },
  { header: "Company", path: "company" },
  { header: "Status", path: "status" },
  { header: "Plan", path: "plan" },
  { header: "RPS", path: "metrics.rps" },
  { header: "P95 Latency (ms)", path: "metrics.p95ms" },
  { header: "Error Rate (%)", path: "metrics.errorRate" },
  { header: "Uptime 30d (%)", path: "metrics.uptime30d" },
];

export const exportTenantsToCsv = (rows, filename = "tenants-export.csv") => {
  const header = TENANT_CSV_COLUMNS.map((c) => escape(c.header)).join(",");
  const body = rows.map((row) =>
    TENANT_CSV_COLUMNS.map((col) => {
      const raw = get(row, col.path);
      return escape(col.format ? col.format(raw) : raw);
    }).join(",")
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const LOG_CSV_COLUMNS = [
  { header: "Log ID", path: "id" },
  { header: "Source", path: "source" },
  {
    header: "Timestamp",
    path: "timestamp",
    format: (v) => (v ? new Date(v).toLocaleString() : ""),
  },
  { header: "Target", path: "target" },
  { header: "Method", path: "method" },
  { header: "Status Code", path: "statusCode" },
  { header: "Latency (ms)", path: "latencyMs" },
  { header: "Status", path: "status" },
  { header: "Message", path: "message" },
];

export const exportLogsToCsv = (rows, filename = "logs-export.csv") => {
  const header = LOG_CSV_COLUMNS.map((c) => escape(c.header)).join(",");
  const body = rows.map((row) =>
    LOG_CSV_COLUMNS.map((col) => {
      const raw = get(row, col.path);
      return escape(col.format ? col.format(raw) : raw);
    }).join(",")
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const CRON_JOB_CSV_COLUMNS = [
  { header: "ID", path: "id" },
  { header: "Name", path: "name" },
  { header: "Cron Expression", path: "cron" },
  { header: "Frequency", path: "cronHuman" },
  { header: "Status", path: "status" },
  { header: "Environment", path: "env" },
  { header: "Category", path: "category" },
  { header: "Owner", path: "owner" },
  { header: "Last Run", path: "lastRunLabel" },
  { header: "Next Run", path: "nextRunLabel" },
  { header: "30d Uptime (%)", path: "uptime30" },
  { header: "30d Runs", path: "runs30" },
  { header: "Enabled", path: "enabled", format: (v) => (v ? "Yes" : "No") },
];

export const exportCronJobsToCsv = (rows, filename = "cron-inventory-export.csv") => {
  const header = CRON_JOB_CSV_COLUMNS.map((c) => escape(c.header)).join(",");
  const body = rows.map((row) =>
    CRON_JOB_CSV_COLUMNS.map((col) => {
      const raw = get(row, col.path);
      return escape(col.format ? col.format(raw) : raw);
    }).join(",")
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const PING_RUN_CSV_COLUMNS = [
  { header: "Run ID", path: "runId" },
  {
    header: "Started",
    path: "started",
    format: (v) => (v ? new Date(v).toLocaleString() : ""),
  },
  { header: "Outcome", path: "outcome" },
  { header: "Duration (ms)", path: "durationMs" },
  { header: "Triggered By", path: "trigger" },
  { header: "Retries", path: "retries" },
  { header: "Error", path: "error" },
];

export const exportPingRunsToCsv = (rows, filename = "job-history-export.csv") => {
  const header = PING_RUN_CSV_COLUMNS.map((c) => escape(c.header)).join(",");
  const body = rows.map((row) =>
    PING_RUN_CSV_COLUMNS.map((col) => {
      const raw = get(row, col.path);
      return escape(col.format ? col.format(raw) : raw);
    }).join(",")
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToCsv = (rows, filename = "export.csv") => {
  const header = CSV_COLUMNS.map((c) => escape(c.header)).join(",");
  const body = rows.map((row) =>
    CSV_COLUMNS.map((col) => {
      const raw = get(row, col.path);
      return escape(col.format ? col.format(raw) : raw);
    }).join(",")
  );
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
