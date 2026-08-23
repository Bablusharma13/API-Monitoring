import { Worker } from "bullmq";
import { redis } from "../../shared/redis.js";
import { cronSchedulerQueue } from "../../shared/queue.js";
import {
  executeCronSchedule,
  checkOverdueJobs,
} from "./cron-job.service.js";

const CRON_CHECK_INTERVAL = 15_000; // 15 seconds

const createSchedulerWorker = () => {
  const schedulerWorker = new Worker(
    "cron-scheduler",
    async (job) => {
      const { cronJobId, targetUrl } = job.data;
      if (!cronJobId || !targetUrl) {
        console.error(`[cron-scheduler] Invalid job data:`, job.data);
        return;
      }

      console.log(
        `[cron-scheduler] Firing cron job ${cronJobId} → ${targetUrl}`,
      );
      const result = await executeCronSchedule(cronJobId, targetUrl);

      if (result?.skipped) {
        console.log(`[cron-scheduler] Skipped (paused/removed): ${cronJobId}`);
      } else {
        console.log(
          `[cron-scheduler] Completed: ${cronJobId}`,
          result.calledAt,
        );
      }
    },
    {
      connection: redis,
      concurrency: 5,
    },
  );

  schedulerWorker.on("error", (err) => {
    console.error("[cron-scheduler] Worker error:", err);
  });

  schedulerWorker.on("failed", async (job, err) => {
    console.error(
      `[cron-scheduler] Job ${job?.id} failed after retries:`,
      err.message,
    );
  });

  return schedulerWorker;
};

const startOverdueChecker = () => {
  const run = async () => {
    try {
      const count = await checkOverdueJobs();
      if (count > 0) {
        console.log(`[cron-overdue] Marked ${count} pending job(s) as missing`);
      }
    } catch (err) {
      console.error("[cron-overdue] Check error:", err);
    }
  };

  run();
  return setInterval(run, CRON_CHECK_INTERVAL);
};

export const startCronJobWorker = () => {
  const schedulerWorker = createSchedulerWorker();
  const overdueTimer = startOverdueChecker();
  console.log("[cron-worker] Cron scheduler worker + overdue checker started");

  return {
    schedulerWorker,
    overdueTimer,
    stop: async () => {
      clearInterval(overdueTimer);
      await schedulerWorker.close();
    },
  };
};
