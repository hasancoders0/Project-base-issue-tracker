"use client";

import { FiTrendingUp } from "react-icons/fi";

export default function AnalyticsCombinedTrendChart({
  title,
  projectData = [],
  issueData = [],
}) {
  const allValues = [...projectData, ...issueData].map((item) => item.value);
  const max = Math.max(...allValues, 1);

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Projects and issues in one chart
          </p>
        </div>
        <FiTrendingUp className="text-slate-400" />
      </div>

      <div className="mb-5 flex flex-wrap gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="h-3 w-3 rounded-full bg-violet-500" />
          Projects
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="h-3 w-3 rounded-full bg-sky-500" />
          Issues
        </div>
      </div>

      <div className="flex h-72 items-end gap-3 overflow-x-auto">
        {projectData.map((projectItem, index) => {
          const issueItem = issueData[index];
          const projectHeight =
            projectItem.value === 0
              ? 6
              : Math.max((projectItem.value / max) * 100, 8);
          const issueHeight =
            issueItem.value === 0
              ? 6
              : Math.max((issueItem.value / max) * 100, 8);

          return (
            <div
              key={projectItem.label}
              className="flex min-w-[72px] flex-1 flex-col items-center gap-3"
            >
              <div className="flex items-end gap-2">
                <span className="text-[11px] font-semibold text-violet-600">
                  {projectItem.value}
                </span>
                <span className="text-[11px] font-semibold text-sky-600">
                  {issueItem.value}
                </span>
              </div>

              <div className="flex h-52 w-full items-end justify-center gap-2 rounded-2xl bg-slate-50 px-2 py-3">
                <div
                  className="w-full max-w-[18px] rounded-xl bg-violet-500"
                  style={{ height: `${projectHeight}%` }}
                />
                <div
                  className="w-full max-w-[18px] rounded-xl bg-sky-500"
                  style={{ height: `${issueHeight}%` }}
                />
              </div>

              <div className="text-xs text-slate-500">{projectItem.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}