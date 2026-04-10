import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema(
  {
    canAddProject: { type: Boolean, default: false },
    canEditProject: { type: Boolean, default: false },
    canDeleteProject: { type: Boolean, default: false },

    canAddIssue: { type: Boolean, default: false },
    canEditIssue: { type: Boolean, default: false },
    canDeleteIssue: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    username: {
      type: String,
      trim: true,
      default: "",
    },

    password: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    timezone: {
      type: String,
      default: "",
    },

    facebook: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    whatsapp: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["admin", "project-manager", "employee", "client"],
      default: "client",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    adminLevel: {
      type: String,
      enum: ["", "super-admin", "support-admin"],
      default: "",
    },

    jobTitle: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    companyName: {
      type: String,
      default: "",
    },

    contactPersonName: {
      type: String,
      default: "",
    },

    businessEmail: {
      type: String,
      default: "",
    },

    budget: {
      type: Number,
      default: 0,
    },

    contractStartDate: {
      type: Date,
      default: null,
    },

    contractEndDate: {
      type: Date,
      default: null,
    },

    assignedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    permissions: {
      type: PermissionSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);