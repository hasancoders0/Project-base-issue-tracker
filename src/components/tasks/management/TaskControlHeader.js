"use client";

import { FiRefreshCw, FiCheckSquare } from "react-icons/fi";

export default function TaskControlHeader({
  filteredTasks = [],
  allFilteredSelected = false,
  onToggleSelectAll,
  onRefresh,
}) {
  return (
    <div className="mb-4 rounded-[16px] border border-white/10 bg-white/[0.07] px-4 py-4 backdrop-blur-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10 text-white/70">
            <FiCheckSquare className="text-base" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-white">Task Control List</h3>
            <p className="mt-1 text-sm text-white/50">
              Manage tasks easily with bulk control and quick actions.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/60">
            {filteredTasks.length} task(s)
          </div>

          {filteredTasks.length > 0 && (
            <label className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-bold text-white/70">
              <input
                type="checkbox"
                checked={allFilteredSelected}
                onChange={onToggleSelectAll}
                className="h-4 w-4 rounded border-white/20 bg-transparent accent-violet-500"
              />
              Select all
            </label>
          )}

          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-white/90"
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}