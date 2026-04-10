import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const user = await User.findById(params.id).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();

    const body = await request.json();

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      {
        email: body.email,
        username: body.username,
        image: body.image || "",
        phone: body.phone,
        address: body.address,
        timezone: body.timezone,
        facebook: body.facebook,
        linkedin: body.linkedin,
        whatsapp: body.whatsapp,
        adminLevel: body.adminLevel || "",
        jobTitle: body.jobTitle || "",
        skills: Array.isArray(body.skills)
          ? body.skills
          : body.skills
            ? body.skills
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        companyName: body.companyName || "",
        contactPersonName: body.contactPersonName || "",
        businessEmail: body.businessEmail || "",
        budget: body.budget ? Number(body.budget) : 0,
        contractStartDate: body.contractStartDate || null,
        contractEndDate: body.contractEndDate || null,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

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