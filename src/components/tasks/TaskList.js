"use client";

import TaskCard from "@/components/tasks/TaskCard";

export default function TaskList({
  tasks = [],
  currentUser,
  title = "Tasks",
  description = "",
  loading = false,
  emptyText = "No tasks found.",
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              currentUser={currentUser}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}