import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import Project from "@/models/Project";
import User from "@/models/User";
import {
  canAccessProject,
  canViewTask,
  isAdmin,
  isClient,
  isEmployee,
  isProjectManager,
} from "@/lib/taskPermissions";

async function getCurrentUser(request) {
  const userId = request.nextUrl.searchParams.get("currentUserId");

  if (!userId) return null;

  return await User.findById(userId);
}

export async function GET(request, { params }) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized user" },
        { status: 401 }
      );
    }

    const project = await Project.findById(params.projectId);

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    if (!canAccessProject(currentUser, params.projectId) && !isAdmin(currentUser)) {
      return NextResponse.json(
        { message: "You do not have access to this project" },
        { status: 403 }
      );
    }

    let tasks = await Task.find({
      type: "project",
      projectId: params.projectId,
    })
      .sort({ createdAt: -1 })
      .populate("projectId", "title slug")
      .populate("assignedTo", "fullName username role")
      .populate("assignedBy", "fullName username role")
      .populate("createdBy", "fullName username role");

    // extra role filtering safety
    if (isEmployee(currentUser)) {
      tasks = tasks.filter(
        (task) => String(task.assignedTo?._id) === String(currentUser._id)
      );
    } else {
      tasks = tasks.filter((task) => canViewTask(currentUser, task));
    }

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch project tasks",
        error: error.message,
      },
      { status: 500 }
    );
  }
}