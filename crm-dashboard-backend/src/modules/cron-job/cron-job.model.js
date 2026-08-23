import mongoose from "mongoose";

const pingSnapshotSchema = new mongoose.Schema(
  {
    pingedAt: Date,
    duration: Number,
    status: { type: String, enum: ["ok", "late"] },
  },
  { _id: false },
);

const cronJobSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" },

    cronExpression: { type: String, required: true },
    frequencyLabel: { type: String, default: "" },
    grace: { type: Number, default: 60 },

    status: {
      type: String,
      enum: ["on_time", "late", "missing", "paused", "pending"],
      default: "on_time",
    },

    lastPingAt: Date,
    lastCalledAt: Date,
    expectedAt: Date,
    nextExpectedAt: Date,
    overdueAt: Date,
    lastDuration: Number,

    currentRunId: { type: String, default: null },

    totalPings: { type: Number, default: 0 },
    pingsToday: { type: Number, default: 0 },
    pingsTodayDate: Date,

    alertFired: { type: Boolean, default: false },
    isPaused: { type: Boolean, default: false },

    last30Pings: { type: [pingSnapshotSchema], default: [] },

    stats: {
      uptime24h: { type: Number, default: 100 },
      successRate24h: { type: Number, default: 100 },
      missedRuns24h: { type: Number, default: 0 },
      uptime7d: { type: Number, default: 100 },
      successRate7d: { type: Number, default: 100 },
      missedRuns7d: { type: Number, default: 0 },
      uptime30d: { type: Number, default: 100 },
      successRate30d: { type: Number, default: 100 },
      missedRuns30d: { type: Number, default: 0 },
      avgDuration24h: { type: Number, default: 0 },
      avgDuration7d: { type: Number, default: 0 },
      avgDuration30d: { type: Number, default: 0 },
    },

    pingUrl: { type: String, default: "" },
    targetUrl: { type: String, default: "" },

    notes: String,
    tags: [String],
  },
  { timestamps: true },
);

cronJobSchema.index({ status: 1 });
cronJobSchema.index({ overdueAt: 1 });

export default mongoose.model("CRM_CronJob", cronJobSchema);
