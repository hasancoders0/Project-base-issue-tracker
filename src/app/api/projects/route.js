import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import slugify from "slugify";

export async function GET() {
  try {
    await connectDB();

    const projects = await Project.find().sort({ createdAt: -1 });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch projects", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();

    const count = await Project.countDocuments();
    const projectNumber = count + 1;

    const title = formData.get("title") || "project";
    const imagePath = formData.get("image") || "";

    const slug = `${slugify(title, {
      lower: true,
      strict: true,
    })}-${projectNumber}`;

    const newProject = await Project.create({
      title,
      slug,
      image: imagePath,
      details: formData.get("details") || "",
      clientName: formData.get("clientName") || "",
      country: formData.get("country") || "",
      value: Number(formData.get("value")) || 0,
      website: formData.get("website") || "",
      status: formData.get("status") || "In Progress",
      projectNumber,
      type: formData.get("type") || "Other",
      startDate: formData.get("startDate") || null,
      completeDate: formData.get("completeDate") || null,
      note: formData.get("note") || "",
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.log("PROJECT CREATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to create project", error: error.message },
      { status: 500 }
    );
  }
}