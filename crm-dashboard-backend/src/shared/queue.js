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

export const alertEscalationQueue = new Queue("alert-escalation", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
});

export const sslCheckQueue = new Queue("ssl-check", {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "fixed", delay: 5000 },
    removeOnComplete: 20,
    removeOnFail: 50,
  },
});

export const syntheticTransactionQueue = new Queue("synthetic-transaction", {
  connection: redis,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 50,
    removeOnFail: 100,
  },
});
