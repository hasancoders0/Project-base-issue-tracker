import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";
import Activity from "@/models/Activity";
import slugify from "slugify";

function getRequester(request) {
  return {
    id: request.headers.get("x-user-id") || "",
    email: request.headers.get("x-user-email") || "",
    username: request.headers.get("x-user-username") || "",
    role: request.headers.get("x-user-role") || "",
  };
}

export async function GET() {
  try {
    await connectDB();

    const projects = await Project.find()
      .populate(
        "clientUserId",
        "fullName username email role address assignedProjects",
      )
      .populate("assignedTeamMembers", "fullName username email role image")
      .sort({ createdAt: -1 });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch projects", error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const requester = getRequester(request);

    if (requester.role !== "admin" && requester.role !== "project-manager") {
      return NextResponse.json(
        { message: "Only admin or project manager can create a project" },
        { status: 403 },
      );
    }

    const formData = await request.formData();

    const count = await Project.countDocuments();
    const projectNumber = count + 1;

    const title = formData.get("title") || "project";
    const imagePath = formData.get("image") || "";

    const slug = `${slugify(title, {
      lower: true,
      strict: true,
    })}-${projectNumber}`;

    let assignedTeamMembers = [];

    try {
      const parsedMembers = JSON.parse(
        formData.get("assignedTeamMembers") || "[]",
      );

      assignedTeamMembers = Array.isArray(parsedMembers) ? parsedMembers : [];
    } catch (error) {
      assignedTeamMembers = [];
    }

    const clientSource = formData.get("clientSource") || "new";
    const clientUserId = formData.get("clientUserId") || "";

    let clientName = formData.get("clientName") || "";
    let country = formData.get("country") || "";
    let finalClientUserId = null;

    if (clientSource === "existing" && clientUserId) {
      const clientUser = await User.findById(clientUserId);

      if (!clientUser || clientUser.role !== "client") {
        return NextResponse.json(
          { message: "Selected client user is invalid" },
          { status: 400 },
        );
      }

      finalClientUserId = clientUser._id;
      clientName = clientUser.fullName || clientUser.username || clientName;
      country = clientUser.country || clientUser.address || country;
    }

    const newProject = await Project.create({
      title,
      slug,
      image: imagePath,
      details: formData.get("details") || "",

      clientSource,
      clientUserId: finalClientUserId,
      clientName,
      country,

      value: Number(formData.get("value")) || 0,
      website: formData.get("website") || "",
      status: formData.get("status") || "In Progress",
      projectNumber,
      type: formData.get("type") || "Other",

      assignedTeamMembers,
      projectPhase: formData.get("projectPhase") || "Planning",
      paymentStatus: formData.get("paymentStatus") || "Pending",
      estimatedTime: formData.get("estimatedTime") || "",
      resourceLink: formData.get("resourceLink") || "",
      startDate: formData.get("startDate") || null,
      completeDate: formData.get("completeDate") || null,
      note: formData.get("note") || "",
    });

    // sync assigned project to team members
    if (assignedTeamMembers.length > 0) {
      await User.updateMany(
        { _id: { $in: assignedTeamMembers } },
        { $addToSet: { assignedProjects: newProject._id } },
      );
    }

    // sync assigned project to selected client user
    if (finalClientUserId) {
      await User.findByIdAndUpdate(
        finalClientUserId,
        { $addToSet: { assignedProjects: newProject._id } },
        { new: true },
      );
    }

    // global activity log
    await Activity.create({
      entityType: "project",
      entityId: newProject._id,
      projectId: newProject._id,
      action: "created",
      field: "project",
      from: null,
      to: newProject.title,
      performedBy: requester.id,
    });

    const populatedProject = await Project.findById(newProject._id)
      .populate(
        "clientUserId",
        "fullName username email role address assignedProjects",
      )
      .populate("assignedTeamMembers", "fullName username email role image");

    return NextResponse.json(populatedProject, { status: 201 });
  } catch (error) {
    console.log("PROJECT CREATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create project", error: error.message },
      { status: 500 },
    );
  }
}