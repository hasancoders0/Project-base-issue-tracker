import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import {
  createManyActivities,
  createActivity,
} from "@/lib/activityHelper";
import { isAdmin, isProjectManager } from "@/lib/taskPermissions";

async function getCurrentUser(request, body = null) {
  const userId =
    body?.currentUserId || request.nextUrl.searchParams.get("currentUserId");

  if (!userId) return null;

  return await User.findById(userId);
}

function sameValue(a, b) {
  return String(a ?? "") === String(b ?? "");
}

export async function PATCH(request) {
  try {
    await connectDB();

    const body = await request.json();
    const currentUser = await getCurrentUser(request, body);

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized user" },
        { status: 401 },
      );
    }

    if (!isAdmin(currentUser) && !isProjectManager(currentUser)) {
      return NextResponse.json(
        { message: "You do not have permission to bulk update tasks" },
        { status: 403 },
      );
    }

    const { taskIds, status, priority, assignedTo } = body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { message: "Task IDs are required" },
        { status: 400 },
      );
    }

    const tasks = await Task.find({ _id: { $in: taskIds } });

    if (tasks.length === 0) {
      return NextResponse.json(
        { message: "No tasks found for update" },
        { status: 404 },
      );
    }

    const updateData = {};

    if (status !== undefined) {
      if (
        !["todo", "in-progress", "in-review", "done", "blocked"].includes(
          status,
        )
      ) {
        return NextResponse.json(
          { message: "Invalid task status" },
          { status: 400 },
        );
      }

      updateData.status = status;

      if (status === "done") {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }

      updateData.isArchived = false;
      updateData.archivedAt = null;
    }

    if (priority !== undefined) {
      if (!["low", "medium", "high", "urgent"].includes(priority)) {
        return NextResponse.json(
          { message: "Invalid task priority" },
          { status: 400 },
        );
      }

      updateData.priority = priority;
    }

    let assignedUser = null;

    if (assignedTo !== undefined) {
      if (!assignedTo) {
        updateData.assignedTo = null;
        updateData.assignedBy = null;
      } else {
        assignedUser = await User.findById(assignedTo);

        if (!assignedUser) {
          return NextResponse.json(
            { message: "Assigned user not found" },
            { status: 404 },
          );
        }

        updateData.assignedTo = assignedUser._id;
        updateData.assignedBy = currentUser._id;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 },
      );
    }

    const result = await Task.updateMany(
      { _id: { $in: taskIds } },
      { $set: updateData },
    );

    const activities = [];

    for (const task of tasks) {
      if (status !== undefined && !sameValue(task.status, status)) {
        activities.push({
          entityType: "task",
          entityId: task._id,
          projectId: task.projectId || null,
          action: "status_changed",
          field: "status",
          from: task.status,
          to: status,
          performedBy: currentUser._id,
        });
      }

      if (priority !== undefined && !sameValue(task.priority, priority)) {
        activities.push({
          entityType: "task",
          entityId: task._id,
          projectId: task.projectId || null,
          action: "priority_changed",
          field: "priority",
          from: task.priority,
          to: priority,
          performedBy: currentUser._id,
        });
      }

      if (assignedTo !== undefined) {
        const nextAssignedTo = assignedTo || null;

        if (!sameValue(task.assignedTo, nextAssignedTo)) {
          activities.push({
            entityType: "task",
            entityId: task._id,
            projectId: task.projectId || null,
            action: "assigned",
            field: "assignedTo",
            from: task.assignedTo || null,
            to: nextAssignedTo,
            performedBy: currentUser._id,
          });
        }
      }
    }

    await createManyActivities(activities);

    return NextResponse.json(
      {
        message: "Tasks updated successfully",
        modifiedCount: result.modifiedCount || 0,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to bulk update tasks",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);
    const currentUser = await getCurrentUser(request, body);

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized user" },
        { status: 401 },
      );
    }

    if (!isAdmin(currentUser) && !isProjectManager(currentUser)) {
      return NextResponse.json(
        { message: "You do not have permission to bulk delete tasks" },
        { status: 403 },
      );
    }

    const { taskIds } = body || {};

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { message: "Task IDs are required" },
        { status: 400 },
      );
    }

    const tasks = await Task.find({ _id: { $in: taskIds } }).select(
      "_id title projectId",
    );

    if (tasks.length === 0) {
      return NextResponse.json(
        { message: "No tasks found for delete" },
        { status: 404 },
      );
    }

    const result = await Task.deleteMany({
      _id: { $in: taskIds },
    });

    for (const task of tasks) {
      await createActivity({
        entityType: "task",
        entityId: task._id,
        projectId: task.projectId || null,
        action: "deleted",
        field: "task",
        from: task.title,
        to: null,
        performedBy: currentUser._id,
      });
    }

    return NextResponse.json(
      {
        message: "Tasks deleted successfully",
        deletedCount: result.deletedCount || 0,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to bulk delete tasks",
        error: error.message,
      },
      { status: 500 },
    );
  }
}