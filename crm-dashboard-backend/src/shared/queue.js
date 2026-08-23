import { Queue } from "bullmq";
import { redis } from "./redis.js";

export const monitorQueue = new Queue("api-monitor", {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "fixed", delay: 5000 },
  },
});

export const cronSchedulerQueue = new Queue("cron-scheduler", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
