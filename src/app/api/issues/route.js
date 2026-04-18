import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Issue from "@/models/Issue";

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
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const issueCount = await Issue.countDocuments({
      projectId: body.projectId,
    });

    const newIssue = await Issue.create({
      title: body.title,
      description: body.description || "",
      projectId: body.projectId,
      issueNumber: issueCount + 1,
      createdBy: body.createdBy || "admin",
      status: body.status || "Open",
      priority: body.priority || "Medium",
      assignee: body.assignee || "",
      reporter: body.reporter || "",
      tags: body.tags || [],
      note: body.note || "",
      closedAt: body.status === "Closed" ? new Date() : null,
      activities: [
        {
          action: "created",
          field: "issue",
          oldValue: "",
          newValue: body.title,
          message: `${body.createdBy || body.reporter || "user"} created the issue`,
          updatedBy: body.createdBy || body.reporter || "user",
        },
      ],
    });

    const populatedIssue = await Issue.findById(newIssue._id).populate(
      "projectId",
      "title slug assignedTeamMembers",
    );

    return NextResponse.json(populatedIssue, { status: 201 });
  } catch (error) {
    console.error("ISSUES POST ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create issue", error: error.message },
      { status: 500 },
    );
  }
}
