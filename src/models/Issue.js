import mongoose from "mongoose";

const IssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    issueNumber: {
      type: Number,
      default: 1,
    },

    createdBy: {
      type: String,
      default: "admin",
    },

    status: {
      type: String,
      enum: ["Open", "In Progress", "Closed"],
      default: "Open",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    assignee: {
      type: String,
      default: "",
    },

    reporter: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    note: {
      type: String,
      default: "",
    },

    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Issue || mongoose.model("Issue", IssueSchema);