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
  FiUser,
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

export default function EmployeeDashboardTab({
  user,
  projects = [],
  issues = [],
}) {
  const userNames = [user?.name, user?.fullName, user?.username, user?.email]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  const myProjects = projects.filter((project) => {
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
      assignedProjectIds.includes(String(project._id))
    );
  });

  const myProjectIds = myProjects.map((project) => String(project._id));

  const myTasks = issues.filter((issue) => {
    const issueProjectId =
      typeof issue.projectId === "object"
        ? String(issue.projectId?._id)
        : String(issue.projectId);

    const assignee = String(issue.assignee || "").toLowerCase();
    const reporter = String(issue.reporter || "").toLowerCase();

    return (
      myProjectIds.includes(issueProjectId) ||
      userNames.includes(assignee) ||
      userNames.includes(reporter)
    );
  });

  const openTasks = myTasks.filter((issue) => issue.status === "Open").length;
  const progressTasks = myTasks.filter(
    (issue) => issue.status === "In Progress"
  ).length;
  const closedTasks = myTasks.filter((issue) => issue.status === "Closed").length;
  const highPriorityTasks = myTasks.filter(
    (issue) => issue.priority === "High"
  ).length;

  const totalTasks = myTasks.length || 1;
  const completedPercent = Math.round((closedTasks / totalTasks) * 100);

  const recentProjects = [...myProjects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  const recentTasks = [...myTasks]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-950 via-sky-950 to-cyan-900 p-6 text-white shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
              Employee Workspace
            </div>

            <h1 className="mt-4 text-3xl font-bold leading-tight lg:text-5xl">
              Hello, {user?.name || "Employee"}
            </h1>

            <p className="mt-3 max-w-xl text-sm text-slate-200 lg:text-base">
              Focus on your assigned work, track task progress, and follow your current project updates from one clean dashboard.
            </p>
          </div>

          <div className="grid min-w-[220px] grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-cyan-100">My Projects</p>
              <p className="mt-2 text-3xl font-bold">{myProjects.length}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs text-cyan-100">My Tasks</p>
              <p className="mt-2 text-3xl font-bold">{myTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">Open Tasks</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {openTasks}
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
              <p className="text-sm text-slate-500">In Progress</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {progressTasks}
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
                {closedTasks}
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
              <p className="text-sm text-slate-500">High Priority</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {highPriorityTasks}
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
              <h2 className="text-xl font-bold text-slate-900">
                Personal Progress
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your current completion rate across assigned tasks.
              </p>
            </div>

            <FiTrendingUp className="text-slate-400" />
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">Completed</span>
                <span className="font-semibold text-slate-900">
                  {completedPercent}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-emerald-500"
                  style={{ width: `${completedPercent}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Projects</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {myProjects.length}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Tasks</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {myTasks.length}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Finished</p>
                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {closedTasks}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Quick Access</h2>
              <p className="mt-1 text-sm text-slate-500">
                Jump into your work faster.
              </p>
            </div>

            <FiUser className="text-slate-400" />
          </div>

          <div className="space-y-3">
            <Link
              href="/issues"
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
            >
              <div>
                <p className="font-semibold text-slate-900">My Tasks</p>
                <p className="text-sm text-slate-500">Review issue list</p>
              </div>
              <FiArrowRight className="text-slate-400" />
            </Link>

            <Link
              href="/projects"
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
            >
              <div>
                <p className="font-semibold text-slate-900">My Projects</p>
                <p className="text-sm text-slate-500">Open project list</p>
              </div>
              <FiArrowRight className="text-slate-400" />
            </Link>

            <Link
              href="/profile"
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
            >
              <div>
                <p className="font-semibold text-slate-900">Profile</p>
                <p className="text-sm text-slate-500">View your account</p>
              </div>
              <FiArrowRight className="text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">My Projects</h2>
            <Link href="/projects" className="text-sm font-semibold text-sky-600">
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
              <p className="text-sm text-slate-500">No assigned projects found.</p>
            )}
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Tasks</h2>
            <Link href="/issues" className="text-sm font-semibold text-sky-600">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((issue) => (
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
              <p className="text-sm text-slate-500">No assigned tasks found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}