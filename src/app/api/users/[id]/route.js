import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid user id" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
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
          { status: 400 }
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
          { status: 400 }
        );
      }
    }

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
      companyWebsite:
        body.companyWebsite ?? existingUser.companyWebsite ?? "",
      contractStartDate:
        body.contractStartDate ?? existingUser.contractStartDate ?? null,
      contractEndDate:
        body.contractEndDate ?? existingUser.contractEndDate ?? null,
      preferredCommunication:
        body.preferredCommunication ??
        existingUser.preferredCommunication ??
        "",

      jobTitle: body.jobTitle ?? existingUser.jobTitle ?? "",
      skills: body.skills
        ? body.skills
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : existingUser.skills || [],
      experienceLevel:
        body.experienceLevel ?? existingUser.experienceLevel ?? "",
      cvFile: body.cvFile ?? existingUser.cvFile ?? "",

      role: body.role ?? existingUser.role ?? "client",
      status: body.status ?? existingUser.status ?? "active",
      assignedProjects:
        body.role === "admin" || body.role === undefined
          ? body.role === "admin"
            ? []
            : body.assignedProjects ?? existingUser.assignedProjects ?? []
          : body.assignedProjects ?? [],
    };

    if (body.password && body.password.trim()) {
      updateData.password = await bcrypt.hash(body.password.trim(), 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("assignedProjects", "title slug status");

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update user", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid user id" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete user", error: error.message },
      { status: 500 }
    );
  }
}