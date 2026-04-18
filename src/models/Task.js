import mongoose, { Schema } from "mongoose";

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["project", "individual"],
      required: true,
      default: "project",
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    creatorRole: {
      type: String,
      enum: ["admin", "project-manager", "employee", "client"],
      required: true,
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "in-review", "done", "blocked"],
      default: "todo",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    dueDate: {
      type: Date,
      default: null,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    reviewedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });

TaskSchema.pre("validate", function (next) {
  if (this.type === "project" && !this.projectId) {
    return next(new Error("Project task must have projectId"));
  }

  if (this.type === "individual") {
    this.projectId = null;
  }

  next();
});

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;