import tls from "tls";
import dayjs from "dayjs";
import { sslCheckQueue } from "../../shared/queue.js";
import apiModel from "../apis/api.model.js";

const CONNECT_TIMEOUT_MS = 10000;
const SSL_PORT = 443;

/**
 * Opens a real TLS connection to the API's hostname on port 443, reads the
 * peer certificate and classifies its expiry.
 *
 * @param {object} api - an Api document (must have request.url)
 * @returns {Promise<{status: "ok"|"warning"|"critical"|"error", expiresAt?: Date, daysUntilExpiry?: number, issuer?: string, error?: string}>}
 */
export const checkSslCertificate = (api) => {
  return new Promise((resolve) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(api.request.url);
    } catch (err) {
      resolve({ status: "error", error: `Invalid URL: ${err.message}` });
      return;
    }

    if (parsedUrl.protocol !== "https:") {
      resolve({ status: "error", error: "not an https URL" });
      return;
    }

    const hostname = parsedUrl.hostname;
    let settled = false;

    // NOTE: rejectUnauthorized is intentionally false — we still want to
    // read the peer certificate (and compute a real expiry) even when the
    // chain is untrusted, self-signed, or already expired. Validity of the
    // chain is not what this check reports on; expiry is.
    const socket = tls.connect({
      host: hostname,
      port: SSL_PORT,
      servername: hostname,
      timeout: CONNECT_TIMEOUT_MS,
      rejectUnauthorized: false,
    });

    const finish = (payload) => {
      if (settled) return;
      settled = true;
      socket.end();
      socket.destroy();
      resolve(payload);
    };

    socket.once("secureConnect", () => {
      try {
        const cert = socket.getPeerCertificate();

        if (!cert || !cert.valid_to) {
          finish({
            status: "error",
            error: "No certificate returned by server",
          });
          return;
        }

        const expiresAt = new Date(cert.valid_to);
        const daysUntilExpiry = dayjs(expiresAt).diff(dayjs(), "day");
        const issuer = cert.issuer?.O || cert.issuer?.CN || "Unknown";

        let status;
        if (daysUntilExpiry > 30) status = "ok";
        else if (daysUntilExpiry >= 7) status = "warning";
        else status = "critical";

        finish({ status, expiresAt, daysUntilExpiry, issuer });
      } catch (err) {
        finish({ status: "error", error: err.message });
      }
    });

    socket.once("timeout", () => {
      finish({
        status: "error",
        error: `Connection to ${hostname}:${SSL_PORT} timed out`,
      });
    });

    socket.once("error", (err) => {
      finish({ status: "error", error: err.message });
    });
  });
};

export const registerSslJob = async (api) => {
  await sslCheckQueue.add(
    `ssl-${api._id}`,
    { apiId: api._id.toString() },
    {
      repeat: {
        pattern: api.ssl.checkFrequency,
      },
      jobId: `ssl-${api._id}`,
    },
  );

  console.log(
    `Registered SSL check job for ${api.name} — ${api.ssl.checkFrequency}`,
  );
};

export const unregisterSslJob = async (api) => {
  try {
    const repeatableJobs = await sslCheckQueue.getRepeatableJobs();
    const job = repeatableJobs.find((j) => j.name === `ssl-${api._id}`);

    if (job) {
      await sslCheckQueue.removeRepeatableByKey(job.key);
      console.log(`Unregistered SSL check job for ${api.name}`);
    } else {
      console.warn(`No SSL repeatable job found for ${api.name}`);
    }
  } catch (err) {
    console.error(`Failed to unregister SSL job for ${api.name}:`, err.message);
  }
};

export const syncSslJobs = async () => {
  const apis = await apiModel.find({
    isDisabled: false,
    "ssl.enabled": true,
  });

  let synced = 0;
  for (const api of apis) {
    await registerSslJob(api);
    synced++;
  }

  console.log(`Synced ${synced} SSL check job(s) from DB`);
};
