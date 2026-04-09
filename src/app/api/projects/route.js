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
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const slug = `${slugify(body.title, { lower: true, strict: true })}-${projectNumber}`;

    const lastProject = await Project.findOne().sort({ projectNumber: -1 });

    const nextProjectNumber = lastProject ? lastProject.projectNumber + 1 : 1;

    const newProject = await Project.create({
      title: body.title,
      slug,
      image: body.image || "",
      details: body.details || "",
      clientName: body.clientName || "",
      country: body.country || "",
      value: body.value || 0,
      website: body.website || "",
      status: body.status || "In Progress",
      type: body.type || "Other",
      startDate: body.startDate || null,
      completeDate: body.completeDate || null,
      note: body.note || "",
      projectNumber: nextProjectNumber,
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create project", error: error.message },
      { status: 500 },
    );
  }
}
