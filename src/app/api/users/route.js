import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Project from "@/models/Project";
import Task from "@/models/Task";
import bcrypt from "bcryptjs";

// 🔥 helper: generate base username
function generateUsername(fullName, email) {
  if (fullName) {
    return fullName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  if (email) {
    return email.split("@")[0].toLowerCase();
  }

  return "user";
}

// 🔥 helper: ensure unique username
async function generateUniqueUsername(baseUsername) {
  let username = baseUsername;
  let counter = 1;

  while (await User.findOne({ username })) {
    username = `${baseUsername}-${counter}`;
    counter++;
  }

  return username;
}

export async function GET() {
  try {
    await connectDB();

    const users = await User.find()
      .select("-password")
      .populate("assignedProjects", "title slug status");

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const userId = user._id;

        let activeProjectsCount = 0;
        let completedProjectsCount = 0;
        let activeTasksCount = 0;
        let monthAssignedTasks = 0;
        let monthCompletedTasks = 0;

        if (user.role === "client") {
          const [activeProjects, completedProjects] = await Promise.all([
            Project.countDocuments({
              clientUserId: userId,
              status: "In Progress",
            }),

            Project.countDocuments({
              clientUserId: userId,
              status: "Complete",
            }),
          ]);

          activeProjectsCount = activeProjects;
          completedProjectsCount = completedProjects;
        } else {
          const [activeProjects, activeTasks, assignedThisMonth, completedThisMonth] =
            await Promise.all([
              Project.countDocuments({
                assignedTeamMembers: userId,
                status: "In Progress",
              }),

              Task.countDocuments({
                assignedTo: userId,
                status: { $ne: "done" },
                isArchived: false,
              }),

              Task.countDocuments({
                assignedTo: userId,
                createdAt: {
                  $gte: monthStart,
                  $lt: nextMonthStart,
                },
              }),

              Task.countDocuments({
                assignedTo: userId,
                status: "done",
                completedAt: {
                  $gte: monthStart,
                  $lt: nextMonthStart,
                },
              }),
            ]);

          activeProjectsCount = activeProjects;
          activeTasksCount = activeTasks;
          monthAssignedTasks = assignedThisMonth;
          monthCompletedTasks = completedThisMonth;
        }

        return {
          ...user.toObject(),
          activeProjectsCount,
          completedProjectsCount,
          activeTasksCount,
          monthAssignedTasks,
          monthCompletedTasks,
        };
      }),
    );

    return NextResponse.json(enrichedUsers);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch users", error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      fullName,
      email,
      username,
      password,
      role = "client",
      assignedProjects = [],
      permissions = {},
    } = body;

    // ✅ Required fields
    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        {
          message: "Full name, email, password and role are required",
        },
        { status: 400 },
      );
    }

    // ✅ Email check
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 400 },
      );
    }

    // 🔥 Username logic
    let finalUsername = username?.trim();

    if (!finalUsername) {
      const base = generateUsername(fullName, email);
      finalUsername = await generateUniqueUsername(base);
    } else {
      const exists = await User.findOne({ username: finalUsername });

      if (exists) {
        return NextResponse.json(
          { message: "Username already exists" },
          { status: 400 },
        );
      }
    }

    // 🔐 Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      username: finalUsername,
      password: hashedPassword,
      role,
      assignedProjects: role === "admin" ? [] : assignedProjects,
      permissions,

      // defaults
      image: "",
      phone: "",
      address: "",
      linkedin: "",
      facebook: "",
      whatsapp: "",
      slack: "",
      website: "",
      companyName: "",
      companyWebsite: "",
      contractStartDate: null,
      contractEndDate: null,
      preferredCommunication: "",
      jobTitle: "",
      designations: [],
      customDesignation: "",
      skills: [],
      experienceLevel: "",
      cvFile: "",
      status: "active",
    });

    const savedUser = await User.findById(newUser._id)
      .select("-password")
      .populate("assignedProjects", "title slug status");

    return NextResponse.json(
      {
        message: "User created successfully",
        user: savedUser,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log("USER CREATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create user", error: error.message },
      { status: 500 },
    );
  }
}