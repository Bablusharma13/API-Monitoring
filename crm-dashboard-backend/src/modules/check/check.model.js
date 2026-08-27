import mongoose from "mongoose";

const checkSchema = new mongoose.Schema({
  api: { type: mongoose.Schema.Types.ObjectId, ref: "CRM_Api", required: true },
  apiName: { type: String, required: true },
  checkedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["ok", "warn", "error", "timeout"] },
  statusCode: Number,
  responseTime: Number,
  message: String,
  error: String,
  region: { type: String, default: "default" },
  expiresAt: Date,
});

checkSchema.index({ api: 1, checkedAt: -1 });
checkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("CRM_Check", checkSchema);
