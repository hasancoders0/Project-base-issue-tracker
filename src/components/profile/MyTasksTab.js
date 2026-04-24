"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiLoader,
  FiX,
  FiCalendar,
  FiFlag,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";
import toast from "react-hot-toast";

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

const innerCard =
  "rounded-[16px] border border-white/10 bg-white/[0.07] backdrop-blur-md";

const statusConfig = {
  todo: { title: "To Do", icon: <FiClock />, color: "text-sky-300" },
  "in-progress": { title: "In Progress", icon: <FiLoader />, color: "text-amber-300" },
  done: { title: "Done", icon: <FiCheckCircle />, color: "text-emerald-300" },
};

function formatLabel(value) {
  if (!value) return "N/A";

  return String(value)
    .split("-")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString();
}

function getPriorityClass(priority) {
  if (priority === "high") return "bg-rose-400/15 text-rose-300";
  if (priority === "medium") return "bg-amber-400/15 text-amber-300";
  if (priority === "low") return "bg-emerald-400/15 text-emerald-300";
  return "bg-white/10 text-white/70";
}

export default function MyTasksTab({ user: userProp }) {
  const [tasks, setTasks] = useState([]);
  const [completedHistory, setCompletedHistory] = useState([]);
  const [user, setUser] = useState(userProp || null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dropColumn, setDropColumn] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (userProp?._id) {
      setUser(userProp);
      return;
    }

    const stored = localStorage.getItem("user");

    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, [userProp]);

  useEffect(() => {
    if (user?._id) {
      fetchMyTasks(user);
    }
  }, [user?._id]);

  useEffect(() => {
    function handleTaskCreated() {
      if (user?._id) fetchMyTasks(user);
    }

    window.addEventListener("task-created", handleTaskCreated);

    return () => {
      window.removeEventListener("task-created", handleTaskCreated);
    };
  }, [user?._id]);

  async function fetchMyTasks(currentUser) {
    try {
      setLoading(true);
      setHistoryLoading(true);

      const res = await fetch(`/api/tasks/my?currentUserId=${currentUser._id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setTasks([]);
        setCompletedHistory([]);
        toast.error(data.message || "Failed to fetch tasks");
        return;
      }

      setTasks(Array.isArray(data?.activeTasks) ? data.activeTasks : []);
      setCompletedHistory(
        Array.isArray(data?.completedTasks) ? data.completedTasks : []
      );
    } catch {
      setTasks([]);
      setCompletedHistory([]);
      toast.error("Something went wrong while loading tasks");
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  }

  async function updateStatus(taskId, status) {
    if (!user?._id) return;

    const oldTasks = [...tasks];
    const oldCompletedHistory = [...completedHistory];
    const previousSelectedTask = selectedTask;

    setTasks((prev) =>
      prev.map((task) => (task._id === taskId ? { ...task, status } : task))
    );

    if (selectedTask?._id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status } : prev));
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentUserId: user._id,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setTasks(oldTasks);
        setCompletedHistory(oldCompletedHistory);
        setSelectedTask(previousSelectedTask);
        toast.error(data.message || "Failed to update task status");
        return;
      }

      await fetchMyTasks(user);

      if (selectedTask?._id === taskId) {
        setSelectedTask(data.task);
      }

      toast.success(status === "done" ? "Task completed 🎉" : "Task updated");
    } catch {
      setTasks(oldTasks);
      setCompletedHistory(oldCompletedHistory);
      setSelectedTask(previousSelectedTask);
      toast.error("Something went wrong while updating task");
    }
  }

  function handleDragStart(taskId) {
    setDraggedTaskId(taskId);
  }

  function handleDragEnd() {
    setDraggedTaskId(null);
    setDropColumn("");
  }

  function handleDragOver(e, statusKey) {
    e.preventDefault();
    setDropColumn(statusKey);
  }

  function handleDragLeave() {
    setDropColumn("");
  }

  async function handleDrop(statusKey) {
    if (!draggedTaskId) return;

    const draggedTask = tasks.find((task) => task._id === draggedTaskId);

    if (!draggedTask || draggedTask.status === statusKey) {
      setDraggedTaskId(null);
      setDropColumn("");
      return;
    }

    await updateStatus(draggedTaskId, statusKey);
    setDraggedTaskId(null);
    setDropColumn("");
  }

  const grouped = useMemo(
    () => ({
      todo: tasks.filter((task) => task.status === "todo"),
      "in-progress": tasks.filter((task) => task.status === "in-progress"),
      done: tasks.filter((task) => task.status === "done"),
    }),
    [tasks]
  );

  return (
    <>
      <div className="space-y-4">
        <div className={`${boardCard} p-5`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
                Personal Workflow
              </p>
              <h2 className="mt-2 text-2xl font-bold">My Tasks</h2>
              <p className="mt-1 text-sm text-white/55">
                Organize your daily work with a simple kanban workflow.
              </p>
            </div>

            <span className="rounded-full bg-violet-400/15 px-4 py-2 text-xs font-bold text-violet-300">
              {tasks.length} Active
            </span>
          </div>
        </div>

        {loading ? (
          <div className={`${boardCard} p-5`}>
            <p className="text-sm text-white/55">Loading tasks...</p>
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            {Object.entries(grouped).map(([key, list]) => {
              const isDropActive = dropColumn === key;

              return (
                <div
                  key={key}
                  onDragOver={(e) => handleDragOver(e, key)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(key)}
                  className={`${boardCard} p-4 transition ${
                    isDropActive ? "bg-white/[0.08] ring-2 ring-violet-400/30" : ""
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex items-center gap-2 ${statusConfig[key].color}`}
                    >
                      {statusConfig[key].icon}
                      <h3 className="font-bold text-white">
                        {statusConfig[key].title}
                      </h3>
                    </div>

                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/60">
                      {list.length}
                    </span>
                  </div>

                  <div className="min-h-[240px] space-y-3">
                    {list.length === 0 && (
                      <div className="rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] p-4 text-center text-sm text-white/40">
                        Drop task here
                      </div>
                    )}

                    {list.map((task) => (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={() => handleDragStart(task._id)}
                        onDragEnd={handleDragEnd}
                        className={`${innerCard} cursor-grab p-4 transition hover:bg-white/10 active:cursor-grabbing ${
                          draggedTaskId === task._id ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="line-clamp-1 text-sm font-bold text-white">
                            {task.title}
                          </h4>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getPriorityClass(
                              task.priority
                            )}`}
                          >
                            {formatLabel(task.priority)}
                          </span>
                        </div>

                        {task.description && (
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/50">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-white/65">
                            {formatLabel(task.type)}
                          </span>

                          {task.projectId?.title && (
                            <span className="max-w-[150px] truncate rounded-full bg-violet-400/15 px-2.5 py-1 text-violet-300">
                              {task.projectId.title}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 text-[11px] text-white/50">
                          {task.assignedTo?.fullName ||
                          task.assignedTo?.name ||
                          task.assignedTo?.username
                            ? `Assigned: ${
                                task.assignedTo.fullName ||
                                task.assignedTo.name ||
                                task.assignedTo.username
                              }`
                            : "No assignee"}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {key !== "todo" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(task._id, "todo")}
                              className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70 hover:bg-white/15"
                            >
                              To Do
                            </button>
                          )}

                          {key !== "in-progress" && (
                            <button
                              type="button"
                              onClick={() =>
                                updateStatus(task._id, "in-progress")
                              }
                              className="rounded-full bg-sky-400/15 px-3 py-1 text-[11px] font-bold text-sky-300 hover:bg-sky-400/20"
                            >
                              Progress
                            </button>
                          )}

                          {key !== "done" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(task._id, "done")}
                              className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-300 hover:bg-emerald-400/20"
                            >
                              Done
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedTask(task)}
                            className="ml-auto rounded-full bg-violet-400/15 px-3 py-1 text-[11px] font-bold text-violet-300 hover:bg-violet-400/20"
                          >
                            See More
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className={`${boardCard} p-5`}>
          <h3 className="text-lg font-bold">Last Completed Tasks</h3>
          <p className="mt-1 text-sm text-white/55">
            Last 20 completed tasks. Old completed tasks are cleaned
            automatically later.
          </p>

          {historyLoading ? (
            <div className="mt-4 rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] p-4 text-center text-sm text-white/40">
              Loading completed tasks...
            </div>
          ) : completedHistory.length === 0 ? (
            <div className="mt-4 rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] p-4 text-center text-sm text-white/40">
              No completed tasks yet
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {completedHistory.map((task) => (
                <div
                  key={task._id}
                  className={`${innerCard} flex flex-wrap items-center justify-between gap-3 p-4`}
                >
                  <div>
                    <p className="font-bold text-white">{task.title}</p>
                    <p className="text-xs text-white/50">
                      {task.projectId?.title || "No project"} •{" "}
                      {task.assignedTo?.fullName ||
                        task.assignedTo?.name ||
                        task.assignedTo?.username ||
                        "No assignee"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/40">
                      {formatDate(task.completedAt)}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedTask(task)}
                      className="rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white/70 hover:bg-white/15"
                    >
                      See More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[20px] border border-white/10 bg-slate-950 text-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 p-5">
              <div>
                <h3 className="text-2xl font-bold">{selectedTask.title}</h3>
                <p className="mt-1 text-sm text-white/50">
                  Full task details and quick actions
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="rounded-[14px] bg-white/10 p-2 text-white/70 hover:bg-white/15"
              >
                <FiX />
              </button>
            </div>

            <div className="grid max-h-[78vh] gap-5 overflow-y-auto p-5 lg:grid-cols-[1fr_0.9fr]">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-bold text-white/70">
                    Description
                  </h4>
                  <div className={`${innerCard} p-4 text-sm leading-6 text-white/65`}>
                    {selectedTask.description || "No description added."}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-bold text-white/70">Note</h4>
                  <div className={`${innerCard} p-4 text-sm leading-6 text-white/65`}>
                    {selectedTask.note || "No note added."}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className={`${innerCard} p-4`}>
                  <div className="flex items-center gap-2 text-sm font-bold text-white/75">
                    <FiFlag />
                    Task Info
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    {[
                      ["Status", formatLabel(selectedTask.status)],
                      ["Priority", formatLabel(selectedTask.priority)],
                      ["Type", formatLabel(selectedTask.type)],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-3"
                      >
                        <span className="text-white/45">{label}</span>
                        <span className="font-bold text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`${innerCard} p-4`}>
                  <div className="flex items-center gap-2 text-sm font-bold text-white/75">
                    <FiUser />
                    Ownership
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-white/45">Assigned To</p>
                      <p className="mt-1 font-bold text-white">
                        {selectedTask.assignedTo?.fullName ||
                          selectedTask.assignedTo?.name ||
                          selectedTask.assignedTo?.username ||
                          "No assignee"}
                      </p>
                    </div>

                    <div>
                      <p className="text-white/45">Created By</p>
                      <p className="mt-1 font-bold text-white">
                        {selectedTask.createdBy?.fullName ||
                          selectedTask.createdBy?.name ||
                          selectedTask.createdBy?.username ||
                          "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`${innerCard} p-4`}>
                  <div className="flex items-center gap-2 text-sm font-bold text-white/75">
                    <FiBriefcase />
                    Project & Date
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <p className="text-white/45">Project</p>
                      <p className="mt-1 font-bold text-white">
                        {selectedTask.projectId?.title || "Not linked"}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-2 text-white/45">
                        <FiCalendar />
                        Due Date
                      </p>
                      <p className="mt-1 font-bold text-white">
                        {formatDate(selectedTask.dueDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-white/45">Completed</p>
                      <p className="mt-1 font-bold text-white">
                        {selectedTask.completedAt
                          ? formatDate(selectedTask.completedAt)
                          : "Not completed"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedTask.status !== "todo" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedTask._id, "todo")}
                      className="rounded-full bg-white/10 px-3 py-2 text-sm font-bold text-white/70 hover:bg-white/15"
                    >
                      Move to To Do
                    </button>
                  )}

                  {selectedTask.status !== "in-progress" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(selectedTask._id, "in-progress")
                      }
                      className="rounded-full bg-sky-400/15 px-3 py-2 text-sm font-bold text-sky-300 hover:bg-sky-400/20"
                    >
                      Move to Progress
                    </button>
                  )}

                  {selectedTask.status !== "done" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedTask._id, "done")}
                      className="rounded-full bg-emerald-400/15 px-3 py-2 text-sm font-bold text-emerald-300 hover:bg-emerald-400/20"
                    >
                      Move to Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}