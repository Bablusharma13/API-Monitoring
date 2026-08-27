import mongoose from "mongoose";

const apiSchema = new mongoose.Schema(
  {
    // identity
    apiId: { type: String, unique: true }, // "api_8f3k9x2m"
    name: { type: String, required: true },
    version: { type: String, default: "v1.0.0" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "TeamMember" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "CRM_Category" },

    tags: [String],
    notes: String,

    // request config
    request: {
      url: { type: String, required: true },
      method: {
        type: String,
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        default: "GET",
      },
      headers: { type: Map, of: String, default: {} },
      body: { type: mongoose.Schema.Types.Mixed, default: null },
      params: { type: Map, of: String, default: {} },
    },

    // api meta
    type: {
      type: String,
      enum: ["Internal", "External", "Public", "Private"],
      default: "External",
    },
    mode: { type: String, enum: ["Live", "Test"], default: "Live" },
    tech: String,
    compliance: [String],

    // auth
    auth: {
      method: {
        type: String,
        enum: ["None", "Bearer", "Basic", "APIKey", "OAuth2"],
        default: "None",
      },
      token: String, // encrypted
      username: String,
      password: String, // encrypted
      apiKey: String, // encrypted
      apiKeyHeader: String,
      clientId: String,
      clientSecret: String, // encrypted
      tokenUrl: String,
    },

    // monitoring config
    monitoring: {
      enabled: { type: Boolean, default: true },
      frequency: { type: String, default: "*/1 * * * *" },
      frequencyLabel: { type: String, default: "Every 1 min" },
      timeout: { type: Number, default: 30000 },
      retries: { type: Number, default: 1 },
      expectedStatus: { type: Number, default: 200 },
      lastCheckedAt: Date,
      nextCheckAt: Date,
      assignedAt: { type: Date, default: Date.now },
      regions: { type: [String], default: ["default"] },
    },

    // live status — updated on every check
    status: {
      current: {
        type: String,
        enum: ["active", "down", "warning", "unknown", "paused"],
        default: "unknown",
      },
      lastStatusCode: Number,
      lastResponseTime: Number,
      lastCheckedAt: Date,
      currentDownSince: Date,
      currentDownDuration: Number,
    },

    // rolling stats — updated on every check
    stats: {
      uptime24h: { type: Number, default: 0 },
      uptime7d: { type: Number, default: 0 },
      uptime30d: { type: Number, default: 0 },
      avgResponse24h: { type: Number, default: 0 },
      avgResponse7d: { type: Number, default: 0 },
      avgResponse30d: { type: Number, default: 0 },
      peakResponse30d: { type: Number, default: 0 },
      totalIncidents: { type: Number, default: 0 },
      riskScore: { type: Number, default: 0 },
    },

    // ssl certificate monitoring
    ssl: {
      enabled: { type: Boolean, default: false },
      checkFrequency: { type: String, default: "0 6 * * *" },
      lastCheckedAt: Date,
      expiresAt: Date,
      daysUntilExpiry: Number,
      issuer: String,
      status: {
        type: String,
        enum: ["ok", "warning", "critical", "error"],
        default: "ok",
      },
    },

    // response assertions
    assertions: {
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
    },

    // alerts
    alertChannels: { type: [String], default: ["email"] },

    isDisabled: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// indexes
apiSchema.index({ "status.current": 1 });
apiSchema.index({ "stats.riskScore": -1 });
apiSchema.index({ owner: 1 });
apiSchema.index({ name: 1 });

export default mongoose.model("CRM_Api", apiSchema);
