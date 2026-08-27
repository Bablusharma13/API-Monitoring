import { Worker } from "bullmq";
import { redis } from "../../shared/redis.js";
import Alert from "./alert.model.js";
import AlertRule from "../alert-rules/alert-rule.model.js";
import { dispatchToChannel } from "./alert.service.js";

export const startAlertEscalationWorker = () => {
  const worker = new Worker(
    "alert-escalation",
    async (job) => {
      const { alertId, tierIndex } = job.data;

      const alert = await Alert.findById(alertId);

      // Cancellation is best-effort (a job may already be in flight when the
      // alert is acked/resolved), so the real safety net is here: only act
      // on alerts that are still firing.
      if (!alert || alert.status !== "firing") {
        return { skipped: true };
      }

      const rule = await AlertRule.findById(alert.rule).populate("escalation.channels");
      const tier = rule?.escalation?.[tierIndex];
      if (!tier) {
        return { skipped: true };
      }

      for (const channel of tier.channels || []) {
        if (!channel) continue;
        await dispatchToChannel(channel, alert);
      }

      await Alert.updateOne({ _id: alert._id }, { $addToSet: { escalatedTiers: tierIndex } });

      return { escalated: true, tierIndex };
    },
    {
      connection: redis,
      concurrency: 5,
    },
  );

  worker.on("completed", (job, result) => {
    console.log(`Alert escalation job ${job.id} completed:`, result);
  });

  worker.on("failed", (job, err) => {
    console.error(`Alert escalation job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("Alert escalation worker error:", err);
  });

  console.log("Alert escalation worker started");
  return worker;
};
