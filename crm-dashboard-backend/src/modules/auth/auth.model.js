import mongoose from "mongoose";
import { getAuthConnection } from "./auth.connection.js";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "member"], default: "admin" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const getUserModel = () => {
  const conn = getAuthConnection();
  return conn.models.User || conn.model("User", UserSchema);
};
