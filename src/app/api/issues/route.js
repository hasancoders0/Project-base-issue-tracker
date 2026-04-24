import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Issue from "@/models/Issue";
import Project from "@/models/Project";
import Activity from "@/models/Activity";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const issues = await Issue.find()
      .populate("projectId", "title slug projectNumber assignedTeamMembers")
      .sort({ createdAt: -1 });

    return NextResponse.json(issues);
  } catch (error) {
    console.error("ISSUES GET ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch issues", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body.projectId) {
      return NextResponse.json(
        { message: "Project ID is required" },
        { status: 400 }
      );
    }

    if (!body.title) {
      return NextResponse.json(
        { message: "Issue title is required" },
        { status: 400 }
      );
    }

    const relatedProject = await Project.findById(body.projectId).select(
      "_id title slug"
    );

    if (!relatedProject) {
      return NextResponse.json(
        { message: "Related project not found" },
        { status: 404 }
      );
    }

    const issueCountByProject = await Issue.countDocuments({
      projectId: body.projectId,
    });

    const totalIssueCount = await Issue.countDocuments();

    let performedBy = null;

    const possibleUserId = body.performedBy || body.requesterId || body.userId;

    if (possibleUserId && mongoose.Types.ObjectId.isValid(possibleUserId)) {
      performedBy = possibleUserId;
    } else {
      const adminUser = await User.findOne({ role: "admin" }).select("_id");

      if (adminUser) {
        performedBy = adminUser._id;
      }
    }

    const activityUserName =
      body.createdBy || body.reporter || body.assignee || "User";

    const newIssue = await Issue.create({
      title: body.title,
      description: body.description || "",
      projectId: body.projectId,

      issueNumber: issueCountByProject + 1,
      globalIssueNumber: totalIssueCount + 1,

      createdBy: body.createdBy || "admin",
      status: body.status || "Open",
      priority: body.priority || "Medium",
      assignee: body.assignee || "",
      reporter: body.reporter || "",
      tags: Array.isArray(body.tags) ? body.tags : [],
      note: body.note || "",
      attachments: body.attachments || [],
      closedAt: body.status === "Closed" ? new Date() : null,

      activities: [
        {
          action: "created",
          field: "issue",
          oldValue: "",
          newValue: body.title,
          message: `${activityUserName} created the issue`,
          updatedBy: activityUserName,
        },
      ],
    });

    if (performedBy) {
      await Activity.create({
        entityType: "issue",
        entityId: newIssue._id,
        projectId: relatedProject._id,
        action: "created",
        field: "issue",
        from: null,
        to: newIssue.title,
        performedBy,
      });
    }

    const populatedIssue = await Issue.findById(newIssue._id).populate(
      "projectId",
      "title slug projectNumber assignedTeamMembers"
    );

    return NextResponse.json(populatedIssue, { status: 201 });
  } catch (error) {
    console.error("ISSUES POST ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create issue", error: error.message },
      { status: 500 }
    );
  }
}