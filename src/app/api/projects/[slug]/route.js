import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

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