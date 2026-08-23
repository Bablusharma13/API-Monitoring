import mongoose from "mongoose";
const { Schema } = mongoose;

const TenantMetricSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    recordedAt: { type: Date, required: true, index: true },
    rps: { type: Number, default: 0 },
    p50: { type: Number },
    p95: { type: Number },
    p99: { type: Number },
    errorRate: { type: Number, default: 0 },
    cpuPct: { type: Number, default: 0 },
    totalRequests: { type: Number, default: 0 },
    totalErrors: { type: Number, default: 0 },
  },
  { timestamps: true },
);

TenantMetricSchema.index({ tenantId: 1, recordedAt: -1 });
TenantMetricSchema.index(
  { recordedAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

export const TenantMetric = mongoose.model("TenantMetric", TenantMetricSchema);
