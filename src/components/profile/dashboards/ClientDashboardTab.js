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
} from "react-icons/fi";

function getProjectStatusClass(status) {
  if (status === "Complete") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "In Progress") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Cancel") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-slate-100 text-slate-600";
}

function getIssueStatusClass(status) {
  if (status === "Closed") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "In Progress") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Open") {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default function ClientDashboardTab({
  user,
  projects = [],
  issues = [],
}) {
  const assignedProjectIds = Array.isArray(user?.assignedProjects)
    ? user.assignedProjects.map((item) =>
        typeof item === "string" ? item : String(item?._id || item)
      )
    : [];

  const myProjects = projects.filter((project) => {
    const assignedMembers = Array.isArray(project.assignedTeamMembers)
      ? project.assignedTeamMembers.map((member) =>
          typeof member === "string" ? member : String(member._id)
        )
      : [];

    return (
      assignedProjectIds.includes(String(project._id)) ||
      assignedMembers.includes(String(user?._id))
    );
  });

  const myProjectIds = myProjects.map((project) => String(project._id));

  const myIssues = issues.filter((issue) => {
    const issueProjectId =
      typeof issue.projectId === "object"
        ? String(issue.projectId?._id)
        : String(issue.projectId);

    return myProjectIds.includes(issueProjectId);
  });

  const inProgressProjects = myProjects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const completedProjects = myProjects.filter(
    (project) => project.status === "Complete"
  ).length;

  const openIssues = myIssues.filter((issue) => issue.status === "Open").length;
  const progressIssues = myIssues.filter(
    (issue) => issue.status === "In Progress"
  ).length;
  const closedIssues = myIssues.filter((issue) => issue.status === "Closed").length;

  const recentProjects = [...myProjects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  const recentIssues = [...myIssues]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);

  const totalProjects = myProjects.length || 1;
  const projectProgressPercent = Math.round(
    (completedProjects / totalProjects) * 100
  );

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-indigo-950 via-violet-900 to-fuchsia-900 p-6 text-white shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">
              Client Dashboard
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight lg:text-5xl">
              Welcome back, {user?.name || "Client"}
            </h1>

            <p className="mt-3 max-w-xl text-sm text-slate-200 lg:text-base">
              Track your assigned projects, monitor delivery progress, and review the latest issue updates in one clean place.
            </p>
          </div>

          <div className="grid min-w-[220px] grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-violet-100">My Projects</p>
              <p className="mt-2 text-3xl font-bold">{myProjects.length}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-violet-100">My Issues</p>
              <p className="mt-2 text-3xl font-bold">{myIssues.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Projects</p>
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
              <p className="text-sm text-slate-500">Completed</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {completedProjects}
              </h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <FiCheckCircle className="text-2xl" />
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
              <p className="text-sm text-slate-500">Project Progress</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {projectProgressPercent}%
              </h2>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <FiTrendingUp className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Project Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                A quick look at your project delivery status.
              </p>
            </div>

            <FiFolder className="text-slate-400" />
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">Completed</span>
                <span className="font-semibold text-slate-900">
                  {projectProgressPercent}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-emerald-500"
                  style={{ width: `${projectProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Total</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {myProjects.length}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">In Progress</p>
                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {inProgressProjects}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Complete</p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {completedProjects}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Issue Status</h2>
              <p className="mt-1 text-sm text-slate-500">
                Current issue distribution across your projects.
              </p>
            </div>

            <FiLayers className="text-slate-400" />
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Open</p>
                <p className="text-lg font-bold text-sky-700">{openIssues}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">In Progress</p>
                <p className="text-lg font-bold text-amber-700">
                  {progressIssues}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Closed</p>
                <p className="text-lg font-bold text-emerald-700">
                  {closedIssues}
                </p>
              </div>
            </div>

            <Link
              href="/issues"
              className="mt-2 flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 transition hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold text-slate-900">View All Issues</p>
                <p className="text-sm text-slate-500">
                  Open the issue tracker
                </p>
              </div>
              <FiArrowRight className="text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Recent Projects
            </h2>
            <Link
              href="/projects"
              className="text-sm font-semibold text-violet-600"
            >
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
                      <p className="font-semibold text-slate-900">
                        {project.title}
                      </p>
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
              <p className="text-sm text-slate-500">No recent projects found.</p>
            )}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Recent Issues
            </h2>
            <Link
              href="/issues"
              className="text-sm font-semibold text-violet-600"
            >
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
                      <p className="font-semibold text-slate-900">
                        {issue.title}
                      </p>
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