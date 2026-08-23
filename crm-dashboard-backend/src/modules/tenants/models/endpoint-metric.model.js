import mongoose from "mongoose";
const { Schema } = mongoose;

const EndpointMetricSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    recordedAt: { type: Date, required: true },
    count: { type: Number, default: 0 },
    minLatency: { type: Number },
    maxLatency: { type: Number },
    avgLatency: { type: Number },
    p50: { type: Number },
    p95: { type: Number },
    p99: { type: Number },
    totalErrors: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 },
  },
  { timestamps: true },
);

EndpointMetricSchema.index({ tenantId: 1, recordedAt: -1 });
EndpointMetricSchema.index({
  tenantId: 1,
  endpoint: 1,
  method: 1,
  recordedAt: -1,
});

export const EndpointMetric = mongoose.model(
  "EndpointMetric",
  EndpointMetricSchema,
);
