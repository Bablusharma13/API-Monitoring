import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./shared/db.js";
import { startMonitorWorker } from "./modules/monitor/monitor.worker.js";
import { syncMonitorJobs } from "./modules/monitor/monitor.service.js";
import { startCronJobWorker } from "./modules/cron-job/cron-job.worker.js";
import { syncCronSchedules } from "./modules/cron-job/cron-job.service.js";
import { startSslWorker } from "./modules/ssl/ssl.worker.js";
import { syncSslJobs } from "./modules/ssl/ssl.service.js";
import { startAlertEscalationWorker } from "./modules/alerts/alert-escalation.worker.js";
import { startTransactionWorker } from "./modules/transactions/transaction.worker.js";
import { syncTransactionJobs } from "./modules/transactions/transaction.service.js";

(async () => {
  await connectDB();
  startMonitorWorker();
  startCronJobWorker();
  startSslWorker();
  startAlertEscalationWorker();
  startTransactionWorker();
  await syncMonitorJobs();
  await syncCronSchedules();
  await syncSslJobs();
  await syncTransactionJobs();
  console.log("Worker process ready");
})();
