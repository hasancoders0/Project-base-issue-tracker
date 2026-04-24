"use client";

import { FiFilter, FiSearch } from "react-icons/fi";

const boardCard =
  "rounded-[20px] border border-white/10 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur-sm";

const inputStyle =
  "w-full rounded-[14px] border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20";

export default function TaskManagementFilters({
  filters,
  setFilters,
  projects = [],
  assignees = [],
}) {
  function updateFilter(key, value) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      search: "",
      status: "",
      priority: "",
      type: "",
      projectId: "",
      assignee: "",
    });
  }

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.priority ||
    filters.type ||
    filters.projectId ||
    filters.assignee;

  return (
    <div className={`${boardCard} p-5`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FiFilter className="text-white/50" />
          <h3 className="text-lg font-bold text-white">Quick Filters</h3>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/70 hover:bg-white/15"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {/* Search */}
        <div className="xl:col-span-2">
          <label className="mb-2 block text-xs font-bold text-white/60">
            Search
          </label>

          <div className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.07] px-3">
            <FiSearch className="text-white/40" />
            <input
              type="text"
              placeholder="Title, project, assignee..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-xs font-bold text-white/60">
            Status
          </label>

          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className={inputStyle}
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="in-review">In Review</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="mb-2 block text-xs font-bold text-white/60">
            Priority
          </label>

          <select
            value={filters.priority}
            onChange={(e) => updateFilter("priority", e.target.value)}
            className={inputStyle}
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="mb-2 block text-xs font-bold text-white/60">
            Type
          </label>

          <select
            value={filters.type}
            onChange={(e) => updateFilter("type", e.target.value)}
            className={inputStyle}
          >
            <option value="">All Types</option>
            <option value="project">Project</option>
            <option value="individual">Individual</option>
          </select>
        </div>

        {/* Project */}
        <div>
          <label className="mb-2 block text-xs font-bold text-white/60">
            Project
          </label>

          <select
            value={filters.projectId}
            onChange={(e) => updateFilter("projectId", e.target.value)}
            className={inputStyle}
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee */}
        <div>
          <label className="mb-2 block text-xs font-bold text-white/60">
            Assignee
          </label>

          <select
            value={filters.assignee}
            onChange={(e) => updateFilter("assignee", e.target.value)}
            className={inputStyle}
          >
            <option value="">All Assignees</option>
            {assignees.map((assignee) => (
              <option key={assignee._id} value={assignee._id}>
                {assignee.fullName ||
                  assignee.name ||
                  assignee.username ||
                  "Unknown"}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}