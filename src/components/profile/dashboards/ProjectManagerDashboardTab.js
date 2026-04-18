"use client";

import Link from "next/link";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiFolder,
  FiAlertCircle,
  FiLayers,
  FiTrendingUp,
  FiUsers,
  FiPlus,
} from "react-icons/fi";

function getProjectStatusClass(status) {
  if (status === "Complete") return "bg-emerald-100 text-emerald-700";
  if (status === "In Progress") return "bg-amber-100 text-amber-700";
  if (status === "Cancel") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-600";
}

function getIssueStatusClass(status) {
  if (status === "Closed") return "bg-emerald-100 text-emerald-700";
  if (status === "In Progress") return "bg-amber-100 text-amber-700";
  if (status === "Open") return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-600";
}

export default function ProjectManagerDashboardTab({
  user,
  projects = [],
  issues = [],
}) {
  const managedProjects = projects.filter((project) => {
    const assignedMembers = Array.isArray(project.assignedTeamMembers)
      ? project.assignedTeamMembers.map((member) =>
          typeof member === "string" ? member : String(member._id)
        )
      : [];

    const assignedProjectIds = Array.isArray(user?.assignedProjects)
      ? user.assignedProjects.map((item) =>
          typeof item === "string" ? item : String(item?._id || item)
        )
      : [];

    return (
      assignedMembers.includes(String(user?._id)) ||
      assignedProjectIds.includes(String(project._id)) ||
      user?.role === "project-manager"
    );
  });

  const managedProjectIds = managedProjects.map((project) => String(project._id));

  const relatedIssues = issues.filter((issue) => {
    const issueProjectId =
      typeof issue.projectId === "object"
        ? String(issue.projectId?._id)
        : String(issue.projectId);

    return managedProjectIds.includes(issueProjectId);
  });

  const inProgressProjects = managedProjects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const completedProjects = managedProjects.filter(
    (project) => project.status === "Complete"
  ).length;

  const openIssues = relatedIssues.filter((issue) => issue.status === "Open").length;
  const progressIssues = relatedIssues.filter(
    (issue) => issue.status === "In Progress"
  ).length;
  const closedIssues = relatedIssues.filter((issue) => issue.status === "Closed").length;
  const highPriorityIssues = relatedIssues.filter(
    (issue) => issue.priority === "High"
  ).length;

  const totalProjects = managedProjects.length || 1;
  const totalIssues = relatedIssues.length || 1;

  const projectCompletionPercent = Math.round(
    (completedProjects / totalProjects) * 100
  );

  const issueClosurePercent = Math.round((closedIssues / totalIssues) * 100);

  const recentProjects = [...managedProjects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);

  const recentIssues = [...relatedIssues]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 p-6 text-white shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">
              Project Manager Hub
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight lg:text-5xl">
              Welcome, {user?.name || "Manager"}
            </h1>

            <p className="mt-3 max-w-xl text-sm text-slate-200 lg:text-base">
              Oversee delivery, monitor project health, and keep issues moving with a cleaner manager-first dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects/add"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <FiPlus />
              New Project
            </Link>

            <Link
              href="/issues/new"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <FiAlertCircle />
              New Issue
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Managed Projects</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {managedProjects.length}
              </h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
              <FiFolder className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">In Progress</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {inProgressProjects}
              </h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <FiClock className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Open Issues</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {openIssues}
              </h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <FiAlertCircle className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">High Priority</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {highPriorityIssues}
              </h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <FiLayers className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Delivery Overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Track progress across your managed projects and issue flow.
              </p>
            </div>

            <FiTrendingUp className="text-slate-400" />
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">Project Completion</span>
                <span className="font-semibold text-slate-900">
                  {projectCompletionPercent}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-emerald-500"
                  style={{ width: `${projectCompletionPercent}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">Issue Closure</span>
                <span className="font-semibold text-slate-900">
                  {issueClosurePercent}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-indigo-500"
                  style={{ width: `${issueClosurePercent}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Completed Projects</p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {completedProjects}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">In Progress Issues</p>
                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {progressIssues}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Closed Issues</p>
                <p className="mt-2 text-2xl font-bold text-indigo-700">
                  {closedIssues}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Manager Shortcuts</h2>
              <p className="mt-1 text-sm text-slate-500">
                Fast access to your core workflows.
              </p>
            </div>

            <FiUsers className="text-slate-400" />
          </div>

          <div className="space-y-3">
            <Link
              href="/projects"
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
            >
              <div>
                <p className="font-semibold text-slate-900">Project Board</p>
                <p className="text-sm text-slate-500">Review managed projects</p>
              </div>
              <FiArrowRight className="text-slate-400" />
            </Link>

            <Link
              href="/issues"
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
            >
              <div>
                <p className="font-semibold text-slate-900">Issue Tracker</p>
                <p className="text-sm text-slate-500">Open full issue list</p>
              </div>
              <FiArrowRight className="text-slate-400" />
            </Link>

            <Link
              href="/projects/add"
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
            >
              <div>
                <p className="font-semibold text-slate-900">Create Project</p>
                <p className="text-sm text-slate-500">Start something new</p>
              </div>
              <FiArrowRight className="text-slate-400" />
            </Link>

            <Link
              href="/issues/new"
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
            >
              <div>
                <p className="font-semibold text-slate-900">Create Issue</p>
                <p className="text-sm text-slate-500">Add a task or blocker</p>
              </div>
              <FiArrowRight className="text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Projects</h2>
            <Link href="/projects" className="text-sm font-semibold text-indigo-600">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div
                  key={project._id}
                  className="rounded-2xl bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{project.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {project.details || "No project details"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getProjectStatusClass(
                        project.status
                      )}`}
                    >
                      {project.status || "N/A"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No managed projects found.</p>
            )}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Issues</h2>
            <Link href="/issues" className="text-sm font-semibold text-indigo-600">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentIssues.length > 0 ? (
              recentIssues.map((issue) => (
                <div
                  key={issue._id}
                  className="rounded-2xl bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{issue.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        #{issue.issueNumber || "N/A"} • {issue.priority || "Medium"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getIssueStatusClass(
                        issue.status
                      )}`}
                    >
                      {issue.status || "Open"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No recent issues found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}