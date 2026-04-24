import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Task from "@/models/Task";
import User from "@/models/User";

async function getCurrentUser(request, body = null) {
  const userId =
    body?.currentUserId ||
    request.nextUrl.searchParams.get("currentUserId");

  if (!userId) return null;

  return await User.findById(userId);
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);
    const currentUser = await getCurrentUser(request, body);

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can run cleanup" },
        { status: 403 }
      );
    }

    const now = new Date();
    const archiveCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const deleteCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const archiveResult = await Task.updateMany(
      {
        status: "done",
        completedAt: { $lte: archiveCutoff, $ne: null },
        isArchived: false,
      },
      {
        $set: {
          isArchived: true,
          archivedAt: now,
        },
      }
    );

    const deleteResult = await Task.deleteMany({
      status: "done",
      completedAt: { $lte: deleteCutoff, $ne: null },
    });

    return NextResponse.json(
      {
        message: "Task cleanup completed",
        archivedCount: archiveResult.modifiedCount || 0,
        deletedCount: deleteResult.deletedCount || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to cleanup tasks",
        error: error.message,
      },
      { status: 500 }
    );
  }
}