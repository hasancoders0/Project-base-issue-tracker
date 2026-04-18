import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import Project from "@/models/Project";

function getRequester(request) {
  return {
    id: request.headers.get("x-user-id") || "",
    email: request.headers.get("x-user-email") || "",
    username: request.headers.get("x-user-username") || "",
    role: request.headers.get("x-user-role") || "",
  };
}

function canManageIssue(requesterRole) {
  return requesterRole === "admin" || requesterRole === "project-manager";
}

function canAssignedProjectUserEdit(requesterRole) {
  return requesterRole === "employee" || requesterRole === "client";
}

function canAssignedProjectUserDelete(requesterRole) {
  return requesterRole === "client";
}

function toText(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === null || value === undefined) return "";
  return String(value);
}

function buildActivityMessage(field, oldValue, newValue, updatedBy) {
  if (field === "status") {
    return `${updatedBy} changed status from "${oldValue}" to "${newValue}"`;
  }

  if (field === "assignee") {
    return `${updatedBy} changed assignee from "${oldValue || "Unassigned"}" to "${newValue || "Unassigned"}"`;
  }

  if (field === "priority") {
    return `${updatedBy} changed priority from "${oldValue}" to "${newValue}"`;
  }
  if (field === "attachments") {
    return `${updatedBy} updated attachments`;
  }

  return `${updatedBy} updated ${field}`;
}

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const issue = await Issue.findById(id).populate(
      "projectId",
      "title slug projectNumber assignedTeamMembers",
    );

    if (!issue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch issue", error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const requester = getRequester(request);
    const updatedBy = requester.username || requester.email || "user";

    const { id } = await params;
    const body = await request.json();

    const existingIssue = await Issue.findById(id);

    if (!existingIssue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    const relatedProject = await Project.findById(
      existingIssue.projectId,
    ).select("assignedTeamMembers");

    if (!relatedProject) {
      return NextResponse.json(
        { message: "Related project not found" },
        { status: 404 },
      );
    }

    const isManager = canManageIssue(requester.role);
    const isAssignedProjectUser =
      canAssignedProjectUserEdit(requester.role) &&
      relatedProject.assignedTeamMembers
        .map((memberId) => String(memberId))
        .includes(String(requester.id));

    if (!isManager && !isAssignedProjectUser) {
      return NextResponse.json(
        {
          message:
            "You do not have permission to edit or change status for this issue",
        },
        { status: 403 },
      );
    }

    const nextData = {
      title: body.title,
      description: body.description || "",
      projectId: body.projectId || existingIssue.projectId,
      status: body.status || "Open",
      priority: body.priority || "Medium",
      assignee: body.assignee || "",
      reporter: body.reporter || "",
      tags: body.tags || [],
      note: body.note || "",
      attachments: body.attachments || [],
      closedAt: body.status === "Closed" ? new Date() : null,
    };

    const activities = [...(existingIssue.activities || [])];

    const trackedFields = [
      "title",
      "description",
      "status",
      "priority",
      "assignee",
      "reporter",
      "tags",
      "note",
      "attachments",
    ];

    trackedFields.forEach((field) => {
      const oldValue = toText(existingIssue[field]);
      const newValue = toText(nextData[field]);

      if (oldValue !== newValue) {
        activities.push({
          action: "updated",
          field,
          oldValue,
          newValue,
          message: buildActivityMessage(field, oldValue, newValue, updatedBy),
          updatedBy,
        });
      }
    });

    await Issue.findByIdAndUpdate(
      id,
      {
        ...nextData,
        activities,
      },
      { new: true },
    );

    const updatedIssue = await Issue.findById(id).populate(
      "projectId",
      "title slug projectNumber assignedTeamMembers",
    );

    if (!updatedIssue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(updatedIssue);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update issue", error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const requester = getRequester(request);
    const { id } = await params;

    const existingIssue = await Issue.findById(id);

    if (!existingIssue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    const relatedProject = await Project.findById(
      existingIssue.projectId,
    ).select("assignedTeamMembers");

    if (!relatedProject) {
      return NextResponse.json(
        { message: "Related project not found" },
        { status: 404 },
      );
    }

    const isManager = canManageIssue(requester.role);
    const isAssignedClient =
      canAssignedProjectUserDelete(requester.role) &&
      relatedProject.assignedTeamMembers
        .map((memberId) => String(memberId))
        .includes(String(requester.id));

    if (!isManager && !isAssignedClient) {
      return NextResponse.json(
        {
          message: "You do not have permission to delete this issue",
        },
        { status: 403 },
      );
    }

    const deletedIssue = await Issue.findByIdAndDelete(id);

    if (!deletedIssue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Issue deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete issue", error: error.message },
      { status: 500 },
    );
  }
}
