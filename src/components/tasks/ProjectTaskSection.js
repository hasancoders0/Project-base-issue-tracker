"use client";

import { useEffect, useState } from "react";
import AddTaskForm from "@/components/tasks/AddTaskForm";
import TaskCard from "@/components/tasks/TaskCard";

export default function ProjectTaskSection({
  currentUser,
  project,
  projects = [],
}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState("");

  async function fetchTasks() {
    if (!project?._id || !currentUser?._id) return;

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(
        `/api/tasks/project/${project._id}?currentUserId=${currentUser._id}`
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to load project tasks");
        setTasks([]);
        return;
      }

      setTasks(data.tasks || []);
    } catch (error) {
      setMessage("Something went wrong while loading tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, [project?._id, currentUser?._id]);

  function handleTaskCreated(newTask) {
    setShowAddForm(false);
    setTasks((prev) => [newTask, ...prev]);
  }

  function handleEdit(task) {
    console.log("Edit task:", task);
  }

  function handleDelete(task) {
    console.log("Delete task:", task);
  }

  function handleView(task) {
    console.log("View task:", task);
  }

  const canCreateTask = ["admin", "project-manager", "client"].includes(
    currentUser?.role
  );

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Tasks</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage project-related tasks for this project.
          </p>
        </div>

        {canCreateTask && (
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            {showAddForm ? "Close Form" : "Add Task"}
          </button>
        )}
      </div>

      {showAddForm && canCreateTask && (
        <div className="mb-6">
          <AddTaskForm
            currentUser={currentUser}
            projects={projects}
            fixedProjectId={project._id}
            onSuccess={handleTaskCreated}
          />
        </div>
      )}

      {message && (
        <div className="mb-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
          Loading project tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
          No tasks found for this project yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              currentUser={currentUser}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </section>
  );
}