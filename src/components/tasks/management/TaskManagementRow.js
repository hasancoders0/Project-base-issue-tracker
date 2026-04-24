"use client";

import { FiEye } from "react-icons/fi";

export default function TaskManagementRow({
  task,
  isChecked,
  canDeleteTasks,
  onToggleSelect,
  onView,
  isOverdue,
}) {
  function getStatusStyle(status) {
    if (status === "todo") return "bg-white/10 text-white/65";
    if (status === "in-progress") return "bg-sky-400/15 text-sky-300";
    if (status === "in-review") return "bg-violet-400/15 text-violet-300";
    if (status === "blocked") return "bg-rose-400/15 text-rose-300";
    if (status === "done") return "bg-emerald-400/15 text-emerald-300";
    return "bg-white/10 text-white/65";
  }

  function getPriorityStyle(priority) {
    if (priority === "urgent") return "bg-rose-400/15 text-rose-300";
    if (priority === "high") return "bg-orange-400/15 text-orange-300";
    if (priority === "medium") return "bg-sky-400/15 text-sky-300";
    if (priority === "low") return "bg-emerald-400/15 text-emerald-300";
    return "bg-white/10 text-white/65";
  }

  return (
    <div className="grid gap-4 px-4 py-4 text-white transition hover:bg-white/[0.04] lg:grid-cols-[0.45fr_1.55fr_1fr_0.8fr_0.9fr_1fr_0.9fr_0.65fr] lg:items-center">
      <div>
        {canDeleteTasks ? (
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => onToggleSelect(task._id)}
            className="h-4 w-4 rounded border-white/20 bg-transparent accent-violet-500"
          />
        ) : (
          <span className="text-white/30">—</span>
        )}
      </div>

      <div>
        <p className="font-bold text-white">{task.title}</p>

        <p className="mt-1 text-xs text-white/45">
          Created by{" "}
          {task.createdBy?.fullName ||
            task.createdBy?.name ||
            task.createdBy?.username ||
            "Unknown"}
        </p>

        {isOverdue(task) && (
          <span className="mt-2 inline-flex rounded-full bg-rose-400/15 px-2 py-1 text-[11px] font-bold text-rose-300">
            Overdue
          </span>
        )}
      </div>

      <div className="text-sm text-white/65">
        {task.projectId?.title || "Not linked"}
      </div>

      <div className="text-sm capitalize text-white/65">
        {task.type || "N/A"}
      </div>

      <div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${getPriorityStyle(
            task.priority
          )}`}
        >
          {task.priority || "N/A"}
        </span>
      </div>

      <div className="text-sm text-white/65">
        {task.assignedTo?.fullName ||
          task.assignedTo?.name ||
          task.assignedTo?.username ||
          "No assignee"}
      </div>

      <div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${getStatusStyle(
            task.status
          )}`}
        >
          {task.status ? task.status.replace("-", " ") : "N/A"}
        </span>
      </div>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={() => onView(task)}
          className="inline-flex items-center gap-2 rounded-full bg-violet-400/15 px-3 py-2 text-sm font-bold text-violet-300 transition hover:bg-violet-400/20"
        >
          <FiEye />
        </button>
      </div>
    </div>
  );
}