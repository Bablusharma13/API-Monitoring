import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
    },

    description: {
      type: String,
      default: null,
    },

    color: {
      type: String,
      default: "#6366f1",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamMember",
      default: null,
    },

    compliance: {
      type: [String],
      default: [],
    },

    defaultAlertChannel: {
      type: String,
      enum: ["email", "slack"],
      default: "email",
    },

    tags: {
      type: [String],
      default: [],
    },

    // ── Computed Stats (denormalized) ───────
    // updated by a background job — not on every API change
    stats: {
      totalApis: { type: Number, default: 0 },
      activeApis: { type: Number, default: 0 },
      downApis: { type: Number, default: 0 },
      warningApis: { type: Number, default: 0 },
      avgUptime: { type: Number, default: 0 },
      avgResponse: { type: Number, default: 0 },
      totalIncidents: { type: Number, default: 0 },
      lastIncidentAt: { type: Date, default: null },
      lastCheckedAt: { type: Date, default: null },
      healthScore: { type: Number, default: 100 },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// ── Indexes ────────────────────────────
categorySchema.index({ owner: 1 });
categorySchema.index({ "stats.healthScore": -1 });

categorySchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    let baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    let slug = baseSlug;
    let count = 1;

    while (await this.constructor.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }
});

export default mongoose.model("CRM_Category", categorySchema);
