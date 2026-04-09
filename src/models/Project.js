import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },

    image: String,
    details: String,

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

    startDate: Date,
    completeDate: Date,

    note: String,
  },
  { timestamps: true },
);

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
