import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },

    image: String,
    details: String,

    clientSource: {
      type: String,
      enum: ["existing", "new"],
      default: "new",
    },

    clientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    clientName: String,
    country: String,
    value: Number,
    website: String,

    status: {
      type: String,
      enum: ["In Progress", "Complete", "Cancel"],
      default: "In Progress",
    },

    projectNumber: {
      type: Number,
      unique: true,
    },

    type: String,

    assignedTeamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    projectPhase: {
      type: String,
      enum: ["Planning", "Design", "Development", "Testing", "Deployment"],
      default: "Planning",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },

    estimatedTime: String,
    resourceLink: String,

    startDate: Date,
    completeDate: Date,

    note: String,
  },
  { timestamps: true },
);

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);