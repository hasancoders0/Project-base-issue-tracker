import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Issue from "@/models/Issue";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { projectId } = await params;

    const issues = await Issue.find({ projectId }).sort({ createdAt: -1 });

    return NextResponse.json(issues);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch project issues", error: error.message },
      { status: 500 }
    );
  }
}