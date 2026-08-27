import mongoose from "mongoose";
const { Schema } = mongoose;

const TenantSchema = new Schema(
  {
    business_email: { type: String, required: true },
    company: { type: String, required: true },
    db_conn: { type: String, required: true },
    db_name: { type: String, required: true },
    login_url: { type: String, required: true },
    name: { type: String, required: true },
    origin: { type: [String], required: true },
    tenant_unique_name: { type: String, required: true, unique: true },
    timezone: { type: String, required: true },
    website: { type: String, required: true },
    phone: { type: Number },
    plan: {
      type: String,
      enum: ["enterprise", "business", "starter"],
      default: "starter",
    },
    userCount: { type: Number, default: 0 },
    quota: {
      requestsPerMonth: { type: Number, default: null },
      rateLimitPerMinute: { type: Number, default: null },
    },
  },
  { timestamps: true },
);

export const Tenant = mongoose.model("Tenant", TenantSchema);
