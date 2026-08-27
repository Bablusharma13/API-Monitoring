import { Worker } from "bullmq";
import { redis } from "../../shared/redis.js";
import { runTransaction } from "./transaction.service.js";

export const startTransactionWorker = () => {
  const worker = new Worker(
    "synthetic-transaction",
    async (job) => {
      const { transactionId } = job.data;
      return await runTransaction(transactionId);
    },
    {
      connection: redis,
      concurrency: 5,
    },
  );

  worker.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed:`, result?.status);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("Worker error:", err);
  });

  console.log("Transaction worker started");
  return worker;
};
