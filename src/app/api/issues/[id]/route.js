import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Issue from "@/models/Issue";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    const issue = await Issue.findById(id).populate("projectId", "title slug");

    if (!issue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch issue", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    await Issue.findByIdAndUpdate(
      id,
      {
        title: body.title,
        description: body.description || "",
        projectId: body.projectId,
        status: body.status || "Open",
        priority: body.priority || "Medium",
        assignee: body.assignee || "",
        reporter: body.reporter || "",
        tags: body.tags || [],
        note: body.note || "",
        closedAt: body.status === "Closed" ? new Date() : null,
      },
      { new: true }
    );

    const updatedIssue = await Issue.findById(id).populate(
      "projectId",
      "title slug"
    );

    if (!updatedIssue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(updatedIssue);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update issue", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const deletedIssue = await Issue.findByIdAndDelete(id);

    if (!deletedIssue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Issue deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete issue", error: error.message },
      { status: 500 }
    );
  }
}