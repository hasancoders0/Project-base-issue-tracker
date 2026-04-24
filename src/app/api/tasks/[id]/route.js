import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import {
  addActivityIfChanged,
  createManyActivities,
  createActivity,
} from "@/lib/activityHelper";

import {
  canManageTask,
  canUpdateOwnTaskStatus,
  canViewTask,
  isAdmin,
  isProjectManager,
} from "@/lib/taskPermissions";

async function getCurrentUser(request, body = null) {
  const userId =
    body?.currentUserId ||
    body?.userId ||
    body?.requesterId ||
    request.nextUrl.searchParams.get("currentUserId") ||
    request.nextUrl.searchParams.get("userId");

  if (!userId) return null;

  return await User.findById(userId);
}

function isAllowedInternalUser(user) {
  return (
    user?.role === "admin" ||
    user?.role === "project-manager" ||
    user?.role === "employee"
  );
}

// ======================== GET ========================
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!isAllowedInternalUser(currentUser)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const task = await Task.findById(id)
      .populate("projectId", "title slug")
      .populate("assignedTo", "fullName username role")
      .populate("assignedBy", "fullName username role")
      .populate("createdBy", "fullName username role");

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    if (!canViewTask(currentUser, task)) {
      return NextResponse.json({ message: "No permission" }, { status: 403 });
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error("TASK GET ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch task", error: error.message },
      { status: 500 }
    );
  }
}

// ======================== PATCH ========================
export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const currentUser = await getCurrentUser(request, body);

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    const original = task.toObject();

    const canManage = canManageTask(currentUser, task);
    const canOwn = canUpdateOwnTaskStatus(currentUser, task);

    if (!canManage && !canOwn) {
      return NextResponse.json({ message: "No permission" }, { status: 403 });
    }

    const { title, description, status, priority, assignedTo, note } = body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (note !== undefined) task.note = note;

    if (assignedTo !== undefined) {
      task.assignedTo = assignedTo || null;
      task.assignedBy = assignedTo ? currentUser._id : null;
    }

    await task.save();

    const activities = [];

    addActivityIfChanged({
      activities,
      entityType: "task",
      entityId: task._id,
      projectId: task.projectId,
      action: "status_changed",
      field: "status",
      from: original.status,
      to: task.status,
      performedBy: currentUser._id,
    });

    addActivityIfChanged({
      activities,
      entityType: "task",
      entityId: task._id,
      projectId: task.projectId,
      action: "priority_changed",
      field: "priority",
      from: original.priority,
      to: task.priority,
      performedBy: currentUser._id,
    });

    addActivityIfChanged({
      activities,
      entityType: "task",
      entityId: task._id,
      projectId: task.projectId,
      action: "assigned",
      field: "assignedTo",
      from: original.assignedTo,
      to: task.assignedTo,
      performedBy: currentUser._id,
    });

    addActivityIfChanged({
      activities,
      entityType: "task",
      entityId: task._id,
      projectId: task.projectId,
      action: "updated",
      field: "title",
      from: original.title,
      to: task.title,
      performedBy: currentUser._id,
    });

    await createManyActivities(activities);

    const updatedTask = await Task.findById(task._id)
      .populate("projectId", "title slug")
      .populate("assignedTo", "fullName username role")
      .populate("assignedBy", "fullName username role")
      .populate("createdBy", "fullName username role");

    return NextResponse.json(
      { message: "Task updated", task: updatedTask },
      { status: 200 }
    );
  } catch (error) {
    console.error("TASK PATCH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update task", error: error.message },
      { status: 500 }
    );
  }
}

// ======================== DELETE ========================
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json().catch(() => null);
    const currentUser = await getCurrentUser(request, body);

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!isAdmin(currentUser) && !isProjectManager(currentUser)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    await createActivity({
      entityType: "task",
      entityId: task._id,
      projectId: task.projectId,
      action: "deleted",
      field: "task",
      from: task.title,
      to: null,
      performedBy: currentUser._id,
    });

    await Task.findByIdAndDelete(id);

    return NextResponse.json({ message: "Task deleted" }, { status: 200 });
  } catch (error) {
    console.error("TASK DELETE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete task", error: error.message },
      { status: 500 }
    );
  }
}