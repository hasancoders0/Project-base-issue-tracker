import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import { cleanupTasks } from "@/lib/taskCleanup";

async function getCurrentUser(request) {
  const userId = request.nextUrl.searchParams.get("currentUserId");
  if (!userId) return null;

  return await User.findById(userId);
}

export async function GET(request) {
  try {
    await connectDB();
    await cleanupTasks();

    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized user" },
        { status: 401 }
      );
    }

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const baseQuery = {
      assignedTo: currentUser._id,
      isArchived: { $ne: true },
    };

    // Active board tasks:
    // - all non-done tasks
    // - done tasks only if completed within last 24 hours
    const activeTasks = await Task.find({
      ...baseQuery,
      $or: [
        { status: { $ne: "done" } },
        {
          status: "done",
          completedAt: { $gte: last24Hours },
        },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("projectId", "title slug")
      .populate("assignedTo", "fullName username role name")
      .populate("assignedBy", "fullName username role name")
      .populate("createdBy", "fullName username role name");

    // Completed history:
    // only done tasks older than 24 hours
    const completedTasks = await Task.find({
      ...baseQuery,
      status: "done",
      completedAt: { $lt: last24Hours },
    })
      .sort({ completedAt: -1, updatedAt: -1 })
      .limit(20)
      .populate("projectId", "title slug")
      .populate("assignedTo", "fullName username role name")
      .populate("assignedBy", "fullName username role name")
      .populate("createdBy", "fullName username role name");

    return NextResponse.json(
      {
        activeTasks,
        completedTasks,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("MY TASK API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch my tasks",
        error: error.message,
      },
      { status: 500 }
    );
  }
}