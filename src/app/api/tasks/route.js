import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";
import Project from "@/models/Project";
import { createManyActivities } from "@/lib/activityHelper";

async function getRequesterUser(request, body = null) {
  const userId =
    body?.currentUserId ||
    body?.userId ||
    body?.requesterId ||
    request.headers.get("x-user-id") ||
    request.nextUrl.searchParams.get("currentUserId") ||
    request.nextUrl.searchParams.get("userId");

  if (!userId) return null;

  return await User.findById(userId).select(
    "_id fullName username email role assignedProjects"
  );
}

function canCreateTask(role) {
  return role === "admin" || role === "project-manager";
}

function normalizeString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value).trim();
}

function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean);
}

async function validateTaskAssignment({
  requesterUser,
  type,
  projectId,
  assignedTo,
}) {
  if (!requesterUser) {
    return { ok: false, message: "Unauthorized user", status: 401 };
  }

  if (!canCreateTask(requesterUser.role)) {
    return {
      ok: false,
      message: "Only admin or project manager can create tasks",
      status: 403,
    };
  }

  if (type === "project") {
    if (!projectId) {
      return {
        ok: false,
        message: "Project task must have a project selected",
        status: 400,
      };
    }

    const project = await Project.findById(projectId).select(
      "_id title assignedTeamMembers clientUserId"
    );

    if (!project) {
      return {
        ok: false,
        message: "Selected project not found",
        status: 404,
      };
    }

    if (requesterUser.role === "project-manager") {
      const assignedIds = (project.assignedTeamMembers || []).map((id) =>
        String(id?._id || id)
      );

      const isManagerAssigned = assignedIds.includes(String(requesterUser._id));

      if (!isManagerAssigned) {
        return {
          ok: false,
          message: "Project manager can only create tasks for assigned projects",
          status: 403,
        };
      }
    }

    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo).select("_id role");

      if (!assignedUser) {
        return {
          ok: false,
          message: "Assigned user not found",
          status: 404,
        };
      }

      if (assignedUser.role === "client") {
        return {
          ok: false,
          message: "Client cannot be assigned internal tasks",
          status: 400,
        };
      }

      if (requesterUser.role === "project-manager") {
        const assignedIds = (project.assignedTeamMembers || []).map((id) =>
          String(id?._id || id)
        );

        const canAssignSelectedUser =
          String(assignedUser._id) === String(requesterUser._id) ||
          assignedIds.includes(String(assignedUser._id));

        if (!canAssignSelectedUser) {
          return {
            ok: false,
            message:
              "Project manager can only assign tasks to self or assigned team members",
            status: 403,
          };
        }
      }
    }

    return { ok: true, project };
  }

  if (type === "individual") {
    if (!assignedTo) {
      return {
        ok: false,
        message: "Individual task must have an assigned user",
        status: 400,
      };
    }

    const assignedUser = await User.findById(assignedTo).select("_id role");

    if (!assignedUser) {
      return {
        ok: false,
        message: "Assigned user not found",
        status: 404,
      };
    }

    if (assignedUser.role === "client") {
      return {
        ok: false,
        message: "Client cannot be assigned internal tasks",
        status: 400,
      };
    }

    return { ok: true, project: null };
  }

  return {
    ok: false,
    message: "Invalid task type",
    status: 400,
  };
}

export async function GET(request) {
  try {
    await connectDB();

    const requesterUser = await getRequesterUser(request);

    if (!requesterUser) {
      return NextResponse.json(
        { message: "Unauthorized user" },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const assignedTo = searchParams.get("assignedTo");
    const projectId = searchParams.get("projectId");
    const reviewedByAdmin = searchParams.get("reviewedByAdmin");

    const query = { isArchived: false };

    if (status) query.status = status;
    if (type) query.type = type;
    if (assignedTo) query.assignedTo = assignedTo;
    if (projectId) query.projectId = projectId;

    if (reviewedByAdmin === "true") query.reviewedByAdmin = true;
    if (reviewedByAdmin === "false") query.reviewedByAdmin = false;

    if (requesterUser.role === "employee") {
      query.assignedTo = requesterUser._id;
    }

    if (requesterUser.role === "project-manager") {
      const assignedProjects = normalizeArray(
        requesterUser.assignedProjects
      ).map((id) => String(id?._id || id));

      query.$or = [
        { assignedTo: requesterUser._id },
        { projectId: { $in: assignedProjects } },
        { createdBy: requesterUser._id },
      ];
    }

    if (requesterUser.role === "client") {
      return NextResponse.json([], { status: 200 });
    }

    const tasks = await Task.find(query)
      .populate("projectId", "title slug status")
      .populate("assignedTo", "fullName username email role image")
      .populate("assignedBy", "fullName username email role image")
      .populate("createdBy", "fullName username email role image")
      .sort({ createdAt: -1 });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("TASKS GET ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch tasks", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const requesterUser = await getRequesterUser(request, body);

    if (!requesterUser) {
      return NextResponse.json(
        { message: "Unauthorized user" },
        { status: 401 }
      );
    }

    const title = normalizeString(body.title);
    const description = normalizeString(body.description);
    const type = normalizeString(body.type, "project");
    const projectId = body.projectId || null;
    const assignedTo = body.assignedTo || null;
    const priority = normalizeString(body.priority, "medium");
    const status = normalizeString(body.status, "todo");
    const dueDate = body.dueDate || null;
    const note = normalizeString(body.note);

    if (!title) {
      return NextResponse.json(
        { message: "Task title is required" },
        { status: 400 }
      );
    }

    const validation = await validateTaskAssignment({
      requesterUser,
      type,
      projectId,
      assignedTo,
    });

    if (!validation.ok) {
      return NextResponse.json(
        { message: validation.message },
        { status: validation.status }
      );
    }

    const newTask = await Task.create({
      title,
      description,
      type,
      projectId: type === "project" ? projectId : null,
      assignedTo,
      assignedBy: requesterUser._id,
      createdBy: requesterUser._id,
      creatorRole: requesterUser.role,
      status,
      priority,
      dueDate: dueDate || null,
      note,
      reviewedByAdmin: requesterUser.role === "admin",
    });

    const activities = [
      {
        entityType: "task",
        entityId: newTask._id,
        projectId: newTask.projectId || null,
        action: "created",
        field: "task",
        from: null,
        to: newTask.title,
        performedBy: requesterUser._id,
      },
    ];

    if (assignedTo) {
      activities.push({
        entityType: "task",
        entityId: newTask._id,
        projectId: newTask.projectId || null,
        action: "assigned",
        field: "assignedTo",
        from: null,
        to: assignedTo,
        performedBy: requesterUser._id,
      });
    }

    await createManyActivities(activities);

    const populatedTask = await Task.findById(newTask._id)
      .populate("projectId", "title slug status")
      .populate("assignedTo", "fullName username email role image")
      .populate("assignedBy", "fullName username email role image")
      .populate("createdBy", "fullName username email role image");

    return NextResponse.json(populatedTask, { status: 201 });
  } catch (error) {
    console.error("TASKS POST ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create task", error: error.message },
      { status: 500 }
    );
  }
}