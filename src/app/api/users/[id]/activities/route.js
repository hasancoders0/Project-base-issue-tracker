import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Task from "@/models/Task";
import mongoose from "mongoose";

async function getCurrentUser(request) {
  const userId = request.nextUrl.searchParams.get("currentUserId");

  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  return await User.findById(userId).select("_id role email username fullName");
}

function canViewUserActivities(currentUser, targetUserId) {
  if (!currentUser) return false;

  if (currentUser.role === "admin") return true;

  return String(currentUser._id) === String(targetUserId);
}

function buildActivityTitle(activity, relatedTask, targetUserId) {
  const action = activity.action || "updated";
  const taskTitle = relatedTask?.title || "Untitled Task";

  if (action === "created") {
    return `Created task: ${taskTitle}`;
  }

  if (action === "deleted") {
    return `Deleted task: ${taskTitle}`;
  }

  if (action === "assigned") {
    const assignedToMatches =
      relatedTask?.assignedTo &&
      String(relatedTask.assignedTo) === String(targetUserId);

    if (assignedToMatches) {
      return `Assigned to task: ${taskTitle}`;
    }

    return `Updated assignment on: ${taskTitle}`;
  }

  if (action === "status_changed") {
    if (activity.from && activity.to) {
      return `Changed status from ${activity.from} to ${activity.to}`;
    }

    return `Changed task status: ${taskTitle}`;
  }

  if (action === "updated") {
    if (activity.field) {
      return `Updated ${activity.field} on: ${taskTitle}`;
    }

    return `Updated task: ${taskTitle}`;
  }

  return `Activity on task: ${taskTitle}`;
}

function buildActivityDescription(activity, relatedTask, targetUserId) {
  const taskTitle = relatedTask?.title || "Untitled Task";
  const details = [];

  if (relatedTask?.projectId?.title) {
    details.push(`Project: ${relatedTask.projectId.title}`);
  }

  details.push(`Task: ${taskTitle}`);

  if (activity.field) {
    details.push(`Field: ${activity.field}`);
  }

  if (activity.action === "assigned" && relatedTask?.assignedTo) {
    const isTargetAssigned =
      String(relatedTask.assignedTo) === String(targetUserId);

    details.push(isTargetAssigned ? "Assigned user activity" : "Assignment updated");
  }

  return details.join(" • ");
}

export async function GET(request, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid user id" },
        { status: 400 },
      );
    }

    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized user" },
        { status: 401 },
      );
    }

    const targetUser = await User.findById(id).select(
      "_id fullName username email role",
    );

    if (!targetUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 },
      );
    }

    if (!canViewUserActivities(currentUser, targetUser._id)) {
      return NextResponse.json(
        { message: "You do not have permission to view this user's activities" },
        { status: 403 },
      );
    }

    const relatedTasks = await Task.find({
      $or: [
        { assignedTo: targetUser._id },
        { assignedBy: targetUser._id },
        { createdBy: targetUser._id },
      ],
    })
      .select("_id title assignedTo assignedBy createdBy projectId")
      .populate("projectId", "title");

    const taskIds = relatedTasks.map((task) => task._id);
    const taskMap = new Map(
      relatedTasks.map((task) => [String(task._id), task]),
    );

    const activities = await TaskActivity.find({
      $or: [
        { performedBy: targetUser._id },
        { taskId: { $in: taskIds } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("performedBy", "fullName username name role");

    const formattedActivities = activities.map((activity) => {
      const relatedTask = taskMap.get(String(activity.taskId));

      return {
        _id: activity._id,
        action: activity.action,
        field: activity.field || "",
        from: activity.from,
        to: activity.to,
        createdAt: activity.createdAt,
        time: activity.createdAt,
        title: buildActivityTitle(activity, relatedTask, targetUser._id),
        description: buildActivityDescription(
          activity,
          relatedTask,
          targetUser._id,
        ),
        task: relatedTask
          ? {
              _id: relatedTask._id,
              title: relatedTask.title,
              projectTitle: relatedTask.projectId?.title || "",
            }
          : null,
        performedBy: activity.performedBy
          ? {
              _id: activity.performedBy._id,
              fullName:
                activity.performedBy.fullName ||
                activity.performedBy.name ||
                activity.performedBy.username ||
                "Unknown User",
              username: activity.performedBy.username || "",
              role: activity.performedBy.role || "",
            }
          : null,
      };
    });

    return NextResponse.json(
      { activities: formattedActivities },
      { status: 200 },
    );
  } catch (error) {
    console.error("USER ACTIVITY API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch user activities",
        error: error.message,
      },
      { status: 500 },
    );
  }
}