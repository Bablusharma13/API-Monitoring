import mongoose from "mongoose";
const { Schema } = mongoose;

const RequestLogSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "TeamMember",
      required: true,
    },
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    statusCode: { type: Number, required: true },
    latency: { type: Number, required: true },
    ip: { type: String },
    recordedAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

RequestLogSchema.index({ tenantId: 1, recordedAt: -1 });
RequestLogSchema.index({ tenantId: 1, endpoint: 1 });

export const RequestLog = mongoose.model("RequestLog", RequestLogSchema);
