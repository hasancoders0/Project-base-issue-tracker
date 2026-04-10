"use client";

import Link from "next/link";
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiFolder,
  FiArrowRight,
} from "react-icons/fi";

export default function DashboardTab({ user, projects = [], issues = [] }) {
  const inProgressProjects = projects.filter(
    (project) => project.status === "In Progress"
  ).length;

  const completeProjects = projects.filter(
    (project) => project.status === "Complete"
  ).length;

  const openIssues = issues.filter((issue) => issue.status === "Open").length;
  const progressIssues = issues.filter(
    (issue) => issue.status === "In Progress"
  ).length;
  const closedIssues = issues.filter((issue) => issue.status === "Closed").length;

  const totalProjects = projects.length || 1;
  const totalIssues = issues.length || 1;

  const inProgressProjectPercent = Math.round(
    (inProgressProjects / totalProjects) * 100
  );
  const completeProjectPercent = Math.round(
    (completeProjects / totalProjects) * 100
  );

  const openIssuePercent = Math.round((openIssues / totalIssues) * 100);
  const progressIssuePercent = Math.round((progressIssues / totalIssues) * 100);
  const closedIssuePercent = Math.round((closedIssues / totalIssues) * 100);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-violet-600">
              Project Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Track project progress, issues, and team activity from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/projects/add"
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white"
            >
              Add Project
            </Link>

            <Link
              href="/issues/new"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Add Issue
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">In Progress Projects</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {inProgressProjects}
              </h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600">
              <FiClock className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Completed Projects</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {completeProjects}
              </h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <FiCheckCircle className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Open Issues</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {openIssues}
              </h2>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <FiAlertCircle className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Project Progress
            </h2>
            <FiFolder className="text-slate-400" />
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">In Progress</span>
                <span className="font-semibold text-slate-900">
                  {inProgressProjectPercent}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-yellow-500"
                  style={{ width: `${inProgressProjectPercent}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">Completed</span>
                <span className="font-semibold text-slate-900">
                  {completeProjectPercent}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{ width: `${completeProjectPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Issue Overview</h2>
            <FiAlertCircle className="text-slate-400" />
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">Open</span>
                <span className="font-semibold text-slate-900">
                  {openIssuePercent}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-blue-500"
                  style={{ width: `${openIssuePercent}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">In Progress</span>
                <span className="font-semibold text-slate-900">
                  {progressIssuePercent}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-yellow-500"
                  style={{ width: `${progressIssuePercent}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-600">Closed</span>
                <span className="font-semibold text-slate-900">
                  {closedIssuePercent}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{ width: `${closedIssuePercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/projects"
            className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
          >
            <p className="font-semibold text-slate-900">All Projects</p>
            <p className="mt-1 text-sm text-slate-500">Browse all projects</p>
          </Link>

          <Link
            href="/issues"
            className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
          >
            <p className="font-semibold text-slate-900">All Issues</p>
            <p className="mt-1 text-sm text-slate-500">Manage issue list</p>
          </Link>

          <Link
            href="/projects/add"
            className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
          >
            <p className="font-semibold text-slate-900">Create Project</p>
            <p className="mt-1 text-sm text-slate-500">Add a new project</p>
          </Link>

          <Link
            href="/issues/new"
            className="rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
          >
            <p className="font-semibold text-slate-900">Create Issue</p>
            <p className="mt-1 text-sm text-slate-500">Report new issue</p>
          </Link>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
          <button className="flex items-center gap-2 text-sm font-medium text-violet-600">
            View all
            <FiArrowRight />
          </button>
        </div>

        <div className="space-y-4">
          {recentProjects.map((project) => (
            <div
              key={project._id}
              className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"
            >
              <div className="mt-1 h-3 w-3 rounded-full bg-violet-500"></div>
              <div>
                <p className="font-medium text-slate-900">{project.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Project updated • {project.status}
                </p>
              </div>
            </div>
          ))}

          {recentIssues.map((issue) => (
            <div
              key={issue._id}
              className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"
            >
              <div className="mt-1 h-3 w-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="font-medium text-slate-900">{issue.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Issue updated • {issue.status}
                </p>
              </div>
            </div>
          ))}

          {recentProjects.length === 0 && recentIssues.length === 0 && (
            <p className="text-sm text-slate-500">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
}