import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";
import slugify from "slugify";

function getRequester(request) {
  return {
    id: request.headers.get("x-user-id") || "",
    email: request.headers.get("x-user-email") || "",
    username: request.headers.get("x-user-username") || "",
    role: request.headers.get("x-user-role") || "",
  };
}

function getAssignedMemberIds(project) {
  if (!project?.assignedTeamMembers) return [];

  return project.assignedTeamMembers.map((member) =>
    typeof member === "string" ? member : String(member._id),
  );
}

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { slug } = await params;

    const project = await Project.findOne({ slug })
      .populate("clientUserId", "fullName username email role address country")
      .populate("assignedTeamMembers", "fullName username email role image");

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch project", error: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const requester = getRequester(request);
    const { slug } = await params;
    const body = await request.json();

    const project = await Project.findOne({ slug });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    const isAdmin = requester.role === "admin";
    const isProjectManager = requester.role === "project-manager";
    const isEmployee = requester.role === "employee";

    const assignedMemberIds = getAssignedMemberIds(project);
    const isAssignedEmployee =
      isEmployee && assignedMemberIds.includes(requester.id);

    const canFullEdit = isAdmin || isProjectManager;
    const canQuickUpdate = canFullEdit || isAssignedEmployee;

    if (!canQuickUpdate) {
      return NextResponse.json(
        { message: "You do not have permission to update this project" },
        { status: 403 },
      );
    }

    if (body.quickUpdateOnly) {
      const quickUpdatedProject = await Project.findOneAndUpdate(
        { slug },
        {
          status: body.status ?? project.status,
          projectPhase: body.projectPhase ?? project.projectPhase,
          estimatedTime: body.estimatedTime ?? project.estimatedTime,
        },
        { new: true },
      )
        .populate("clientUserId", "fullName username email role address country")
        .populate("assignedTeamMembers", "fullName username email role image");

      return NextResponse.json(quickUpdatedProject);
    }

    if (!canFullEdit) {
      return NextResponse.json(
        { message: "Only admin or project manager can fully edit this project" },
        { status: 403 },
      );
    }

    const updatedTitle = body.title ?? project.title;
    const updatedSlug = `${slugify(updatedTitle, {
      lower: true,
      strict: true,
    })}-${project.projectNumber}`;

    let finalClientSource = body.clientSource ?? project.clientSource ?? "new";
    let finalClientUserId = body.clientUserId ?? project.clientUserId ?? null;
    let finalClientName = body.clientName ?? project.clientName ?? "";
    let finalCountry = body.country ?? project.country ?? "";

    if (finalClientSource === "existing" && finalClientUserId) {
      const clientUser = await User.findById(finalClientUserId);

      if (!clientUser || clientUser.role !== "client") {
        return NextResponse.json(
          { message: "Selected client user is invalid" },
          { status: 400 },
        );
      }

      finalClientUserId = clientUser._id;
      finalClientName = clientUser.fullName || clientUser.username || finalClientName;
      finalCountry = clientUser.country || clientUser.address || finalCountry;
    }

    if (finalClientSource === "new") {
      finalClientUserId = null;
    }

    const previousAssignedIds = getAssignedMemberIds(project);
    const nextAssignedIds = Array.isArray(body.assignedTeamMembers)
      ? body.assignedTeamMembers
      : previousAssignedIds;

    const removedMemberIds = previousAssignedIds.filter(
      (id) => !nextAssignedIds.includes(id),
    );

    const updatedProject = await Project.findOneAndUpdate(
      { slug },
      {
        title: updatedTitle,
        slug: updatedSlug,
        details: body.details ?? project.details,

        clientSource: finalClientSource,
        clientUserId: finalClientUserId,
        clientName: finalClientName,
        country: finalCountry,

        value: body.value ?? project.value,
        website: body.website ?? project.website,
        status: body.status ?? project.status,
        type: body.type ?? project.type,

        assignedTeamMembers: nextAssignedIds,
        projectPhase: body.projectPhase ?? project.projectPhase,
        paymentStatus: body.paymentStatus ?? project.paymentStatus,
        estimatedTime: body.estimatedTime ?? project.estimatedTime,
        resourceLink: body.resourceLink ?? project.resourceLink,

        startDate: body.startDate ?? project.startDate,
        completeDate: body.completeDate ?? project.completeDate,
        note: body.note ?? project.note,
      },
      { new: true },
    )
      .populate("clientUserId", "fullName username email role address country")
      .populate("assignedTeamMembers", "fullName username email role image");

    if (nextAssignedIds.length > 0) {
      await User.updateMany(
        { _id: { $in: nextAssignedIds } },
        { $addToSet: { assignedProjects: updatedProject._id } },
      );
    }

    if (removedMemberIds.length > 0) {
      await User.updateMany(
        { _id: { $in: removedMemberIds } },
        { $pull: { assignedProjects: updatedProject._id } },
      );
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update project", error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const requester = getRequester(request);

    if (
      requester.role !== "admin" &&
      requester.role !== "project-manager"
    ) {
      return NextResponse.json(
        { message: "Only admin or project manager can delete a project" },
        { status: 403 },
      );
    }

    const { slug } = await params;

    const project = await Project.findOne({ slug });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    await User.updateMany(
      { assignedProjects: project._id },
      { $pull: { assignedProjects: project._id } },
    );

    await Project.findOneAndDelete({ slug });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete project", error: error.message },
      { status: 500 },
    );
  }
}