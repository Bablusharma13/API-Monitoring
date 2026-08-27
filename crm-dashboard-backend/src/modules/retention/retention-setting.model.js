import mongoose from "mongoose";

export const RETENTION_KEYS = [
  "check_retention_days",
  "ping_retention_days",
  "tenant_metric_retention_days",
];

const retentionSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      enum: RETENTION_KEYS,
      unique: true,
      required: true,
    },
    valueDays: { type: Number, required: true },
    updatedBy: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("CRM_RetentionSetting", retentionSettingSchema);
