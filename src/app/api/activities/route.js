import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Activity from "@/models/Activity";

function getRequester(request) {
  return {
    id: request.headers.get("x-user-id") || "",
    role: request.headers.get("x-user-role") || "",
  };
}

function formatActivity(item) {
  return {
    _id: item._id,
    entityType: item.entityType || "",
    entityId: item.entityId || null,
    projectId: item.projectId?._id || null,
    projectTitle: item.projectId?.title || "",
    action: item.action || "",
    field: item.field || "",
    from: item.from ?? null,
    to: item.to ?? null,
    createdAt: item.createdAt,
    performedBy: item.performedBy
      ? {
          _id: item.performedBy._id,
          name:
            item.performedBy.fullName ||
            item.performedBy.username ||
            "User",
          role: item.performedBy.role || "",
        }
      : null,
  };
}

/**
 * Keep only the latest 50 activities per user.
 * No global activity limit.
 */
async function cleanupActivities() {
  try {
    const users = await Activity.distinct("performedBy");

    for (const userId of users) {
      if (!userId) continue;

      const count = await Activity.countDocuments({
        performedBy: userId,
      });

      if (count > 50) {
        const extra = count - 50;

        const oldUserActivities = await Activity.find({
          performedBy: userId,
        })
          .sort({ createdAt: 1 })
          .limit(extra)
          .select("_id");

        const ids = oldUserActivities.map((item) => item._id);

        if (ids.length > 0) {
          await Activity.deleteMany({ _id: { $in: ids } });
        }
      }
    }
  } catch (error) {
    console.error("ACTIVITY CLEANUP ERROR:", error);
  }
}

export async function GET(request) {
  try {
    await connectDB();

    cleanupActivities();

    const requester = getRequester(request);
    const { searchParams } = request.nextUrl;

    const userId = searchParams.get("userId") || "";
    const entityType = searchParams.get("entityType") || "";
    const action = searchParams.get("action") || "";
    const limitParam = Number(searchParams.get("limit") || 20);
    const pageParam = Number(searchParams.get("page") || 1);

    const limit = Math.min(Math.max(limitParam, 1), 50);
    const page = Math.max(pageParam, 1);
    const skip = (page - 1) * limit;

    const query = {};

    if (entityType) {
      query.entityType = entityType;
    }

    if (action) {
      query.action = action;
    }

    if (userId) {
      const isOwnActivities =
        requester.id && String(requester.id) === String(userId);

      const canViewOthers =
        requester.role === "admin" || requester.role === "project-manager";

      if (!isOwnActivities && !canViewOthers) {
        return NextResponse.json(
          { message: "You do not have permission to view these activities" },
          { status: 403 },
        );
      }

      query.performedBy = userId;
    } else {
      const canViewAll =
        requester.role === "admin" || requester.role === "project-manager";

      if (!canViewAll) {
        return NextResponse.json(
          { message: "You do not have permission to view all activities" },
          { status: 403 },
        );
      }
    }

    const total = await Activity.countDocuments(query);

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("performedBy", "fullName username role")
      .populate("projectId", "title slug");

    const formattedActivities = activities.map(formatActivity);

    return NextResponse.json(
      {
        activities: formattedActivities,
        pagination: {
          total,
          page,
          limit,
          hasMore: skip + formattedActivities.length < total,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("ACTIVITY API ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch activities",
        error: error.message,
      },
      { status: 500 },
    );
  }
}