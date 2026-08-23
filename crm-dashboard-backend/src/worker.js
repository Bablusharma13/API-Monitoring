import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./shared/db.js";
import { startMonitorWorker } from "./modules/monitor/monitor.worker.js";
import { syncMonitorJobs } from "./modules/monitor/monitor.service.js";
import { startCronJobWorker } from "./modules/cron-job/cron-job.worker.js";
import { syncCronSchedules } from "./modules/cron-job/cron-job.service.js";

(async () => {
  await connectDB();
  startMonitorWorker();
  startCronJobWorker();
  await syncMonitorJobs();
  await syncCronSchedules();
  console.log("Worker process ready");
})();
