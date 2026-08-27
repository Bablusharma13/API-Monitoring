import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    rule: { type: mongoose.Schema.Types.ObjectId, ref: "CRM_AlertRule" },
    api: { type: mongoose.Schema.Types.ObjectId, ref: "CRM_Api" },
    incident: { type: mongoose.Schema.Types.ObjectId, ref: "CRM_Incident", default: null },

    severity: { type: String, enum: ["critical", "warning", "info"] },
    title: String,
    message: String,

    status: {
      type: String,
      enum: ["firing", "acknowledged", "resolved", "silenced"],
      default: "firing",
    },

    triggeredAt: { type: Date, default: Date.now },
    acknowledgedAt: Date,
    acknowledgedBy: String,
    resolvedAt: Date,

    value: Number,
    threshold: Number,

    notifiedChannels: [
      {
        channel: { type: mongoose.Schema.Types.ObjectId, ref: "CRM_NotificationChannel" },
        status: { type: String, enum: ["sent", "failed"] },
        at: Date,
      },
    ],
  },
  { timestamps: true },
);

alertSchema.index({ rule: 1, api: 1, status: 1 });
alertSchema.index({ status: 1, triggeredAt: -1 });

export default mongoose.model("CRM_Alert", alertSchema);
