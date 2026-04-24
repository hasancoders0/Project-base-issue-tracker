"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";

import TaskManagementStats from "@/components/tasks/management/TaskManagementStats";
import TaskManagementFilters from "@/components/tasks/management/TaskManagementFilters";
import TaskControlHeader from "@/components/tasks/management/TaskControlHeader";
import TaskBulkActions from "@/components/tasks/management/TaskBulkActions";
import TaskManagementTable from "@/components/tasks/management/TaskManagementTable";
import TaskEditModal from "@/components/tasks/management/TaskEditModal";

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString();
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

function isOverdue(task) {
  if (!task?.dueDate) return false;
  if (task?.status === "done") return false;
  return new Date(task.dueDate) < new Date();
}

function getAuthHeaders(user) {
  return {
    "Content-Type": "application/json",
    "x-user-id": user?._id || "",
    "x-user-email": user?.email || "",
    "x-user-username": user?.username || "",
    "x-user-role": user?.role || "",
  };
}

export default function TaskManagementTab({ user }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    type: "",
    projectId: "",
    assignee: "",
  });

  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkPriority, setBulkPriority] = useState("");
  const [bulkAssignee, setBulkAssignee] = useState("");

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    dueDate: "",
    note: "",
    assignedTo: "",
  });

  const hasShownLoadErrorRef = useRef(false);

  const canDeleteTasks =
    user?.role === "admin" || user?.role === "project-manager";

  const canUseTaskManagement =
    user?.role === "admin" || user?.role === "project-manager";

  useEffect(() => {
    if (!user?._id || !canUseTaskManagement) return;

    fetchTasks();
    fetchUsers();
  }, [user?._id, canUseTaskManagement]);

  async function fetchTasks({ silent = false } = {}) {
    if (!user?._id || !canUseTaskManagement) return;

    try {
      if (!silent) setLoading(true);

      const res = await fetch("/api/tasks", {
        cache: "no-store",
        headers: getAuthHeaders(user),
      });

      const data = await res.json();

      if (!res.ok) {
        setTasks([]);

        if (!hasShownLoadErrorRef.current) {
          toast.error(data?.message || "Failed to fetch tasks");
          hasShownLoadErrorRef.current = true;
        }

        return;
      }

      hasShownLoadErrorRef.current = false;

      const nextTasks = Array.isArray(data?.tasks)
        ? data.tasks
        : Array.isArray(data)
        ? data
        : [];

      setTasks(nextTasks);

      setSelectedTaskIds((prev) =>
        prev.filter((id) =>
          nextTasks.some((task) => String(task._id) === String(id))
        )
      );

      if (selectedTask) {
        const freshTask = nextTasks.find(
          (task) => String(task._id) === String(selectedTask._id)
        );

        if (freshTask) {
          setSelectedTask(freshTask);
          syncEditForm(freshTask);
        } else {
          setSelectedTask(null);
        }
      }
    } catch {
      setTasks([]);

      if (!hasShownLoadErrorRef.current) {
        toast.error("Something went wrong while loading task management");
        hasShownLoadErrorRef.current = true;
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setUsers([]);
        return;
      }

      const nextUsers = Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data)
        ? data
        : [];

      setUsers(nextUsers);
    } catch {
      setUsers([]);
    }
  }

  function syncEditForm(task) {
    setEditForm({
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "medium",
      status: task?.status || "todo",
      dueDate: toDateInputValue(task?.dueDate),
      note: task?.note || "",
      assignedTo: task?.assignedTo?._id || "",
    });
  }

  async function runCleanup() {
    if (!user?._id) return;

    try {
      setCleanupLoading(true);

      const res = await fetch("/api/tasks/cleanup", {
        method: "POST",
        headers: getAuthHeaders(user),
        body: JSON.stringify({ currentUserId: user._id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to cleanup tasks");
        return;
      }

      toast.success(
        `Cleanup complete. Archived: ${data.archivedCount || 0}, Deleted: ${
          data.deletedCount || 0
        }`
      );

      await fetchTasks({ silent: true });
    } catch {
      toast.error("Something went wrong while cleaning tasks");
    } finally {
      setCleanupLoading(false);
    }
  }

  async function handleSaveTaskEdit() {
    if (!selectedTask?._id || !user?._id) return;

    if (!editForm.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      setSavingEdit(true);

      const res = await fetch(`/api/tasks/${selectedTask._id}`, {
        method: "PATCH",
        headers: getAuthHeaders(user),
        body: JSON.stringify({
          currentUserId: user._id,
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          priority: editForm.priority,
          status: editForm.status,
          dueDate: editForm.dueDate
            ? new Date(editForm.dueDate).toISOString()
            : null,
          note: editForm.note.trim(),
          assignedTo: editForm.assignedTo || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to save task");
        return;
      }

      setSelectedTask(data.task);
      syncEditForm(data.task);
      await fetchTasks({ silent: true });
      toast.success("Task saved successfully");
    } catch {
      toast.error("Something went wrong while saving task");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDeleteTask(taskId) {
    if (!user?._id || !canDeleteTasks) return;

    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: getAuthHeaders(user),
        body: JSON.stringify({ currentUserId: user._id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to delete task");
        return;
      }

      setSelectedTask(null);
      setSelectedTaskIds((prev) =>
        prev.filter((id) => String(id) !== String(taskId))
      );

      await fetchTasks({ silent: true });
      toast.success("Task deleted successfully");
    } catch {
      toast.error("Something went wrong while deleting task");
    }
  }

  async function handleBulkUpdate() {
    if (selectedTaskIds.length === 0 || !user?._id) return;

    if (!bulkStatus && !bulkPriority && bulkAssignee === "") {
      toast.error("Select bulk action first");
      return;
    }

    try {
      setBulkUpdating(true);

      const payload = {
        currentUserId: user._id,
        taskIds: selectedTaskIds,
      };

      if (bulkStatus) payload.status = bulkStatus;
      if (bulkPriority) payload.priority = bulkPriority;

      if (bulkAssignee === "__UNASSIGN__") {
        payload.assignedTo = null;
      } else if (bulkAssignee !== "") {
        payload.assignedTo = bulkAssignee;
      }

      const res = await fetch("/api/tasks/bulk", {
        method: "PATCH",
        headers: getAuthHeaders(user),
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to bulk update tasks");
        return;
      }

      toast.success(`${data.modifiedCount || 0} task(s) updated`);

      setSelectedTaskIds([]);
      setBulkStatus("");
      setBulkPriority("");
      setBulkAssignee("");

      await fetchTasks({ silent: true });
    } catch {
      toast.error("Something went wrong while bulk updating");
    } finally {
      setBulkUpdating(false);
    }
  }

  async function handleBulkDelete() {
    if (!user?._id || !canDeleteTasks || selectedTaskIds.length === 0) return;

    try {
      setBulkDeleting(true);

      const res = await fetch("/api/tasks/bulk", {
        method: "DELETE",
        headers: getAuthHeaders(user),
        body: JSON.stringify({
          currentUserId: user._id,
          taskIds: selectedTaskIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to bulk delete tasks");
        return;
      }

      toast.success(`${data.deletedCount || 0} task(s) deleted`);
      setSelectedTaskIds([]);
      setSelectedTask(null);
      setBulkStatus("");
      setBulkPriority("");
      setBulkAssignee("");

      await fetchTasks({ silent: true });
    } catch {
      toast.error("Something went wrong while bulk deleting");
    } finally {
      setBulkDeleting(false);
    }
  }

  function toggleSelectTask(taskId) {
    setSelectedTaskIds((prev) =>
      prev.some((id) => String(id) === String(taskId))
        ? prev.filter((id) => String(id) !== String(taskId))
        : [...prev, String(taskId)]
    );
  }

  function toggleSelectAll(filtered) {
    const allIds = filtered.map((task) => String(task._id));

    const allSelected =
      filtered.length > 0 &&
      filtered.every((task) =>
        selectedTaskIds.some((id) => String(id) === String(task._id))
      );

    if (allSelected) {
      setSelectedTaskIds((prev) =>
        prev.filter((id) => !allIds.includes(String(id)))
      );
    } else {
      setSelectedTaskIds((prev) => {
        const merged = new Set([...prev.map(String), ...allIds]);
        return Array.from(merged);
      });
    }
  }

  const activeTasks = useMemo(() => tasks, [tasks]);

  const projectOptions = useMemo(() => {
    const map = new Map();

    activeTasks.forEach((task) => {
      if (task.projectId?._id) {
        map.set(String(task.projectId._id), task.projectId.title);
      }
    });

    return Array.from(map.entries()).map(([value, label]) => ({
      _id: value,
      title: label,
    }));
  }, [activeTasks]);

  const filteredTasks = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return activeTasks.filter((task) => {
      const title = task.title?.toLowerCase() || "";
      const description = task.description?.toLowerCase() || "";
      const note = task.note?.toLowerCase() || "";
      const projectTitle = task.projectId?.title?.toLowerCase() || "";
      const createdBy =
        task.createdBy?.fullName?.toLowerCase() ||
        task.createdBy?.name?.toLowerCase() ||
        task.createdBy?.username?.toLowerCase() ||
        "";
      const assignedTo =
        task.assignedTo?.fullName?.toLowerCase() ||
        task.assignedTo?.name?.toLowerCase() ||
        task.assignedTo?.username?.toLowerCase() ||
        "";

      const matchesSearch =
        !keyword ||
        title.includes(keyword) ||
        description.includes(keyword) ||
        note.includes(keyword) ||
        projectTitle.includes(keyword) ||
        createdBy.includes(keyword) ||
        assignedTo.includes(keyword);

      const matchesStatus = !filters.status || task.status === filters.status;
      const matchesPriority =
        !filters.priority || task.priority === filters.priority;
      const matchesType = !filters.type || task.type === filters.type;
      const matchesProject =
        !filters.projectId ||
        String(task.projectId?._id) === String(filters.projectId);
      const matchesAssignee =
        !filters.assignee ||
        String(task.assignedTo?._id) === String(filters.assignee);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesType &&
        matchesProject &&
        matchesAssignee
      );
    });
  }, [activeTasks, filters]);

  const stats = useMemo(() => {
    const total = activeTasks.length;
    const overdue = activeTasks.filter(isOverdue).length;
    const inProgress = activeTasks.filter(
      (task) => task.status === "in-progress"
    ).length;
    const doneCount = activeTasks.filter((task) => task.status === "done").length;

    return { total, overdue, inProgress, doneCount };
  }, [activeTasks]);

  const allFilteredSelected =
    filteredTasks.length > 0 &&
    filteredTasks.every((task) =>
      selectedTaskIds.some((id) => String(id) === String(task._id))
    );

  const assigneeOptions = useMemo(() => {
    return users
      .filter((userItem) =>
        ["admin", "project-manager", "employee"].includes(userItem.role)
      )
      .map((userItem) => ({
        value: String(userItem._id),
        label:
          userItem.fullName || userItem.name || userItem.username || "Unknown",
        _id: String(userItem._id),
        fullName:
          userItem.fullName || userItem.name || userItem.username || "Unknown",
        username:
          userItem.username || userItem.fullName || userItem.name || "Unknown",
        role: userItem.role || "",
        image: userItem.image || "",
        email: userItem.email || "",
      }));
  }, [users]);

  if (!canUseTaskManagement) {
    return (
      <div className={`${boardCard} p-6`}>
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="mt-2 text-sm text-white/55">
          Only admin and project manager can access task management.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className={`${boardCard} p-5`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/50">
                Team Workflow
              </p>

              <h2 className="mt-2 text-2xl font-bold">Task Management</h2>

              <p className="mt-1 text-sm text-white/55">
                Manage active tasks, review team workload, and control
                execution.
              </p>
            </div>

            {user?.role === "admin" && (
              <button
                type="button"
                onClick={runCleanup}
                disabled={cleanupLoading}
                className="inline-flex items-center gap-2 rounded-full bg-rose-400/15 px-4 py-2 text-sm font-bold text-rose-300 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiTrash2 />
                {cleanupLoading ? "Cleaning..." : "Run Cleanup"}
              </button>
            )}
          </div>
        </div>

        <TaskManagementStats stats={stats} />

        <TaskManagementFilters
          filters={filters}
          setFilters={setFilters}
          projects={projectOptions}
          assignees={users}
        />

        <div className={`${boardCard} p-5`}>
          <TaskControlHeader
            filteredTasks={filteredTasks}
            allFilteredSelected={allFilteredSelected}
            onToggleSelectAll={() => toggleSelectAll(filteredTasks)}
            onRefresh={() => fetchTasks()}
          />

          {selectedTaskIds.length > 0 && (
            <TaskBulkActions
              selectedTaskIds={selectedTaskIds}
              selectedCount={selectedTaskIds.length}
              bulkStatus={bulkStatus}
              setBulkStatus={setBulkStatus}
              bulkPriority={bulkPriority}
              setBulkPriority={setBulkPriority}
              bulkAssignee={bulkAssignee}
              setBulkAssignee={setBulkAssignee}
              assigneeOptions={assigneeOptions}
              onApply={handleBulkUpdate}
              onDelete={handleBulkDelete}
              onClear={() => {
                setSelectedTaskIds([]);
                setBulkStatus("");
                setBulkPriority("");
                setBulkAssignee("");
              }}
              bulkUpdating={bulkUpdating}
              bulkDeleting={bulkDeleting}
              canDeleteTasks={canDeleteTasks}
            />
          )}

          <TaskManagementTable
            loading={loading}
            tasks={filteredTasks}
            selectedTaskIds={selectedTaskIds}
            canDeleteTasks={canDeleteTasks}
            onToggleSelect={toggleSelectTask}
            onView={(task) => {
              setSelectedTask(task);
              syncEditForm(task);
            }}
            onDelete={handleDeleteTask}
            isOverdue={isOverdue}
          />
        </div>
      </div>

      {selectedTask && (
        <TaskEditModal
          selectedTask={selectedTask}
          editForm={editForm}
          setEditForm={setEditForm}
          onClose={() => setSelectedTask(null)}
          onSave={handleSaveTaskEdit}
          onDelete={handleDeleteTask}
          canDeleteTasks={canDeleteTasks}
          savingEdit={savingEdit}
          assigneeOptions={assigneeOptions}
          formatDate={formatDate}
          currentUser={user}
        />
      )}
    </>
  );
}