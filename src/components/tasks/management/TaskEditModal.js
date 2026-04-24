"use client";

import { useEffect, useState } from "react";
import {
  FiActivity,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiFlag,
  FiTrash2,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

const card =
  "rounded-[20px] border border-white/10 bg-white/[0.06] p-5 text-white backdrop-blur-md";

const input =
  "w-full rounded-[14px] border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20";

const selectInput =
  "h-12 w-full rounded-[14px] border border-white/10 bg-white px-4 text-sm font-semibold text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20";

function statusBadgeClass(status) {
  if (status === "todo") return "bg-white/10 text-white/70";
  if (status === "in-progress") return "bg-sky-400/15 text-sky-300";
  if (status === "in-review") return "bg-violet-400/15 text-violet-300";
  if (status === "done") return "bg-emerald-400/15 text-emerald-300";
  if (status === "blocked") return "bg-rose-400/15 text-rose-300";
  return "bg-white/10 text-white/70";
}

function priorityBadgeClass(priority) {
  if (priority === "low") return "bg-white/10 text-white/70";
  if (priority === "medium") return "bg-sky-400/15 text-sky-300";
  if (priority === "high") return "bg-orange-400/15 text-orange-300";
  if (priority === "urgent") return "bg-rose-400/15 text-rose-300";
  return "bg-white/10 text-white/70";
}

function prettyStatus(status) {
  if (!status) return "Unknown";
  if (status === "todo") return "To Do";
  if (status === "in-progress") return "In Progress";
  if (status === "in-review") return "In Review";
  if (status === "done") return "Done";
  if (status === "blocked") return "Blocked";
  return status;
}

function prettyPriority(priority) {
  if (!priority) return "Unknown";
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export default function TaskEditModal({
  selectedTask,
  editForm,
  setEditForm,
  onClose,
  onSave,
  onDelete,
  canDeleteTasks,
  savingEdit = false,
  assigneeOptions = [],
  formatDate,
  currentUser,
}) {
  const [activities, setActivities] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    if (!selectedTask?._id || !currentUser?._id) return;

    async function fetchActivity() {
      try {
        setLoadingActivity(true);

        const res = await fetch(
          `/api/tasks/${selectedTask._id}/activity?currentUserId=${currentUser._id}`
        );

        if (!res.ok) {
          setActivities([]);
          return;
        }

        const data = await res.json();
        setActivities(Array.isArray(data?.activities) ? data.activities : []);
      } catch (error) {
        console.error("ACTIVITY FETCH ERROR:", error);
        setActivities([]);
      } finally {
        setLoadingActivity(false);
      }
    }

    fetchActivity();
  }, [selectedTask?._id, currentUser?._id]);

  if (!selectedTask) return null;

  function formatActivity(log) {
    const user =
      log.performedBy?.fullName || log.performedBy?.username || "User";

    if (log.action === "created") return `${user} created this task`;
    if (log.action === "status_changed") {
      return `${user} changed status from "${log.from}" → "${log.to}"`;
    }
    if (log.action === "assigned") return `${user} changed assignee`;
    if (log.action === "updated") return `${user} updated ${log.field}`;
    if (log.action === "deleted") return `${user} deleted this task`;

    return `${user} made changes`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[24px] border border-white/10 bg-slate-950 text-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h3 className="text-3xl font-bold tracking-tight">
              Task Details
            </h3>
            <p className="mt-1 text-sm text-white/50">
              Review and update this task from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white"
          >
            <FiX />
          </button>
        </div>

        <div className="max-h-[calc(92vh-88px)] overflow-y-auto p-5">
          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div className={card}>
                <label className="mb-3 block text-sm font-bold text-white/70">
                  Title
                </label>

                <div className="flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.07] px-4 py-3">
                  <FiEdit2 className="shrink-0 text-white/40" />
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                    placeholder="Task title"
                  />
                </div>
              </div>

              <div className={card}>
                <label className="mb-3 block text-sm font-bold text-white/70">
                  Description
                </label>

                <textarea
                  rows="8"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className={input}
                  placeholder="Write task description"
                />
              </div>

              <div className={card}>
                <label className="mb-3 block text-sm font-bold text-white/70">
                  Note
                </label>

                <textarea
                  rows="5"
                  value={editForm.note}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                  className={input}
                  placeholder="Internal note"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className={card}>
                <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white/75">
                  <FiFlag className="text-white/45" />
                  Task Settings
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/50">
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                      className={selectInput}
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="in-review">In Review</option>
                      <option value="blocked">Blocked</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/50">
                      Priority
                    </label>
                    <select
                      value={editForm.priority}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          priority: e.target.value,
                        }))
                      }
                      className={selectInput}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/50">
                      Assignee
                    </label>
                    <select
                      value={editForm.assignedTo}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          assignedTo: e.target.value,
                        }))
                      }
                      className={selectInput}
                    >
                      <option value="">No assignee</option>
                      {assigneeOptions.map((a) => (
                        <option key={a.value} value={a.value}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-white/50">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          dueDate: e.target.value,
                        }))
                      }
                      className={selectInput}
                    />
                  </div>
                </div>
              </div>

              <div className={card}>
                <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white/75">
                  <FiBriefcase className="text-white/45" />
                  Task Meta
                </div>

                <div className="grid gap-3">
                  <div className="rounded-[16px] bg-white/[0.07] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/45">
                      Project
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">
                      {selectedTask.projectId?.title || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-[16px] bg-white/[0.07] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/45">
                      Created By
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
                      <FiUser className="text-white/40" />
                      {selectedTask.createdBy?.fullName ||
                        selectedTask.createdBy?.name ||
                        selectedTask.createdBy?.username ||
                        "Unknown"}
                    </p>
                  </div>

                  <div className="rounded-[16px] bg-white/[0.07] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/45">
                      Assigned To
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
                      <FiUsers className="text-white/40" />
                      {selectedTask.assignedTo?.fullName ||
                        selectedTask.assignedTo?.name ||
                        selectedTask.assignedTo?.username ||
                        "No assignee"}
                    </p>
                  </div>

                  <div className="rounded-[16px] bg-white/[0.07] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/45">
                      Current Status
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(
                          selectedTask.status
                        )}`}
                      >
                        {prettyStatus(selectedTask.status)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[16px] bg-white/[0.07] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/45">
                      Priority
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${priorityBadgeClass(
                          selectedTask.priority
                        )}`}
                      >
                        {prettyPriority(selectedTask.priority)}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-[16px] bg-white/[0.07] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/45">
                      Due
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
                      <FiCalendar className="text-white/40" />
                      {selectedTask.dueDate
                        ? formatDate(selectedTask.dueDate)
                        : "Not set"}
                    </p>
                  </div>

                  <div className="rounded-[16px] bg-white/[0.07] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-white/45">
                      Completed
                    </p>
                    <p className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
                      <FiCheckCircle className="text-white/40" />
                      {selectedTask.completedAt
                        ? formatDate(selectedTask.completedAt)
                        : "Not completed"}
                    </p>
                  </div>
                </div>
              </div>

              <div className={card}>
                <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white/75">
                  <FiActivity className="text-white/45" />
                  Activity
                </div>

                {loadingActivity ? (
                  <p className="text-sm text-white/45">Loading activity...</p>
                ) : activities.length === 0 ? (
                  <p className="text-sm text-white/45">No activity yet</p>
                ) : (
                  <div className="space-y-3">
                    {activities.map((log) => (
                      <div key={log._id} className="flex gap-3">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-400/15 text-violet-300">
                          <FiClock size={14} />
                        </div>

                        <div className="min-w-0 flex-1 rounded-[16px] bg-white/[0.07] px-4 py-3">
                          <p className="text-sm leading-6 text-white/70">
                            {formatActivity(log)}
                          </p>
                          <p className="mt-1 text-xs text-white/40">
                            {formatDate(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 flex flex-wrap items-center gap-2 rounded-[20px] border border-white/10 bg-slate-950/95 p-4 shadow-lg backdrop-blur">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={savingEdit}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiEdit2 />
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>

                {canDeleteTasks && (
                  <button
                    type="button"
                    onClick={() => onDelete(selectedTask._id)}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-rose-400/15 px-5 text-sm font-bold text-rose-300 transition hover:bg-rose-400/20"
                  >
                    <FiTrash2 />
                    Delete Task
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 items-center rounded-full bg-white/10 px-5 text-sm font-bold text-white/70 transition hover:bg-white/15"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}