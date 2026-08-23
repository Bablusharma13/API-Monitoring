import mongoose from "mongoose";

const PROFILE_ENUM = {
  ROLES: {
    DEVELOPER: "developer",
    TESTER: "tester",
    BUSINESS_DEVELOPMENT_EXECUTIVE: "business_development_executive",
    UNKNOWN: "unknown",
  },
};

const TeamMemberSchema = new mongoose.Schema({
  team: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    required: true,
  },
  name: { type: String, required: false, default: null },
  email: { type: String, required: false, default: null, sparse: true },
  phone: { type: String, required: false, default: null, sparse: true },

  image_url: { type: String, required: false, default: null },
  profile_name: {
    type: String,
    required: false,
    default: PROFILE_ENUM.ROLES.UNKNOWN,
  },

  employee_id: {
    type: Number,
    required: true,
  },

  login_ip: { type: String, default: null },

  otp: { type: String, maxlength: 6, default: null },
  otp_expiry: { type: Date, default: null },
  is_otp_verified: { type: Boolean, default: false },
  permissions: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
    default: [],
  },

  password: { type: String, required: false, default: null },
  isVerified: { type: Boolean, required: false, default: false },
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  isCompleted: { type: Boolean, required: true, default: false },

  grace_minutes: { type: Number, required: false },

  resetToken: { type: String, required: false, default: null },
  resetTokenExpiration: { type: Date },

  timezone: { type: String, default: "Asia/kolkata" },
  is_deleted: { type: Boolean, required: false, default: false },
  verified_date: { type: Date, default: null },

  user_details: { type: mongoose.Schema.Types.ObjectId, ref: "TeamDetails" },

  lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  system_username: { type: String, required: false, default: null },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: {
    type: Date,
    default: null,
    index: {
      expireAfterSeconds: 60 * 60 * 24 * 30,
    },
  },
});

export const TeamMember = mongoose.model("TeamMember", TeamMemberSchema);
