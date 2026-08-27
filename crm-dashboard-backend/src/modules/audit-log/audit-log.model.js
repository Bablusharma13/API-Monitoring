import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: String,
      default: null,
    },

    actorEmail: {
      type: String,
      default: null,
    },

    action: {
      type: String,
      required: true,
    },

    entityType: {
      type: String,
      default: null,
    },

    entityId: {
      type: String,
      default: null,
    },

    method: {
      type: String,
      default: null,
    },

    summary: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// ── Indexes ────────────────────────────
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ entityType: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ actorEmail: 1 });

export default mongoose.model("CRM_AuditLog", auditLogSchema);
