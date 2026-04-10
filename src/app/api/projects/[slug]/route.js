import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import slugify from "slugify";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { slug } = await params;

    const project = await Project.findOne({ slug });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch project", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const { slug } = await params;
    const body = await request.json();

    const project = await Project.findOne({ slug });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    const updatedTitle = body.title ?? project.title;
    const updatedSlug = `${slugify(updatedTitle, {
      lower: true,
      strict: true,
    })}-${project.projectNumber}`;

    const updatedProject = await Project.findOneAndUpdate(
      { slug },
      {
        title: updatedTitle,
        slug: updatedSlug,
        details: body.details ?? project.details,
        clientName: body.clientName ?? project.clientName,
        country: body.country ?? project.country,
        value: body.value ?? project.value,
        website: body.website ?? project.website,
        status: body.status ?? project.status,
        type: body.type ?? project.type,
        startDate: body.startDate ?? project.startDate,
        completeDate: body.completeDate ?? project.completeDate,
        note: body.note ?? project.note,
      },
      { new: true }
    );

    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update project", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { slug } = await params;

    const project = await Project.findOneAndDelete({ slug });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete project", error: error.message },
      { status: 500 }
    );
  }
}