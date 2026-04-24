import mongoose, { Schema } from "mongoose";

const ActivitySchema = new Schema(
  {
    entityType: {
      type: String,
      enum: ["project", "issue", "task", "user"],
      required: true,
      trim: true,
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    field: {
      type: String,
      default: "",
      trim: true,
    },

    from: {
      type: Schema.Types.Mixed,
      default: null,
    },

    to: {
      type: Schema.Types.Mixed,
      default: null,
    },

    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
ActivitySchema.index({ projectId: 1, createdAt: -1 });
ActivitySchema.index({ performedBy: 1, createdAt: -1 });

export default mongoose.models.Activity ||
  mongoose.model("Activity", ActivitySchema);