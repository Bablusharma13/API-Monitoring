import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
export const Counter = mongoose.model("Counter", counterSchema);

export const generateIncidentId = async () => {
  const year = new Date().getFullYear();
  const result = await Counter.findOneAndUpdate(
    { _id: `incident_${year}` },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );
  return `INC-${year}-${String(result.seq).padStart(4, "0")}`;
};

const incidentSchema = new mongoose.Schema(
  {
    incidentId: { type: String, unique: true, sparse: true },
    api: { type: mongoose.Schema.Types.ObjectId, ref: "CRM_Api" },
    title: String,
    type: {
      type: String,
      enum: ["down", "high_latency", "ssl_error", "timeout"],
    },
    severity: { type: String, enum: ["critical", "warning", "info"] },
    status: {
      type: String,
      enum: ["ongoing", "resolved", "acknowledged"],
      default: "ongoing",
    },
    startedAt: { type: Date, default: Date.now },
    resolvedAt: Date,
    duration: Number,
    triggeredBy: {
      type: String,
      enum: ["monitor", "manual"],
      default: "monitor",
    },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" },
    timeline: [
      {
        at: Date,
        event: String,
        by: String,
      },
    ],
  },
  { timestamps: true },
);

incidentSchema.index({ api: 1, status: 1 });
incidentSchema.index({ status: 1, severity: 1 });

export default mongoose.model("CRM_Incident", incidentSchema);
