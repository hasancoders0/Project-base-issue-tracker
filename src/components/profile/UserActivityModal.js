"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiClock,
  FiX,
  FiRefreshCw,
  FiEdit3,
  FiPlusCircle,
  FiTrash2,
  FiUserPlus,
  FiClipboard,
} from "react-icons/fi";

function formatActivityTime(value) {
  if (!value) return "No time";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No time";

  return date.toLocaleString();
}

function formatValue(value) {
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";

    return value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return (
            item.fullName ||
            item.name ||
            item.username ||
            item.title ||
            "Item"
          );
        }

        return String(item)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
      })
      .join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value === null || value === undefined || value === "") {
    return "None";
  }

  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getActivityIcon(action) {
  if (action === "created") return <FiPlusCircle className="text-base" />;
  if (action === "deleted") return <FiTrash2 className="text-base" />;

  if (
    action === "status_changed" ||
    action === "phase_changed" ||
    action === "priority_changed" ||
    action === "review_changed"
  ) {
    return <FiRefreshCw className="text-base" />;
  }

  if (action === "assigned" || action === "assignee_changed") {
    return <FiUserPlus className="text-base" />;
  }

  if (action === "updated") {
    return <FiEdit3 className="text-base" />;
  }

  return <FiClipboard className="text-base" />;
}

function getActivityIconClass(action) {
  if (action === "created") return "bg-emerald-100 text-emerald-700";
  if (action === "deleted") return "bg-rose-100 text-rose-700";

  if (
    action === "status_changed" ||
    action === "phase_changed" ||
    action === "priority_changed" ||
    action === "review_changed"
  ) {
    return "bg-amber-100 text-amber-700";
  }

  if (action === "assigned" || action === "assignee_changed") {
    return "bg-violet-100 text-violet-700";
  }

  if (action === "updated") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getActivityTitle(activity) {
  const actor = activity.performedBy?.name || "Someone";
  const entityType = activity.entityType || "item";
  const action = activity.action || "updated";

  if (action === "created") {
    return `${actor} created ${entityType}`;
  }

  if (action === "deleted") {
    return `${actor} deleted ${entityType}`;
  }

  if (action === "status_changed") {
    return `${actor} changed ${entityType} status`;
  }

  if (action === "phase_changed") {
    return `${actor} changed ${entityType} phase`;
  }

  if (action === "priority_changed") {
    return `${actor} changed ${entityType} priority`;
  }

  if (action === "review_changed") {
    return `${actor} updated ${entityType} review`;
  }

  if (action === "assigned") {
    return `${actor} updated ${entityType} assignment`;
  }

  if (action === "assignee_changed") {
    return `${actor} changed ${entityType} assignee`;
  }

  if (activity.field) {
    return `${actor} updated ${entityType} ${formatValue(activity.field)}`;
  }

  return `${actor} updated ${entityType}`;
}

function getActivityDescription(activity) {
  const action = activity.action || "updated";
  const fromValue = formatValue(activity.from);
  const toValue = formatValue(activity.to);
  const projectTitle = activity.projectTitle || "";

  let mainText = "";

  if (action === "created") {
    mainText = `Created: ${toValue}`;
  } else if (action === "deleted") {
    mainText = `Deleted: ${fromValue}`;
  } else if (
    action === "status_changed" ||
    action === "phase_changed" ||
    action === "priority_changed" ||
    action === "review_changed" ||
    action === "assignee_changed"
  ) {
    mainText = `${fromValue} → ${toValue}`;
  } else if (action === "assigned") {
    mainText = `Assigned to ${toValue}`;
  } else if (activity.field) {
    mainText = `${formatValue(activity.field)}: ${fromValue} → ${toValue}`;
  } else {
    mainText = `${fromValue} → ${toValue}`;
  }

  if (projectTitle) {
    return `${mainText} • ${projectTitle}`;
  }

  return mainText;
}

export default function UserActivityModal({
  user,
  currentUser,
  open,
  onClose,
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const displayName = useMemo(() => {
    if (!user) return "User";
    return user.fullName || user.name || user.username || "Unnamed User";
  }, [user]);

  useEffect(() => {
    if (!open || !user?._id || !currentUser?._id) return;

    let isMounted = true;

    async function fetchActivities() {
      try {
        setLoading(true);
        setErrorMessage("");

        const params = new URLSearchParams({
          userId: user._id,
          limit: "20",
        });

        const res = await fetch(`/api/activities?${params.toString()}`, {
          cache: "no-store",
          headers: {
            "x-user-id": currentUser._id || "",
            "x-user-role": currentUser.role || "",
            "x-user-email": currentUser.email || "",
            "x-user-username": currentUser.username || "",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load activities");
        }

        if (isMounted) {
          setActivities(Array.isArray(data.activities) ? data.activities : []);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Failed to load activities");
          setActivities([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, [open, user, currentUser]);

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              {displayName} Activities
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Showing the latest 20 activities for this user.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Loading activities...
            </div>
          ) : activities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No recent activities found.
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-3">
                {activities.map((activity, index) => (
                  <div
                    key={activity._id || `${displayName}-${index}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${getActivityIconClass(
                          activity.action,
                        )}`}
                      >
                        {getActivityIcon(activity.action)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <p className="text-sm font-semibold text-slate-900">
                            {getActivityTitle(activity)}
                          </p>

                          <p className="text-xs text-slate-500">
                            {formatActivityTime(activity.createdAt)}
                          </p>
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                          {getActivityDescription(activity)}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {activity.entityType && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium capitalize text-slate-600">
                              {activity.entityType}
                            </span>
                          )}

                          {activity.field && (
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                              {formatValue(activity.field)}
                            </span>
                          )}

                          {activity.projectTitle && (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                              {activity.projectTitle}
                            </span>
                          )}

                          {activity.performedBy?.name && (
                            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                              By {activity.performedBy.name}
                            </span>
                          )}
                        </div>

                        {(activity.from !== null &&
                          activity.from !== undefined) ||
                        (activity.to !== null && activity.to !== undefined) ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {activity.from !== null &&
                              activity.from !== undefined && (
                                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
                                  From: {formatValue(activity.from)}
                                </span>
                              )}

                            {activity.to !== null &&
                              activity.to !== undefined && (
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                                  To: {formatValue(activity.to)}
                                </span>
                              )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}