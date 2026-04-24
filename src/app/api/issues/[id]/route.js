import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import Project from "@/models/Project";
import {
  addActivityIfChanged,
  createManyActivities,
  createActivity,
} from "@/lib/activityHelper";

function getRequester(request) {
  return {
    id: request.headers.get("x-user-id") || "",
    username: request.headers.get("x-user-username") || "",
    email: request.headers.get("x-user-email") || "",
    role: request.headers.get("x-user-role") || "",
  };
}

function same(a, b) {
  return String(a ?? "") === String(b ?? "");
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
      return NextResponse.json(
        { message: "Issue not found" },
        { status: 404 },
      );
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
    const { id } = await params;
    const body = await request.json();

    const existingIssue = await Issue.findById(id);
    if (!existingIssue) {
      return NextResponse.json(
        { message: "Issue not found" },
        { status: 404 },
      );
    }

    const project = await Project.findById(existingIssue.projectId);
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 },
      );
    }

    const nextData = {
      title: body.title ?? existingIssue.title,
      description: body.description ?? existingIssue.description,
      projectId: body.projectId ?? existingIssue.projectId,
      status: body.status ?? existingIssue.status,
      priority: body.priority ?? existingIssue.priority,
      assignee: body.assignee ?? existingIssue.assignee,
      reporter: body.reporter ?? existingIssue.reporter,
      tags: body.tags ?? existingIssue.tags,
      note: body.note ?? existingIssue.note,
      attachments: body.attachments ?? existingIssue.attachments,
      closedAt: body.status === "Closed" ? new Date() : null,
    };

    const activities = [];

    addActivityIfChanged({
      activities,
      entityType: "issue",
      entityId: existingIssue._id,
      projectId: project._id,
      action: "status_changed",
      field: "status",
      from: existingIssue.status,
      to: nextData.status,
      performedBy: requester.id,
    });

    addActivityIfChanged({
      activities,
      entityType: "issue",
      entityId: existingIssue._id,
      projectId: project._id,
      action: "priority_changed",
      field: "priority",
      from: existingIssue.priority,
      to: nextData.priority,
      performedBy: requester.id,
    });

    addActivityIfChanged({
      activities,
      entityType: "issue",
      entityId: existingIssue._id,
      projectId: project._id,
      action: "assigned",
      field: "assignee",
      from: existingIssue.assignee,
      to: nextData.assignee,
      performedBy: requester.id,
    });

    addActivityIfChanged({
      activities,
      entityType: "issue",
      entityId: existingIssue._id,
      projectId: project._id,
      action: "updated",
      field: "title",
      from: existingIssue.title,
      to: nextData.title,
      performedBy: requester.id,
    });

    addActivityIfChanged({
      activities,
      entityType: "issue",
      entityId: existingIssue._id,
      projectId: project._id,
      action: "updated",
      field: "description",
      from: existingIssue.description,
      to: nextData.description,
      performedBy: requester.id,
    });

    addActivityIfChanged({
      activities,
      entityType: "issue",
      entityId: existingIssue._id,
      projectId: project._id,
      action: "updated",
      field: "reporter",
      from: existingIssue.reporter,
      to: nextData.reporter,
      performedBy: requester.id,
    });

    addActivityIfChanged({
      activities,
      entityType: "issue",
      entityId: existingIssue._id,
      projectId: project._id,
      action: "updated",
      field: "note",
      from: existingIssue.note,
      to: nextData.note,
      performedBy: requester.id,
    });

    if (!same(existingIssue.tags?.join(","), nextData.tags?.join(","))) {
      activities.push({
        entityType: "issue",
        entityId: existingIssue._id,
        projectId: project._id,
        action: "updated",
        field: "tags",
        from: existingIssue.tags || [],
        to: nextData.tags || [],
        performedBy: requester.id,
      });
    }

    if (
      !same(
        existingIssue.attachments?.join(","),
        nextData.attachments?.join(","),
      )
    ) {
      activities.push({
        entityType: "issue",
        entityId: existingIssue._id,
        projectId: project._id,
        action: "updated",
        field: "attachments",
        from: existingIssue.attachments || [],
        to: nextData.attachments || [],
        performedBy: requester.id,
      });
    }

    if (!same(existingIssue.projectId, nextData.projectId)) {
      activities.push({
        entityType: "issue",
        entityId: existingIssue._id,
        projectId: nextData.projectId || project._id,
        action: "updated",
        field: "projectId",
        from: existingIssue.projectId,
        to: nextData.projectId,
        performedBy: requester.id,
      });
    }

    await Issue.findByIdAndUpdate(id, nextData, { new: true });

    await createManyActivities(activities);

    const updatedIssue = await Issue.findById(id).populate(
      "projectId",
      "title slug projectNumber assignedTeamMembers",
    );

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

    const issue = await Issue.findById(id);
    if (!issue) {
      return NextResponse.json(
        { message: "Issue not found" },
        { status: 404 },
      );
    }

    await createActivity({
      entityType: "issue",
      entityId: issue._id,
      projectId: issue.projectId,
      action: "deleted",
      field: "issue",
      from: issue.title,
      to: null,
      performedBy: requester.id,
    });

    await Issue.findByIdAndDelete(id);

    return NextResponse.json({ message: "Issue deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete issue", error: error.message },
      { status: 500 },
    );
  }
}