import { monitorQueue } from "../../shared/queue.js";
import apiModel from "../apis/api.model.js";
import incidentModel, {
  generateIncidentId,
} from "../incident/incident.model.js";
import dayjs from "dayjs";
import { sendEmailNotification } from "../../shared/mailer.js";
import { evaluateStatusAlerts } from "../alerts/alert.service.js";

export const unregisterMonitorJob = async (api) => {
  const repeatableJobs = await monitorQueue.getRepeatableJobs();
  const job = repeatableJobs.find((j) => j.name === `check-${api._id}`);

  if (job) {
    await monitorQueue.removeRepeatableByKey(job.key);
    console.log(`Unregistered monitor job for ${api.name}`);
  } else {
    console.warn(`No repeatable job found for ${api.name}`);
  }
};

export const reregisterMonitorJob = async (api, oldFrequency) => {
  await monitorQueue.removeRepeatable(`check-${api._id}`, {
    pattern: oldFrequency,
  });
  await registerMonitorJob(api);
};

export const syncMonitorJobs = async () => {
  const registeredJobs = await monitorQueue.getRepeatableJobs();
  const registeredIds = new Set(registeredJobs.map((j) => j.name));

  const apis = await apiModel.find({
    isDisabled: false,
  });

  let synced = 0;
  for (const api of apis) {
    const jobName = `check-${api._id}`;
    if (!registeredIds.has(jobName)) {
      await registerMonitorJob(api);
      synced++;
    }
  }

  if (synced > 0)
    console.log(`Synced ${synced} missing monitor job(s) from DB`);
  else console.log("Monitor jobs in sync — nothing to reseed");
};

export const registerMonitorJob = async (api) => {
  await monitorQueue.add(
    `check-${api._id}`,
    { apiId: api._id.toString() },
    {
      repeat: {
        pattern: api.monitoring.frequency,
      },
      jobId: `check-${api._id}`,
      attempts: 2,
      backoff: {
        type: "fixed",
        delay: 5000,
      },
      removeOnComplete: 50,
      removeOnFail: 100,
    },
  );

  console.log(
    `Registered monitor job for ${api.name} — ${api.monitoring.frequency}`,
  );
};

const buildIncidentTitle = (result) => {
  if (!result.statusCode) return `Connection failed — ${result.message}`;
  if (result.statusCode >= 500)
    return `HTTP ${result.statusCode} — Server error`;
  if (result.statusCode >= 400)
    return `HTTP ${result.statusCode} — Client error`;
  return result.message || "API is down";
};

export const handleStatusChange = async (
  api,
  previousStatus,
  newStatus,
  result,
) => {
  let incident = null;
  try {
    console.log(`${api.name} status changed: ${previousStatus} → ${newStatus}`);

    if (newStatus === "down" || newStatus === "warning") {
      if (previousStatus === "active" || previousStatus === "unknown") {
        incident = await handleDown(api, newStatus, result);
      }
    }

    if (newStatus === "active") {
      if (previousStatus === "down" || previousStatus === "warning") {
        incident = await handleRecovered(api);
      }
    }
  } catch (e) {
    console.log("error", e.stack);
  }

  // ── status-based alert rules ──────────────
  try {
    await evaluateStatusAlerts(api, previousStatus, newStatus, result, incident);
  } catch (e) {
    console.error(`evaluateStatusAlerts failed for ${api.name}:`, e.message);
  }
};

const handleDown = async (api, newStatus, result) => {
  let incident;
  try {
    // ── 1. create incident ───────────────────
    const incidentId = await generateIncidentId();
    incident = await incidentModel.create({
      incidentId,
      api: api._id,
      title: buildIncidentTitle(result),
      type: newStatus === "down" ? "down" : "high_latency",
      severity: newStatus === "down" ? "critical" : "warning",
      status: "ongoing",
      startedAt: new Date(),
      triggeredBy: "monitor",
      timeline: [
        {
          at: new Date(),
          event: `Incident opened — ${api.name} is ${newStatus}`,
          by: "monitor",
        },
      ],
    });

    // ── 2. increment incident count on api ───
    await apiModel.findByIdAndUpdate(api._id, {
      $inc: { "stats.totalIncidents": 1 },
      "status.currentDownSince": new Date(),
    });
  } catch (e) {
    console.log("error", e.stack);
  }

  // ── 3. send alert email ──────────────────
  try {
    const startedAt = new Date();
    const label = newStatus === "down" ? "CRITICAL" : "WARNING";
    if (newStatus === "down") {
      await sendEmailNotification({
        uniqueName: "api-down-template-employee",
        project: "API",
        to: [api.owner.email],
        isDisclaimer: true,
        priority: 1,
        isNote: false,
        subject: `[${label}] ${api.name} is ${newStatus}`,
        title: `${api.name}`,
        status: newStatus?.toUpperCase(),
        statusCode: result?.statusCode || "N/A",
        incidentId: incident.incidentId,
        error: result.message,
        api: api.request.url,
        owner: api.owner.name,
        audience_label: "Employee",
        startedAt: `${startedAt.toISOString().split("T")[0]} ${startedAt.toLocaleTimeString(
          "en-IN",
          {
            hour12: false,
          },
        )}`,
      });
      await sendEmailNotification({
        uniqueName: "api-down-template",
        project: "API",
        to: process.env.ADMIN_EMAILS?.split(",")
          .map((email) => email.trim())
          .filter(Boolean),
        isDisclaimer: true,
        priority: 1,
        isNote: false,
        subject: `[${label}] ${api.name} is ${newStatus}`,
        title: `${api.name} is ${newStatus}`,
        status: newStatus?.toUpperCase(),
        statusCode: result?.statusCode || "N/A",
        incidentId: incident.incidentId,
        api: api.request.url,
        owner: api.owner.name,
        method: api.request.method,
        startedAt: `${startedAt.toISOString().split("T")[0]} ${startedAt.toLocaleTimeString(
          "en-IN",
          {
            hour12: false,
          },
        )}`,
      });
    }
  } catch (err) {
    console.error(`Failed to send alert email for ${api.name}:`, err.message);
  }

  return incident || null;
};

const handleRecovered = async (api) => {
  let duration = 0;
  let openIncident;
  try {
    // ── 1. find open incident ────────────────
    openIncident = await incidentModel.findOne({
      api: api._id,
      status: "ongoing",
    });

    if (!openIncident) {
      console.log(`No open incident found for ${api.name} — skipping resolve`);
      return null;
    }

    // ── 2. compute downtime ──────────────────
    duration = dayjs().diff(dayjs(openIncident.startedAt), "minute");

    // ── 3. resolve incident ──────────────────
    await incidentModel.findByIdAndUpdate(openIncident._id, {
      status: "resolved",
      resolvedAt: new Date(),
      duration,
      $push: {
        timeline: {
          at: new Date(),
          event: `Recovered automatically after ${duration} min`,
          by: "monitor",
        },
      },
    });

    // ── 4. clear down fields on api ──────────
    await apiModel.findByIdAndUpdate(api._id, {
      "status.currentDownSince": null,
      "status.currentDownDuration": duration,
    });
  } catch (e) {
    console.log("error", e.stack);
  }

  // ── 5. send recovery email ───────────────
  try {
    console.log("sending recover email for", api);
    const startedAt = new Date();

    // const populated = await api.populate("owner");
    // const to = populated.owner?.email || process.env.DEFAULT_ALERT_EMAIL;

    await sendEmailNotification({
      uniqueName: "incident-resolved-employee",
      project: "API",
      to: [api.owner.email],
      isDisclaimer: true,
      priority: 1,
      isNote: false,
      subject: `[RECOVERED] ${api.name} is back online`,
      title: `${api.name} is Active`,
      status: "ACTIVE",
      audience_label: "Employee",
      // statusCode: result?.statusCode || "N/A",
      incidentId: openIncident.incidentId,
      duration: `${duration} min`,
      api: api.request.url,
      owner: api.owner.name,
      method: api.request.method,
      resolvedAt: `${startedAt.toISOString().split("T")[0]} ${startedAt.toLocaleTimeString(
        "en-IN",
        {
          hour12: false,
        },
      )}`,
    });

    await sendEmailNotification({
      uniqueName: "incident-resolved-admin",
      project: "API",
      to: process.env.ADMIN_EMAILS?.split(",")
        .map((email) => email.trim())
        .filter(Boolean),
      isDisclaimer: true,
      priority: 1,
      isNote: false,
      subject: `[RECOVERED] ${api.name} is back online`,
      title: `${api.name} is Active`,
      status: "ACTIVE",
      // statusCode: result?.statusCode || "N/A",
      incidentId: openIncident.incidentId,
      duration: `${duration} min`,
      api: api.request.url,
      owner: api.owner.name,
      method: api.request.method,
      resolvedAt: `${startedAt.toISOString().split("T")[0]} ${startedAt.toLocaleTimeString(
        "en-IN",
        {
          hour12: false,
        },
      )}`,
    });
  } catch (err) {
    console.error(
      `Failed to send recovery email for ${api.name}:`,
      err.message,
    );
  }

  return openIncident || null;
};
