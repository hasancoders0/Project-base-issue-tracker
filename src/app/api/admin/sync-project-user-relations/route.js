import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";

function getRequester(request) {
  return {
    id: request.headers.get("x-user-id") || "",
    email: request.headers.get("x-user-email") || "",
    username: request.headers.get("x-user-username") || "",
    role: request.headers.get("x-user-role") || "",
  };
}

export async function POST(request) {
  try {
    await connectDB();

    const requester = getRequester(request);

    if (requester.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can run sync" },
        { status: 403 }
      );
    }

    const projects = await Project.find({}, "_id assignedTeamMembers");
    const users = await User.find({}, "_id role");

    const userProjectMap = new Map();

    for (const user of users) {
      userProjectMap.set(String(user._id), []);
    }

    for (const project of projects) {
      const projectId = String(project._id);
      const assignedMembers = Array.isArray(project.assignedTeamMembers)
        ? project.assignedTeamMembers.map((member) => String(member))
        : [];

      for (const userId of assignedMembers) {
        if (!userProjectMap.has(userId)) {
          userProjectMap.set(userId, []);
        }

        userProjectMap.get(userId).push(project._id);
      }
    }

    for (const user of users) {
      const userId = String(user._id);

      if (user.role === "admin") {
        await User.findByIdAndUpdate(user._id, {
          assignedProjects: [],
        });

        await Project.updateMany(
          { assignedTeamMembers: user._id },
          { $pull: { assignedTeamMembers: user._id } }
        );

        continue;
      }

      await User.findByIdAndUpdate(user._id, {
        assignedProjects: userProjectMap.get(userId) || [],
      });
    }

    return NextResponse.json({
      message: "Project and user assignment sync completed successfully",
      totalProjects: projects.length,
      totalUsers: users.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to sync project-user relations",
        error: error.message,
      },
      { status: 500 }
    );
  }
}