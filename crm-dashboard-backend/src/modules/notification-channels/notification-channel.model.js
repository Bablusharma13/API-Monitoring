import mongoose from "mongoose";

const notificationChannelSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["email", "slack", "webhook", "pagerduty", "discord"],
      required: true,
    },
    name: { type: String, required: true },

    // shape varies by type:
    //  email     -> { to: [String] }
    //  slack/discord/pagerduty -> { webhookUrl: String }
    //  webhook   -> { url: String, headers: Map<String,String> }
    config: { type: mongoose.Schema.Types.Mixed, default: {} },

    severityFilter: {
      type: [String],
      enum: ["critical", "warning", "info"],
      default: [], // empty means "all severities"
    },

    enabled: { type: Boolean, default: true },

    stats: {
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      lastUsed: { type: Date, default: null },
    },

    createdBy: String,
  },
  { timestamps: true },
);

export default mongoose.model("CRM_NotificationChannel", notificationChannelSchema);
