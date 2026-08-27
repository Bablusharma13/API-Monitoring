import mongoose from "mongoose";

const maintenanceWindowSchema = new mongoose.Schema(
  {
    scope: {
      type: {
        type: String,
        enum: ["all", "category", "api"],
        default: "all",
      },
      categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "CRM_Category" }],
      apiIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "CRM_Api" }],
    },

    reason: String,
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },

    createdBy: String,
  },
  { timestamps: true },
);

export default mongoose.model("CRM_MaintenanceWindow", maintenanceWindowSchema);
