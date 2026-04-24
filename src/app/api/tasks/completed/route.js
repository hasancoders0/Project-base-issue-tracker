import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import {
  isAdmin,
  isProjectManager,
  isEmployee,
  isClient,
} from "@/lib/taskPermissions";

async function getCurrentUser(request) {
  const userId = request.nextUrl.searchParams.get("currentUserId");

  if (!userId) return null;

  return await User.findById(userId);
}

export async function GET(request) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized user" },
        { status: 401 }
      );
    }

    const assignedProjects = currentUser.assignedProjects || [];
    let scopeQuery = {};

    if (isAdmin(currentUser)) {
      scopeQuery = {};
    } else if (isProjectManager(currentUser)) {
      scopeQuery = {
        $or: [
          { assignedTo: currentUser._id },
          { createdBy: currentUser._id },
          {
            type: "project",
            projectId: { $in: assignedProjects },
          },
        ],
      };
    } else if (isEmployee(currentUser)) {
      scopeQuery = {
        assignedTo: currentUser._id,
      };
    } else if (isClient(currentUser)) {
      scopeQuery = {
        createdBy: currentUser._id,
      };
    } else {
      scopeQuery = {
        _id: null,
      };
    }

    const query = {
      $and: [
        scopeQuery,
        {
          status: "done",
          completedAt: { $ne: null },
        },
      ],
    };

    const tasks = await Task.find(query)
      .sort({ completedAt: -1, updatedAt: -1 })
      .limit(20)
      .populate("projectId", "title slug")
      .populate("assignedTo", "fullName username role name")
      .populate("assignedBy", "fullName username role name")
      .populate("createdBy", "fullName username role name");

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch completed task history",
        error: error.message,
      },
      { status: 500 }
    );
  }
}