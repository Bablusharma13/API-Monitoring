import mongoose from "mongoose";

const transactionRunSchema = new mongoose.Schema({
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CRM_Transaction",
    required: true,
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
  status: { type: String, enum: ["success", "failed"] },
  steps: [
    {
      name: String,
      statusCode: Number,
      responseTimeMs: Number,
      passed: Boolean,
      error: String,
    },
  ],
});

transactionRunSchema.index({ transaction: 1, startedAt: -1 });

export default mongoose.model("CRM_TransactionRun", transactionRunSchema);
