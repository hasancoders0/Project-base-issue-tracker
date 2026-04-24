"use client";

import { useState } from "react";

function getStatusClasses(status) {
  switch (status) {
    case "todo":
      return "bg-slate-100 text-slate-700";
    case "in-progress":
      return "bg-amber-100 text-amber-700";
    case "in-review":
      return "bg-blue-100 text-blue-700";
    case "done":
      return "bg-emerald-100 text-emerald-700";
    case "blocked":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getPriorityClasses(priority) {
  switch (priority) {
    case "low":
      return "bg-gray-100 text-gray-700";
    case "medium":
      return "bg-sky-100 text-sky-700";
    case "high":
      return "bg-orange-100 text-orange-700";
    case "urgent":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatLabel(value) {
  return value
    ?.split("-")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

export default function TaskCard({
  task,
  currentUser,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
}) {
  const [changingStatus, setChangingStatus] = useState(false);

  const canManage =
    currentUser?.role === "admin" ||
    currentUser?.role === "project-manager";

  const canUpdateOwnTask =
    (currentUser?.role === "employee" ||
      currentUser?.role === "project-manager") &&
    String(task?.assignedTo?._id || task?.assignedTo) === String(currentUser?._id);

  const canChangeStatus = canManage || canUpdateOwnTask;

  async function handleStatusChange(e) {
    const newStatus = e.target.value;

    if (!onStatusChange || !task?._id) return;

    try {
      setChangingStatus(true);
      await onStatusChange(task, newStatus);
    } finally {
      setChangingStatus(false);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-slate-900">
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
              task.status
            )}`}
          >
            {formatLabel(task.status)}
          </span>

          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPriorityClasses(
              task.priority
            )}`}
          >
            {formatLabel(task.priority)}
          </span>
        </div>
      </div>

      <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
        <div>
          <span className="font-medium text-slate-800">Type:</span>{" "}
          {formatLabel(task.type)}
        </div>

        <div>
          <span className="font-medium text-slate-800">Assigned To:</span>{" "}
          {task.assignedTo?.fullName ||
            task.assignedTo?.username ||
            "Unassigned"}
        </div>

        {task.projectId?.title && (
          <div>
            <span className="font-medium text-slate-800">Project:</span>{" "}
            {task.projectId.title}
          </div>
        )}

        <div>
          <span className="font-medium text-slate-800">Created By:</span>{" "}
          {task.createdBy?.fullName ||
            task.createdBy?.username ||
            task.creatorRole ||
            "Unknown"}
        </div>

        <div>
          <span className="font-medium text-slate-800">Due Date:</span>{" "}
          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString()
            : "Not set"}
        </div>

        <div>
          <span className="font-medium text-slate-800">Reviewed:</span>{" "}
          {task.reviewedByAdmin ? "Yes" : "No"}
        </div>
      </div>

      {canChangeStatus && (
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Update Status
          </label>
          <select
            value={task.status}
            onChange={handleStatusChange}
            disabled={changingStatus}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 disabled:opacity-60"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="in-review">In Review</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      )}

      {task.note && (
        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-medium text-slate-800">Note:</span> {task.note}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {onView && (
          <button
            type="button"
            onClick={() => onView(task)}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            View
          </button>
        )}

        {(canManage || canUpdateOwnTask) && onEdit && (
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Edit
          </button>
        )}

        {canManage && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}