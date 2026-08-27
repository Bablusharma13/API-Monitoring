import mongoose from "mongoose";

const alertRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    signal: {
      type: String,
      enum: ["status", "latency", "errorRate"],
      required: true,
    },

    condition: {
      statuses: { type: [String], enum: ["down", "warning"], default: [] }, // signal=status
      thresholdMs: Number, // signal=latency
      thresholdPct: Number, // signal=errorRate
    },

    scope: {
      type: {
        type: String,
        enum: ["all", "category", "api"],
        default: "all",
      },
      categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "CRM_Category" }],
      apiIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "CRM_Api" }],
    },

    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: "CRM_NotificationChannel" }],

    severity: {
      type: String,
      enum: ["critical", "warning", "info"],
      default: "warning",
    },

    cooldownMinutes: { type: Number, default: 15 },
    autoResolve: { type: Boolean, default: true },
    enabled: { type: Boolean, default: true },

    createdBy: String,
  },
  { timestamps: true },
);

export default mongoose.model("CRM_AlertRule", alertRuleSchema);
