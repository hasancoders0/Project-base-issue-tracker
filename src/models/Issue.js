import mongoose from "mongoose";

const IssueActivitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    field: {
      type: String,
      default: "",
    },
    oldValue: {
      type: String,
      default: "",
    },
    newValue: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
    updatedBy: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const IssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
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

    // project-based ID
    issueNumber: {
      type: Number,
      default: 1,
    },

    // global unique ID across all issues
    globalIssueNumber: {
      type: Number,
      unique: true,
      sparse: true,
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

    attachments: {
      type: [
        {
          name: {
            type: String,
            default: "",
          },
          url: {
            type: String,
            default: "",
          },
          type: {
            type: String,
            default: "",
          },
          size: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [],
      validate: {
        validator: function (value) {
          return value.length <= 2;
        },
        message: "Maximum 2 files allowed",
      },
    },

    activities: {
      type: [IssueActivitySchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Issue || mongoose.model("Issue", IssueSchema);