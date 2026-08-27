import mongoose from "mongoose";

// same shape as the Api model's `assertions` field — kept in sync deliberately
const assertionsSchema = {
  enabled: { type: Boolean, default: false },
  bodyContains: { type: [String], default: [] },
  jsonPathChecks: [
    {
      path: String,
      expected: { type: mongoose.Schema.Types.Mixed },
      operator: {
        type: String,
        enum: ["equals", "exists", "contains", "gt", "lt"],
        default: "equals",
      },
    },
  ],
};

const stepSchema = new mongoose.Schema(
  {
    name: String,
    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      default: "GET",
    },
    url: { type: String, required: true },
    headers: { type: Map, of: String, default: {} },
    body: { type: mongoose.Schema.Types.Mixed, default: null },

    // captures a value from this step's JSON response body at `fromPath`
    // (dot-path) and stores it under `name` for later steps to reference
    // via {{name}} tokens in their url/headers/body
    extractVars: [
      {
        name: String,
        fromPath: String,
      },
    ],

    assertions: assertionsSchema,
  },
  { _id: false },
);

const transactionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" },

    steps: { type: [stepSchema], default: [] },

    frequency: { type: String, default: "*/5 * * * *" },
    timeout: { type: Number, default: 15000 }, // ms, applied per step
    enabled: { type: Boolean, default: true },

    // transactions notify channels directly — a multi-step transaction
    // doesn't fit the single-api scope model AlertRule uses
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: "CRM_NotificationChannel" }],

    stats: {
      lastRunAt: Date,
      lastRunStatus: String,
      uptime30d: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

transactionSchema.index({ owner: 1 });
transactionSchema.index({ enabled: 1 });

export default mongoose.model("CRM_Transaction", transactionSchema);
