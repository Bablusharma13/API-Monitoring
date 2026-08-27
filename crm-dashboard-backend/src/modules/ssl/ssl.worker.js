import { Worker } from "bullmq";
import { redis } from "../../shared/redis.js";
import apiModel from "../apis/api.model.js";
import incidentModel from "../incident/incident.model.js";
import { checkSslCertificate } from "./ssl.service.js";
import { evaluateSslAlerts } from "../alerts/alert.service.js";

export const startSslWorker = () => {
  const worker = new Worker(
    "ssl-check",
    async (job) => {
      const { apiId } = job.data;
      const api = await apiModel.findById(apiId);

      if (!api || !api.ssl?.enabled) {
        console.log(`SSL job for api ${apiId} not found or skipped`);
        return { skipped: true };
      }

      console.log(`Checking SSL certificate for ${api.name}...`);

      const previousStatus = api.ssl.status;
      const result = await checkSslCertificate(api);

      await apiModel.findByIdAndUpdate(api._id, {
        "ssl.lastCheckedAt": new Date(),
        "ssl.expiresAt": result.expiresAt ?? null,
        "ssl.daysUntilExpiry": result.daysUntilExpiry ?? null,
        "ssl.issuer": result.issuer ?? null,
        "ssl.status": result.status,
      });

      // ── open an incident the moment a previously-healthy cert stops being ok ──
      if (
        previousStatus === "ok" &&
        ["warning", "critical", "error"].includes(result.status)
      ) {
        try {
          await incidentModel.create({
            api: api._id,
            type: "ssl_error",
            severity:
              result.status === "critical" || result.status === "error"
                ? "critical"
                : "warning",
            title: `${api.name} SSL certificate ${result.status}`,
            status: "ongoing",
            startedAt: new Date(),
            triggeredBy: "monitor",
          });
        } catch (err) {
          console.error(
            `Failed to create SSL incident for ${api.name}:`,
            err.message,
          );
        }
      }

      // ── SSL-expiry alert rules ────────────────
      try {
        await evaluateSslAlerts(api, result.daysUntilExpiry);
      } catch (err) {
        console.error(`evaluateSslAlerts failed for ${api.name}:`, err.message);
      }

      console.log(
        `${api.name} — SSL ${result.status}${
          result.daysUntilExpiry != null ? ` — ${result.daysUntilExpiry}d` : ""
        }`,
      );
      return { status: result.status };
    },
    {
      connection: redis,
      concurrency: 5,
    },
  );

  worker.on("completed", (job, result) => {
    console.log(`SSL job ${job.id} completed:`, result);
  });

  worker.on("failed", (job, err) => {
    console.error(`SSL job ${job.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("SSL worker error:", err);
  });

  console.log("SSL worker started");
  return worker;
};
