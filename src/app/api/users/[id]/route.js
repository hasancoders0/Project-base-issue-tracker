import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Project from "@/models/Project";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

function getRequester(request) {
  return {
    id: request.headers.get("x-user-id") || "",
    email: request.headers.get("x-user-email") || "",
    username: request.headers.get("x-user-username") || "",
    role: request.headers.get("x-user-role") || "",
  };
}

function isOwnAccount(requester, targetUser) {
  if (!requester || !targetUser) return false;

  return (
    requester.id === String(targetUser._id) ||
    requester.email === targetUser.email ||
    requester.username === targetUser.username
  );
}

export async function GET(request, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    let user = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findById(id)
        .select("-password")
        .populate("assignedProjects", "title slug status");
    }

    if (!user) {
      user = await User.findOne({ username: id })
        .select("-password")
        .populate("assignedProjects", "title slug status");
    }

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user", error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    const requester = getRequester(request);
    const body = await request.json();

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const ownAccount = isOwnAccount(requester, existingUser);

    if (
      ownAccount &&
      existingUser.role === "admin" &&
      body.role &&
      body.role !== "admin"
    ) {
      return NextResponse.json(
        { message: "Admin cannot change own role" },
        { status: 400 },
      );
    }

    if (body.email && body.email !== existingUser.email) {
      const emailExists = await User.findOne({
        email: body.email,
        _id: { $ne: id },
      });

      if (emailExists) {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 400 },
        );
      }
    }

    if (body.username && body.username !== existingUser.username) {
      const usernameExists = await User.findOne({
        username: body.username,
        _id: { $ne: id },
      });

      if (usernameExists) {
        return NextResponse.json(
          { message: "Username already exists" },
          { status: 400 },
        );
      }
    }

    const finalRole =
      ownAccount && existingUser.role === "admin"
        ? "admin"
        : (body.role ?? existingUser.role ?? "client");

    const finalAssignedProjects =
      finalRole === "admin"
        ? []
        : Array.isArray(body.assignedProjects)
          ? body.assignedProjects
          : (existingUser.assignedProjects ?? []);

    const updateData = {
      fullName: body.fullName ?? existingUser.fullName ?? "",
      email: body.email ?? existingUser.email ?? "",
      username: body.username ?? existingUser.username ?? "",
      image: body.image ?? existingUser.image ?? "",

      phone: body.phone ?? existingUser.phone ?? "",
      address: body.address ?? existingUser.address ?? "",

      linkedin: body.linkedin ?? existingUser.linkedin ?? "",
      facebook: body.facebook ?? existingUser.facebook ?? "",
      whatsapp: body.whatsapp ?? existingUser.whatsapp ?? "",
      slack: body.slack ?? existingUser.slack ?? "",
      website: body.website ?? existingUser.website ?? "",

      companyName: body.companyName ?? existingUser.companyName ?? "",
      companyWebsite: body.companyWebsite ?? existingUser.companyWebsite ?? "",
      contractStartDate:
        body.contractStartDate || existingUser.contractStartDate || null,
      contractEndDate:
        body.contractEndDate || existingUser.contractEndDate || null,
      preferredCommunication:
        body.preferredCommunication ??
        existingUser.preferredCommunication ??
        "",

      jobTitle: body.jobTitle ?? existingUser.jobTitle ?? "",
      skills: Array.isArray(body.skills)
        ? body.skills.filter(Boolean)
        : body.skills
          ? body.skills
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : existingUser.skills || [],
      experienceLevel:
        body.experienceLevel ?? existingUser.experienceLevel ?? "",
      cvFile: body.cvFile ?? existingUser.cvFile ?? "",

      role: finalRole,
      status: body.status ?? existingUser.status ?? "active",
      assignedProjects: finalAssignedProjects,
    };

    if (body.password && body.password.trim()) {
      updateData.password = await bcrypt.hash(body.password.trim(), 10);
    }
    if (finalRole === "admin") {
      await Project.updateMany(
        { assignedTeamMembers: existingUser._id },
        { $pull: { assignedTeamMembers: existingUser._id } },
      );
    }

    const previousProjects = (existingUser.assignedProjects || []).map((item) =>
      String(item),
    );
    const nextProjects = (finalAssignedProjects || []).map((item) =>
      String(item),
    );

    const removedProjects = previousProjects.filter(
      (projectId) => !nextProjects.includes(projectId),
    );

    const addedProjects = nextProjects.filter(
      (projectId) => !previousProjects.includes(projectId),
    );

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("assignedProjects", "title slug status");

    if (removedProjects.length > 0) {
      await Project.updateMany(
        { _id: { $in: removedProjects } },
        { $pull: { assignedTeamMembers: existingUser._id } },
      );
    }

    if (addedProjects.length > 0) {
      await Project.updateMany(
        { _id: { $in: addedProjects } },
        { $addToSet: { assignedTeamMembers: existingUser._id } },
      );
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update user", error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user id" }, { status: 400 });
    }

    const requester = getRequester(request);
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const ownAccount = isOwnAccount(requester, user);

    if (ownAccount) {
      return NextResponse.json(
        { message: "You cannot delete your own account" },
        { status: 400 },
      );
    }

    await Project.updateMany(
      { assignedTeamMembers: user._id },
      { $pull: { assignedTeamMembers: user._id } },
    );

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete user", error: error.message },
      { status: 500 },
    );
  }
}
