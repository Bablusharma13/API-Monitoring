# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server with nodemon (hot-reload)
npm run start    # Production: start via PM2 (ecosystem.config.cjs)
npm run logs     # Stream PM2 logs
npm run status   # PM2 process status
```

Requires MongoDB and Redis running locally before starting.

## Environment Variables

```
PORT=8081
MONGO_URI=mongodb://localhost:27017/crm-dashboard-backend
REDIS_HOST=localhost          # port hardcoded to 6379 in src/shared/redis.js
CRM_DASHBOARD_URL=http://localhost:5173   # CORS allowed origin
EMAIL_MS_URL=                 # External email microservice endpoint
SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM   # Fallback direct SMTP
```

## Architecture

Express 5 backend for a CRM API monitoring dashboard. Stack: MongoDB (Mongoose), Redis, BullMQ.

**Request flow:** HTTP → `src/app.js` routes → module controller → module service → Mongoose model → MongoDB

**Process split** — `src/index.js` starts the HTTP server and imports `src/worker.js`. `src/worker.js` runs independently and handles all BullMQ workers. In production, PM2 runs both via `ecosystem.config.cjs`.

**Startup sequence** (`src/worker.js`):
1. Connect to MongoDB
2. Start API monitor worker (`monitor.worker.js`, concurrency 5) on queue `api-monitor`
3. Start cron-job scheduler worker (`cron-job.worker.js`, concurrency 5) on queue `cron-scheduler`
4. `syncMonitorJobs()` — re-registers any BullMQ repeatable jobs missing from the queue (survives Redis flush)
5. `syncCronSchedules()` — same for cron-job schedules

## Module Pattern

Each module under `src/modules/` has: `*.model.js` → `*.service.js` → `*.controller.js` → `*.routes.js`

**Modules:**
- `apis` — monitored API definitions
- `incident` — incidents created/resolved by the monitor
- `check` — individual check results (TTL 90 days via `expiresAt`)
- `categories` — groups of APIs with rolled-up stats
- `monitor` — BullMQ worker + `registerMonitorJob` / `handleStatusChange`
- `cron-job` — external cron heartbeat monitoring (ping-based, separate from API monitoring)
- `dashboard` — aggregate stats for the main dashboard view
- `leaderboard` — ranked API/team stats
- `team-members` — API owners
- `tenants` — multi-tenant SaaS customers with per-tenant DB connections

## API Monitoring Flow

When an API is created/updated, `registerMonitorJob()` adds a BullMQ repeatable job keyed to `check-<apiId>` using the API's cron pattern (default `*/1 * * * *`). The worker:

1. Makes an HTTP request using the API's config (method, headers, auth, body)
2. Classifies result: `active` (2xx + within timeout), `warning` (wrong status or slow), `down` (error/no response)
3. Writes a `Check` record and recomputes rolling uptime stats on the `Api` doc (24h/7d/30d windows) from raw `Check` documents — no incremental counters
4. On status change → `handleStatusChange()` creates or auto-resolves `Incident` records and sends email alerts via `sendEmailNotification()` (delegates to `EMAIL_MS_URL` microservice)

## Cron-Job Monitoring Flow

`CronJob` records track **external** scheduled jobs via inbound pings. A client hits `/ping/:slug` to signal execution. The system:
- Marks jobs `late` / `missing` if a ping doesn't arrive within `grace` seconds of `expectedAt`
- `checkOverdueJobs()` runs every 15 s via `setInterval` to sweep for overdue jobs
- `last30Pings` array is kept inline on the document (no separate collection)

## Data Model Relationships

- `Api` → many `Check` (monitoring history, 90-day TTL)
- `Api` → many `Incident` (failure events)
- `Category` → many `Api`
- `Tenant` → `TenantMetric`, `EndpointMetric`, `RequestLog` (analytics ingested externally)

`Api.status` holds live state (`current`, `lastStatusCode`, `lastResponseTime`, `currentDownSince`). `Api.stats` holds denormalized uptime/latency aggregates.

`Tenant.db_conn` is a full MongoDB connection string to that tenant's own database. `tenant.service.js` opens ephemeral `mongoose.createConnection()` calls (closed in `finally`) to query tenant-side collections directly.

## Response Helpers

All controllers use `successResponse(res, message, data)` and `errorResponse(res, message, statusCode)` from `src/utils/responses.js`. Response shape: `{ message, data }`.

## API Routes (base: `/api/v1`)

| Prefix | Router |
|--------|--------|
| `/categories` | `categoryRouter` |
| `/apis` | `apiRouter` |
| `/incidents` | `incidentRouter` |
| `/team-members` | `teamMembersRouter` |
| `/dashboard` | `dashboardRouter` |
| `/checks` | `checkRouter` |
| `/leaderboard` | `leaderboardRouter` |
| `/tenants` | `tenantRouter` |
| `/cron-jobs` | `cronJobRouter` |
| `/ping` | `pingRouter` (cron heartbeat receiver) |
