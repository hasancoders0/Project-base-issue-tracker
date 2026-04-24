"use client";

import TaskManagementRow from "./TaskManagementRow";

export default function TaskManagementTable({
  loading,
  tasks = [],
  selectedTaskIds = [],
  canDeleteTasks,
  onToggleSelect,
  onView,
  onDelete,
  isOverdue,
}) {
  return (
    <>
      {loading ? (
        <div className="rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] p-8 text-center text-sm text-white/55">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-white/15 bg-white/[0.04] p-8 text-center text-sm text-white/55">
          No tasks found.
        </div>
      ) : (
        <div className="overflow-visible rounded-[16px] border border-white/10 bg-white/[0.04]">
          <div className="hidden gap-3 border-b border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/45 lg:grid lg:grid-cols-[0.45fr_1.55fr_1fr_0.8fr_0.9fr_1fr_0.9fr_0.65fr]">
            <div>Select</div>
            <div>Title</div>
            <div>Project</div>
            <div>Type</div>
            <div>Priority</div>
            <div>Assigned</div>
            <div>Status</div>
            <div>Action</div>
          </div>

          <div className="divide-y divide-white/10">
            {tasks.map((task) => {
              const isChecked = selectedTaskIds.some(
                (id) => String(id) === String(task._id)
              );

              return (
                <TaskManagementRow
                  key={task._id}
                  task={task}
                  isChecked={isChecked}
                  canDeleteTasks={canDeleteTasks}
                  onToggleSelect={onToggleSelect}
                  onView={onView}
                  onDelete={onDelete}
                  isOverdue={isOverdue}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}