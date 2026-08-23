import mongoose from "mongoose";

const pingSchema = new mongoose.Schema(
  {
    cronJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CRM_CronJob",
      required: true,
      index: true,
    },
    runId: { type: String, unique: true, sparse: true },
    pingedAt: { type: Date },
    startedAt: { type: Date },
    endedAt: { type: Date },
    duration: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["running", "success", "failed", "timeout", "late"],
      default: "running",
    },
    type: {
      type: String,
      enum: ["scheduled", "manual", "retry"],
      default: "scheduled",
    },
    retries: { type: Number, default: 0 },
    error: { type: String, default: null },
    expectedAt: Date,
    delay: Number,
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: false },
);

pingSchema.index({ cronJob: 1, startedAt: -1 });
pingSchema.index({ cronJob: 1, runId: 1 });

const Ping = mongoose.model("CRM_CronPing", pingSchema, "crm_cron_pings");
export default Ping;
